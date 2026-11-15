import React from 'react';

const goals = ['长痘','闭口或黑头','痘印或色素沉着','干燥脱皮','泛红或不适','肤色不均','细纹','术后护理'];

const groups = [
  {title:'肤质和分区特点', questions:[
    ['整体肤质','single',['干皮','油皮','中性皮','混油皮','敏感皮']],
    ['容易出油的部位','multi',['额头','鼻子','下巴','两颊']],
    ['容易干燥的部位','multi',['额头','鼻翼','下巴','两颊','嘴周']]
  ]},
  {title:'最近皮肤状态、部位及持续时间', questions:[
    ['最近有哪些表现','multi',['长痘','闭口或黑头','痘印','泛红','刺痛','发痒','脱皮','紧绷','目前较稳定']],
    ['主要出现在哪','multi',['额头','鼻子或鼻翼','两颊','下巴','嘴周','全脸']],
    ['持续多久','single',['不确定','最近几天','1–2周','超过两周','反复数月']],
    ['最近变化','single',['逐渐改善','差不多','逐渐加重','时好时坏','不确定']]
  ]},
  {title:'改善目标（按优先级）', questions:[
    ['最想先改善','single',goals],
    ['还想改善','multi',goals]
  ]},
  {title:'以往产品反应和已耐受产品', questions:[]},
  {title:'过敏、外用药、治疗日期和医生要求', questions:[
    ['已知过敏情况','single',['没有已知过敏','有已知过敏（下方补充）','不确定']],
    ['近期皮肤治疗','single',['没有进行相关治疗','有相关治疗','不确定']],
    ['最近用药','multi',['正在用外用药','正在用口服药']],
    ['治疗部位目前状态','multi',['仍有结痂','有破皮或渗液','红肿或疼痛','已脱痂且表面长合','不确定']]
  ]},
  {title:'目前早间流程', questions:[
    ['早间通常使用','multi',['清水洗脸','洁面产品','爽肤水','精华','乳液或面霜','防晒','基本不护肤']],
    ['防晒习惯','single',['每天使用','外出时使用','偶尔使用','很少使用']],
    ['户外补涂情况','single',['会补涂','偶尔补涂','基本不补涂','很少长时间在户外']]
  ]},
  {title:'目前晚间流程', questions:[
    ['晚间通常使用','multi',['卸妆','洁面','爽肤水','精华','乳液或面霜','祛痘产品','酸类产品','面膜','基本不护肤']]
  ]},
  {title:'作息和执行偏好', questions:[
    ['作息与习惯','multi',['经常熬夜','作息规律','经常抠痘','经常化妆','经常户外活动','经常运动出汗']],
    ['早间愿意花多久','single',['2分钟以内','约5分钟','时间不限']],
    ['晚间愿意花多久','single',['5分钟以内','约10分钟','时间不限']],
    ['步骤偏好','single',['越简单越好','可以早晚轮换产品','可以安排每周护理']]
  ]},
  {title:'产品选择限制', questions:[
    ['产品使用范围','single',['优先只用现有产品','缺少必要步骤时提醒我','可以推荐预算内的补充产品']]
  ]}
];

