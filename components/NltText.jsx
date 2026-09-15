'use client';
import { useEffect, useState } from 'react';
// Fetches one chapter from Tyndale's NLT API through our proxy and renders it.
export default function NltText({ book, ch }) {
  const [state, setState] = useState({ status: 'loading' });
  useEffect(() => {
    let dead = false; setState({ status: 'loading' });
    fetch(`/api/nlt?ref=${encodeURIComponent(book + ' ' + ch)}`).then(async r => {
      if (!r.ok) throw new Error((await r.json().catch(() => ({}))).error || 'NLT request failed');
      return r.text();
    }).then(html => { if (!dead) setState({ status: 'ok', html }); }).catch(e => { if (!dead) setState({ status: 'error', error: e.message }); });
    return () => { dead = true; };
  }, [book, ch]);
  return <div className="card" style={{ padding: '24px 28px' }}>
    <div className="note" style={{ display: 'flex', justifyContent: 'space-between', gap: 12, flexWrap: 'wrap' }}><span>New Living Translation</span><span>{book} {ch}</span></div>
    {state.status === 'loading' && <p className="note" style={{ marginTop: 14 }}>Fetching the chapter…</p>}
    {state.status === 'error' && <p className="note" style={{ marginTop: 14 }}>Could not load the text: {state.error}. <a href={`https://www.biblegateway.com/passage/?search=${encodeURIComponent(book + ' ' + ch)}&version=NLT`} target="_blank" rel="noopener">Read it on Bible Gateway</a>.</p>}
    {state.status === 'ok' && <div className="nlt reader" style={{ marginTop: 14 }} dangerouslySetInnerHTML={{ __html: state.html }} />}
  </div>;
}
