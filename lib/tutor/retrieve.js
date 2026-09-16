// Assembles everything the tutor is allowed to answer from: BSB passages, verse search hits, cross references,
// Tyndale notes, Theographic entities, and Emmaus's own pages and graded studies.
import { findRefs } from './refs.js';
import { getVerses, searchVerses, crossRefs } from './text.js';
import { findPeople, findPlaces, findEvents, personSummary, placeSummary, eventSummary } from './entities.js';
import { studyNotes, bookIntro } from './notes.js';
import { bookFromName, bySlug } from './books.js';
import { findPages, SECTIONS } from '../catalog.js';
import { studyByParam } from '../learn/index.js';

// A plan is what the planner model (or the heuristic fallback) decided the question needs.
export function heuristicPlan(question,opened){
  const refs=findRefs(question); if(!refs.length&&opened) refs.push(opened);
  const caps=[...new Set((String(question).match(/\b[A-Z][a-z]{2,}(?:\s[A-Z][a-z]{2,})?\b/g)||[]).filter(w=>!bookFromName(w)&&!/^(What|Who|Why|How|When|Where|Which|Does|Did|Is|Are|Can|Could|Should|Tell|Show|Explain|Give|The|And|But|Emmaus|Bible|God|Lord|Jesus|Christ)$/.test(w)))];
  return { passages:refs.map(r=>r.label), keywords:[question], entities:caps, wholeBook:refs.length===0&&!!question.match(/\b(book of|overview of|about the book|introduce)\b/i), intent:refs.length?'passage':'topic' };
}
export function normalizePlan(plan,question,opened){
  const h=heuristicPlan(question,opened); if(!plan||typeof plan!=='object') return h;
  const passages=[...new Set([...(Array.isArray(plan.passages)?plan.passages:[]),...h.passages].map(String))].slice(0,5);
  return { passages, keywords:[...new Set([...(Array.isArray(plan.keywords)?plan.keywords:[]).map(String),question])].slice(0,8), entities:[...new Set([...(Array.isArray(plan.entities)?plan.entities:[]).map(String),...h.entities])].slice(0,6), wholeBook:!!plan.wholeBook||h.wholeBook, intent:plan.intent||h.intent };
}
export async function retrieve(question,plan,opened){
  const refs=[]; for(const p of plan.passages){ const r=findRefs(p)[0]; if(r&&!refs.some(x=>x.book===r.book&&x.ch===r.ch&&x.v1===r.v1)) refs.push(r); }
  if(!refs.length&&opened) refs.push(opened);
  const passages=[]; let verseBudget=48;
  for(const r of refs.slice(0,3)){ const vs=getVerses(r,Math.min(40,verseBudget)); if(!vs.length) continue; verseBudget-=vs.length; passages.push({ label:r.label, book:r.book.slug, ch:r.ch, v:vs[0].v, verses:vs }); if(verseBudget<=4) break; }
  const have=new Set(passages.flatMap(p=>p.verses.map(v=>v.ref)));
  const hits=searchVerses(plan.keywords.join(' '),plan.intent==='passage'?6:10).filter(h=>!have.has(h.ref)&&h.score>2);
  const primary=refs[0]; const xrefs=primary?crossRefs(primary.book,primary.ch,primary.v1||1,6).filter(x=>!have.has(x.ref)):[];
  const notes=[]; for(const r of refs.slice(0,2)){ notes.push(...await studyNotes(r,refs.length>1?1400:2400)); }
  const intro=plan.wholeBook&&primary?bookIntro(primary.book):(primary&&!primary.v1?bookIntro(primary.book,700):'');
  const people=findPeople(plan.entities,question,3), places=findPlaces(plan.entities,question,2), events=findEvents(question,refs,4);
  const pages=findPages([question,...plan.keywords,...plan.entities].join(' '),10); const sections=SECTIONS.filter(s=>{ const q=question.toLowerCase(); return ['where','find','site','emmaus','page','how do i'].some(w=>q.includes(w))&&s.text.split(' ').some(w=>w.length>4&&q.includes(w)); }).slice(0,3);
  const studies=pages.filter(p=>p.kind==='study').slice(0,3).map(p=>{ const s=studyByParam(p.path.split('/').pop()); return s?{ title:s.title, path:s.href, lane:s.lane, evidence:s.evidence, core:s.core, caveats:s.caveats.length>420?s.caveats.slice(0,420).replace(/\s+\S*$/,'')+'…':s.caveats }:null; }).filter(Boolean);
  return { question, plan, opened:opened?opened.label:null, passages, hits, xrefs, notes, intro:primary?{ book:primary.book.name, text:intro }:null, people, places, events, pages:[...pages,...sections], studies };
}
export function contextPrompt(c){
  const P=[];
  if(c.opened) P.push(`The reader opened this conversation from ${c.opened}; treat it as the default subject unless they ask about something else.`);
  if(c.passages.length) P.push('BSB TEXT OF THE PASSAGES IN QUESTION (Berean Standard Bible, public domain). Quote only from here, and cite verse by verse:\n'+c.passages.map(p=>`## ${p.label}\n`+p.verses.map(v=>`${v.v} ${v.text}`).join('\n')).join('\n\n'));
  if(c.hits.length) P.push('OTHER VERSES THAT MATCH THE QUESTION (BSB). Use the ones that are relevant, ignore the rest:\n'+c.hits.map(h=>`${h.ref}: ${h.text}`).join('\n'));
  if(c.xrefs.length) P.push('CROSS REFERENCES for the main passage (OpenBible.info / Treasury of Scripture Knowledge, BSB text):\n'+c.xrefs.map(x=>`${x.ref}: ${x.text}`).join('\n'));
  if(c.intro?.text) P.push(`TYNDALE OPEN STUDY NOTES, INTRODUCTION TO ${c.intro.book.toUpperCase()} (CC BY-SA 4.0):\n${c.intro.text}`);
  if(c.notes.length) P.push('TYNDALE OPEN STUDY NOTES on these verses (CC BY-SA 4.0). Scholarly notes; you may draw on them and say "the Tyndale study notes" when you do:\n'+c.notes.map(n=>`${n.ref}: ${n.text}`).join('\n'));
  if(c.people.length) P.push('PEOPLE (Theographic Bible Metadata, with Easton’s dictionary text):\n'+c.people.map(personSummary).join('\n'));
  if(c.places.length) P.push('PLACES (Theographic / OpenBible geocoding):\n'+c.places.map(placeSummary).join('\n'));
  if(c.events.length) P.push('EVENTS (Theographic timeline; dates are traditional reckonings, not certainties):\n'+c.events.map(eventSummary).join('\n'));
  if(c.studies.length) P.push('EMMAUS STUDIES relevant to the question, with this site’s own evidence grade. Represent their conclusions and caveats faithfully when you use them:\n'+c.studies.map(s=>`[${s.title}](${s.path}) (${s.lane}; graded: ${s.evidence})\nCore: ${s.core}\nCaveats: ${s.caveats}`).join('\n\n'));
  if(c.pages.length) P.push('PAGES ON EMMAUS you may link to, using exactly these paths:\n'+c.pages.map(p=>`- [${p.title}](${p.path}) (${p.kind})`).join('\n'));
  return P.join('\n\n');
}
// What the client shows under the answer.
export function groundingSummary(c){
  return { passages:c.passages.map(p=>({ label:p.label, href:`/book/${p.book}/${p.ch}` })), hits:c.hits.slice(0,6).map(h=>({ label:h.ref, href:`/book/${h.book}/${h.ch}` })), xrefs:c.xrefs.slice(0,6).map(x=>({ label:x.ref, href:`/book/${x.book}/${x.ch}` })), notes:c.notes.length?`Tyndale Open Study Notes on ${[...new Set(c.notes.map(n=>n.ref.replace(/:\d+$/,'')))].join(', ')}`:'', intro:c.intro?.text?`Tyndale introduction to ${c.intro.book}`:'', people:c.people.map(p=>p.name), places:c.places.map(p=>p.name), studies:c.studies.map(s=>({ label:s.title, href:s.path, evidence:s.evidence })), pages:c.pages.filter(p=>p.kind!=='study').slice(0,5).map(p=>({ label:p.title, href:p.path, kind:p.kind })) };
}
export const openedRef=(slug,ch)=>{ const b=bySlug[slug]; return b&&ch>=1&&ch<=b.ch?{ book:b, ch, v1:null, v2:null, label:`${b.name} ${ch}` }:null; };
