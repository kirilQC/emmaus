'use client';
import Artwork from '../../../components/Artwork.jsx';
import { DIAGRAMS } from '../../../lib/diagrams/index.js';
import { ico } from '../../../lib/icons.js';
export default function Page(){
  return <div className="wrap"><Artwork id="C2" className="art-page-heading"/>
    <div className="crumb"><a href="/explore#reference">Explore</a><span>/</span><span style={{ color:'var(--ink)' }}>Diagrams</span></div>
    <h1 className="h1" style={{ marginTop:36, fontSize:'clamp(48px,7vw,96px)' }}>Diagrams</h1>
    <p style={{ fontSize:22, color:'var(--dim)', margin:'14px 0 0', maxWidth:760 }}>Layouts drawn from the measurements in the text. Click any part for its dimensions, its use, the verses that describe it, and how the New Testament reads it.</p>
    <div className="grid2" style={{ marginTop:40 }}>
      {DIAGRAMS.map(d=><a key={d.id} className="card" href={`/reference/diagrams/${d.id}`} style={{ padding:'22px 24px', color:'var(--ink)', display:'flex', flexDirection:'column', gap:8 }}><span className="gi" dangerouslySetInnerHTML={{ __html:ico('tablets',22) }} /><span className="lab" style={{ marginTop:4 }}>{d.books.slice(0,3).join(' · ')}</span><span style={{ fontSize:28, lineHeight:1.1, fontFamily:'var(--f-disp)' }}>{d.title}</span><span style={{ color:'var(--dim)', fontSize:16 }}>{d.subtitle}</span><span className="note">{d.elements.filter(e=>e.name).length} parts · {d.notes.length} notes</span></a>)}
    </div>
  </div>;
}
