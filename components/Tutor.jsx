'use client';
import Artwork from './Artwork.jsx';
import { useEffect, useRef, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { BOOKS } from '../lib/data.js';
import { ico } from '../lib/icons.js';
import { Refs } from './learn/Refs.jsx';
const SUGGEST = ['Where should I start reading?', 'What is the gospel, in one paragraph?', 'Who were the Pharisees and Sadducees?', 'Show me the maps of Paul’s journeys', 'What does Emmaus say about Genesis 6?', 'Quiz me on Matthew'];
const LINK=/\[([^\]]+)\]\((\/[^)\s]*)\)/g;
function Message({ text, onNav }){
  const paras=String(text).split(/\n{2,}/);
  return paras.map((p,i)=>{ const out=[]; let last=0, m; LINK.lastIndex=0;
    while((m=LINK.exec(p))){ out.push(<Refs key={'t'+m.index} text={p.slice(last,m.index)}/>); out.push(<a key={'l'+m.index} href={m[2]} onClick={e=>{ e.preventDefault(); onNav(m[2]); }}>{m[1]}</a>); last=m.index+m[0].length; }
    out.push(<Refs key={'e'+i} text={p.slice(last)}/>);
    return <p key={i} style={{ margin:i?'10px 0 0':0 }}>{out}</p>; });
}
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
    setMsgs([...history, { role: 'assistant', content: '' }]);
    try {
      const r = await fetch('/api/tutor', { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ messages: history, book: context ? context.slug : undefined, ch: context ? context.ch : undefined }) });
      if (!r.ok || !r.body) throw new Error((await r.json().catch(() => ({}))).error || 'The tutor is unavailable');
      const reader = r.body.getReader(); const dec = new TextDecoder(); let acc = '';
      while (true) { const { value, done } = await reader.read(); if (done) break; acc += dec.decode(value, { stream: true }); setMsgs([...history, { role: 'assistant', content: acc }]); }
    } catch (e) { setMsgs([...history, { role: 'assistant', content: 'Something went wrong: ' + e.message }]); }
    setBusy(false);
  }
  return <div className="wrap"><Artwork id="A5" className="art-page-heading"/>
    <div className="lab">Grounded in the text</div>
    <h1 className="h1" style={{ marginTop: 8, fontSize: 'clamp(48px,7vw,96px)' }}>Tutor</h1>
    <p style={{ fontSize: 20, color: 'var(--dim)', margin: '14px 0 0', maxWidth: 760 }}>Ask anything about the Bible, or about where to find something on Emmaus. Answers come from Scripture with verse citations, and point you to the studies, maps and pages here that go deeper.</p>
    <div className="card" style={{ marginTop: 32, padding: 20 }}>
      {ctx && <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14, flexWrap: 'wrap', gap: 8 }}>
        <a className="chip" href={`/book/${ctx.slug}/${ctx.ch}`}><span dangerouslySetInnerHTML={{ __html: ico('book', 13) }} /> About {ctx.book} {ctx.ch}</a>
        <button className="note" style={{ background: 'none', border: 'none', cursor: 'pointer', textDecoration: 'underline dotted' }} onClick={() => setCtx(false)}>Ask about anything instead</button>
      </div>}
      <div className="chat" ref={box}>
        {msgs.length === 0 && <div className="msg">Ask me anything. I answer from the text, cite the verses, and point you to the right page on Emmaus when there is one.</div>}
        {msgs.map((m, i) => <div key={i} className={'msg ' + (m.role === 'user' ? 'me' : '')} style={{ whiteSpace: 'pre-wrap' }}>{m.content ? <Message text={m.content} onNav={p => router.push(p)} /> : (busy && i === msgs.length - 1 ? 'Thinking…' : '')}</div>)}
      </div>
      <div style={{ display: 'flex', gap: 10, marginTop: 16 }}>
        <input type="text" id="q" value={q} onChange={e => setQ(e.target.value)} onKeyDown={e => { if (e.key === 'Enter') send(); }} placeholder={ctx ? `Ask about ${ctx.book} ${ctx.ch}, or anything else` : 'Ask about any passage, person, place or idea'} />
        <button className="btn" onClick={() => send()} disabled={busy}>Send</button>
      </div>
      <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginTop: 10 }}>{SUGGEST.map(s => <button key={s} className="chip" style={{ cursor: 'pointer' }} onClick={() => send(s)}><span dangerouslySetInnerHTML={{ __html: ico('spark', 12) }} />{s}</button>)}</div>
    </div>
  </div>;
}
