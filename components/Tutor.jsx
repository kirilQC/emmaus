'use client';
import Artwork from './Artwork.jsx';
import { useEffect, useRef, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { BOOKS } from '../lib/data.js';
import { ico } from '../lib/icons.js';
import { Refs } from './learn/Refs.jsx';
import { Grade } from './learn/Badges.jsx';
const SUGGEST = ['Where should I start reading?', 'What does "born again" mean in John 3?', 'Who was Melchizedek?', 'What is the gospel, in one paragraph?', 'Show me the maps of Paul’s journeys', 'Quiz me on Genesis 1 to 3'];
const LINK=/\[([^\]]+)\]\((\/[^)\s]*)\)/g; const SEP='';
function Message({ text, onNav }){
  const paras=String(text).split(/\n{2,}/);
  return paras.map((p,i)=>{ const out=[]; let last=0, m; LINK.lastIndex=0;
    while((m=LINK.exec(p))){ out.push(<Refs key={'t'+m.index} text={p.slice(last,m.index)}/>); out.push(<a key={'l'+m.index} href={m[2]} onClick={e=>{ e.preventDefault(); onNav(m[2]); }}>{m[1]}</a>); last=m.index+m[0].length; }
    out.push(<Refs key={'e'+i} text={p.slice(last)}/>);
    return <p key={i} style={{ margin:i?'10px 0 0':0 }}>{out}</p>; });
}
function Grounding({ g, v }){
  const [open,setOpen]=useState(false); if(!g) return null;
  const n=g.passages.length+g.hits.length+g.xrefs.length+g.people.length+g.places.length+g.studies.length+g.pages.length+(g.notes?1:0)+(g.intro?1:0);
  const Row=({ label, items, kind })=>items&&items.length?<div className="tut-row"><span className="lab">{label}</span><span className="tut-chips">{items.map((x,i)=>typeof x==='string'?<span key={i} className="chip">{x}</span>:<a key={i} className={'chip '+(kind||'')} href={x.href}>{x.label}{x.evidence&&<Grade evidence={x.evidence}/>}</a>)}</span></div>:null;
  return <div className="tut-ground">
    <button className="tut-toggle" onClick={()=>setOpen(o=>!o)}><span dangerouslySetInnerHTML={{ __html:ico(open?'check':'book',12) }}/> Grounded in {n} {n===1?'source':'sources'}{v&&v.badRefs.length?` · ${v.badRefs.length} reference${v.badRefs.length>1?'s':''} could not be verified`:v&&v.checkedRefs?` · ${v.checkedRefs} references verified`:''}</button>
    {open && <div className="tut-rows">
      <Row label="Passages" items={g.passages}/><Row label="Cross refs" items={g.xrefs}/><Row label="Also matched" items={g.hits}/>
      {(g.notes||g.intro) && <div className="tut-row"><span className="lab">Notes</span><span className="tut-chips">{g.intro&&<span className="chip">{g.intro}</span>}{g.notes&&<span className="chip">{g.notes}</span>}</span></div>}
      <Row label="People" items={g.people}/><Row label="Places" items={g.places}/><Row label="Emmaus studies" items={g.studies}/><Row label="Pages" items={g.pages}/>
      {v&&v.badRefs.length>0 && <div className="tut-row"><span className="lab" style={{ color:'#d9b25c' }}>Check</span><span className="note">{v.badRefs.map(b=>`${b.ref} (${b.reason})`).join('; ')}</span></div>}
      {v&&v.unverifiedQuotes.length>0 && <div className="tut-row"><span className="lab" style={{ color:'#d9b25c' }}>Quotes</span><span className="note">{v.unverifiedQuotes.length} quotation{v.unverifiedQuotes.length>1?'s':''} not found word for word in the retrieved text; read the passage itself.</span></div>}
      <div className="note" style={{ marginTop:8 }}>Bible text: Berean Standard Bible (public domain). Notes: Tyndale Open Study Notes, CC BY-SA 4.0. Cross references: OpenBible.info, CC BY. People and places: Theographic, CC BY-SA 4.0.</div>
    </div>}
  </div>;
}
function parseStream(raw){ const parts=raw.split(SEP); let text=parts[0]||''; let ctx=null, ver=null;
  for(const p of parts.slice(1)){ const nl=p.indexOf('\n'); const head=nl>=0?p.slice(0,nl):p; const rest=nl>=0?p.slice(nl+1):'';
    try{ const j=JSON.parse(head); if(j.type==='context') ctx=j; else if(j.type==='verify') ver=j; text+=rest; }catch(e){ text+=p; } }
  return { text:text.trim(), ctx, ver }; }
