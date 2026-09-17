'use client';
import Artwork from '../Artwork.jsx';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { S } from '../../lib/state.js';
import { ico, pattern } from '../../lib/icons.js';

const STATUS={ known:['Know it','var(--ok)'], learning:['Still learning','var(--accent)'], new:['Not yet tried','var(--dim)'] };
const ORDER=['all','new','learning','known'];
const FILTERLABEL={ all:'All', new:'Not yet tried', learning:'Still learning', known:'Know it' };
const DECKART=[['#4d6f95','B3'],['#6a8f6a','B4'],['#8a3b2e','D5'],['#d9a441','C6'],['#7a5c96','A6'],['#b08d3f','C2'],['#a35b3f','C3'],['#c96a3f','B1']];
const deckStyle=i=>DECKART[i%DECKART.length];
const I=(n,s=16)=><span className="ico" dangerouslySetInnerHTML={{ __html:ico(n,s) }}/>;

function Tile({ ref_, status, reps, onPick, active, deck }){
  const col=STATUS[status][1];
  return <button className={'mem-tile'+(active?' on':'')} onClick={onPick} style={{ borderColor:`color-mix(in srgb,${col} 45%,var(--line))`, background:`color-mix(in srgb,${col} ${status==='new'?6:13}%,var(--card))` }}>
    {deck && <span className="mem-tile-deck">{deck}</span>}
    <span className="mem-tile-ref">{ref_}</span>
    <span className="mem-tile-foot"><span className="mem-dot" style={{ background:col }}/><span className="mem-reps">{[0,1,2,3,4].map(i=><i key={i} style={{ background:i<reps?'var(--dim)':'var(--line)' }}/>)}</span></span>
  </button>;
}

