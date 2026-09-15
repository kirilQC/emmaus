'use client';
import { MAPS } from '../../../lib/atlas/maps.js';
import { ico } from '../../../lib/icons.js';
export default function Page(){
  return <div className="wrap">
    <div className="crumb"><a href="/reference">Reference</a><span>/</span><span style={{ color:'var(--ink)' }}>Atlas</span></div>
    <h1 className="h1" style={{ marginTop:36, fontSize:'clamp(48px,7vw,96px)' }}>Atlas</h1>
    <p style={{ fontSize:22, color:'var(--dim)', margin:'14px 0 0', maxWidth:760 }}>Every map is drawn on real terrain from open data. Boundaries are the text’s own descriptions, approximate where the text is. Click any place to read the chapters that mention it.</p>
    <div className="grid2" style={{ marginTop:40 }}>
      {MAPS.map(m=><a key={m.id} className="card" href={`/reference/atlas/${m.id}`} style={{ padding:'22px 24px', color:'var(--ink)', display:'flex', flexDirection:'column', gap:8 }}><span className="gi" dangerouslySetInnerHTML={{ __html:ico('map',22) }} /><span className="lab" style={{ marginTop:4 }}>{m.books.slice(0,3).join(' · ')}</span><span style={{ fontSize:28, lineHeight:1.1, fontFamily:'var(--f-disp)' }}>{m.title}</span><span style={{ color:'var(--dim)', fontSize:16 }}>{m.subtitle}</span><span className="note">{m.places.length} places · {m.routes.reduce((a,r)=>a+r.legs.length,0)} route legs · {m.regions.length} regions</span></a>)}
    </div>
  </div>;
}
