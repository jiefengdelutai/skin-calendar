import React, {useState, useRef} from 'react';
import {createRoot} from 'react-dom/client';
import './style.css';
import PromptForm, {describeForm} from './PromptForm';
const fields=['年龄及个人情况','肤质和分区特点','最近皮肤状态、部位及持续时间','改善目标（按优先级）','以往产品反应和已耐受产品','过敏、外用药、治疗日期和医生要求','目前早间流程','目前晚间流程','作息和执行偏好','产品选择限制','产品全名、版本、规格、链接、目前用法及感受','开始日期及计划时长','旧计划及希望调整的地方'];
function read(key,fallback){try{return JSON.parse(localStorage.getItem(key))||fallback}catch{return fallback}}
function App(){
 const [tab,setTab]=useState('执行计划'),[form,setForm]=useState(()=>read('prompt-form',{})),[plan,setPlan]=useState(()=>read('imported-plan','')),[draft,setDraft]=useState(''),[error,setError]=useState('');
 function persist(key,value,setter){try{localStorage.setItem(key,JSON.stringify(value));setter(value);setError('')}catch{setError('保存失败，请检查浏览器空间。')}}
 const prompt='请根据以下资料制定容易坚持的护肤计划，优先使用现有产品。\n\n'+describeForm(form,fields)+'\n\n优先核对包装和对应版本品牌官网，附来源。产品版本或链接未填写、链接无法打开或信息不足时，请自行查询相关产品网页，逐件列出采用的网页标题、链接和查到的用法；多个版本无法确定时先向我确认，暂未核实的信息明确标注。未公开的浓度、时间及搭配限制标为未确认。结合实际耐受，说明频率、区域、冲洗要求及不适时暂停步骤。治疗区域按医生要求护理。关键信息缺失先提问。请输出Markdown，包含每日早晚基础流程、周一至周日安排，以及完整逐日日历。日历表头固定为：日期｜星期｜早上怎么用｜晚上怎么用｜当日提醒。日期使用YYYY-MM-DD，每天写清实际操作，避免仅引用流程名称。';
 return <main><header className="page-header"><h1>AI护肤手册</h1><button className="text-link" onClick={()=>setTab(tab==='执行计划'?'生成提示词':'执行计划')}>{tab==='执行计划'?'生成提示词':'返回执行计划'}</button></header>{error&&<p role="alert">{error}</p>}{tab==='生成提示词'?<><p>填写资料，复制给自己的 AI。与 AI 确定计划后，将 Markdown 导入护肤计划开始执行。</p><PromptForm form={form} fields={fields} onChange={value=>persist('prompt-form',value,setForm)}/><button onClick={async()=>{try{await navigator.clipboard.writeText(prompt);setError('提示词已复制')}catch{setError('请从下方文本框手动复制')}}}>复制提示词</button><textarea readOnly value={prompt}/></>:<>{plan?<Executor plan={plan}/>:<section className="empty-plan"><h2>开始你的护肤计划</h2><p>已有计划可以在下方导入。还没有计划？先填写情况，生成提示词交给自己的 AI。</p><button onClick={()=>setTab('生成提示词')}>生成我的提示词</button><a href="#plan-import">导入已有计划</a></section>}<div className="plan-management"><details id="plan-import" open={!plan}><summary>导入或调整计划</summary><input aria-label="选择计划文件" type="file" accept=".md,.txt,text/plain,text/markdown" onChange={async e=>{if(e.target.files[0])setDraft(await e.target.files[0].text())}}/><textarea value={draft} onChange={e=>setDraft(e.target.value)} placeholder="粘贴 AI 生成的 Markdown 计划"/><button onClick={()=>persist('imported-plan',draft,setPlan)}>保存计划</button></details>{plan&&<details><summary>查看完整计划</summary><pre>{plan}</pre></details>}</div></>}<footer>资料、记录和照片存储在当前浏览器。导出数据可交给医生或其他应用查看。本项目提供记录工具，AI 分析结果由所使用的服务生成。</footer></main>
}
function Executor({plan}){
 const rows=plan.split('\n').filter(l=>/^\|?\s*\d{4}-\d{2}-\d{2}\s*\|/.test(l)).map(l=>l.replace(/^\|/,'').replace(/\|$/,'').split('|').map(s=>s.trim()));
 const [selected,setSelected]=useState(0),[records,setRecords]=useState(()=>read('executor-records',{})),[status,setStatus]=useState('');
 const row=rows[Math.min(selected,Math.max(0,rows.length-1))],date=row?.[0]||'计划记录',record=records[date]||{};
 function save(patch){const next={...records,[date]:{...record,...patch}};try{localStorage.setItem('executor-records',JSON.stringify(next));setRecords(next);setStatus('已保存')}catch{setStatus('保存失败，照片可能超过浏览器容量，请先导出记录。')}}
 function download(){const url=URL.createObjectURL(new Blob([JSON.stringify({version:1,plan,records},null,2)],{type:'application/json'}));const a=document.createElement('a');a.href=url;a.download='护肤记录.json';a.click();setTimeout(()=>URL.revokeObjectURL(url),10000)}
 return <>{rows.length>0?<select value={selected} onChange={e=>setSelected(Number(e.target.value))}>{rows.map((r,i)=><option key={i} value={i}>{r[0]} {r[1]}</option>)}</select>:<p>未找到标准日期表格，可以查看完整计划并记录情况。下次请让 AI 使用 YYYY-MM-DD 日期表格。</p>}{['早间','晚间'].map((period,i)=><section className="care-card" key={period}><h2>{period}护理</h2><p className="care-instructions">{row?.[i+2]}</p><button type="button" className="completion-button" aria-pressed={!!record[period]} onClick={()=>save({[period]:!record[period]})}><span className="completion-icon" aria-hidden="true">{record[period]?"✓":"○"}</span><span>{record[period]?"已完成":"标记已完成"}</span></button><textarea placeholder="按顺序记录产品、部位、方式及当时情况" value={record[period+'说明']||''} onChange={e=>save({[period+'说明']:e.target.value})}/><label className="photo-upload"><span>＋ 添加护理照片</span><small>按护理顺序选择，可添加多张</small><input type="file" accept="image/*" multiple onChange={async e=>{try{const photos=await Promise.all(Array.from(e.target.files).map(file=>new Promise((resolve,reject)=>{const r=new FileReader();r.onload=()=>resolve({name:file.name,data:r.result});r.onerror=reject;r.readAsDataURL(file)})));save({[period+'照片']:[...(record[period+'照片']||[]),...photos]})}catch{setStatus('读取照片失败，请重试')}}}/></label><div className="photo-grid">{(record[period+'照片']||[]).map((photo,j)=><Photo key={j} photo={photo} label={period+'照片 '+(j+1)} onDelete={()=>save({[period+'照片']:record[period+'照片'].filter((_,k)=>k!==j)})}/>)}</div></section>)}<p>{row?.[4]}</p><label>当天其他情况<textarea placeholder="产品用完、过期、防晒不足、治疗记录等" value={record.notes||''} onChange={e=>save({notes:e.target.value})}/></label><p role="status">{status}</p><button onClick={download}>导出计划、记录和照片 JSON</button></>
}
function Photo({photo,label,onDelete}){
 const dialog=useRef(null);
 return <div className="photo-tile">
   <button type="button" className="photo-thumbnail" aria-label={'查看'+label+'大图'} onClick={()=>dialog.current.showModal()}><img loading="lazy" src={photo.data} alt={label}/><span className="photo-number">{label}</span></button>
   <div className="photo-actions"><span title={photo.name}>{photo.name}</span><button type="button" aria-label={'删除'+label} onClick={onDelete}>删除</button></div>
   <dialog ref={dialog} className="photo-viewer" aria-label={label+'大图'} onClick={e=>{if(e.target===dialog.current)dialog.current.close()}}>
     <button type="button" className="photo-close" onClick={()=>dialog.current.close()}>关闭大图</button>
     <img src={photo.data} alt={label}/>
   </dialog>
 </div>
}
createRoot(document.getElementById('root')).render(<App/>);

