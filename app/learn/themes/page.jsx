import Artwork from '../../../components/Artwork.jsx';
import { Grade } from '../../../components/learn/Badges.jsx';
import { THEMES } from '../../../lib/learn/index.js';
export const metadata={ title:'Themes · Emmaus' };
export default function Page(){
  return <div className="wrap">
    <div className="crumb"><a href="/explore">Explore</a><span>/</span><span style={{ color:'var(--ink)' }}>Themes</span></div>
    <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-end', gap:40, marginTop:36 }}>
      <div><div className="lab">{THEMES.length} trails through the whole Bible</div>
        <h1 className="h1" style={{ marginTop:8, fontSize:'clamp(44px,6.4vw,88px)' }}>Themes</h1>
        <p style={{ fontSize:22, color:'var(--dim)', margin:'16px 0 0', maxWidth:780 }}>Themes are not shortcuts around the books. They are trails that let you move from passage to passage while each local context stays visible.</p></div>
      <Artwork id="B4" className="art-page-heading"/>
    </div>
    <div className="grid2 art-clear" style={{ marginTop:44 }}>
      {THEMES.map(t=><div key={t.title} className="card lrn-theme">
        <span className="t">{t.title}</span><span className="span">{t.span}</span>
        <div style={{ display:'flex', gap:6, flexWrap:'wrap', marginTop:6 }}>{t.studies.map(s=><a key={s.id} className="chip" href={s.href}>{s.title}</a>)}</div>
        <div style={{ display:'flex', gap:6, flexWrap:'wrap', marginTop:2 }}>{[...new Set(t.studies.map(s=>s.evidence))].map(e=><Grade key={e} evidence={e}/>)}</div>
      </div>)}
    </div>
  </div>;
}
