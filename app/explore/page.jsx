import Artwork from '../../components/Artwork.jsx';
import Sect from '../../components/learn/Sect.jsx';
import StartHere from '../../components/learn/StartHere.jsx';
import { Grade } from '../../components/learn/Badges.jsx';
import { ico } from '../../lib/icons.js';
import { PEOPLE, ROLES, PARABLES, PLACES, EVENTS } from '../../lib/data.js';
import { MAPS } from '../../lib/atlas/maps.js';
import { DIAGRAMS } from '../../lib/diagrams/index.js';
import { CHARTS } from '../../lib/charts/tables.js';
import { ESSAYS } from '../../lib/background.js';
import { MODELS } from '../../lib/models/index.js';
import { LANES, EVIDENCE, EVIDENCE_ORDER } from '../../lib/learn/lanes.js';
import { STUDIES, LANE_COUNTS, PATH, THEMES, QUESTIONS, SOURCES } from '../../lib/learn/index.js';
import { MOTTO } from '../../lib/learn/method.js';
export const metadata={ title:'Explore · Emmaus' };
const SHELVES=[
  ['Atlas','/reference/atlas','map','C1',`${MAPS.length} maps`,'Interactive maps on real terrain. Places open their chapters; routes are broken into legs with references.'],
  ['Diagrams','/reference/diagrams','tablets','C2',`${DIAGRAMS.length} drawings`,'Original drawings to the cubit, every element linked to its verse.'],
  ['3D models','/reference/models','layers','C3',`${MODELS.length} models`,'The blueprints raised to full height. Orbit, zoom, lift the coverings, click any part.'],
  ['Charts','/reference/charts','scales','C4',`${CHARTS.length+1} charts`,'Timelines and tables: reigns, prophets, feasts, offerings, covenants, genealogies.'],
  ['Background','/reference/background','scroll','C6',`${ESSAYS.length} essays`,'What the Bible assumes you know: the silent centuries, the parties, daily life, how we got the text.'],
];
const WORLD=[
  ['People','/people','person','C5',`${PEOPLE.length} people in ${ROLES.length} groups`,'Who they were, where they appear, what they were for.'],
  ['Parables of Jesus','/parables','seed','B4',`${PARABLES.length} parables`,'Every parable, where it is told, and what it teaches.'],
  ['Places','/places','pin','C3',`${PLACES.length} places mapped`,'Real coordinates from open data; every place linked to its chapters.'],
  ['Major events','/timeline','flag','C4',`${EVENTS.length} events`,'From Abraham to Revelation on one timeline.'],
  ['Commandments and teachings','/commandments','tablets','D3','The Ten, the two greatest, the Beatitudes','The lists people mean by "commandments", plus the great discourses and the Lord’s Prayer.'],
];
const Card=({ t,h,i,a,c,d })=><a className="card art-card" href={h} style={{ padding:'22px 24px', color:'var(--ink)', display:'flex', gap:16 }}><Artwork id={a} className="art-card-heading"/><span className="gi" dangerouslySetInnerHTML={{ __html:ico(i,24) }}/><span className="art-card-copy"><span className="lab">{c}</span><span className="art-card-title" style={{ display:'block', fontSize:26, lineHeight:1.1, marginTop:4, fontFamily:'var(--f-disp)' }}>{t}</span><span style={{ color:'var(--dim)', fontSize:16, display:'block', marginTop:6 }}>{d}</span></span></a>;
export default function Page(){
  const steps=PATH.map(p=>({ n:p.n, id:p.id, href:p.study.href, title:p.study.title, lane:p.study.lane, evidence:p.study.evidence, why:p.why }));
  const jump=[['Start here','#start','road'],['Studies','#learn','lamp'],['Reference','#reference','map'],['People and places','#world','compass'],['Themes','#themes','link'],['Harder questions','/learn/questions','spark'],['Sources','/learn/sources','shelf'],['The method','/learn/method','scales']];
  return <div className="wrap"><Artwork id="A2" className="art-page-heading"/>
    <div className="lab">Everything that is not a chapter</div>
    <h1 className="h1" style={{ marginTop:8, fontSize:'clamp(48px,7vw,96px)' }}>Explore</h1>
    <p style={{ fontSize:22, color:'var(--dim)', margin:'14px 0 0', maxWidth:780 }}>{STUDIES.length} guided studies, {MAPS.length} maps, {DIAGRAMS.length+MODELS.length} drawings and models, {CHARTS.length+1} charts, {ESSAYS.length} background essays, and the people, stories and places of the whole Bible. Everything links back to the chapters it explains.</p>
    <div className="strip" style={{ marginTop:28 }}>{jump.map(([t,h,i])=><a key={t} className="gl" href={h}><span className="gi" dangerouslySetInnerHTML={{ __html:ico(i,16) }}/><span>{t}</span></a>)}</div>

    <Sect id="start" label="Start here" icon="road" sub={<span>{MOTTO} A guided path of {PATH.length} studies: the central story first, then the studies that teach the evidence system, then the visuals that unlock the most pages.</span>}>
      <StartHere steps={steps} initial={5}/>
    </Sect>

    <Sect id="learn" label="Studies" icon="lamp" sub={<span>{STUDIES.length} studies in {LANES.length} lanes. Each begins with a passage, says what the text states and what is only inferred, and ends with what it does not establish. <a href="/learn/method">How to read them →</a></span>}>
      <div className="lrn-badges" style={{ marginBottom:18, gap:10 }}>{EVIDENCE_ORDER.map(e=><span key={e} title={EVIDENCE[e][2]}><Grade evidence={e}/></span>)}<span className="note">{QUESTIONS.length} harder questions · {SOURCES.length} sources</span></div>
      <div className="grid3">{LANES.map(([name,slug,icon,blurb])=><a key={slug} className="card lrn-lane" href={`/learn/${slug}`}><span className="gi" dangerouslySetInnerHTML={{ __html:ico(icon,22) }}/><span><span className="lab">{LANE_COUNTS[slug]} {LANE_COUNTS[slug]===1?'study':'studies'}</span><span className="t">{name}</span><span className="note" style={{ display:'block', marginTop:6 }}>{blurb}</span></span></a>)}</div>
    </Sect>

    <Sect id="reference" label="Reference" icon="map" sub="The context people go to Bible school for. Maps, layouts, timelines and background, all drawn from the text and open data.">
      <div className="grid2">{SHELVES.map(([t,h,i,a,c,d])=><Card key={t} t={t} h={h} i={i} a={a} c={c} d={d}/>)}</div>
    </Sect>

    <Sect id="world" label="People, stories and places" icon="compass" sub="Each one links to every chapter it appears in.">
      <div className="grid2">{WORLD.map(([t,h,i,a,c,d])=><Card key={t} t={t} h={h} i={i} a={a} c={c} d={d}/>)}</div>
    </Sect>

    <Sect id="themes" label="Themes" icon="link" sub="Trails from passage to passage while each local context stays visible. Not shortcuts around the books.">
      <div className="grid2">{THEMES.map(t=><div key={t.title} className="card lrn-theme"><span className="t">{t.title}</span><span className="span">{t.span}</span><div style={{ display:'flex', gap:6, flexWrap:'wrap', marginTop:4 }}>{t.studies.map(s=><a key={s.id} className="chip" href={s.href}>{s.title}</a>)}</div></div>)}</div>
    </Sect>
  </div>;
}