export default function Memorise(){
  const [ready,setReady]=useState(false); const [,force]=useState(0);
  const [deck,setDeck]=useState(0); const [filter,setFilter]=useState('all');
  const [idx,setIdx]=useState(0); const [flip,setFlip]=useState(false);
  const [textFirst,setTextFirst]=useState(false); const [order,setOrder]=useState(null);
  const [allDecks,setAllDecks]=useState(false); const [full,setFull]=useState(false);
  const [vref,setVref]=useState(''); const [vtxt,setVtxt]=useState('');
  const bump=useCallback(()=>force(n=>n+1),[]);
  useEffect(()=>{ (S.loaded?Promise.resolve():S.load()).then(()=>setReady(true)); },[]);

  const decks=S.DECKS||[]; const d=decks[deck]||decks[0]||{ name:'', cards:[] };
  const statOf=r=>(S.CSTAT||{})[r]||'new';
  const repsOf=r=>((S.REPS||{})[r])||0;
  const pool=useMemo(()=>{
    const rows=allDecks?decks.flatMap((x,di)=>x.cards.map(c=>({ ref:c[0], text:c[1], deck:x.name, di }))):(d.cards||[]).map(c=>({ ref:c[0], text:c[1], deck:d.name, di:deck }));
    const f=rows.filter(r=>filter==='all'||statOf(r.ref)===filter);
    return order&&order.length===f.length?order.map(i=>f[i]):f;
  },[ready,deck,filter,allDecks,order,decks.length,d.cards&&d.cards.length,S.updated]);
  const cur=pool[Math.min(idx,Math.max(pool.length-1,0))];
  useEffect(()=>{ setIdx(0); setFlip(false); setOrder(null); },[deck,filter,allDecks]);

  const move=useCallback(n=>{ if(!pool.length) return; setIdx(i=>(i+n+pool.length)%pool.length); setFlip(false); },[pool.length]);
  const grade=useCallback(st=>{ if(!cur) return; S.CSTAT=S.CSTAT||{}; S.REPS=S.REPS||{}; S.CSTAT[cur.ref]=st; S.REPS[cur.ref]=Math.min((S.REPS[cur.ref]||0)+1,5); S.save(); bump(); move(1); },[cur,bump,move]);
  useEffect(()=>{
    const h=e=>{ if(/INPUT|TEXTAREA/.test(document.activeElement?.tagName||'')) return;
      if(e.key===' '||e.key==='Enter'){ e.preventDefault(); setFlip(f=>!f); }
      else if(e.key==='ArrowRight') move(1); else if(e.key==='ArrowLeft') move(-1);
      else if(e.key==='1') grade('learning'); else if(e.key==='2') grade('known');
      else if(e.key==='Escape') setFull(false); };
    window.addEventListener('keydown',h); return ()=>window.removeEventListener('keydown',h);
  },[move,grade]);

  if(!ready) return <div className="wrap"><div className="note">Loading…</div></div>;
  const counts=k=>(allDecks?decks.flatMap(x=>x.cards):d.cards||[]).filter(c=>k==='all'||statOf(c[0])===k).length;
  const [col,artId]=deckStyle(deck);
  const known=(d.cards||[]).filter(c=>statOf(c[0])==='known').length;
  const pct=d.cards&&d.cards.length?Math.round(known/d.cards.length*100):0;
  const addVerse=()=>{ if(!vref.trim()||!vtxt.trim()) return; d.cards.push([vref.trim(),vtxt.trim()]); S.save(); setVref(''); setVtxt(''); bump(); };
  const newDeck=()=>{ const n=prompt('Name the group'); if(n){ S.DECKS.push({ name:n, cards:[] }); S.save(); setDeck(S.DECKS.length-1); bump(); } };
  const removeCur=()=>{ if(!cur) return; const dk=decks[cur.di]; const i=dk.cards.findIndex(c=>c[0]===cur.ref); if(i>=0){ dk.cards.splice(i,1); S.save(); bump(); } };

  const card=cur?<div className="mem-card" style={{ backgroundImage:`${pattern('quote','var(--accent)')},linear-gradient(155deg,color-mix(in srgb,var(--accent-soft) 72%,var(--card)),var(--card) 72%)` }} onClick={()=>setFlip(f=>!f)} role="button" tabIndex={0} aria-label="Flip the card">
      <Artwork id="D5" className="mem-card-art"/>
      {(textFirst?!flip:flip)
        ? <div className="mem-card-in"><div className="lab" style={{ color:'var(--accent)' }}>{cur.ref}</div><p className="mem-verse">“{cur.text}”</p></div>
        : <div className="mem-card-in"><div className="lab">Reference</div><div className="mem-ref">{cur.ref}</div><div className="note mem-hint">click or press space to flip</div></div>}
    </div>:<div className="mem-card mem-empty"><div className="note">Nothing in this group yet. Add a verse below, or press “Memorise this” on any verse in the reader.</div></div>;

  if(full) return <div className="mem-full" style={{ backgroundImage:`${pattern('cards','var(--accent)')},radial-gradient(ellipse at 50% -10%, var(--accent-soft), var(--bg) 62%)` }}>
    <div className="mem-full-top">
      <div className="mem-band-left"><span className="note">{d.name}</span><span className="mem-dots">{pool.map((p,i)=><i key={p.ref+i} style={{ width:i===idx?24:18, background:i<=idx?STATUS[statOf(p.ref)][1]:'var(--line)' }}/>)}</span><span className="note">{pool.length?idx+1:0} of {pool.length}</span></div>
      <div className="mem-band-right"><button className={'chip'+(textFirst?'':' on')} onClick={()=>setTextFirst(false)}>Reference first</button><button className={'chip'+(textFirst?' on':'')} onClick={()=>setTextFirst(true)}>Text first</button><button className="chip" onClick={()=>setFull(false)}>Close · esc</button></div>
    </div>
    <div className="mem-full-mid">{card}</div>
    <div className="mem-full-bot"><button className="chip lrn" onClick={()=>grade('learning')}>Still learning</button><button className="chip kn" onClick={()=>grade('known')}>{I('check',13)} Know it</button></div>
    <div className="note mem-keys">space flips · ← → moves · 1 still learning · 2 know it</div>
  </div>;

  return <div className="mem">
    <div className="mem-band" style={{ backgroundImage:`${pattern('cards','var(--accent)')},radial-gradient(ellipse at 50% -30%, var(--accent-soft), var(--bg) 62%)` }}>
      <div className="mem-band-in">
        <div className="mem-band-top">
          <div className="mem-band-left">
            <span className="mem-deck-chip" style={{ background:`color-mix(in srgb,${col} 18%,transparent)`, borderColor:`color-mix(in srgb,${col} 40%,var(--line))` }}><Artwork id={artId} className="mem-deck-art"/></span>
            <span className="note">{allDecks?'All groups':d.name}</span>
            <span className="mem-dots">{pool.slice(0,14).map((p,i)=><i key={p.ref+i} style={{ width:i===idx?24:18, background:i<=idx?STATUS[statOf(p.ref)][1]:'var(--line)' }}/>)}</span>
            <span className="note">{pool.length?idx+1:0} of {pool.length}</span>
          </div>
          <div className="mem-band-right">
            <button className={'chip'+(textFirst?'':' on')} onClick={()=>setTextFirst(false)}>Reference first</button>
            <button className={'chip'+(textFirst?' on':'')} onClick={()=>setTextFirst(true)}>Text first</button>
            <button className="chip" onClick={()=>{ setOrder(pool.map((_,i)=>i).sort(()=>Math.random()-.5)); setIdx(0); setFlip(false); }}>Shuffle</button>
            <button className="chip" onClick={()=>setFull(true)}>{I('cards',13)} Full screen</button>
          </div>
        </div>
        {card}
        <div className="mem-grade">
          <span className="note mem-prev">{pool.length>1?'← '+pool[(idx-1+pool.length)%pool.length].ref:''}</span>
          <span className="mem-grade-btns"><button className="chip lrn" onClick={()=>grade('learning')} disabled={!cur}>Still learning</button><button className="chip kn" onClick={()=>grade('known')} disabled={!cur}>{I('check',13)} Know it</button></span>
          <span className="note mem-next">{pool.length>1?pool[(idx+1)%pool.length].ref+' →':''}</span>
        </div>
        <div className="note mem-keys">space flips · ← → moves · 1 still learning · 2 know it</div>
      </div>
    </div>

    <div className="wrap mem-body">
      <aside className="mem-rail">
        <div className="mem-rail-head"><span className="lab">Groups</span><button className="mem-link" onClick={newDeck}>+ New</button></div>
        <div className="mem-decks">{decks.map((x,i)=>{ const [c,a]=deckStyle(i); const k=x.cards.filter(cd=>statOf(cd[0])==='known').length; const p=x.cards.length?Math.round(k/x.cards.length*100):0;
          return <button key={x.name+i} className={'mem-deck'+(i===deck&&!allDecks?' on':'')} onClick={()=>{ setDeck(i); setAllDecks(false); }} style={i===deck&&!allDecks?{ background:`color-mix(in srgb,${c} 11%,var(--card))`, borderColor:`color-mix(in srgb,${c} 40%,var(--line))` }:undefined}>
            <span className="mem-deck-chip sm" style={{ background:`color-mix(in srgb,${c} 16%,transparent)` }}><Artwork id={a} className="mem-deck-art"/></span>
            <span className="mem-deck-copy"><span className="mem-deck-name">{x.name}</span><span className="mem-deck-meta"><span className="mem-bar"><i style={{ width:p+'%', background:c }}/></span><span className="note">{x.cards.length}</span></span></span>
          </button>; })}
          <button className={'mem-deck all'+(allDecks?' on':'')} onClick={()=>setAllDecks(true)}><span className="mem-deck-copy"><span className="mem-deck-name">All groups</span><span className="note">{decks.reduce((a,x)=>a+x.cards.length,0)} verses</span></span></button>
        </div>
        <div className="mem-rail-sec"><span className="lab">Filter</span>
          <div className="mem-filters">{ORDER.map(k=><button key={k} className={'mem-filter'+(filter===k?' on':'')} onClick={()=>setFilter(k)}>
            <span>{k!=='all'&&<span className="mem-dot" style={{ background:STATUS[k][1] }}/>}{FILTERLABEL[k]}</span><span className="note">{counts(k)}</span></button>)}</div></div>
        <div className="mem-rail-sec"><span className="lab">Add a verse</span>
          <div className="mem-add"><input value={vref} onChange={e=>setVref(e.target.value)} placeholder="Matthew 7:7" aria-label="Reference"/><input value={vtxt} onChange={e=>setVtxt(e.target.value)} onKeyDown={e=>{ if(e.key==='Enter') addVerse(); }} placeholder="Ask, and it will be given to you…" aria-label="Verse text"/><button className="btn sm" onClick={addVerse}>Add</button></div>
          <div className="note" style={{ marginTop:8 }}>Every verse in the reader has a memorise button that sends it here.</div></div>
      </aside>

      <main className="mem-main">
        <div className="mem-main-head">
          <div className="mem-main-title"><h2 className="mem-h2">{allDecks?'All groups':d.name}</h2><span className="note">{pool.length} {pool.length===1?'verse':'verses'}{filter!=='all'?' · '+FILTERLABEL[filter].toLowerCase():''} · click any one to load it above</span></div>
          <div className="mem-legend">{['known','learning','new'].map(k=><span key={k}><span className="mem-dot" style={{ background:STATUS[k][1] }}/>{STATUS[k][0]} · {counts(k)}</span>)}</div>
        </div>
        {pool.length?<div className="mem-wall">{pool.map((p,i)=><Tile key={p.ref+i} ref_={p.ref} status={statOf(p.ref)} reps={repsOf(p.ref)} active={i===idx} deck={allDecks?p.deck:null} onPick={()=>{ setIdx(i); setFlip(false); }}/>)}</div>
          :<div className="stub">Nothing here yet.{filter!=='all'&&' Try another filter.'}</div>}
        <div className="mem-main-foot">
          {!allDecks&&<button className="mem-link" onClick={()=>setAllDecks(true)}>Show all {decks.reduce((a,x)=>a+x.cards.length,0)} verses across every group →</button>}
          {cur&&<button className="mem-link dim" onClick={removeCur}>Remove {cur.ref} from {decks[cur.di]?.name}</button>}
        </div>
      </main>
    </div>
  </div>;
}
