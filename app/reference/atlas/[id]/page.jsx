'use client';
import { use } from 'react';
import { mapById, MAPS } from '../../../../lib/atlas/maps.js';
import { PLACES } from '../../../../lib/atlas/places.js';
import AtlasMap, { refHref } from '../../../../components/AtlasMap.jsx';
import { BOOKS } from '../../../../lib/data.js';
const Ref=({ r })=>{ const h=refHref(r); return h?<a className="chip" href={h}>{r}</a>:<span className="chip">{r}</span>; };
export default function Page({ params }){
  const { id } = use(params); const def=mapById(id);
  if(!def) return <div className="wrap"><h1 className="h1">Not found</h1><p><a href="/reference/atlas">Back to the atlas</a></p></div>;
  const idx=MAPS.indexOf(def); const prev=MAPS[idx-1], next=MAPS[idx+1];
  return <div className="wrap" style={{ maxWidth:1600 }}>
    <div className="crumb"><a href="/reference">Reference</a><span>/</span><a href="/reference/atlas">Atlas</a><span>/</span><span style={{ color:'var(--ink)' }}>{def.title}</span></div>
    <div className="lab" style={{ marginTop:36 }}>{def.subtitle}</div>
    <h1 className="h1" style={{ marginTop:8, fontSize:'clamp(44px,6vw,88px)' }}>{def.title}</h1>
    <p style={{ fontSize:20, margin:'18px 0 0', maxWidth:820, color:'var(--dim)' }}>{def.intro}</p>
    <div style={{ display:'flex', gap:6, flexWrap:'wrap', marginTop:14 }}>{def.books.map(b=>{ const bk=BOOKS.find(x=>x.name===b); return bk?<a key={b} className="chip" href={`/book/${bk.slug}`}>{b}</a>:null; })}</div>
    <div style={{ marginTop:28 }}><AtlasMap def={def} /></div>
    {def.routes.length>0 && <div className="sect"><div><div className="lab" style={{ color:'var(--ink)' }}>The route, leg by leg</div><div className="note" style={{ marginTop:8 }}>Each leg lists its stops in order and the chapters that record it.</div></div>
      <div style={{ display:'flex', flexDirection:'column', gap:22 }}>{def.routes.map(r=><div key={r.id}><div style={{ display:'flex', gap:10, alignItems:'center', marginBottom:8 }}><span style={{ background:r.color, width:22, height:4, display:'inline-block', borderRadius:2 }} /><span style={{ fontWeight:500 }}>{r.label}</span></div>
        <div className="tablewrap"><table><tbody>{r.legs.map((l,i)=><tr key={i}><td style={{ width:60 }} className="note">{i+1}</td><td style={{ fontWeight:500, minWidth:180 }}>{l.label}</td><td className="note">{l.stops.join(' → ')}</td><td><div style={{ display:'flex', gap:6, flexWrap:'wrap' }}>{l.refs.map(x=><Ref key={x} r={x} />)}</div></td></tr>)}</tbody></table></div></div>)}</div></div>}
    <div className="sect"><div><div className="lab" style={{ color:'var(--ink)' }}>Places</div><div className="note" style={{ marginTop:8 }}>What happened where, with the modern site.</div></div>
      <div className="tablewrap"><table><thead><tr><th>Place</th><th>Today</th><th>What happened here</th><th>Read</th></tr></thead><tbody>{def.places.map(([n,refs,d])=><tr key={n}><td style={{ fontWeight:500, whiteSpace:'nowrap' }}>{n}</td><td className="note">{PLACES[n].modern}{PLACES[n].approx?' (approx.)':''}</td><td style={{ color:'var(--dim)' }}>{d}</td><td><div style={{ display:'flex', gap:6, flexWrap:'wrap' }}>{refs.map(x=><Ref key={x} r={x} />)}</div></td></tr>)}</tbody></table></div></div>
    {def.regions.some(r=>r.ref) && <div className="sect"><div className="lab" style={{ color:'var(--ink)' }}>Boundaries in the text</div><div style={{ display:'flex', flexWrap:'wrap', gap:8 }}>{def.regions.filter(r=>r.ref).map(r=><Ref key={r.name} r={r.ref} />)}</div></div>}
    <div className="sect"><div><div className="lab" style={{ color:'var(--ink)' }}>Worth knowing</div><div className="note" style={{ marginTop:8 }}>Where the evidence is thin or scholars disagree, it says so.</div></div>
      <div className="grid2">{def.notes.map(([t,d])=><div key={t} className="card" style={{ padding:'18px 20px' }}><div style={{ fontSize:20, fontWeight:500, lineHeight:1.2 }}>{t}</div><p style={{ margin:'8px 0 0', color:'var(--dim)', fontSize:16 }}>{d}</p></div>)}</div></div>
    <div style={{ display:'flex', justifyContent:'space-between', marginTop:56, gap:12, flexWrap:'wrap' }}><span>{prev && <a href={`/reference/atlas/${prev.id}`}>← {prev.title}</a>}</span><span>{next && <a href={`/reference/atlas/${next.id}`}>{next.title} →</a>}</span></div>
    <p className="note" style={{ marginTop:40 }}>Terrain from Mapzen and AWS open elevation data. Coastlines and rivers from OpenStreetMap via OpenFreeMap. Ancient boundaries and routes drawn for Emmaus from the biblical text and standard reference works; they are interpretations, not surveys.</p>
  </div>;
}
