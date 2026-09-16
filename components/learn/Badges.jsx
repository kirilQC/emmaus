import { gradeOf } from '../../lib/learn/lanes.js';
export function Grade({ evidence }){ const g=gradeOf(evidence); return <span className={`badge ev ev-${g[1]}`} title={evidence}><span className="dot"/>{g[0]}</span>; }
export function Diff({ level }){ return <span className="badge" title="Difficulty">{level}</span>; }
export function Conf({ level }){ return <span className="badge" title="Confidence">{level} confidence</span>; }
export function Badges({ study, conf=false }){
  return <span className="lrn-badges"><Grade evidence={study.evidence}/><Diff level={study.difficulty}/>{conf && <Conf level={study.confidence}/>}</span>;
}
