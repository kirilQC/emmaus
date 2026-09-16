'use client';
import { useEffect, useState } from 'react';
import { S } from '../../lib/state.js';
import { ico } from '../../lib/icons.js';
import { Grade } from './Badges.jsx';
export default function StartHere({ steps, initial=8 }){
  const [all,setAll]=useState(false); const [done,setDone]=useState([]);
  useEffect(()=>{ let live=true; (S.loaded?Promise.resolve():S.load()).then(()=>{ if(live) setDone(S.DONE||[]); }); return ()=>{ live=false; }; },[]);
  const rows=all?steps:steps.slice(0,initial); const n=steps.filter(s=>done.includes(s.id)).length;
  return <div>
    {n>0 && <div className="note" style={{ marginBottom:10 }}>{n} of {steps.length} studied</div>}
    <div className="lrn-steps">{rows.map(s=><a key={s.id} className={'lrn-step '+(done.includes(s.id)?'done':'')} href={s.href}>
      <span className="n">{done.includes(s.id)?<span dangerouslySetInnerHTML={{ __html:ico('check',22) }}/>:String(s.n).padStart(2,'0')}</span>
      <span><span className="lrn-step-title">{s.title}</span><span className="note" style={{ display:'block', marginTop:4 }}>{s.lane}</span><span className="note clamp2" style={{ display:'block', marginTop:6, fontSize:15 }}>{s.why}</span></span>
      <span className="lrn-step-side"><Grade evidence={s.evidence}/></span>
    </a>)}</div>
    {steps.length>initial && <button className="btn ghost sm" style={{ marginTop:16 }} onClick={()=>setAll(a=>!a)}>{all?'Show fewer':`Show all ${steps.length} steps`}</button>}
  </div>;
}
