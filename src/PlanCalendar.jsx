import React, {useState} from 'react';

export default function PlanCalendar({rows,selected,records,onSelect}){
  const [open,setOpen]=useState(false);
  const current=rows[selected]||rows[0];
  const [view,setView]=useState(current[0].slice(0,7));
  const months=[...new Set(rows.map(row=>row[0].slice(0,7)))].sort();
  const monthIndex=months.indexOf(view);
  const [year,month]=view.split('-').map(Number);
  const offset=(new Date(year,month-1,1).getDay()+6)%7;
  const count=new Date(year,month,0).getDate();
  const byDate=new Map(rows.map((row,index)=>[row[0],index]));
  function toggle(){
    if(!open)setView(current[0].slice(0,7));
    setOpen(!open);
  }
  return <div className="plan-calendar">
    <button type="button" className="calendar-trigger" aria-expanded={open} aria-controls="plan-calendar-panel" onClick={toggle}>
      <span>{current[0]} {current[1]}</span><span className="calendar-chevron" aria-hidden="true"/>
    </button>
    {open&&<div id="plan-calendar-panel" className="calendar-panel" onKeyDown={e=>{if(e.key==='Escape')setOpen(false)}}>
      <div className="calendar-month"><button type="button" aria-label="上一个计划月份" disabled={monthIndex<=0} onClick={()=>setView(months[monthIndex-1])}>‹</button><strong>{year}年{month}月</strong><button type="button" aria-label="下一个计划月份" disabled={monthIndex>=months.length-1} onClick={()=>setView(months[monthIndex+1])}>›</button></div>
      <div className="calendar-grid">
        {['一','二','三','四','五','六','日'].map(day=><span className="calendar-weekday" key={day}>{day}</span>)}
        {Array.from({length:offset},(_,i)=><span key={'blank'+i}/>)}
        {Array.from({length:count},(_,i)=>{
          const date=view+'-'+String(i+1).padStart(2,'0');
          const index=byDate.get(date);
          const completed=!!(records[date]?.['早间']||records[date]?.['晚间']);
          return <button type="button" key={date} disabled={index===undefined} className={'calendar-day'+(completed?' has-care':'')} aria-pressed={current[0]===date} aria-label={date+(index===undefined?'，无计划':completed?'，已护肤':'，未完成护理')} onClick={()=>{onSelect(index);setOpen(false)}}>{i+1}</button>
        })}
      </div>
      <p className="calendar-legend"><span/>浅绿色表示当天已完成早间或晚间护理</p>
    </div>}
  </div>
}
