import { notFound, permanentRedirect } from 'next/navigation';
import Sect from '../../../../components/learn/Sect.jsx';
import StudyCard from '../../../../components/learn/StudyCard.jsx';
import DoneButton from '../../../../components/learn/DoneButton.jsx';
import AskChip from '../../../../components/learn/AskChip.jsx';
import { Grade, Diff, Conf } from '../../../../components/learn/Badges.jsx';
import { Refs, RefLink } from '../../../../components/learn/Refs.jsx';
import { ico } from '../../../../lib/icons.js';
import { PEOPLE, slug as personSlug } from '../../../../lib/data.js';
import { lanePath, tagPath, gradeOf } from '../../../../lib/learn/lanes.js';
import { STUDIES, studyByParam, related, neighbours, pathStep, sourceById } from '../../../../lib/learn/index.js';
export function generateStaticParams(){ return STUDIES.map(s=>({ slug:s.href.split('/').pop() })); }
export async function generateMetadata({ params }){ const { slug } = await params; const s=studyByParam(slug); return { title:(s?s.title:'Study')+' · Emmaus', description:s?.core }; }
const people=new Set(PEOPLE.map(p=>p[0]));
export default async function Page({ params }){
  const { slug } = await params; const s=studyByParam(slug); if(!s) notFound();
  const want=s.href.split('/').pop(); if(slug!==want) permanentRedirect(s.href);
  const step=pathStep(s.id); const { prev, next }=neighbours(s); const rel=related(s); const first=s.chapters[0];
  const P=({ text })=><p className="lrn-prose"><Refs text={text}/></p>;
  return <div className="wrap">
    <div className="crumb"><a href="/explore#learn">Explore</a><span>/</span><a href={lanePath(s.lane)}>{s.lane}</a><span>/</span><span style={{ color:'var(--ink)' }}>{s.id}</span></div>
    <div className="lab" style={{ marginTop:36 }}>{s.lane} · {s.id}{step?` · Start here, step ${step.n}`:''}</div>
    <h1 className="h1" style={{ marginTop:8, fontSize:'clamp(40px,5.5vw,80px)' }}>{s.title}</h1>
    <div style={{ display:'flex', gap:14, alignItems:'center', flexWrap:'wrap', marginTop:18 }}><span className="lrn-badges"><Grade evidence={s.evidence}/><Diff level={s.difficulty}/><Conf level={s.confidence}/></span><DoneButton id={s.id}/></div>
    <div className="grid2" style={{ marginTop:28, gap:32, alignItems:'start' }}>
      <p className="lrn-lead">{s.core}</p>
      <div className="card lrn-why"><span className="lab">Why it matters</span><p>{s.why}</p></div>
    </div>

    <Sect label="Scripture foundation" icon="book" sub="Read these first. Each reference opens the chapter in the NLT.">
      <div>{s.scripture.map((r,i)=><div key={i} className="lrn-ref"><RefLink refText={r.ref}/><p>{r.note}</p></div>)}</div>
      {first && <div style={{ marginTop:14 }}><a className="btn ghost sm" href={`/book/${first.slug}/${first.ch}`}><span dangerouslySetInnerHTML={{ __html:ico('book',14) }}/> Open {first.name} {first.ch}</a></div>}
    </Sect>
    <Sect label="What the text says" icon="quote" sub="Only what the passages explicitly state."><P text={s.explicit}/></Sect>
    <Sect label="Deeper insight" icon="spark" sub={<span>Labelled for what it is. <Grade evidence={s.evidence}/></span>}><P text={s.insight}/></Sect>
    <Sect label="Often unnoticed" icon="search"><P text={s.unnoticed}/></Sect>
    <Sect label="Outside context" icon="globe" sub="What history, archaeology or language add, and what they cannot settle."><P text={s.context}/></Sect>
    <Sect label="Caveats and limits" icon="scales" sub="What this study does not establish."><div className="lrn-caveat"><p><Refs text={s.caveats}/></p></div></Sect>
    {s.questions.length>0 && <Sect label="Key questions" icon="heart" sub="Write your answer in a chapter note, or take the question to the tutor with this study’s passage open.">
      <div>{s.questions.map(q=><div key={q} className="lrn-q"><p>{q}</p><AskChip q={q} book={first?.slug} ch={first?.ch}/></div>)}</div>
    </Sect>}
    {s.sources.length>0 && <Sect label="Sources" icon="shelf" sub={<span>What was consulted, and why it was trusted. <a href="/learn/sources">The full registry →</a></span>}>
      <div>{s.sources.map(x=>{ const r=sourceById(x.id); return <div key={x.id} className="lrn-src"><a className="id" href={`/learn/sources#${x.id}`}>{x.id}</a><div><div className="t">{r&&r.url?<a href={r.url} target="_blank" rel="noopener">{r.title}</a>:(r?r.title:x.text)}</div>{r && <p>{r.publisher?r.publisher+'. ':''}{r.why}</p>}</div></div>; })}</div>
    </Sect>}
    <Sect label="Tags" icon="compass" sub="Every tag is a page listing the studies that share it.">
      <div style={{ display:'flex', flexDirection:'column', gap:10 }}>
        {s.tags.doctrine.length>0 && <div style={{ display:'flex', gap:6, flexWrap:'wrap' }}>{s.tags.doctrine.map(t=><a key={t} className="chip teaching" href={tagPath(t)}><span dangerouslySetInnerHTML={{ __html:ico('scroll',13) }}/>{t}</a>)}</div>}
        {s.tags.characters.length>0 && <div style={{ display:'flex', gap:6, flexWrap:'wrap' }}>{s.tags.characters.map(t=><a key={t} className="chip person" href={people.has(t)?`/people/${personSlug(t)}`:tagPath(t)}><span dangerouslySetInnerHTML={{ __html:ico('person',13) }}/>{t}</a>)}</div>}
        {s.tags.places.length>0 && <div style={{ display:'flex', gap:6, flexWrap:'wrap' }}>{s.tags.places.map(t=><a key={t} className="chip place" href={tagPath(t)}><span dangerouslySetInnerHTML={{ __html:ico('pin',13) }}/>{t}</a>)}</div>}
        {s.chapters.length>0 && <div style={{ display:'flex', gap:6, flexWrap:'wrap' }}>{s.chapters.map(c=><a key={c.slug+c.ch} className="chip" href={`/book/${c.slug}/${c.ch}`}><span dangerouslySetInnerHTML={{ __html:ico('book',13) }}/>{c.name} {c.ch}</a>)}</div>}
      </div>
    </Sect>
    {rel.length>0 && <Sect label="Related studies" icon="link"><div className="grid2">{rel.map(r=><StudyCard key={r.id} s={r} showCore={false}/>)}</div></Sect>}
    <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginTop:56, gap:12, flexWrap:'wrap' }}><span>{prev && <a href={prev.href}>← {prev.title}</a>}</span><DoneButton id={s.id}/><span>{next && <a href={next.href}>{next.title} →</a>}</span></div>
  </div>;
}
