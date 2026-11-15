import { readFileSync, writeFileSync, mkdirSync, existsSync } from 'node:fs';
import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import path from 'node:path';

const root = fileURLToPath(new URL('../', import.meta.url));
process.chdir(root);
const args = process.argv.slice(2);
if (args.some(arg => arg !== '--dry-run')) {
  throw new Error('支持 npm run deploy 或 npm run deploy -- --dry-run');
}
const version = JSON.parse(readFileSync('package.json', 'utf8')).version;
if (!/^\d+\.\d+\.\d+(?:-[\w.-]+)?$/.test(version)) throw new Error('请使用有效的版本号');
const releaseDir = path.join('releases', version);
const notesPath = path.join(releaseDir, 'changes.md');
if (!existsSync(notesPath) || !readFileSync(notesPath, 'utf8').trim()) {
  throw new Error('请先填写 ' + notesPath + '，再部署该版本');
}
const project = JSON.parse(readFileSync('.openai/hosting.json', 'utf8')).project_id;
if (!project) throw new Error('缺少站点 project_id');
const resultPath = path.join(releaseDir, 'deployment.json');
if (existsSync(resultPath)) {
  const previous = JSON.parse(readFileSync(resultPath, 'utf8'));
  if (previous.status === 'succeeded') throw new Error('该版本已发布，请更新 package.json 版本号并填写新版 changes.md');
}
const request = {
  version, project_id: project, requested_at: new Date().toISOString(),
  status: 'requested',
  archive: path.join(releaseDir, 'site.tar.gz').replaceAll('\\', '/'),
  changes: notesPath.replaceAll('\\', '/')
};
const prompt = [
  '在当前目录为现有 Sites 站点执行一次发布。用户已授权发布，保持当前访问范围。',
  '先读取并遵循 Sites 技能。项目 ID 必须使用 .openai/hosting.json 中的值。',
  '本次版本为 ' + version + '，更新说明位于 ' + notesPath + '。',
  '先运行 npm run build，按 Sites 流程同步源代码，并打包部署。',
  '将实际发布包保存到 ' + request.archive + '，不要覆盖已有成功发布的包。',
  '将 commit_sha、version、project_id、version_id、deployment_id、url、SHA256、发布时间和最终 status 写入 ' + resultPath + '。',
  '等待到部署成功或失败，失败时记录具体错误与可恢复的版本及部署ID，重试时复用已有保存版本或部署。',
  '打包工具若失败，诊断后按相同部署格式打包。发布包须与已推送提交对应。',
  '完成后检查版本目录包含 changes.md、site.tar.gz 和 deployment.json。'
].join('\n');
if (args.includes('--dry-run')) {
  console.log(JSON.stringify({ ...request, prompt }, null, 2));
  process.exit(0);
}
mkdirSync(releaseDir, { recursive: true });
writeFileSync(path.join(releaseDir, 'request.json'), JSON.stringify(request, null, 2) + '\n');
const executable = process.platform === 'win32' ? 'codex.cmd' : 'codex';
const result = spawnSync(executable, ['exec', '-'], {
  cwd: root, input: prompt, stdio: ['pipe', 'inherit', 'inherit'], shell: process.platform === 'win32', windowsHide: true
});
if (result.error) throw new Error('无法启动 Codex CLI，请安装并登录，且启用 Sites 插件。' + result.error.message);
if (result.status !== 0) process.exit(result.status || 1);
if (!existsSync(resultPath)) throw new Error('发布未返回部署记录，请检查 Codex 输出后重试。');
const deployed = JSON.parse(readFileSync(resultPath, 'utf8'));
if (deployed.status !== 'succeeded' || !existsSync(request.archive)) throw new Error('发布尚未成功，请查看 deployment.json');
console.log('已发布 ' + version + ' ' + deployed.url);

