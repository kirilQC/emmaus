import { notFound } from 'next/navigation';
import StudyList from '../../../../components/learn/StudyList.jsx';
import { TAGS, tagBySlug } from '../../../../lib/learn/index.js';
export function generateStaticParams(){ return TAGS.map(t=>({ slug:t.slug })); }
export async function generateMetadata({ params }){ const { slug } = await params; const t=tagBySlug(slug); return { title:(t?t.name:'Tag')+' · Emmaus' }; }
const KIND={ doctrine:'Doctrine or theme', characters:'Character', places:'Place' };
export default async function Page({ params }){
  const { slug } = await params; const t=tagBySlug(slug); if(!t) notFound();
  const studies=t.studies.map(s=>({ id:s.id, href:s.href, title:s.title, core:s.core, lane:s.lane, difficulty:s.difficulty, evidence:s.evidence, confidence:s.confidence }));
  return <div className="wrap">
    <div className="crumb"><a href="/learn">Learn</a><span>/</span><span style={{ color:'var(--ink)' }}>{t.name}</span></div>
    <div className="lab" style={{ marginTop:36 }}>{t.types.map(k=>KIND[k]).join(' · ')} · {studies.length} {studies.length===1?'study':'studies'}</div>
    <h1 className="h1" style={{ marginTop:8, fontSize:'clamp(40px,6vw,80px)' }}>{t.name}</h1>
    <div style={{ marginTop:32 }}><StudyList studies={studies} showLane/></div>
  </div>;
}