export default function Tutor() {
  const params = useSearchParams(); const router = useRouter();
  const [msgs, setMsgs] = useState([]);
  const [q, setQ] = useState('');
  const [busy, setBusy] = useState(false);
  const [ctx, setCtx] = useState(null);
  const box = useRef(null); const started = useRef(false);
  useEffect(() => { const b = BOOKS.find(x => x.slug === params.get('book')); const ch = +params.get('ch'); setCtx(b && ch >= 1 && ch <= b.ch ? { book: b.name, slug: b.slug, ch } : false); }, []);
  useEffect(() => { const initial = params.get('q'); if (initial && ctx !== null && !started.current) { started.current = true; send(initial, ctx); } }, [ctx]);
  useEffect(() => { if (box.current) box.current.scrollTop = box.current.scrollHeight; }, [msgs]);
  async function send(text, context = ctx) {
    const question = (text ?? q).trim(); if (!question || busy) return;
    setQ(''); setBusy(true);
    const history = [...msgs, { role: 'user', content: question }];
    setMsgs([...history, { role: 'assistant', content: '', ground: null, verify: null }]);
    try {
      const r = await fetch('/api/tutor', { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ messages: history.map(m=>({ role:m.role, content:m.content })), book: context ? context.slug : undefined, ch: context ? context.ch : undefined }) });
      if (!r.ok || !r.body) throw new Error((await r.json().catch(() => ({}))).error || 'The tutor is unavailable');
      const reader = r.body.getReader(); const dec = new TextDecoder(); let raw = '';
      while (true) { const { value, done } = await reader.read(); if (done) break; raw += dec.decode(value, { stream: true }); const p=parseStream(raw); setMsgs([...history, { role: 'assistant', content: p.text, ground: p.ctx, verify: p.ver }]); }
    } catch (e) { setMsgs([...history, { role: 'assistant', content: 'Something went wrong: ' + e.message }]); }
    setBusy(false);
  }
  return <div className="wrap"><Artwork id="A5" className="art-page-heading"/>
    <div className="lab">Grounded in the text</div>
    <h1 className="h1" style={{ marginTop: 8, fontSize: 'clamp(48px,7vw,96px)' }}>Tutor</h1>
    <p style={{ fontSize: 20, color: 'var(--dim)', margin: '14px 0 0', maxWidth: 760 }}>Ask anything about the Bible, or where to find something on Emmaus. Before it answers, the tutor looks up the actual passages, cross references, study notes and the people and places involved, then cites what it found. Every reference is checked afterwards.</p>
    <div className="card" style={{ marginTop: 32, padding: 20 }}>
      {ctx && <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14, flexWrap: 'wrap', gap: 8 }}>
        <a className="chip" href={`/book/${ctx.slug}/${ctx.ch}`}><span dangerouslySetInnerHTML={{ __html: ico('book', 13) }} /> About {ctx.book} {ctx.ch}</a>
        <button className="note" style={{ background: 'none', border: 'none', cursor: 'pointer', textDecoration: 'underline dotted' }} onClick={() => setCtx(false)}>Ask about anything instead</button>
      </div>}
      <div className="chat" ref={box}>
        {msgs.length === 0 && <div className="msg">Ask me anything. I read the passage first, then answer from it with verse references, and point you to the right page on Emmaus when there is one.</div>}
        {msgs.map((m, i) => <div key={i} className={'msg ' + (m.role === 'user' ? 'me' : '')} style={{ whiteSpace: 'pre-wrap' }}>
          {m.content ? <Message text={m.content} onNav={p => router.push(p)} /> : (busy && i === msgs.length - 1 ? (m.ground ? 'Reading…' : 'Looking up the passages…') : '')}
          {m.role==='assistant' && m.ground && (m.verify || !busy) && <Grounding g={m.ground} v={m.verify}/>}
        </div>)}
      </div>
      <div style={{ display: 'flex', gap: 10, marginTop: 16 }}>
        <input type="text" id="q" value={q} onChange={e => setQ(e.target.value)} onKeyDown={e => { if (e.key === 'Enter') send(); }} placeholder={ctx ? `Ask about ${ctx.book} ${ctx.ch}, or anything else` : 'Ask about any passage, person, place or idea'} />
        <button className="btn" onClick={() => send()} disabled={busy}>Send</button>
      </div>
      <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginTop: 10 }}>{SUGGEST.map(s => <button key={s} className="chip" style={{ cursor: 'pointer' }} onClick={() => send(s)}><span dangerouslySetInnerHTML={{ __html: ico('spark', 12) }} />{s}</button>)}</div>
    </div>
  </div>;
}
