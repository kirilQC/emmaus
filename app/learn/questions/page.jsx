import AskChip from '../../../components/learn/AskChip.jsx';
import { Grade } from '../../../components/learn/Badges.jsx';
import { QUESTIONS } from '../../../lib/learn/index.js';
export const metadata={ title:'Harder questions · Emmaus' };
const POSTURE={ 'Debated interpretation':'Debated interpretation', 'Historically supported':'Historically supported', 'Speculative observation':'Speculative' };
export default function Page(){
  const first=QUESTIONS.filter(q=>!q.new), added=QUESTIONS.filter(q=>q.new);
  const Row=({ q })=><div className="lrn-q" id={q.id} style={{ alignItems:'flex-start' }}>
    <div style={{ flex:'1 1 520px' }}><div className="lab" style={{ color:'var(--accent)' }}>{q.id}</div><p style={{ marginTop:4 }}>{q.q}</p><div className="note" style={{ marginTop:8, fontSize:15, lineHeight:1.5 }}>{q.body}</div></div>
    <div style={{ display:'flex', flexDirection:'column', gap:8, alignItems:'flex-end' }}>{POSTURE[q.posture]?<Grade evidence={POSTURE[q.posture]}/>:<span className="badge">{q.posture}</span>}<AskChip q={q.q} label="Take it to the tutor"/></div>
  </div>;
  return <div className="wrap">
    <div className="crumb"><a href="/explore#learn">Explore</a><span>/</span><span style={{ color:'var(--ink)' }}>Harder questions</span></div>
    <h1 className="h1" style={{ marginTop:36, fontSize:'clamp(48px,7vw,96px)' }}>Harder questions</h1>
    <p style={{ fontSize:22, color:'var(--dim)', margin:'14px 0 0', maxWidth:760 }}>{QUESTIONS.length} intentionally open questions for deep study. None of them is settled here; each names the passages to read together and the kind of evidence in play.</p>
    <div style={{ marginTop:32 }}>{first.map(q=><Row key={q.id} q={q}/>)}</div>
    <div className="lab" style={{ margin:'40px 0 8px', color:'var(--ink)' }}>Raised by the newer studies</div>
    <div>{added.map(q=><Row key={q.id} q={q}/>)}</div>
  </div>;
}
