'use client';
import { use } from 'react';
import { essayById, ESSAYS } from '../../../../lib/background.js';
import { linkRefs } from '../../../../components/charts/TableChart.jsx';
import { BOOKS } from '../../../../lib/data.js';
export default function Page({ params }){
  const { id } = use(params); const e=essayById(id);
  if(!e) return <div className="wrap"><h1 className="h1">Not found</h1><p><a href="/reference/background">Back</a></p></div>;
  const idx=ESSAYS.indexOf(e); const prev=ESSAYS[idx-1], next=ESSAYS[idx+1];
  return <div className="wrap">
    <div className="crumb"><a href="/explore#reference">Explore</a><span>/</span><a href="/reference/background">Background</a><span>/</span><span style={{ color:'var(--ink)' }}>{e.title}</span></div>
    <div className="lab" style={{ marginTop:36 }}>{e.subtitle}</div>
    <h1 className="h1" style={{ marginTop:8, fontSize:'clamp(40px,5.5vw,80px)' }}>{e.title}</h1>
    <p style={{ fontSize:22, margin:'22px 0 0', maxWidth:760, fontStyle:'italic' }}>{e.intro}</p>
    <div style={{ display:'flex', gap:6, flexWrap:'wrap', marginTop:14 }}>{e.books.map(b=>{ const bk=BOOKS.find(x=>x.name===b); return bk?<a key={b} className="chip" href={`/book/${bk.slug}`}>{b}</a>:null; })}</div>
    <div style={{ marginTop:20 }}>{e.sections.map(([h,body],i)=><div key={h} className="sect" style={{ marginTop:i?44:36 }}><div><div className="lab" style={{ color:'var(--ink)' }}>{h}</div></div><p style={{ margin:0, fontSize:19, lineHeight:1.7, maxWidth:'70ch' }}>{linkRefs(body)}</p></div>)}</div>
    <div className="sect"><div className="lab" style={{ color:'var(--ink)' }}>Read next</div><div style={{ display:'flex', flexDirection:'column', gap:6 }}>{e.further.map(f=><div key={f} style={{ fontSize:17 }}>{linkRefs(f)}</div>)}</div></div>
    <div style={{ display:'flex', justifyContent:'space-between', marginTop:56, gap:12, flexWrap:'wrap' }}><span>{prev && <a href={`/reference/background/${prev.id}`}>← {prev.title}</a>}</span><span>{next && <a href={`/reference/background/${next.id}`}>{next.title} →</a>}</span></div>
  </div>;
}
