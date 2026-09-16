import Artwork from '../../components/Artwork.jsx';
import Sect from '../../components/learn/Sect.jsx';
import StartHere from '../../components/learn/StartHere.jsx';
import { Grade } from '../../components/learn/Badges.jsx';
import { ico } from '../../lib/icons.js';
import { LANES, EVIDENCE, EVIDENCE_ORDER } from '../../lib/learn/lanes.js';
import { STUDIES, LANE_COUNTS, PATH, THEMES, QUESTIONS } from '../../lib/learn/index.js';
import { MOTTO } from '../../lib/learn/method.js';
export const metadata={ title:'Learn · Emmaus' };
export default function Page(){
  const steps=PATH.map(p=>({ n:p.n, id:p.id, href:p.study.href, title:p.study.title, lane:p.study.lane, evidence:p.study.evidence, why:p.why }));
  const quick=[['Start here','#start','A guided path of '+PATH.length+' studies','road'],['How to read these','/learn/method','The method and the grades','scales'],['Harder questions','/learn/questions',QUESTIONS.length+' open questions','spark'],['Sources','/learn/sources','Every source, and why it was trusted','shelf']];
  return <div className="wrap"><Artwork id="A5" className="art-page-heading"/>
    <div className="lab">{MOTTO}</div>
    <h1 className="h1" style={{ marginTop:8, fontSize:'clamp(48px,7vw,96px)' }}>Learn</h1>
    <p style={{ fontSize:22, color:'var(--dim)', margin:'14px 0 0', maxWidth:780 }}>{STUDIES.length} studies in {LANES.length} lanes. Each one begins with a passage, says what the text states and what is only inferred, and ends with what it does not establish. Every reference opens the chapter.</p>
    <div className="lrn-quick">{quick.map(([t,h,d,i])=><a key={t} className="card" href={h}><span className="gi" dangerouslySetInnerHTML={{ __html:ico(i,20) }}/><span><span style={{ display:'block', fontWeight:500, fontSize:18, lineHeight:1.2 }}>{t}</span><span className="note">{d}</span></span></a>)}</div>

    <Sect id="start" label="Start here" icon="road" sub="The book’s own order: the central story first, then the studies that teach the evidence system, then the visuals that unlock the most pages.">
      <StartHere steps={steps}/>
    </Sect>

    <Sect label="How the grades work" icon="scales" sub={<span>Every study carries one of these. <a href="/learn/method">Read the method →</a></span>}>
      <div style={{ display:'flex', flexDirection:'column', gap:10, maxWidth:720 }}>{EVIDENCE_ORDER.map(e=><div key={e} style={{ display:'grid', gridTemplateColumns:'130px minmax(0,1fr)', gap:14, alignItems:'baseline' }}><Grade evidence={e}/><span><span style={{ fontWeight:500 }}>{e}.</span> <span style={{ color:'var(--dim)' }}>{EVIDENCE[e][2]}</span> <span className="note">{STUDIES.filter(s=>s.evidence===e).length||''}</span></span></div>)}</div>
    </Sect>

    <Sect label="Twenty lanes" icon="layers" sub="Browse by subject. Within a lane, filter by level and by evidence grade.">
      <div className="grid3">{LANES.map(([name,slug,icon,blurb])=><a key={slug} className="card lrn-lane" href={`/learn/${slug}`}><span className="gi" dangerouslySetInnerHTML={{ __html:ico(icon,22) }}/><span><span className="lab">{LANE_COUNTS[slug]} {LANE_COUNTS[slug]===1?'study':'studies'}</span><span className="t">{name}</span><span className="note" style={{ display:'block', marginTop:6 }}>{blurb}</span></span></a>)}</div>
    </Sect>

    <Sect label="Themes" icon="link" sub="Trails from passage to passage while each local context stays visible. Not shortcuts around the books.">
      <div className="grid2">{THEMES.map(t=><div key={t.title} className="card lrn-theme"><span className="t">{t.title}</span><span className="span">{t.span}</span><div style={{ display:'flex', gap:6, flexWrap:'wrap', marginTop:4 }}>{t.studies.map(s=><a key={s.id} className="chip" href={s.href}>{s.title}</a>)}</div></div>)}</div>
    </Sect>

    <Sect label="Harder questions" icon="spark" sub="Open questions for deep study. Kept discoverable, never presented as settled.">
      <div>{QUESTIONS.slice(0,6).map(q=><div key={q.id} className="lrn-q"><p>{q.q}</p><span className="note">{q.posture}</span></div>)}</div>
      <div style={{ marginTop:14 }}><a href="/learn/questions">All {QUESTIONS.length} questions →</a></div>
    </Sect>
  </div>;
}
