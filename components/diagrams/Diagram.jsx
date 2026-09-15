'use client';
import { useState } from 'react';
import { refHref } from '../AtlasMap.jsx';
const Ref=({ r })=>{ const h=refHref(r); return h?<a className="chip" href={h}>{r}</a>:<span className="chip">{r}</span>; };
// Generic renderer: real units in, interactive SVG out. Scale chosen so the drawing is about 900px wide.
export default function Diagram({ def }){
  const [sel,setSel]=useState(null);
  const [W,H]=def.size; const pad=def.pad||4; const k=Math.min(900/(W+2*pad), 720/(H+2*pad));
  const vb=`${-pad*k} ${-pad*k} ${(W+2*pad)*k} ${(H+2*pad)*k}`;
  const els=def.elements; const cur=els.find(e=>e.id===sel);
  const common=e=>({ className:'dg-el'+(sel===e.id?' on':''), onClick:()=>setSel(e.id===sel?null:e.id), onMouseEnter:()=>{}, tabIndex:0, role:'button', 'aria-label':e.name, onKeyDown:ev=>{ if(ev.key==='Enter'||ev.key===' '){ ev.preventDefault(); setSel(e.id===sel?null:e.id); } } });
  const paint=e=>({ fill:e.fill==='none'?'transparent':(e.fill||'#2a241b'), stroke:e.stroke==='none'?'none':(e.stroke||'#c9b79a'), strokeWidth:(e.width||1.2), strokeDasharray:e.dash?'4 3':undefined, vectorEffect:'non-scaling-stroke' });
  return <div className="dg">
    <div className="dg-svg card">
      <svg viewBox={vb} style={{ width:'100%', height:'auto', maxHeight:760, display:'block', margin:'0 auto' }} aria-label={def.title}>
        {els.map(e=>{
          if(e.type==='rect') return <rect key={e.id} {...common(e)} x={e.x*k} y={e.y*k} width={Math.max(e.w*k,1.5)} height={Math.max(e.h*k,1.5)} {...paint(e)} />;
          if(e.type==='circle') return <circle key={e.id} {...common(e)} cx={e.cx*k} cy={e.cy*k} r={e.r*k} {...paint(e)} />;
          if(e.type==='line') return <line key={e.id} {...common(e)} x1={e.x1*k} y1={e.y1*k} x2={e.x2*k} y2={e.y2*k} stroke={e.stroke||'#c9b79a'} strokeWidth={e.width||2} strokeLinecap="round" />;
          if(e.type==='poly') return <polygon key={e.id} {...common(e)} points={e.pts.map(p=>p[0]*k+','+p[1]*k).join(' ')} {...paint(e)} />;
          return null; })}
        {els.filter(e=>e.tag).map(e=>{ const cx=e.type==='circle'?e.cx:(e.x+e.w/2), cy=(e.type==='circle'?e.cy+e.r:(e.y+e.h))+1.2; return <text key={'t'+e.id} x={cx*k} y={cy*k+8} textAnchor="middle" style={{ fontFamily:'var(--f-ui)', fontSize:9, fill:'var(--dim)', pointerEvents:'none' }}>{e.tag}</text>; })}
        {(def.dots||[]).map((d,i)=><circle key={'d'+i} cx={d[0]*k} cy={d[1]*k} r={1.6} fill="#c9b79a" opacity={.9} style={{ pointerEvents:'none' }} />)}
        {def.labels.map((l,i)=><text key={i} x={l.x*k} y={l.y*k} textAnchor="middle" dominantBaseline="middle" transform={l.vertical?`rotate(-90 ${l.x*k} ${l.y*k})`:undefined} style={{ fontFamily:'var(--f-ui)', fontSize:l.compass?12:(l.small?9:11), letterSpacing:'.14em', fill:l.compass?'var(--accent)':'var(--dim)', fontWeight:600, pointerEvents:'none' }}>{l.text}</text>)}
        {def.unit!=='schematic' && <g style={{ pointerEvents:'none' }}><line x1={0} y1={(H+pad*0.6)*k} x2={(def.unit==='metre'?50:10)*k} y2={(H+pad*0.6)*k} stroke="var(--dim)" strokeWidth={1.2} /><text x={0} y={(H+pad*0.6)*k-4} style={{ fontFamily:'var(--f-ui)', fontSize:9, fill:'var(--dim)' }}>{def.unit==='metre'?'50 m':'10 cubits'}</text></g>}
      </svg>
    </div>
    <div className="dg-side">
      <div className="card" style={{ padding:'16px 18px', minHeight:200 }}>
        {cur ? <>
          <div className="lab" style={{ color:'var(--accent)' }}>{cur.name}</div>
          {cur.dims && <div className="note" style={{ marginTop:4 }}>{cur.dims}</div>}
          {cur.what && <p style={{ margin:'12px 0 0', fontSize:17 }}>{cur.what}</p>}
          {cur.meaning && <p style={{ margin:'10px 0 0', fontSize:16, color:'var(--dim)', fontStyle:'italic' }}>{cur.meaning}</p>}
          {cur.refs && cur.refs.length>0 && <div style={{ display:'flex', gap:6, flexWrap:'wrap', marginTop:12 }}>{cur.refs.map(r=><Ref key={r} r={r} />)}</div>}
        </> : <><div className="lab">Click any part of the drawing</div><p className="note" style={{ marginTop:8 }}>{def.unitNote}</p></>}
      </div>
      <div className="card" style={{ padding:'14px 16px' }}><div className="lab" style={{ marginBottom:8 }}>Parts</div><div style={{ display:'flex', flexDirection:'column', gap:2 }}>{els.filter(e=>e.name).map(e=><button key={e.id} className={'dg-part'+(sel===e.id?' on':'')} onClick={()=>setSel(e.id)}><span className="dot" style={{ background:e.fill&&e.fill!=='none'?e.fill:(e.stroke||'#c9b79a') }} />{e.name}</button>)}</div></div>
    </div>
  </div>;
}
