'use client';
import Artwork from './Artwork.jsx';
import { useEffect, useRef, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { BOOKS, TOTAL, PEOPLE, slug as personSlug } from '../lib/data.js';
import { ico, pattern, GICON } from '../lib/icons.js';
import { Refs } from './learn/Refs.jsx';
import { Grade } from './learn/Badges.jsx';
const SUGGEST = ['Where should I start reading?', 'What does "born again" mean in John 3?', 'Who was Melchizedek?', 'What is the gospel, in one paragraph?', 'Is baptism necessary for salvation?', 'Show me the maps of Paul’s journeys'];
const LINK=/\[([^\]]+)\]\((\/[^)\s]*)\)/g; const SEP='';
const people=new Set(PEOPLE.map(p=>p[0]));
const I=(n,s=16)=><span dangerouslySetInnerHTML={{ __html:ico(n,s) }} style={{ display:'inline-flex' }}/>;

function Rich({ text, onNav }){ const out=[]; let last=0, m; LINK.lastIndex=0; const p=String(text);
  while((m=LINK.exec(p))){ out.push(<Refs key={'t'+m.index} text={p.slice(last,m.index)}/>); out.push(<a key={'l'+m.index} href={m[2]} onClick={e=>{ e.preventDefault(); onNav(m[2]); }}>{m[1]}</a>); last=m.index+m[0].length; }
  out.push(<Refs key="e" text={p.slice(last)}/>); return out; }
