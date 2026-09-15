'use client';
import Artwork from '../../../components/Artwork.jsx';
import { MODELS } from '../../../lib/models/index.js';
import { diagramById } from '../../../lib/diagrams/index.js';
import { ico } from '../../../lib/icons.js';
const SOON=[];
export default function Page(){
  return <div className="wrap"><Artwork id="C3" className="art-page-heading"/>
    <div className="crumb"><a href="/reference">Reference</a><span>/</span><span style={{ color:'var(--ink)' }}>3D models</span></div>
    <h1 className="h1" style={{ marginTop:36, fontSize:'clamp(48px,7vw,96px)' }}>3D Models</h1>
    <p style={{ fontSize:22, color:'var(--dim)', margin:'14px 0 0', maxWidth:760 }}>The buildings from the blueprints, raised to full height from the same measurements. Orbit, zoom, lift the coverings, and click any part.</p>
    <div className="grid2" style={{ marginTop:40 }}>
      {MODELS.map(m=>{ const d=diagramById(m.diagram); return <a key={m.id} className="card" href={`/reference/models/${m.id}`} style={{ padding:'22px 24px', color:'var(--ink)', display:'flex', flexDirection:'column', gap:8 }}><span className="gi" dangerouslySetInnerHTML={{ __html:ico('layers',22) }} /><span className="lab" style={{ marginTop:4 }}>{d?d.books.slice(0,3).join(' · '):''}</span><span style={{ fontSize:28, lineHeight:1.1, fontFamily:'var(--f-disp)' }}>{m.title}</span><span style={{ color:'var(--dim)', fontSize:16 }}>{d?d.subtitle:''}</span></a>; })}
    </div>
    {SOON.filter(s=>!MODELS.some(m=>m.title===s)).length>0 && <div className="sect"><div className="lab" style={{ color:'var(--ink)' }}>Being built</div><div style={{ display:'flex', gap:8, flexWrap:'wrap' }}>{SOON.filter(s=>!MODELS.some(m=>m.title===s)).map(s=><span key={s} className="chip">{s}</span>)}</div></div>}
  </div>;
}