export default function PromptForm({form,onChange,fields}){
  function update(key,value){
    const next={...form,[key]:value};
    const primary='改善目标（按优先级） / 最想先改善';
    const secondary='改善目标（按优先级） / 还想改善';
    if(key===primary)next[secondary]=(next[secondary]||[]).filter(goal=>goal!==value);
    if(key===secondary&&value.includes(next[primary]))next[primary]='';
    onChange(next);
  }
  const medical='过敏、外用药、治疗日期和医生要求 / ';
  const treated=form[medical+'近期皮肤治疗']==='有相关治疗';
  const reactions=form.productReactions||[];
  function reaction(index,key,value){
    update('productReactions',reactions.map((row,i)=>i===index?{...row,[key]:value}:row));
  }
  return <div className="prompt-form">
    <p>按实际情况选择。拿不准可以选“不确定”，也可以跳过。每部分都能补充说明。</p>
    <label>年龄（选填）<input type="number" min="0" max="120" value={form.age||''} onChange={e=>update('age',e.target.value)}/></label>
    <label>其他个人情况（选填）<input value={form[fields[0]]||''} onChange={e=>update(fields[0],e.target.value)} placeholder="例如与护理相关的孕期、哺乳期情况"/></label>
    {groups.map(group=><section key={group.title}><h2>{group.title}</h2>
      {group.questions.map(([question,type,options])=>{
        if(question==='治疗部位目前状态'&&!treated)return null;
        const key=group.title+' / '+question;
        const selected=form[key]||(type==='multi'?[]:'');
        const extraKey=key+'补充';
        return <fieldset key={key}><legend>{question==='治疗部位目前状态'?'接受治疗后的皮肤情况':question}{type==='multi'?'（可多选）':''}</legend>
          <div className="choices">{options.map(option=>{
            const active=type==='multi'?selected.includes(option):selected===option;
            return <button type="button" className={'choice'+(active?' chosen':'')} aria-pressed={active} key={option} onClick={()=>update(key,type==='multi'?(active?selected.filter(x=>x!==option):[...selected,option]):active?'':option)}>{option}</button>;
          })}</div>
          {question==='已知过敏情况'?selected==='有已知过敏（下方补充）'&&<label>对哪些产品或成分过敏，出现过什么反应<textarea value={form[extraKey]||''} onChange={e=>update(extraKey,e.target.value)}/></label>:
           question==='最近用药'?options.filter(option=>selected.includes(option)).map(option=><label key={option}>{option}的名称、用法和开始时间<textarea value={form[key+' / '+option]||''} onChange={e=>update(key+' / '+option,e.target.value)}/></label>):
           question==='近期皮肤治疗'?treated&&<label>治疗项目、目的、日期、部位和医生要求<textarea value={form[extraKey]||''} placeholder="例如激光去痣，某月某日，嘴旁，医生要求7天避水" onChange={e=>update(extraKey,e.target.value)}/></label>:
           <label>{question.includes('通常使用')?'具体产品、实际顺序、使用区域和频率':'自行填写或详细描述（选填）'}<textarea value={form[extraKey]||''} onChange={e=>update(extraKey,e.target.value)} placeholder={question.includes('部位')?'例如右侧鼻翼旁、只有冬天两颊干燥':'可以补充选项之外的情况，也可以直接自行描述'}/></label>}
        </fieldset>
      })}
      {group.title==='以往产品反应和已耐受产品'&&<>
        <p>每件产品分别记录，包含已经用得舒服的产品。产品名称或成分不记得时可以写大致描述。</p>
        {reactions.map((row,index)=><fieldset key={index}><legend>产品记录 {index+1}</legend>
          {[['name','产品或成分名称'],['usage','使用了多久、多久一次、用在哪'],['effect','目前效果、使用感受及反应'],['status','现在是否继续使用，停用后有何变化']].map(([key,title])=><label key={key}>{title}<textarea value={row[key]||''} onChange={e=>reaction(index,key,e.target.value)}/></label>)}
          <button type="button" onClick={()=>update('productReactions',reactions.filter((_,i)=>i!==index))}>移除此产品记录</button>
        </fieldset>)}
        <button type="button" onClick={()=>update('productReactions',[...reactions,{name:'',usage:'',effect:'',status:''}])}>添加产品使用经历</button>
      </>}
      {form[group.title]&&<details><summary>之前填写的补充内容</summary><textarea value={form[group.title]} onChange={e=>update(group.title,e.target.value)}/></details>}
    </section>)}
    <section><h2>现有产品</h2><p>每件产品填写一行，先写你记得的品牌和产品名称，以及目前怎么用。版本、规格和官网链接都可以留空，生成的提示词会请 AI 查询并列出来源；遇到多个可能版本时先向你确认。</p><textarea value={form[fields[10]]||''} onChange={e=>update(fields[10],e.target.value)} placeholder="例如：某某面霜50ml｜中国版｜官网链接｜每晚两颊薄涂｜使用后舒服"/></section>
    <section><h2>计划范围</h2><label>开始日期<input type="date" value={form.startDate||''} onChange={e=>update('startDate',e.target.value)}/></label><label>计划时长<select value={form.duration||''} onChange={e=>update('duration',e.target.value)}><option value="">请选择</option><option>14天</option><option>30天</option><option>自定义（下方填写）</option></select></label><label>日期范围补充或原来填写的范围<textarea value={form[fields[11]]||''} onChange={e=>update(fields[11],e.target.value)}/></label></section>
    <label>旧计划及希望调整的地方（选填）<textarea value={form[fields[12]]||''} onChange={e=>update(fields[12],e.target.value)}/></label>
  </div>
}
export function describeForm(form,fields){
  return fields.map(title=>{
    const medical=fields[5]+' / ';
    const treated=form[medical+'近期皮肤治疗']==='有相关治疗';
    const details=Object.entries(form).filter(([key,value])=>{
      if(!key.startsWith(title+' / ')||!value.length)return false;
      if(key.startsWith(medical+'治疗部位目前状态')&&!treated)return false;
      if(key===medical+'近期皮肤治疗补充'&&!treated)return false;
      if(key===medical+'已知过敏情况补充'&&form[medical+'已知过敏情况']!=='有已知过敏（下方补充）')return false;
      if(key.startsWith(medical+'最近用药 / ')&&!(form[medical+'最近用药']||[]).includes(key.split(' / ').at(-1)))return false;
      return true;
    }).map(([key,value])=>key.slice(title.length+3)+'：'+(Array.isArray(value)?value.join('、'):value));
    if(title===fields[4]){
      for(const [index,row] of (form.productReactions||[]).entries()){
        if(Object.values(row).some(Boolean))details.push('产品经历 '+(index+1)+'：'+['产品：'+(row.name||'未填写'),'用法与时长：'+(row.usage||'未填写'),'效果与反应：'+(row.effect||'未填写'),'目前状态：'+(row.status||'未填写')].join('；'));
      }
    }
    if(title===fields[0]&&form.age)details.unshift('年龄：'+form.age);
    if(title===fields[11]){
      if(form.startDate)details.unshift('开始日期：'+form.startDate);
      if(form.duration)details.push('计划时长：'+form.duration);
    }
    if(form[title])details.push('补充：'+form[title]);
    return '【'+title+'】\n'+(details.join('\n')||'未填写');
  }).join('\n\n');
}

