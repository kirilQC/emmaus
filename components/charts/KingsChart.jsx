'use client';
import { useState } from 'react';
import { JUDAH, ISRAEL, PROPHETS, EVENTS } from '../../lib/charts/kings.js';
import { refHref } from '../AtlasMap.jsx';
const COL={ good:'#8cc39a', mixed:'#d9a441', evil:'#a35b3f' };
const PCOL={ judah:'#d69282', israel:'#8fb3dc', exile:'#c9b79a', both:'#ece7dc' };
export default function KingsChart(){
  const [sel,setSel]=useState(null);
  const Y0=940, Y1=570, W=1200, PADL=70, PADR=20; const x=y=>PADL+((Y0-y)/(Y0-Y1))*(W-PADL-PADR);
  const rowH=26; const jud=pack(JUDAH), isr=pack(ISRAEL); const nI=Math.max(...isr.map(x=>x.r))+1, nJ=Math.max(...jud.map(x=>x.r))+1;
  const laneIsrael=40, laneJudah=laneIsrael+rowH*nI+34, laneProph=laneJudah+rowH*nJ+34;
  // pack bars into sub-rows so co-regencies overlap on purpose and nothing else does
  function pack(list){ const rows=[]; return list.map(k=>{ let r=0; while(rows[r]!==undefined&&rows[r]<k[1]-0.01) r++; rows[r]=k[2]; return { k, r }; }); }
  const prophRows=[]; const pro=PROPHETS.map(p=>{ let r=0; while(prophRows[r]!==undefined&&prophRows[r]<p[1]-0.01) r++; prophRows[r]=p[2]; return { p, r }; });
  const nP=Math.max(...pro.map(x=>x.r))+1; const H=laneProph+rowH*nP+50;
  const item=sel;
  const Bar=({ x1,x2,y,h,fill,label,onClick,on })=><g className={'kb'+(on?' on':'')} onClick={onClick} style={{ cursor:'pointer' }}><rect x={x1} y={y} width={Math.max(x2-x1,3)} height={h} rx={2} fill={fill} opacity={on?1:0.85} /><text x={x1+4} y={y+h/2+3.5} style={{ fontFamily:'var(--f-ui)', fontSize:10, fill:'#171510', fontWeight:600, pointerEvents:'none' }} clipPath={undefined}>{(x2-x1)>40?label:''}</text></g>;
  return <div className="dg" style={{ gridTemplateColumns:'minmax(0,1fr) 340px' }}>
    <div className="card dg-svg" style={{ padding:14 }}>
      <svg viewBox={`0 0 ${W} ${H}`} style={{ width:'100%', height:'auto', display:'block' }} aria-label="Kings of Israel and Judah with the prophets">
        {[900,850,800,750,700,650,600].map(y=><g key={y}><line x1={x(y)} y1={20} x2={x(y)} y2={H-30} stroke="var(--line)" strokeDasharray="2 4" /><text x={x(y)} y={H-14} textAnchor="middle" style={{ fontFamily:'var(--f-ui)', fontSize:11, fill:'var(--dim)' }}>{y} BC</text></g>)}
        <text x={0} y={laneIsrael-12} style={{ fontFamily:'var(--f-ui)', fontSize:11, letterSpacing:'.12em', fill:'#8fb3dc', fontWeight:600 }}>ISRAEL, NORTH</text>
        <text x={0} y={laneJudah-12} style={{ fontFamily:'var(--f-ui)', fontSize:11, letterSpacing:'.12em', fill:'#d69282', fontWeight:600 }}>JUDAH, SOUTH</text>
        <text x={0} y={laneProph-12} style={{ fontFamily:'var(--f-ui)', fontSize:11, letterSpacing:'.12em', fill:'var(--dim)', fontWeight:600 }}>PROPHETS</text>
        {isr.map(({k,r})=><Bar key={k[0]} x1={x(k[1])} x2={x(k[2])} y={laneIsrael+r*rowH} h={rowH-6} fill={COL[k[3]]} label={k[0]} on={sel===k} onClick={()=>setSel(sel===k?null:{ kind:'king', realm:'Israel', k })} />)}
        {jud.map(({k,r})=><Bar key={k[0]} x1={x(k[1])} x2={x(k[2])} y={laneJudah+r*rowH} h={rowH-6} fill={COL[k[3]]} label={k[0]} on={sel===k} onClick={()=>setSel(sel===k?null:{ kind:'king', realm:'Judah', k })} />)}
        {pro.map(({p,r})=><g key={p[0]} onClick={()=>setSel({ kind:'prophet', p })} style={{ cursor:'pointer' }}><rect x={x(p[1])} y={laneProph+r*rowH} width={Math.max(x(p[2])-x(p[1]),4)} height={rowH-10} rx={2} fill={PCOL[p[3]]} opacity={.9} /><text x={x(p[1])+(x(p[2])-x(p[1])>60?4:Math.max(x(p[2])-x(p[1]),4)+4)} y={laneProph+r*rowH+(rowH-10)/2+3.5} style={{ fontFamily:'var(--f-ui)', fontSize:10, fill:x(p[2])-x(p[1])>60?'#171510':'var(--ink)', fontWeight:600, pointerEvents:'none' }}>{p[0]}</text></g>)}
        {EVENTS.map(([y,t])=><g key={y} onClick={()=>setSel({ kind:'event', e:[y,t] })} style={{ cursor:'pointer' }}><line x1={x(y)} y1={16} x2={x(y)} y2={H-30} stroke="var(--accent)" strokeWidth={1} opacity={.55} /><circle cx={x(y)} cy={14} r={4} fill="var(--accent)" /></g>)}
        <line x1={x(722)} y1={laneIsrael-4} x2={x(722)} y2={laneIsrael+rowH*nI} stroke="var(--ink)" strokeWidth={2} />
        <line x1={x(586)} y1={laneJudah-4} x2={x(586)} y2={laneJudah+rowH*nJ} stroke="var(--ink)" strokeWidth={2} />
      </svg>
      <div style={{ display:'flex', gap:14, flexWrap:'wrap', marginTop:10 }} className="note">{Object.entries(COL).map(([k,c])=><span key={k} style={{ display:'inline-flex', gap:6, alignItems:'center' }}><span className="dot" style={{ background:c }} />{k==='good'?'Did right in the eyes of the LORD':k==='mixed'?'Began well, ended badly':'Did evil'}</span>)}<span style={{ display:'inline-flex', gap:6, alignItems:'center' }}><span className="dot" style={{ background:'var(--accent)' }} />Event</span></div>
    </div>
    <div className="dg-side">
      <div className="card" style={{ padding:'16px 18px', minHeight:220 }}>
        {!item && <><div className="lab">Click a reign, a prophet or an event</div><p className="note" style={{ marginTop:8 }}>Two kingdoms for two centuries, then one for another 136 years. Dates are approximate to a year or two because the two courts counted regnal years differently; co-regencies overlap on purpose.</p></>}
        {item&&item.kind==='king' && <><div className="lab" style={{ color:item.realm==='Judah'?'#d69282':'#8fb3dc' }}>{item.realm}</div><div style={{ fontSize:26, fontFamily:'var(--f-disp)', marginTop:4 }}>{item.k[0]}</div><div className="note">{item.k[1]} to {item.k[2]} BC · {Math.max(item.k[1]-item.k[2],1)} year{item.k[1]-item.k[2]===1?'':'s'} · <span style={{ color:COL[item.k[3]] }}>{item.k[3]==='good'?'did right':item.k[3]==='mixed'?'mixed':'did evil'}</span></div><p style={{ margin:'12px 0 0', fontSize:16 }}>{item.k[5]}</p><div style={{ display:'flex', gap:6, flexWrap:'wrap', marginTop:12 }}>{item.k[4].split(';').map(r=>{ const t=r.trim(); const h=refHref(t); return h?<a key={t} className="chip" href={h}>{t}</a>:<span key={t} className="chip">{t}</span>; })}</div></>}
        {item&&item.kind==='prophet' && <><div className="lab" style={{ color:PCOL[item.p[3]] }}>Prophet to {item.p[3]==='exile'?'the exiles':item.p[3]}</div><div style={{ fontSize:26, fontFamily:'var(--f-disp)', marginTop:4 }}>{item.p[0]}</div><div className="note">about {item.p[1]} to {item.p[2]} BC</div><p style={{ margin:'12px 0 0', fontSize:16 }}>{item.p[5]}</p><div style={{ display:'flex', gap:6, flexWrap:'wrap', marginTop:12 }}>{item.p[4].split(';').map(r=>{ const t=r.trim(); const h=refHref(t); return h?<a key={t} className="chip" href={h}>{t}</a>:<span key={t} className="chip">{t}</span>; })}</div></>}
        {item&&item.kind==='event' && <><div className="lab" style={{ color:'var(--accent)' }}>{item.e[0]} BC</div><p style={{ margin:'10px 0 0', fontSize:18 }}>{item.e[1]}</p></>}
      </div>
      <div className="card" style={{ padding:'14px 16px' }}><div className="lab" style={{ marginBottom:8 }}>Events</div>{EVENTS.map(([y,t,r])=><button key={y} className="dg-part" onClick={()=>setSel({ kind:'event', e:[y,t] })}><span className="note" style={{ minWidth:40 }}>{y}</span><span>{t}</span></button>)}</div>
    </div>
  </div>;
}
