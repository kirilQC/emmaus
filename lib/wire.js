// Attaches behaviour to string-rendered pages after they mount.
import { BOOKS } from './data.js';
import { ico } from './icons.js';
import { S } from './state.js';
import { setPF, bySlug, extLinks } from './views.js';
export function wire(p,ctx){const $=s=>document.querySelector(s);const $$=s=>[...document.querySelectorAll(s)];const render=ctx.rerender;
 const rnd=$('#random');if(rnd)rnd.onclick=e=>{e.preventDefault();const b=BOOKS[Math.floor(Math.random()*BOOKS.length)];ctx.navigate(`/book/${b.slug}/${1+Math.floor(Math.random()*b.ch)}`)};
 $$('[data-pf]').forEach(b=>b.onclick=()=>{setPF(b.dataset.pf);render()});
 $$('.toggle').forEach(b=>b.onclick=()=>{const r=b.closest('.row');r.classList.toggle('open');b.textContent=r.classList.contains('open')?'Hide':(p[1]==='matthew'?'Show people, parables and resources':'Show resources')});
 $$('.addv').forEach(b=>b.onclick=()=>{S.DECKS[0].cards.push([b.dataset.ref,b.dataset.txt]);S.save();b.innerHTML=ico('check',14)+' In your deck';b.disabled=true});
 if(p[0]==='book'&&p[2]){const s=p[1],n=+p[2];const sn=$('#savenote');if(sn)sn.onclick=()=>{S.NOTES[s+':'+n]=$('#note').value;S.save();$('#notestat').textContent='Saved'};
  const ag=$('#askgo');if(ag)ag.onclick=e=>{e.preventDefault();const q=$('#askq').value.trim();ctx.navigate(`/tutor?book=${s}&ch=${n}`+(q?'&q='+encodeURIComponent(q):''))};const aq=$('#askq');if(aq)aq.onkeydown=e=>{if(e.key==='Enter')ag.click()}}
 if(p[0]==='library'){const go=$('#lbgo');if(go)go.onclick=()=>{const b=bySlug($('#lbbook').value);const ch=Math.max(1,Math.min(b.ch,parseInt($('#lbch').value)||1));$('#lbout').innerHTML=extLinks(b,ch)}}
}
