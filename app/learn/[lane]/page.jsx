import { notFound } from 'next/navigation';
import StudyList from '../../../components/learn/StudyList.jsx';
import { ico } from '../../../lib/icons.js';
import { LANES, laneBySlug } from '../../../lib/learn/lanes.js';
import { studiesInLane } from '../../../lib/learn/index.js';
export function generateStaticParams(){ return LANES.map(l=>({ lane:l[1] })); }
export async function generateMetadata({ params }){ const { lane } = await params; const l=laneBySlug(lane); return { title:(l?l[0]:'Learn')+' · Emmaus' }; }
export default async function Page({ params }){
  const { lane } = await params; const l=laneBySlug(lane); if(!l) notFound();
  const [name,slug,icon,blurb]=l; const studies=studiesInLane(name).map(s=>({ id:s.id, href:s.href, title:s.title, core:s.core, lane:s.lane, difficulty:s.difficulty, evidence:s.evidence, confidence:s.confidence }));
  const i=LANES.indexOf(l); const prev=LANES[i-1], next=LANES[i+1];
  return <div className="wrap">
    <div className="crumb"><a href="/learn">Learn</a><span>/</span><span style={{ color:'var(--ink)' }}>{name}</span></div>
    <div style={{ display:'flex', gap:18, alignItems:'center', marginTop:36 }}><span className="gi big" dangerouslySetInnerHTML={{ __html:ico(icon,30) }}/><div><div className="lab">{studies.length} {studies.length===1?'study':'studies'}</div><h1 className="h1" style={{ marginTop:6, fontSize:'clamp(40px,6vw,80px)' }}>{name}</h1></div></div>
    <p style={{ fontSize:22, color:'var(--dim)', margin:'18px 0 0', maxWidth:760 }}>{blurb}</p>
    <div style={{ marginTop:32 }}><StudyList studies={studies}/></div>
    <div style={{ display:'flex', justifyContent:'space-between', marginTop:56, gap:12, flexWrap:'wrap' }}><span>{prev && <a href={`/learn/${prev[1]}`}>← {prev[0]}</a>}</span><span>{next && <a href={`/learn/${next[1]}`}>{next[0]} →</a>}</span></div>
  </div>;
}
