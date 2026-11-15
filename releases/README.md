# 发布记录

在项目目录运行 npm run deploy。命令会调用已登录的 Codex CLI，使用 Sites 插件构建、同步源码并部署原站点。电脑需要 Node.js、Git、Codex CLI 以及已连接的 Sites 插件。首次运行可能需要完成工具授权。

发布前更新 package.json 的 version，并创建 releases/<版本号>/changes.md，填写本次更新内容。运行 npm run deploy -- --dry-run 可检查配置和发布指令，不会部署。

每个版本目录保存以下文件。

- changes.md 为人工填写的更新说明。
- request.json 为本次发布请求。
- site.tar.gz 为对应部署包。
- deployment.json 为部署结果，包含版本、提交、站点和部署ID、地址、包校验值及发布时间。

已经成功发布的版本拒绝重复发布。失败后保留记录，用相同命令重试，发布助手继续已有保存版本或部署。部署成功以 deployment.json 的 succeeded 状态及实际包文件为准。

此命令依赖 Codex CLI 和 Sites 插件执行托管发布。GitHub 开源使用者需要配置自己的 Sites 站点及登录环境。
