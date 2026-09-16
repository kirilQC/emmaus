import Sect from '../../../components/learn/Sect.jsx';
import { ico } from '../../../lib/icons.js';
import { SOURCES, SOURCE_CATEGORIES, studiesCiting, TOOLS, AUDIT, VERIFICATION } from '../../../lib/learn/index.js';
import { SOURCE_POLICY, EDITORIAL_RULE } from '../../../lib/learn/method.js';
export const metadata={ title:'Sources · Emmaus' };
export default function Page(){
  return <div className="wrap">
    <div className="crumb"><a href="/learn">Learn</a><span>/</span><span style={{ color:'var(--ink)' }}>Sources</span></div>
    <h1 className="h1" style={{ marginTop:36, fontSize:'clamp(48px,7vw,96px)' }}>Sources</h1>
    <p style={{ fontSize:22, color:'var(--dim)', margin:'14px 0 0', maxWidth:760 }}>{SOURCES.length} sources behind the studies. {SOURCE_POLICY}</p>
    <div className="strip" style={{ marginTop:24 }}>{SOURCE_CATEGORIES.map(c=><a key={c.slug} className="gl" href={`#${c.slug}`}><span>{c.name}</span><span className="note" style={{ fontSize:12 }}>{c.sources.length}</span></a>)}</div>
    {SOURCE_CATEGORIES.map(c=><Sect key={c.slug} id={c.slug} label={c.name} icon="shelf" sub={`${c.sources.length} ${c.sources.length===1?'source':'sources'}`}>
      <div>{c.sources.map(r=>{ const used=studiesCiting(r.id); return <div key={r.id} id={r.id} className="lrn-src"><span className="id">{r.id}</span><div>
        <div className="t">{r.url?<a href={r.url} target="_blank" rel="noopener">{r.title}</a>:r.title}</div>
        {r.publisher && <div className="note" style={{ marginTop:2 }}>{r.publisher}</div>}
        <p><b style={{ color:'var(--ink)', fontWeight:500 }}>Why this source.</b> {r.why}</p>
        {r.consulted && <p><b style={{ color:'var(--ink)', fontWeight:500 }}>Consulted.</b> {r.consulted}</p>}
        {r.supports && <p><b style={{ color:'var(--ink)', fontWeight:500 }}>Supports.</b> {r.supports}</p>}
        {used.length>0 && <div style={{ display:'flex', gap:6, flexWrap:'wrap', marginTop:10 }}>{used.map(s=><a key={s.id} className="chip" href={s.href}>{s.id} · {s.title}</a>)}</div>}
      </div></div>; })}</div>
    </Sect>)}
    <Sect label="Tools and assets" icon="link" sub="Reference tools and image sets a study site can lean on, with what each license allows.">
      <div style={{ display:'flex', flexDirection:'column', gap:28 }}>{TOOLS.map(g=><div key={g.group}><div className="lab" style={{ color:'var(--ink)', marginBottom:6 }}>{g.group}</div><div className="list">{g.items.map(t=>t.url?<a key={t.name} className="item" href={t.url} target="_blank" rel="noopener"><span><span style={{ fontSize:19, fontWeight:500 }}>{t.name}</span><span className="sub">{t.desc}</span></span><span dangerouslySetInnerHTML={{ __html:ico('link',16) }}/></a>:<div key={t.name} className="item"><span><span style={{ fontSize:19, fontWeight:500 }}>{t.name}</span><span className="sub">{t.desc}</span></span></div>)}</div></div>)}</div>
      <p className="lrn-prose" style={{ marginTop:24, fontSize:17, color:'var(--dim)' }}>{AUDIT}</p>
    </Sect>
    <Sect label="Verification log" icon="check" sub={<span>What was re-checked against standard references, what was corrected, and what stays flagged. {EDITORIAL_RULE}</span>}>
      <div style={{ display:'flex', flexDirection:'column', gap:28 }}>{[['Checked and confirmed',VERIFICATION.confirmed],['Corrected in this edition',VERIFICATION.corrected],['Deliberately flagged or downgraded',VERIFICATION.flagged]].map(([t,items])=><div key={t}><div className="lab" style={{ color:'var(--ink)', marginBottom:8 }}>{t}</div><ul style={{ margin:0, paddingLeft:20, color:'var(--dim)', fontSize:16, lineHeight:1.6, maxWidth:'80ch' }}>{items.map(x=><li key={x} style={{ marginBottom:8 }}>{x}</li>)}</ul></div>)}</div>
    </Sect>
  </div>;
}
