'use client';
import Artwork from './Artwork.jsx';
import { useEffect, useRef, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { S } from '../lib/state.js';
import { BOOKS, MT } from '../lib/data.js';
import { ico } from '../lib/icons.js';
const SUGGEST = ['Quiz me on this chapter', 'What is the main point of this chapter?', 'How does this chapter fit the whole book?', 'What would the first readers have heard here?', 'Where else in the Bible does this theme appear?'];
export default function Tutor() {
  const params = useSearchParams();
  const [msgs, setMsgs] = useState([]);
  const [q, setQ] = useState('');
  const [busy, setBusy] = useState(false);
  const [ctx, setCtx] = useState(null);
  const box = useRef(null);
  useEffect(() => { S.load().then(() => { const b = BOOKS.find(x => x.slug === S.LAST.book) || BOOKS[39]; setCtx({ book: b.name, slug: b.slug, ch: S.LAST.ch }); }); }, []);
  useEffect(() => { const initial = params.get('q'); if (initial && ctx && msgs.length === 0) send(initial); }, [ctx]);
  useEffect(() => { if (box.current) box.current.scrollTop = box.current.scrollHeight; }, [msgs]);
  async function send(text) {
    const question = (text ?? q).trim(); if (!question || busy || !ctx) return;
    setQ(''); setBusy(true);
    const history = [...msgs, { role: 'user', content: question }];
    setMsgs([...history, { role: 'assistant', content: '' }]);
    try {
      const r = await fetch('/api/tutor', { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ messages: history, book: ctx.book, ch: ctx.ch }) });
      if (!r.ok || !r.body) throw new Error((await r.json().catch(() => ({}))).error || 'The tutor is unavailable');
      const reader = r.body.getReader(); const dec = new TextDecoder(); let acc = '';
      while (true) { const { value, done } = await reader.read(); if (done) break; acc += dec.decode(value, { stream: true }); setMsgs([...history, { role: 'assistant', content: acc }]); }
    } catch (e) { setMsgs([...history, { role: 'assistant', content: 'Something went wrong: ' + e.message }]); }
    setBusy(false);
  }
  const chapterTitle = ctx && ctx.slug === 'matthew' ? ' · ' + MT.ch[ctx.ch - 1][1] : '';
  return <div className="wrap"><Artwork id="A5" className="art-page-heading"/>
    <div className="lab">Grounded in the text</div>
    <h1 className="h1" style={{ marginTop: 8, fontSize: 'clamp(48px,7vw,96px)' }}>Tutor</h1>
    <p style={{ fontSize: 20, color: 'var(--dim)', margin: '14px 0 0', maxWidth: 760 }}>Answers from Scripture with verse citations. The tutor reads the NLT text of the chapter you have open before it answers.</p>
    <div className="card" style={{ marginTop: 32, padding: 20 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14, flexWrap: 'wrap', gap: 8 }}>
        <span className="chip"><span dangerouslySetInnerHTML={{ __html: ico('book', 13) }} /> {ctx ? `Reading ${ctx.book} ${ctx.ch}${chapterTitle}` : 'Loading…'}</span>
        {ctx && <a className="note" href={`/book/${ctx.slug}/${ctx.ch}`}>Change chapter</a>}
      </div>
      <div className="chat" ref={box}>
        {msgs.length === 0 && <div className="msg">Ask me anything about the passage you are reading. I answer from the text and cite the verses.</div>}
        {msgs.map((m, i) => <div key={i} className={'msg ' + (m.role === 'user' ? 'me' : '')} style={{ whiteSpace: 'pre-wrap' }}>{m.content || (busy && i === msgs.length - 1 ? 'Reading the chapter…' : '')}</div>)}
      </div>
      <div style={{ display: 'flex', gap: 10, marginTop: 16 }}>
        <input type="text" id="q" value={q} onChange={e => setQ(e.target.value)} onKeyDown={e => { if (e.key === 'Enter') send(); }} placeholder={ctx ? `Ask about ${ctx.book} ${ctx.ch}` : 'Ask'} />
        <button className="btn" onClick={() => send()} disabled={busy}>Send</button>
      </div>
      <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginTop: 10 }}>{SUGGEST.map(s => <button key={s} className="chip" style={{ cursor: 'pointer' }} onClick={() => send(s)}><span dangerouslySetInnerHTML={{ __html: ico('spark', 12) }} />{s}</button>)}</div>
    </div>
  </div>;
}
