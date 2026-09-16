// The tools the tutor model calls while it works. Every call is executed against the open datasets and recorded,
// so the finished answer can be verified and the reader can see exactly what was looked up.
import { findRefs } from './refs.js';
import { getVerses, searchVerses, crossRefs } from './text.js';
import { findPeople, findPlaces, findEvents, personSummary, placeSummary, eventSummary } from './entities.js';
import { studyNotes, bookIntro } from './notes.js';
import { bookFromName, bySlug } from './books.js';
import { findPages } from '../catalog.js';
import { studyByParam } from '../learn/index.js';

export const TOOLS=[
  { type:'function', name:'get_passage', description:'Read the actual Bible text (Berean Standard Bible) of a passage, with the Tyndale Open Study Notes on those verses. Always read a passage before quoting or explaining it. Use full book names, e.g. "Leviticus 18:22", "Romans 1:18-32", "John 3".', parameters:{ type:'object', properties:{ reference:{ type:'string' } }, required:['reference'] } },
  { type:'function', name:'search_verses', description:'Search every verse of the Bible for words or a phrase. Use distinctive Bible words, not the reader\'s abstract vocabulary (e.g. "lie with a male" rather than "homosexuality"; "forgive" rather than "forgiveness ethics").', parameters:{ type:'object', properties:{ query:{ type:'string' }, limit:{ type:'integer' } }, required:['query'] } },
  { type:'function', name:'cross_references', description:'Cross references for a verse from OpenBible.info (Treasury of Scripture Knowledge), with their text.', parameters:{ type:'object', properties:{ reference:{ type:'string' } }, required:['reference'] } },
  { type:'function', name:'lookup_entity', description:'Look up a biblical person, place or event: family, dates, dictionary summary, where they appear.', parameters:{ type:'object', properties:{ name:{ type:'string' } }, required:['name'] } },
  { type:'function', name:'book_introduction', description:'The Tyndale Open Study Notes introduction to a book: setting, author, date, purpose, themes.', parameters:{ type:'object', properties:{ book:{ type:'string' } }, required:['book'] } },
  { type:'function', name:'find_emmaus_pages', description:'Find pages on the Emmaus site itself: graded studies (with their conclusion and caveats), maps, diagrams, charts, essays, people pages. Use when the reader asks where to find something, or to point them to deeper material.', parameters:{ type:'object', properties:{ query:{ type:'string' } }, required:['query'] } },
];

export function newContext(){ return { passages:[], hits:[], xrefs:[], notes:[], intro:null, people:[], places:[], events:[], studies:[], pages:[], calls:[] }; }
const dedupe=(arr,key)=>{ const s=new Set(); return arr.filter(x=>{ const k=key(x); if(s.has(k)) return false; s.add(k); return true; }); };

