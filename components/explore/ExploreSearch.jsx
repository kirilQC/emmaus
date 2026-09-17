'use client';
import { useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { ico } from '../../lib/icons.js';
const SUGGEST=['covenant','the temple','Melchizedek','Paul’s journeys','baptism','Genesis 6','the exile','parables of the kingdom'];
export default function ExploreSearch(){
  const router=useRouter(); const [q,setQ]=useState(''); const input=useRef(null);
  const go=t=>{ const s=(t??q).trim(); if(s) router.push('/search?q='+encodeURIComponent(s)); };
  return <div className="exp-search-wrap">
    <div className="exp-search" onClick={()=>input.current?.focus()}>
      <span className="exp-search-ico" dangerouslySetInnerHTML={{ __html:ico('search',22) }}/>
      <input ref={input} type="text" value={q} onChange={e=>setQ(e.target.value)} onKeyDown={e=>{ if(e.key==='Enter') go(); }}
        placeholder="Search a passage, a person, a place, an idea" aria-label="Search everything on Emmaus"/>
      <button className="btn" onClick={e=>{ e.stopPropagation(); go(); }}>Search</button>
    </div>
    <div className="exp-suggest">{SUGGEST.map(s=><button key={s} className="chip" onClick={()=>go(s)}>{s}</button>)}</div>
  </div>;
}
