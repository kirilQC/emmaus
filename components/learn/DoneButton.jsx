'use client';
import { useEffect, useState } from 'react';
import { S } from '../../lib/state.js';
import { ico } from '../../lib/icons.js';
export default function DoneButton({ id }){
  const [done,setDone]=useState(null);
  useEffect(()=>{ let live=true; (S.loaded?Promise.resolve():S.load()).then(()=>{ if(live) setDone((S.DONE||[]).includes(id)); }); return ()=>{ live=false; }; },[id]);
  async function toggle(){ if(!S.loaded) await S.load(); S.DONE=S.DONE||[]; const i=S.DONE.indexOf(id); if(i>=0) S.DONE.splice(i,1); else S.DONE.push(id); S.save(); setDone(i<0); }
  if(done===null) return <button className="btn ghost sm" disabled>…</button>;
  return <button className={'btn sm '+(done?'':'ghost')} onClick={toggle} aria-pressed={done}><span dangerouslySetInnerHTML={{ __html:ico(done?'check':'plus',14) }}/> {done?'Studied':'Mark as studied'}</button>;
}