export async function readPassage(ctx,reference,noteBudget=1600){
  const r=findRefs(reference)[0]; if(!r) return `Could not parse the reference "${reference}". Use a full book name, chapter and verses, e.g. "Romans 1:26-27".`;
  const verses=getVerses(r,40); if(!verses.length) return `No text found for ${r.label}.`;
  const notes=await studyNotes(r,noteBudget);
  ctx.passages=dedupe([...ctx.passages,{ label:r.label, book:r.book.slug, ch:r.ch, v:verses[0].v, verses }],p=>p.label);
  ctx.notes=dedupe([...ctx.notes,...notes],n=>n.ref+n.text.slice(0,30));
  return `${r.label} (BSB):\n`+verses.map(v=>`${v.v} ${v.text}`).join('\n')+(notes.length?`\n\nTyndale Open Study Notes:\n`+notes.map(n=>`${n.ref}: ${n.text}`).join('\n'):'');
}
export async function runTool(ctx,name,args){
  try{
    if(name==='get_passage'){ const out=await readPassage(ctx,args.reference); ctx.calls.push(`Read ${findRefs(args.reference)[0]?.label||args.reference}`); return out; }
    if(name==='search_verses'){ const hits=searchVerses(args.query,Math.min(+args.limit||10,20)); ctx.hits=dedupe([...ctx.hits,...hits],h=>h.ref); ctx.calls.push(`Searched “${args.query}”`); return hits.length?hits.map(h=>`${h.ref}: ${h.text}`).join('\n'):'No verses matched. Try other words that would appear in the verse itself.'; }
    if(name==='cross_references'){ const r=findRefs(args.reference)[0]; if(!r) return 'Could not parse the reference.'; const xs=crossRefs(r.book,r.ch,r.v1||1,8); ctx.xrefs=dedupe([...ctx.xrefs,...xs],x=>x.ref); ctx.calls.push(`Cross references for ${r.label}`); return xs.length?xs.map(x=>`${x.ref}: ${x.text}`).join('\n'):'No cross references recorded for that verse.'; }
    if(name==='lookup_entity'){ const people=findPeople([args.name],args.name,2), places=findPlaces([args.name],args.name,2), events=findEvents(args.name,[],3); ctx.people=dedupe([...ctx.people,...people],p=>p.id); ctx.places=dedupe([...ctx.places,...places],p=>p.id); ctx.events=dedupe([...ctx.events,...events],e=>e.id); ctx.calls.push(`Looked up ${args.name}`); const out=[...people.map(personSummary),...places.map(placeSummary),...events.map(eventSummary)]; return out.length?out.join('\n\n'):`Nothing found for "${args.name}" in the people, places or events data.`; }
    if(name==='book_introduction'){ const b=bookFromName(args.book)||bookFromName(String(args.book).replace(/\b\w/g,c=>c.toUpperCase())); if(!b) return 'Unknown book.'; const t=bookIntro(b,2400); ctx.intro={ book:b.name, text:t }; ctx.calls.push(`Introduction to ${b.name}`); return t||'No introduction available.'; }
    if(name==='find_emmaus_pages'){ const pages=findPages(args.query,10); const studies=pages.filter(p=>p.kind==='study').slice(0,3).map(p=>{ const s=studyByParam(p.path.split('/').pop()); return s?{ title:s.title, path:s.href, lane:s.lane, evidence:s.evidence, core:s.core, caveats:s.caveats.length>420?s.caveats.slice(0,420).replace(/\s+\S*$/,'')+'…':s.caveats }:null; }).filter(Boolean); ctx.studies=dedupe([...ctx.studies,...studies],s=>s.path); ctx.pages=dedupe([...ctx.pages,...pages.filter(p=>p.kind!=='study')],p=>p.path); ctx.calls.push(`Searched Emmaus for “${args.query}”`); return (studies.length?'EMMAUS STUDIES (this site’s own graded conclusions):\n'+studies.map(s=>`[${s.title}](${s.path}) (${s.lane}; graded ${s.evidence})\nCore: ${s.core}\nCaveats: ${s.caveats}`).join('\n\n')+'\n\n':'')+(pages.length?'PAGES you may link to with exactly these paths:\n'+pages.map(p=>`- [${p.title}](${p.path}) (${p.kind})`).join('\n'):'No matching pages.'); }
    return `Unknown tool ${name}.`;
  }catch(e){ ctx.calls.push(`${name} failed: ${e.message}`); return `Tool error: ${e.message}`; }
}
// Text the model sees before it starts: anything the reader referenced explicitly, plus the chapter they came from.
export async function seedContext(ctx,question,opened){
  const refs=findRefs(question).slice(0,3); if(!refs.length&&opened) refs.push(opened);
  const parts=[]; for(const r of refs){ parts.push(await readPassage(ctx,r.label,1400)); }
  const pages=findPages(question,8); const studies=pages.filter(p=>p.kind==='study').slice(0,3).map(p=>{ const s=studyByParam(p.path.split('/').pop()); return s?{ title:s.title, path:s.href, lane:s.lane, evidence:s.evidence, core:s.core, caveats:s.caveats.length>320?s.caveats.slice(0,320).replace(/\s+\S*$/,'')+'…':s.caveats }:null; }).filter(Boolean);
  ctx.studies=studies; ctx.pages=pages.filter(p=>p.kind!=='study');
  // People and places named in the question, so the reader sees them even when the model does not look them up.
  ctx.people=findPeople([],question,2); ctx.places=findPlaces([],question,1);
  if(ctx.people.length||ctx.places.length) parts.push('PEOPLE AND PLACES named in the question (Theographic data):\n'+[...ctx.people.map(personSummary),...ctx.places.map(placeSummary)].join('\n'));
  if(studies.length) parts.push('EMMAUS STUDIES that may be relevant (this site’s own graded conclusions; represent them faithfully if you use them):\n'+studies.map(s=>`[${s.title}](${s.path}) (${s.lane}; graded ${s.evidence})\nCore: ${s.core}\nCaveats: ${s.caveats}`).join('\n\n'));
  if(ctx.pages.length) parts.push('OTHER EMMAUS PAGES you may link to with exactly these paths:\n'+ctx.pages.map(p=>`- [${p.title}](${p.path}) (${p.kind})`).join('\n'));
  return parts.join('\n\n');
}
const cut=(s,n)=>{ s=String(s||''); return s.length>n?s.slice(0,n).replace(/\s+\S*$/,'')+'…':s; };
export function grounding(ctx){
  const books=[...new Set([...ctx.passages.map(p=>p.book),...ctx.hits.map(h=>h.book),...ctx.xrefs.map(x=>x.book)])];
  return { type:'context', calls:ctx.calls, books,
    passages:ctx.passages.map(p=>({ label:p.label, href:`/book/${p.book}/${p.ch}`, book:p.book, text:cut(p.verses.slice(0,2).map(v=>v.text).join(' '),260) })),
    hits:ctx.hits.slice(0,8).map(h=>({ label:h.ref, href:`/book/${h.book}/${h.ch}` })), xrefs:ctx.xrefs.slice(0,8).map(x=>({ label:x.ref, href:`/book/${x.book}/${x.ch}` })),
    notes:ctx.notes.length?`Tyndale Open Study Notes on ${[...new Set(ctx.notes.map(n=>n.ref.replace(/:\d+$/,'')))].join(', ')}`:'', intro:ctx.intro?.text?`Tyndale introduction to ${ctx.intro.book}`:'',
    people:ctx.people.map(p=>({ name:p.name, also:p.also, summary:cut(p.summary,190), count:p.count, group:p.group })),
    places:ctx.places.map(p=>({ name:p.name, type:p.type, lat:p.lat, lon:p.lon, summary:cut(p.summary,160), count:p.count })),
    studies:ctx.studies.map(s=>({ label:s.title, href:s.path, evidence:s.evidence, lane:s.lane })), pages:ctx.pages.slice(0,6).map(p=>({ label:p.title, href:p.path, kind:p.kind })) };
}
export const openedRef=(slug,ch)=>{ const b=bySlug[slug]; return b&&ch>=1&&ch<=b.ch?{ book:b, ch, v1:null, v2:null, label:`${b.name} ${ch}` }:null; };
