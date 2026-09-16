// Theographic people, places and events (CC BY-SA 4.0), looked up by name or by words in the question.
import PEOPLE from './data/people.json';
import PLACES from './data/places.json';
import EVENTS from './data/events.json';
import { parseOsis, label } from './books.js';
// Folds spelling variants (Melchizedek / Melchisedec, Isaac / Izaak) so KJV-era names in the dataset still match.
const norm=s=>String(s).toLowerCase().replace(/[’']/g,'').replace(/[^a-z0-9 ]+/g,' ').replace(/\s+/g,' ').trim().replace(/z/g,'s').replace(/ck|k/g,'c').replace(/ph/g,'f');
const index=(list,fields)=>{ const m=new Map(); for(const x of list){ for(const f of fields){ for(const n of String(x[f]||'').split(/,|;/)){ const k=norm(n); if(k.length>2&&!m.has(k)) m.set(k,x); } } } return m; };
const PIDX=index(PEOPLE,['name','also']); const LIDX=index(PLACES,['name']);
const refLabels=vs=>vs.map(o=>{ const r=parseOsis(o); return r?{ label:label(r), book:r.book.slug, ch:r.ch, v:r.v1 }:null; }).filter(Boolean);
export function findPeople(names,question,n=3){
  const out=[]; const seen=new Set(); const add=p=>{ if(p&&!seen.has(p.id)&&out.length<n){ seen.add(p.id); out.push(p); } };
  names.forEach(nm=>add(PIDX.get(norm(nm))));
  const q=' '+norm(question)+' '; for(const [k,p] of PIDX){ if(out.length>=n) break; if(k.length>3&&q.includes(' '+k+' ')&&p.count>=3) add(p); }
  return out.map(p=>({ ...p, refs:refLabels(p.verses) }));
}
export function findPlaces(names,question,n=2){
  const out=[]; const seen=new Set(); const add=p=>{ if(p&&!seen.has(p.id)&&out.length<n){ seen.add(p.id); out.push(p); } };
  names.forEach(nm=>add(LIDX.get(norm(nm))));
  const q=' '+norm(question)+' '; for(const [k,p] of LIDX){ if(out.length>=n) break; if(k.length>3&&q.includes(' '+k+' ')&&p.count>=2) add(p); }
  return out.map(p=>({ ...p, refs:refLabels(p.verses) }));
}
export function findEvents(question,refs=[],n=4){
  const toks=new Set(norm(question).split(' ').filter(w=>w.length>3));
  const keys=new Set(refs.map(r=>`${r.book.osis}.${r.ch}.`));
  return EVENTS.map(e=>{ let s=0; norm(e.title).split(' ').forEach(w=>{ if(toks.has(w)) s+=2; }); if(e.verses.some(v=>[...keys].some(k=>v.startsWith(k)))) s+=3; return [s,e]; }).filter(([s])=>s>=2).sort((a,b)=>b[0]-a[0]).slice(0,n).map(([,e])=>({ ...e, refs:refLabels(e.verses) }));
}
export const personSummary=p=>`${p.name}${p.also?` (also ${p.also})`:''}${p.group?`, ${p.group}`:''}${p.born||p.died?` [${p.born||'?'} to ${p.died||'?'}]`:''}. ${p.father?`Father: ${p.father}. `:''}${p.mother?`Mother: ${p.mother}. `:''}${p.partners?.length?`Spouse: ${p.partners.join(', ')}. `:''}${p.children?.length?`Children: ${p.children.join(', ')}. `:''}${p.summary} Appears in ${p.count} verses, e.g. ${p.refs.slice(0,6).map(r=>r.label).join('; ')}.`;
export const placeSummary=p=>`${p.name}${p.type?` (${p.type})`:''}${p.lat?` at ${p.lat.toFixed(2)}, ${p.lon.toFixed(2)}`:''}. ${p.summary} Mentioned in ${p.count} verses, e.g. ${p.refs.slice(0,6).map(r=>r.label).join('; ')}.`;
export const eventSummary=e=>`${e.title}${e.year?` (${e.year<0?Math.abs(e.year)+' BC':'AD '+e.year})`:''}${e.people.length?`; people: ${e.people.join(', ')}`:''}${e.places.length?`; places: ${e.places.join(', ')}`:''}; ${e.refs.map(r=>r.label).join('; ')}.`;
export { PEOPLE, PLACES, EVENTS };
