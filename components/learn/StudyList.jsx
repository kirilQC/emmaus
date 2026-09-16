'use client';
import { useState } from 'react';
import StudyCard from './StudyCard.jsx';
import { DIFFICULTY, EVIDENCE_ORDER, gradeOf } from '../../lib/learn/lanes.js';
export default function StudyList({ studies, showLane=false }){
  const [diff,setDiff]=useState('all'); const [ev,setEv]=useState('all');
  const diffs=DIFFICULTY.filter(d=>studies.some(s=>s.difficulty===d)); const evs=EVIDENCE_ORDER.filter(e=>studies.some(s=>s.evidence===e));
  const rows=studies.filter(s=>(diff==='all'||s.difficulty===diff)&&(ev==='all'||s.evidence===ev));
  return <div>
    <div className="lrn-filters">
      <div className="strip"><button className={'opt '+(diff==='all'?'on':'')} onClick={()=>setDiff('all')}>All levels</button>{diffs.map(d=><button key={d} className={'opt '+(diff===d?'on':'')} onClick={()=>setDiff(d)}>{d} <span className="note">{studies.filter(s=>s.difficulty===d).length}</span></button>)}</div>
      <div className="strip">{evs.map(e=><button key={e} className={'opt '+(ev===e?'on':'')} onClick={()=>setEv(ev===e?'all':e)}><span className={`dot ev-${gradeOf(e)[1]}`} style={{ background:'var(--c)', width:8, height:8 }}/> {gradeOf(e)[0]} <span className="note">{studies.filter(s=>s.evidence===e).length}</span></button>)}</div>
    </div>
    <div className="note" style={{ margin:'14px 0 12px' }}>{rows.length} of {studies.length} studies</div>
    <div className="grid2">{rows.map(s=><StudyCard key={s.id} s={s} showLane={showLane}/>)}</div>
    {!rows.length && <div className="stub">Nothing in this lane matches both filters.</div>}
  </div>;
}