function Answer({ text, onNav }){
  const paras=String(text).split(/\n{2,}/).filter(Boolean); if(!paras.length) return null;
  return <div className="tut-answer"><p className="tut-lead"><Rich text={paras[0]} onNav={onNav}/></p>{paras.slice(1).map((p,i)=><p key={i}><Rich text={p} onNav={onNav}/></p>)}</div>;
}
function Ribbon({ books }){
  const set=new Set(books||[]); const W=1000, h=34; let x=0; const segs=[]; const labels=[];
  BOOKS.forEach(b=>{ const w=b.ch/TOTAL*W; const hi=set.has(b.slug); segs.push(<a key={b.slug} href={`/book/${b.slug}`}><rect x={x} y={hi?0:8} width={Math.max(w-.6,.4)} height={hi?h:h-12} fill={b.col} opacity={hi?1:.32}><title>{b.name}</title></rect></a>); if(hi&&labels.length<5) labels.push(<text key={b.slug} x={Math.min(Math.max(x+w/2,30),W-30)} y={h+16} textAnchor="middle" fill="var(--ink)" style={{ fontFamily:'var(--f-ui)', fontSize:11, letterSpacing:'.08em' }}>{b.name.toUpperCase()}</text>); x+=w; });
  const ot=BOOKS.filter(b=>b.t==='OT').reduce((a,b)=>a+b.ch,0)/TOTAL*W;
  return <svg className="tut-ribbon" viewBox={`0 0 ${W} ${h+22}`} preserveAspectRatio="none" aria-label="The books the tutor read, on the canon">{segs}<line x1={ot} y1="0" x2={ot} y2={h} stroke="var(--bg)" strokeWidth="3"/>{labels}</svg>;
}
function MiniMap({ p }){
  if(!p.lat||!p.lon) return null; const k=200, lon0=34.4, lat0=33.7; const X=(p.lon-lon0)*k*.85, Y=(lat0-p.lat)*k; if(X<10||X>320||Y<10||Y>460) return null;
  const coast=[[35.37,33.56],[35.20,33.27],[35.07,32.93],[34.99,32.82],[34.92,32.62],[34.89,32.50],[34.75,32.05],[34.55,31.67],[34.45,31.50],[34.30,31.30]];
  const land=`M${(coast[0][0]-lon0)*k*.85} 0 `+coast.map(([lo,la])=>`L${((lo-lon0)*k*.85).toFixed(1)} ${((lat0-la)*k).toFixed(1)}`).join(' ')+` L${(34.30-lon0)*k*.85} 470 L330 470 L330 0 Z`;
  const vy=Math.max(0,Math.min(470-150,Y-75));
  return <svg viewBox={`0 ${vy} 330 150`} className="tut-map" aria-hidden="true"><rect y={vy} width="330" height="150" fill="var(--sea)"/><path d={land} fill="var(--land)"/><ellipse cx={(35.59-lon0)*k*.85} cy={(lat0-32.82)*k} rx={0.06*k*.85} ry={0.11*k} fill="var(--sea)"/><ellipse cx={(35.48-lon0)*k*.85} cy={(lat0-31.5)*k} rx={0.07*k*.85} ry={0.32*k} fill="var(--sea)"/><circle cx={X} cy={Y} r="12" fill="var(--accent)" opacity=".25"/><circle cx={X} cy={Y} r="5" fill="var(--accent)"/><text x={X+12} y={Y+4} fill="var(--ink)" style={{ fontFamily:'var(--f-disp)', fontSize:15 }}>{p.name}</text></svg>;
}
function Rail({ g, v, busy, onNav }){
  const study=g?.studies||[]; const q=(g?.pages||[]).find(p=>p.kind==='question'); const pages=(g?.pages||[]).filter(p=>p.kind!=='question').slice(0,4);
  return <aside className="tut-rail">
    {g?.people?.slice(0,2).map(p=><div key={p.name} className="card tut-ent" style={{ backgroundImage:`${pattern('person','#4d6f95')},linear-gradient(120deg,rgba(77,111,149,.28),var(--card) 62%)` }}><div className="tut-ent-head"><div><span className="lab" style={{ color:'#8fb3dc' }}>Person</span><div className="tut-ent-name">{p.name}</div></div><Artwork id="C5" className="art-ent"/></div><div className="note">{p.summary}{p.count?` Appears in ${p.count} verses.`:''}</div>{people.has(p.name)&&<a className="note" href={`/people/${personSlug(p.name)}`} style={{ color:'var(--accent)' }}>Open the person page →</a>}</div>)}
    {g?.places?.slice(0,1).map(p=><div key={p.name} className="card tut-ent" style={{ padding:0, overflow:'hidden' }}><div className="tut-ent-head" style={{ padding:'20px 22px 0' }}><div><span className="lab" style={{ color:'#9cc49c' }}>Place</span><div className="tut-ent-name">{p.name}</div></div><Artwork id="C3" className="art-ent"/></div><MiniMap p={p}/><div className="note" style={{ padding:'12px 22px 18px' }}>{p.type?p.type+'. ':''}{p.summary} <a href="/reference/atlas" style={{ color:'var(--accent)' }}>Atlas →</a></div></div>)}
    {study.map(s=>{ const col=BOOKS.find(b=>b.slug===(g.passages[0]?.book))?.col||'var(--accent)'; return <a key={s.href} href={s.href} className="card tut-study" style={{ backgroundImage:`linear-gradient(160deg,color-mix(in srgb,${col} 22%,var(--card)),var(--card) 70%)`, borderColor:`color-mix(in srgb,${col} 35%,var(--line))` }}><span className="lab">Emmaus study · {s.lane}</span><span className="tut-study-t">{s.label}</span><Grade evidence={s.evidence}/></a>; })}
    {q && <a href={q.href} className="card tut-ent" style={{ display:'flex', gap:12, alignItems:'center', color:'var(--ink)' }}><Artwork id="C1" className="art-ent-sm"/><span><span className="lab">Harder question</span><span style={{ display:'block', marginTop:2 }}>{q.label}</span></span></a>}
    {pages.length>0 && <div className="card tut-ent"><span className="lab">Also on Emmaus</span><div style={{ display:'flex', flexDirection:'column', gap:6, marginTop:6 }}>{pages.map(p=><a key={p.href} href={p.href} style={{ color:'var(--ink)' }}>{p.label} <span className="note">· {p.kind}</span></a>)}</div></div>}
    {g && <div className="card tut-ent tut-srcs"><span className="lab">What was read</span><div className="tut-chips">{g.calls.map((c,i)=><span key={i} className="chip">{c}</span>)}</div>
      {v&&v.badRefs.length>0 && <div className="note" style={{ color:'#d9b25c' }}>Could not verify: {v.badRefs.map(b=>b.ref).join(', ')}</div>}
      {v&&v.unverifiedQuotes.length>0 && <div className="note" style={{ color:'#d9b25c' }}>{v.unverifiedQuotes.length} quotation{v.unverifiedQuotes.length>1?'s':''} not found word for word in the retrieved text.</div>}
      <div className="note" style={{ fontSize:12 }}>Bible text: Berean Standard Bible (public domain). Notes: Tyndale Open Study Notes, CC BY-SA 4.0. Cross references: OpenBible.info, CC BY. People and places: Theographic, CC BY-SA 4.0.</div></div>}
    {!g && !busy && <>
      <div className="card tut-ent"><Artwork id="B3" className="art-ent"/><span className="lab">Reads first</span><div className="note">It opens the passages, follows the cross references and reads the study notes before it writes a word.</div></div>
      <div className="card tut-ent"><Artwork id="D3" className="art-ent"/><span className="lab">Answers plainly</span><div className="note">What the text says, in the words it uses. Explicit, inferred and debated are kept apart.</div></div>
      <div className="card tut-ent"><Artwork id="C1" className="art-ent"/><span className="lab">Shows its work</span><div className="note">Every reference is checked against the text afterwards, and every lookup is listed here.</div></div>
    </>}
  </aside>;
}
function parseStream(raw){ const parts=raw.split(SEP); let text=parts[0]||''; let ctx=null, ver=null, status='';
  for(const p of parts.slice(1)){ const nl=p.indexOf('\n'); const head=nl>=0?p.slice(0,nl):p; const rest=nl>=0?p.slice(nl+1):'';
    try{ const j=JSON.parse(head); if(j.type==='context') ctx=j; else if(j.type==='verify') ver=j; else if(j.type==='status') status=j.text; text+=rest; }catch(e){ text+=p; } }
  return { text:text.trim(), ctx, ver, status }; }

