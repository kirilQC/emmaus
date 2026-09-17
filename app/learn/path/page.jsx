import Artwork from '../../../components/Artwork.jsx';
import Sect from '../../../components/learn/Sect.jsx';
import StartHere from '../../../components/learn/StartHere.jsx';
import { Grade } from '../../../components/learn/Badges.jsx';
import { EVIDENCE, EVIDENCE_ORDER } from '../../../lib/learn/lanes.js';
import { PATH, STUDIES } from '../../../lib/learn/index.js';
import { MOTTO } from '../../../lib/learn/method.js';
export const metadata={ title:'The guided path · Emmaus' };
export default function Page(){
  const steps=PATH.map(p=>({ n:p.n, id:p.id, href:p.study.href, title:p.study.title, lane:p.study.lane, evidence:p.study.evidence, why:p.why }));
  return <div className="wrap">
    <div className="crumb"><a href="/explore">Explore</a><span>/</span><span style={{ color:'var(--ink)' }}>The guided path</span></div>
    <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-end', gap:40, marginTop:36 }}>
      <div><div className="lab">{MOTTO}</div>
        <h1 className="h1" style={{ marginTop:8, fontSize:'clamp(44px,6.4vw,88px)' }}>Start here</h1>
        <p style={{ fontSize:22, color:'var(--dim)', margin:'16px 0 0', maxWidth:760 }}>The research book’s own order through {STUDIES.length} studies: the central story first, then the studies that teach the evidence system, then the visuals that unlock the most pages. Nothing is locked, and nothing is tracked against you.</p></div>
      <Artwork id="D2" className="art-page-heading"/>
    </div>
    <Sect label="How the grades work" icon="scales" sub={<span>Every study carries one of these. <a href="/learn/method">Read the method →</a></span>}>
      <div style={{ display:'flex', flexDirection:'column', gap:10, maxWidth:720 }}>{EVIDENCE_ORDER.map(e=><div key={e} style={{ display:'grid', gridTemplateColumns:'130px minmax(0,1fr)', gap:14, alignItems:'baseline' }}><Grade evidence={e}/><span><span style={{ fontWeight:500 }}>{e}.</span> <span style={{ color:'var(--dim)' }}>{EVIDENCE[e][2]}</span></span></div>)}</div>
    </Sect>
    <Sect label={`${PATH.length} steps`} icon="road" sub="The first twenty five are the highest-leverage studies in the library. The last ten are the visuals that unlock the most other pages.">
      <StartHere steps={steps} initial={12}/>
    </Sect>
  </div>;
}
