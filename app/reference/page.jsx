'use client';
import Artwork from '../../components/Artwork.jsx';
import { MAPS } from '../../lib/atlas/maps.js';
import { DIAGRAMS } from '../../lib/diagrams/index.js';
import { CHARTS } from '../../lib/charts/tables.js';
import { ESSAYS } from '../../lib/background.js';
import { MODELS } from '../../lib/models/index.js';
import { ico } from '../../lib/icons.js';
const SHELVES=[
  ['Atlas','/reference/atlas','map',`${MAPS.length} maps`,'Interactive maps on real terrain. Places open their chapters; routes are broken into legs with references.'],
  ['Diagrams','/reference/diagrams','tablets',`${DIAGRAMS.length} drawings`,'Original drawings to the cubit, every element linked to its verse.'],
  ['3D models','/reference/models','layers',`${MODELS.length} models`,'The blueprints raised to full height. Orbit, zoom, lift the coverings, click any part.'],
  ['Charts','/reference/charts','scales',`${CHARTS.length+1} charts`,'Timelines and tables: reigns, prophets, feasts, offerings, covenants, genealogies.'],
  ['Background','/reference/background','scroll',`${ESSAYS.length} essays`,'What the Bible assumes you know: the silent centuries, the parties, daily life, how we got the text.'],
];
export default function Page(){
  return <div className="wrap"><Artwork id="C6" className="art-page-heading"/>
    <div className="lab">The reference shelf</div>
    <h1 className="h1" style={{ marginTop:8, fontSize:'clamp(48px,7vw,96px)' }}>Reference</h1>
    <p style={{ fontSize:22, color:'var(--dim)', margin:'14px 0 0', maxWidth:760 }}>The context people go to Bible school for. Maps, layouts, timelines and background, all drawn from the text and open data, and all linked back to the chapters they explain.</p>
    <div className="grid2" style={{ marginTop:40 }}>
      {SHELVES.map(([t,h,i,c,d])=><a key={t} className="card art-card" href={h} style={{ padding:'24px 26px', color:'var(--ink)', display:'flex', gap:18 }}><Artwork id={({Atlas:"C1",Diagrams:"C2","3D models":"C3",Charts:"C4",Background:"C6"})[t]} className="art-card-heading"/><span className="gi" dangerouslySetInnerHTML={{ __html:ico(i,24) }} /><span className="art-card-copy"><span className="lab">{c}</span><span className="art-card-title" style={{ display:'block', fontSize:28, fontWeight:500, lineHeight:1.1, marginTop:4, fontFamily:'var(--f-disp)' }}>{t}</span><span style={{ color:'var(--dim)', fontSize:16, display:'block', marginTop:6 }}>{d}</span></span></a>)}
    </div>
  </div>;
}
