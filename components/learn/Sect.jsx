import { ico } from '../../lib/icons.js';
export default function Sect({ label, icon, sub, id, children }){
  return <div className="sect" id={id}>
    <div><div className="lab si" style={{ color:'var(--ink)' }}>{icon && <span className="gi" dangerouslySetInnerHTML={{ __html:ico(icon,16) }}/>}<span>{label}</span></div>{sub && <div className="note" style={{ marginTop:8, lineHeight:1.5 }}>{sub}</div>}</div>
    <div>{children}</div>
  </div>;
}
