'use client';
import Artwork from '../../../components/Artwork.jsx';
import { ESSAYS } from '../../../lib/background.js';
import { ico } from '../../../lib/icons.js';
export default function Page(){
  return <div className="wrap"><Artwork id="C6" className="art-page-heading"/>
    <div className="crumb"><a href="/explore#reference">Explore</a><span>/</span><span style={{ color:'var(--ink)' }}>Background</span></div>
    <h1 className="h1" style={{ marginTop:36, fontSize:'clamp(48px,7vw,96px)' }}>Background</h1>
    <p style={{ fontSize:22, color:'var(--dim)', margin:'14px 0 0', maxWidth:760 }}>What the writers assumed you already knew. Each essay is ten minutes and every reference in it opens the chapter.</p>
    <div className="grid2" style={{ marginTop:40 }}>
      {ESSAYS.map(e=><a key={e.id} className="card" href={`/reference/background/${e.id}`} style={{ padding:'22px 24px', color:'var(--ink)', display:'flex', flexDirection:'column', gap:8 }}><span className="gi" dangerouslySetInnerHTML={{ __html:ico(e.icon,22) }} /><span className="lab" style={{ marginTop:4 }}>{e.sections.length} parts</span><span style={{ fontSize:26, lineHeight:1.15, fontFamily:'var(--f-disp)' }}>{e.title}</span><span style={{ color:'var(--dim)', fontSize:16 }}>{e.subtitle}</span></a>)}
    </div>
  </div>;
}
