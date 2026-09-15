'use client';
import { use } from 'react';
import { modelById, MODELS } from '../../../../lib/models/index.js';
import { diagramById } from '../../../../lib/diagrams/index.js';
import ModelViewer from '../../../../components/three/ModelViewer.jsx';
import { BOOKS } from '../../../../lib/data.js';
import Sketchfab from '../../../../components/three/Sketchfab.jsx';
export default function Page({ params }){
  const { id } = use(params); const m=modelById(id); const d=m&&diagramById(m.diagram);
  if(!m) return <div className="wrap"><h1 className="h1">Not found</h1><p><a href="/reference/models">Back to the models</a></p></div>;
  const idx=MODELS.indexOf(m); const prev=MODELS[idx-1], next=MODELS[idx+1];
  return <div className="wrap" style={{ maxWidth:1600 }}>
    <div className="crumb"><a href="/reference">Reference</a><span>/</span><a href="/reference/models">3D models</a><span>/</span><span style={{ color:'var(--ink)' }}>{m.title}</span></div>
    <div className="lab" style={{ marginTop:36 }}>{d?d.subtitle.replace(/, east at the right|, north at the top|plan view, /g,''):''}</div>
    <h1 className="h1" style={{ marginTop:8, fontSize:'clamp(44px,6vw,88px)' }}>{m.title}</h1>
    {d && <p style={{ fontSize:20, margin:'18px 0 0', maxWidth:820, color:'var(--dim)' }}>{d.intro}</p>}
    <div style={{ display:'flex', gap:8, flexWrap:'wrap', marginTop:14, alignItems:'center' }}>{d&&d.books.map(b=>{ const bk=BOOKS.find(x=>x.name===b); return bk?<a key={b} className="chip" href={`/book/${bk.slug}`}>{b}</a>:null; })}<a className="btn ghost sm" href={`/reference/diagrams/${m.diagram}`}>Blueprint view</a></div>
    <div style={{ marginTop:28 }}><ModelViewer model={m} /></div>
    <div className="sect"><div><div className="lab" style={{ color:'var(--ink)' }}>Reconstruction choices</div><div className="note" style={{ marginTop:8 }}>Where the text gives a measurement it is used exactly. Where it is silent, this is what was decided and why.</div></div>
      <div className="grid2">{m.choices.map(([t,x])=><div key={t} className="card" style={{ padding:'18px 20px' }}><div style={{ fontSize:20, fontWeight:500, lineHeight:1.2 }}>{t}</div><p style={{ margin:'8px 0 0', color:'var(--dim)', fontSize:16 }}>{x}</p></div>)}</div></div>
    {m.others && m.others.length>0 && <div className="sect"><div><div className="lab" style={{ color:'var(--ink)' }}>Other reconstructions</div><div className="note" style={{ marginTop:8 }}>Models by other people, shown here under their own licences for comparison. Loading one streams it from Sketchfab.</div></div>
      <div className="grid2">{m.others.map(([t,a,l,uid,n])=><Sketchfab key={uid} uid={uid} title={t} author={a} licence={l} note={n} />)}</div></div>}
    {m.sources && <div className="sect"><div><div className="lab" style={{ color:'var(--ink)' }}>Sources</div><div className="note" style={{ marginTop:8 }}>What this reconstruction was checked against.</div></div>
      <div style={{ display:'flex', flexDirection:'column', gap:10 }}>{m.sources.map(([t,d,u])=><div key={t}><a href={u} target={u.startsWith('http')?'_blank':undefined} rel="noopener" style={{ fontWeight:500 }}>{t}</a><div className="note">{d}</div></div>)}</div></div>}
    <div style={{ display:'flex', justifyContent:'space-between', marginTop:56, gap:12, flexWrap:'wrap' }}><span>{prev && <a href={`/reference/models/${prev.id}`}>← {prev.title}</a>}</span><span>{next && <a href={`/reference/models/${next.id}`}>{next.title} →</a>}</span></div>
  </div>;
}
