import Sect from '../../../components/learn/Sect.jsx';
import { Grade, Diff } from '../../../components/learn/Badges.jsx';
import { EVIDENCE, EVIDENCE_ORDER, DIFFICULTY } from '../../../lib/learn/lanes.js';
import { MOTTO, POSTURE, PRIMER, ANATOMY, SOURCE_POLICY, EDITORIAL_RULE } from '../../../lib/learn/method.js';
export const metadata={ title:'How to read these studies · Emmaus' };
const LEVELS={ Foundational:'Start here if the subject is new to you.', Intermediate:'Assumes the passages are familiar.', Advanced:'Weighs competing readings.', 'Deep Dive':'Follows one thread through many books.', Specialist:'Engages the scholarly argument directly.' };
export default function Page(){
  return <div className="wrap">
    <div className="crumb"><a href="/explore#learn">Explore</a><span>/</span><span style={{ color:'var(--ink)' }}>Method</span></div>
    <div className="lab" style={{ marginTop:36 }}>{MOTTO}</div>
    <h1 className="h1" style={{ marginTop:8, fontSize:'clamp(40px,6vw,80px)' }}>How to read these studies</h1>
    <div style={{ marginTop:22, maxWidth:780 }}>{POSTURE.map(p=><p key={p} style={{ fontSize:22, lineHeight:1.45, margin:'0 0 14px', fontStyle:'italic' }}>{p}</p>)}</div>
    <Sect label="Evidence grades" icon="scales" sub="The badge on every study. The same page can hold a direct statement, a canonical pattern, an archaeological setting and a denominational reading; these are not the same kind of evidence.">
      <div style={{ display:'flex', flexDirection:'column', gap:12, maxWidth:720 }}>{EVIDENCE_ORDER.map(e=><div key={e} style={{ display:'grid', gridTemplateColumns:'130px minmax(0,1fr)', gap:14, alignItems:'baseline' }}><Grade evidence={e}/><span><span style={{ fontWeight:500 }}>{e}.</span> <span style={{ color:'var(--dim)' }}>{EVIDENCE[e][2]}</span></span></div>)}</div>
    </Sect>
    <Sect label="Levels" icon="mountain">
      <div style={{ display:'flex', flexDirection:'column', gap:12, maxWidth:720 }}>{DIFFICULTY.map(d=><div key={d} style={{ display:'grid', gridTemplateColumns:'130px minmax(0,1fr)', gap:14, alignItems:'baseline' }}><Diff level={d}/><span style={{ color:'var(--dim)' }}>{LEVELS[d]}</span></div>)}</div>
    </Sect>
    <Sect label="Anatomy of a study" icon="book" sub="Every study has the same parts, in the same order.">
      <div className="lrn-anatomy">{ANATOMY.map(([t,d])=>[<b key={t}>{t}</b>,<span key={t+'d'}>{d}</span>])}</div>
    </Sect>
    {PRIMER.map(([t,body])=><Sect key={t} label={t} icon="lamp"><p className="lrn-prose">{body}</p></Sect>)}
    <Sect label="Sources and popular claims" icon="shelf">
      <p className="lrn-prose">{SOURCE_POLICY}</p>
      <p className="lrn-prose" style={{ marginTop:16 }}>{EDITORIAL_RULE}</p>
      <div style={{ marginTop:16 }}><a href="/learn/sources">The source registry →</a></div>
    </Sect>
  </div>;
}
