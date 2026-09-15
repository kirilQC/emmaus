'use client';
import { use } from 'react';
import { diagramById, DIAGRAMS } from '../../../../lib/diagrams/index.js';
import Diagram from '../../../../components/diagrams/Diagram.jsx';
import { BOOKS } from '../../../../lib/data.js';
export default function Page({ params }){
  const { id } = use(params); const def=diagramById(id);
  if(!def) return <div className="wrap"><h1 className="h1">Not found</h1><p><a href="/reference/diagrams">Back to the diagrams</a></p></div>;
  const idx=DIAGRAMS.indexOf(def); const prev=DIAGRAMS[idx-1], next=DIAGRAMS[idx+1];
  return <div className="wrap" style={{ maxWidth:1600 }}>
    <div className="crumb"><a href="/reference">Reference</a><span>/</span><a href="/reference/diagrams">Diagrams</a><span>/</span><span style={{ color:'var(--ink)' }}>{def.title}</span></div>
    <div className="lab" style={{ marginTop:36 }}>{def.subtitle}</div>
    <h1 className="h1" style={{ marginTop:8, fontSize:'clamp(44px,6vw,88px)' }}>{def.title}</h1>
    <p style={{ fontSize:20, margin:'18px 0 0', maxWidth:820, color:'var(--dim)' }}>{def.intro}</p>
    <div style={{ display:'flex', gap:6, flexWrap:'wrap', marginTop:14 }}>{def.books.map(b=>{ const bk=BOOKS.find(x=>x.name===b); return bk?<a key={b} className="chip" href={`/book/${bk.slug}`}>{b}</a>:null; })}</div>
    <div style={{ marginTop:28 }}><Diagram def={def} /></div>
    <div className="sect"><div><div className="lab" style={{ color:'var(--ink)' }}>Worth knowing</div><div className="note" style={{ marginTop:8 }}>Where the text is silent or scholars disagree, it says so.</div></div>
      <div className="grid2">{def.notes.map(([t,d])=><div key={t} className="card" style={{ padding:'18px 20px' }}><div style={{ fontSize:20, fontWeight:500, lineHeight:1.2 }}>{t}</div><p style={{ margin:'8px 0 0', color:'var(--dim)', fontSize:16 }}>{d}</p></div>)}</div></div>
    <div style={{ display:'flex', justifyContent:'space-between', marginTop:56, gap:12, flexWrap:'wrap' }}><span>{prev && <a href={`/reference/diagrams/${prev.id}`}>← {prev.title}</a>}</span><span>{next && <a href={`/reference/diagrams/${next.id}`}>{next.title} →</a>}</span></div>
  </div>;
}
