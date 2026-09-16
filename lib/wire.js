// Attaches behaviour to string-rendered pages after they mount.
import { BOOKS } from './data.js';
import { ico } from './icons.js';
import { S } from './state.js';
import { MEM, cardsOf, setPF, bySlug, extLinks } from './views.js';
export function wire(p,ctx){const $=s=>document.querySelector(s);const $$=s=>[...document.querySelectorAll(s)];const render=ctx.rerender;
 const rnd=$('#random');if(rnd)rnd.onclick=e=>{e.preventDefault();const b=BOOKS[Math.floor(Math.random()*BOOKS.length)];ctx.navigate(`/book/${b.slug}/${1+Math.floor(Math.random()*b.ch)}`)};
 $$('[data-pf]').forEach(b=>b.onclick=()=>{setPF(b.dataset.pf);render()});
 $$('.toggle').forEach(b=>b.onclick=()=>{const r=b.closest('.row');r.classList.toggle('open');b.textContent=r.classList.contains('open')?'Hide':(p[1]==='matthew'?'Show people, parables and resources':'Show resources')});
 $$('.addv').forEach(b=>b.onclick=()=>{S.DECKS[0].cards.push([b.dataset.ref,b.dataset.txt]);S.save();b.innerHTML=ico('check',14)+' In your deck';b.disabled=true});
 if(p[0]==='book'&&p[2]){const s=p[1],n=+p[2];const sn=$('#savenote');if(sn)sn.onclick=()=>{S.NOTES[s+':'+n]=$('#note').value;S.save();$('#notestat').textContent='Saved'};
  const ag=$('#askgo');if(ag)ag.onclick=e=>{e.preventDefault();const q=$('#askq').value.trim();ctx.navigate(`/tutor?book=${s}&ch=${n}`+(q?'&q='+encodeURIComponent(q):''))};const aq=$('#askq');if(aq)aq.onkeydown=e=>{if(e.key==='Enter')ag.click()}}
 if(p[0]==='memorize'){const d=S.DECKS[MEM.deck]||S.DECKS[0];const cs=cardsOf(d);const reset=()=>{MEM.i=0;MEM.flip=false;MEM.result=null;MEM.test=null};
  $$('[data-deck]').forEach(b=>b.onclick=()=>{MEM.deck=+b.dataset.deck;MEM.order=null;reset();render()});$$('[data-filter]').forEach(b=>b.onclick=()=>{MEM.filter=b.dataset.filter;MEM.order=null;reset();render()});
  $$('[data-mode]').forEach(b=>b.onclick=()=>{MEM.mode=b.dataset.mode;MEM.flip=false;MEM.result=null;MEM.test=null;render()});
  const fc=$('#fc');const flip=()=>{MEM.flip=!MEM.flip;if(fc)fc.classList.toggle('flip')};if(fc){fc.onclick=flip}
  const go=dd=>{if(!cs.length)return;MEM.i=(MEM.i+dd+cs.length)%cs.length;MEM.flip=false;render()};const nx=$('#next');if(nx)nx.onclick=()=>go(1);const pv=$('#prev');if(pv)pv.onclick=()=>go(-1);
  const sh=$('#shuffle');if(sh)sh.onclick=()=>{const n=d.cards.filter(c=>MEM.filter==='all'||(S.CSTAT[c[0]]||'new')===MEM.filter).length;MEM.order=Array.from({length:n},(_,i)=>i).sort(()=>Math.random()-.5);MEM.i=0;MEM.flip=false;render()};const tf=$('#textfirst');if(tf)tf.onclick=()=>{MEM.textFirst=!MEM.textFirst;MEM.flip=false;render()};
  window.__memkeys=e=>{if(location.pathname.indexOf('/memorize')!==0||MEM.mode!=='cards'||/INPUT|TEXTAREA/.test(document.activeElement.tagName))return;if(e.key===' '||e.key==='Enter'){e.preventDefault();flip()}else if(e.key==='ArrowRight')go(1);else if(e.key==='ArrowLeft')go(-1)};
  $$('[data-stat]').forEach(b=>b.onclick=()=>{S.CSTAT[b.dataset.ref]=b.dataset.stat;S.save();render()});
  $$('[data-del]').forEach(b=>b.onclick=()=>{d.cards.splice(+b.dataset.del,1);S.save();MEM.i=0;render()});
  const ac=$('#addcard');if(ac)ac.onclick=()=>{const r=$('#vref').value.trim(),t=$('#vtxt').value.trim();if(r&&t){d.cards.push([r,t]);S.save();MEM.mode='list';MEM.filter='all';render()}};
  const nd=$('#newdeck');if(nd)nd.onclick=()=>{const name=prompt('Name the deck');if(name){S.DECKS.push({name,cards:[]});S.save();MEM.deck=S.DECKS.length-1;reset();render()}}}
 if(p[0]==='library'){const go=$('#lbgo');if(go)go.onclick=()=>{const b=bySlug($('#lbbook').value);const ch=Math.max(1,Math.min(b.ch,parseInt($('#lbch').value)||1));$('#lbout').innerHTML=extLinks(b,ch)}}
}
