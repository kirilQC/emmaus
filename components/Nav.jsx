'use client';
import Artwork from './Artwork.jsx';
import { usePathname, useRouter } from 'next/navigation';
import { useEffect, useRef } from 'react';
import { ico } from '../lib/icons.js';
import { TOTAL } from '../lib/data.js';
const L=[['/','Canon','book'],['/explore','Explore','compass'],['/learn','Learn','lamp'],['/memorize','Memorise','cards'],['/reference','Reference','map'],['/notes','Notes','pen'],['/library','Library','shelf'],['/tutor','Tutor','heart']];
export default function Nav(){
  const path=usePathname();const router=useRouter();const inp=useRef(null);
  useEffect(()=>{const h=e=>{if(window.__memkeys)window.__memkeys(e);if(e.key==='/'&&!/INPUT|TEXTAREA/.test(document.activeElement.tagName)){e.preventDefault();inp.current&&inp.current.focus()}};window.addEventListener('keydown',h);return()=>window.removeEventListener('keydown',h)},[]);
  const on=h=>h==='/'?path==='/'||path.startsWith('/book'):path.startsWith(h);
  return <nav className="top">
    <a className="brand art-brand" aria-label="Emmaus" href="/" onClick={e=>{e.preventDefault();router.push('/')}}><Artwork id="logo" className="art-logo"/><Artwork id="wordmark" className="art-wordmark"/></a>
    <div className="links">{L.map(([h,l,i])=><a key={h} href={h} className={on(h)?'on':''} onClick={e=>{e.preventDefault();router.push(h)}}><span dangerouslySetInnerHTML={{__html:ico(i,16)}}/> {l}</a>)}</div>
    <div className="right"><span className="srch"><span dangerouslySetInnerHTML={{__html:ico('search',15)}}/><input ref={inp} type="text" id="gsearch" placeholder="Search  ·  press /" aria-label="Search" onKeyDown={e=>{if(e.key==='Enter'&&e.currentTarget.value.trim())router.push('/search?q='+encodeURIComponent(e.currentTarget.value.trim()))}}/></span></div>
  </nav>;
}
