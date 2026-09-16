// Tyndale Open Study Notes (CC BY-SA 4.0) and public-domain commentaries, fetched per chapter from bible.helloao.org and cached in memory.
import INTROS from './data/intros.json';
const API='https://bible.helloao.org/api/c';
const cache=new Map();
async function chapterNotes(commentary,book,ch){
  const key=`${commentary}/${book.usfm}/${ch}`; if(cache.has(key)) return cache.get(key);
  const p=(async()=>{ try{ const r=await fetch(`${API}/${key}.json`,{ next:{ revalidate:86400 } }); if(!r.ok) return []; const j=await r.json(); return (j.chapter?.content||[]).filter(x=>x.type==='verse').map(x=>({ v:x.number, text:x.content.map(c=>typeof c==='string'?c:c.text||'').join('').replace(/\s+/g,' ').trim() })); }catch(e){ return []; } })();
  cache.set(key,p); return p;
}
// Study notes for the verses of a reference (plus one on either side), trimmed to a budget.
export async function studyNotes(ref,budget=2200,commentary='tyndale'){
  const notes=await chapterNotes(commentary,ref.book,ref.ch); if(!notes.length) return [];
  const a=ref.v1?ref.v1-1:1, b=ref.v2||ref.v1||999;
  const picked=notes.filter(n=>n.v>=a&&n.v<=b+1); const out=[]; let used=0;
  for(const n of picked.length?picked:notes.slice(0,6)){ const t=n.text.length>700?n.text.slice(0,700).replace(/\s+\S*$/,'')+'…':n.text; if(used+t.length>budget) break; out.push({ ref:`${ref.book.name} ${ref.ch}:${n.v}`, text:t }); used+=t.length; }
  return out;
}
export const bookIntro=(book,max=1400)=>{ const t=INTROS[book.usfm]; if(!t) return ''; return t.length>max?t.slice(0,max).replace(/\s+\S*$/,'')+'…':t; };