export default function Tutor() {
  const params = useSearchParams(); const router = useRouter();
  const [msgs, setMsgs] = useState([]); const [q, setQ] = useState(''); const [busy, setBusy] = useState(false); const [ctx, setCtx] = useState(null);
  const started = useRef(false); const endRef = useRef(null);
  useEffect(() => { const b = BOOKS.find(x => x.slug === params.get('book')); const ch = +params.get('ch'); setCtx(b && ch >= 1 && ch <= b.ch ? { book: b.name, slug: b.slug, ch } : false); }, []);
  useEffect(() => { const initial = params.get('q'); if (initial && ctx !== null && !started.current) { started.current = true; send(initial, ctx); } }, [ctx]);
  useEffect(() => { if (msgs.length>2 && endRef.current) endRef.current.scrollIntoView({ block:'nearest' }); }, [msgs.length]);
  async function send(text, context = ctx) {
    const question = (text ?? q).trim(); if (!question || busy) return;
    setQ(''); setBusy(true);
    const history = [...msgs, { role: 'user', content: question }];
    setMsgs([...history, { role: 'assistant', content: '', ground: null, verify: null }]);
    try {
      const r = await fetch('/api/tutor', { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ messages: history.map(m=>({ role:m.role, content:m.content })), book: context ? context.slug : undefined, ch: context ? context.ch : undefined }) });
      if (!r.ok || !r.body) throw new Error((await r.json().catch(() => ({}))).error || 'The tutor is unavailable');
      const reader = r.body.getReader(); const dec = new TextDecoder(); let raw = '';
      while (true) { const { value, done } = await reader.read(); if (done) break; raw += dec.decode(value, { stream: true }); const p=parseStream(raw); setMsgs([...history, { role: 'assistant', content: p.text, ground: p.ctx, verify: p.ver, status: p.status }]); }
    } catch (e) { setMsgs([...history, { role: 'assistant', content: 'Something went wrong: ' + e.message }]); }
    setBusy(false);
  }
  const last=msgs[msgs.length-1]; const lastQ=[...msgs].reverse().find(m=>m.role==='user'); const g=last?.ground; const v=last?.verify;
  const tint=BOOKS.find(b=>b.slug===g?.passages?.[0]?.book)?.col||'#8a3b2e';
  const nav=p=>router.push(p);
  return <div className="wrap tut-wrap">
    <div className="tut-poster" style={{ backgroundImage:`${pattern(g?GICON[BOOKS.find(b=>b.slug===g?.passages?.[0]?.book)?.gid]||'heart':'heart',tint)},linear-gradient(120deg,color-mix(in srgb,${tint} 34%,var(--bg)) 0%,var(--bg) 62%)` }}>
      <span className="tut-wmk" style={{ color:tint }}>{I('heart',420)}</span>
      <div className="tut-poster-copy">
        <div className="lab" style={{ color:`color-mix(in srgb,${tint} 60%,var(--ink))` }}>{lastQ?'Tutor · you asked':'Grounded in the text'}</div>
        <h1 className="h1 tut-h1">{lastQ?lastQ.content:'Tutor'}</h1>
        {!lastQ && <p className="tut-tag">Ask anything about the Bible, or where to find something on Emmaus. The tutor reads the passages first, answers plainly from what it read, and shows you every lookup.</p>}
        {lastQ && <div className="tut-verified">{busy&&!v?<span className="note">{last?.status||'Deciding what to read…'}</span>:v?<span className="lab" style={{ color:'var(--ok)', display:'inline-flex', gap:8, alignItems:'center' }}>{I('check',13)} Grounded in {g?.passages.length||0} passages · {v.checkedRefs} references verified</span>:null}</div>}
      </div>
      <Artwork id="A5" className="art-tut-poster"/>
    </div>
    <Ribbon books={g?.books}/>
    <div className="tut-ribbon-cap ui"><span>Old Testament</span><span>{g?'The books the tutor read, on the canon':'The 66 books. The ones the tutor reads light up here.'}</span><span>New Testament</span></div>
    {ctx && <div style={{ display:'flex', gap:10, alignItems:'center', marginTop:18, flexWrap:'wrap' }}><a className="chip" href={`/book/${ctx.slug}/${ctx.ch}`}>{I('book',13)} About {ctx.book} {ctx.ch}</a><button className="note" style={{ background:'none', border:'none', cursor:'pointer', textDecoration:'underline dotted' }} onClick={()=>setCtx(false)}>Ask about anything instead</button></div>}
    <div className="tut-grid">
      <main className="tut-main">
        {msgs.map((m,i)=>m.role==='user'?(i<msgs.length-2?<div key={i} className="lab tut-earlier">You asked · {m.content}</div>:null):
          <div key={i} className="tut-turn">{m.content?<Answer text={m.content} onNav={nav}/>:(busy&&i===msgs.length-1?<p className="tut-lead" style={{ color:'var(--dim)' }}>{m.status||'Deciding what to read…'}</p>:null)}
            {i===msgs.length-1 && m.ground?.passages?.[0]?.text && <div className="verse tut-verse"><span className="ref">{m.ground.passages[0].label} · BSB</span><span>{m.ground.passages[0].text}</span><Artwork id="D1" className="art-corner"/></div>}
          </div>)}
        <div ref={endRef}/>
        <div className="tut-ask card"><Artwork id="D1" className="art-ask"/><input type="text" value={q} onChange={e=>setQ(e.target.value)} onKeyDown={e=>{ if(e.key==='Enter') send(); }} placeholder={lastQ?'Ask a follow-up, or anything else':'Ask about any passage, person, place or idea'} aria-label="Ask the tutor"/><button className="btn" onClick={()=>send()} disabled={busy}>{I('spark',14)} Ask</button></div>
        <div className="strip">{SUGGEST.map(s=><button key={s} className="gl" onClick={()=>send(s)}><span className="gi">{I('spark',14)}</span><span>{s}</span></button>)}</div>
      </main>
      <Rail g={g} v={v} busy={busy} onNav={nav}/>
    </div>
  </div>;
}
