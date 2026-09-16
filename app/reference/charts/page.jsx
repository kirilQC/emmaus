'use client';
import Artwork from '../../../components/Artwork.jsx';
import { ico } from '../../../lib/icons.js';
import { CHARTS as TABLES } from '../../../lib/charts/tables.js';
const ICONS={ feasts:'star', offerings:'flame', covenants:'scroll', twelve:'fish', measures:'scales', 'paul-life':'road', herods:'crown' };
const CHARTS=[['kings','Kings and prophets','Every king of Israel and Judah on one timeline, judged as Kings judges them, with the prophets over the reigns they spoke into.','1 Kings · 2 Kings · the Prophets','crown'],...TABLES.map(t=>[t.id,t.title,t.subtitle,t.books.slice(0,3).join(' · '),ICONS[t.id]||'layers'])];
const SOON=['Genealogies from Adam to Jesus','A harmony of the Gospels','Miracles and parables by Gospel','Messianic prophecies and where they land'];
export default function Page(){
  return <div className="wrap"><Artwork id="C4" className="art-page-heading"/>
    <div className="crumb"><a href="/explore#reference">Explore</a><span>/</span><span style={{ color:'var(--ink)' }}>Charts</span></div>
    <h1 className="h1" style={{ marginTop:36, fontSize:'clamp(48px,7vw,96px)' }}>Charts</h1>
    <p style={{ fontSize:22, color:'var(--dim)', margin:'14px 0 0', maxWidth:760 }}>Timelines and tables that put things side by side which the text keeps chapters apart.</p>
    <div className="grid2" style={{ marginTop:40 }}>
      {CHARTS.map(([id,t,d,b,i])=><a key={id} className="card" href={`/reference/charts/${id}`} style={{ padding:'22px 24px', color:'var(--ink)', display:'flex', flexDirection:'column', gap:8 }}><span className="gi" dangerouslySetInnerHTML={{ __html:ico(i,22) }} /><span className="lab" style={{ marginTop:4 }}>{b}</span><span style={{ fontSize:28, lineHeight:1.1, fontFamily:'var(--f-disp)' }}>{t}</span><span style={{ color:'var(--dim)', fontSize:16 }}>{d}</span></a>)}
    </div>
    <div className="sect"><div className="lab" style={{ color:'var(--ink)' }}>Coming next</div><div style={{ display:'flex', gap:8, flexWrap:'wrap' }}>{SOON.map(s=><span key={s} className="chip">{s}</span>)}</div></div>
  </div>;
}
