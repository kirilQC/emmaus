import { Badges } from './Badges.jsx';
export default function StudyCard({ s, showLane=true, showCore=true }){
  return <a className="card lrn-card" href={s.href}>
    {showLane && <span className="lab">{s.lane}</span>}
    <span className="lrn-card-title">{s.title}</span>
    {showCore && s.core && <span className="note clamp3" style={{ fontSize:15 }}>{s.core}</span>}
    <Badges study={s}/>
  </a>;
}
