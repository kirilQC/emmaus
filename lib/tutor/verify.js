// Checks a finished answer against the text it was given: every reference must exist, every quotation must be real.
import { findRefs } from './refs.js';
import { verseExists, chapterVerseCount } from './text.js';
const norm=s=>String(s).toLowerCase().replace(/[’']/g,'').replace(/[^a-z0-9 ]+/g,' ').replace(/\s+/g,' ').trim();
export function verifyAnswer(answer,context){
  const bad=[]; const seen=new Set();
  for(const r of findRefs(answer)){ if(seen.has(r.label)) continue; seen.add(r.label);
    if(r.v1&&!verseExists(r.book,r.ch,r.v1)) bad.push({ ref:r.label, reason:`${r.book.name} ${r.ch} has ${chapterVerseCount(r.book,r.ch)} verses` });
    else if(r.v2&&r.v2>r.v1&&!verseExists(r.book,r.ch,r.v2)) bad.push({ ref:r.label, reason:`${r.book.name} ${r.ch} has ${chapterVerseCount(r.book,r.ch)} verses` }); }
  const hay=norm([...context.passages.flatMap(p=>p.verses.map(v=>v.text)),...context.hits.map(h=>h.text),...context.xrefs.map(x=>x.text),...context.notes.map(n=>n.text),...(context.intro?.text?[context.intro.text]:[]),...context.people.map(p=>p.summary),...context.places.map(p=>p.summary)].join(' '));
  const quotes=[...String(answer).matchAll(/[“"]([^”"]{25,})[”"]/g)].map(m=>m[1]);
  // A quotation may skip words with an ellipsis or nest inner quotes; each fragment of four or more words must appear somewhere in the retrieved text.
  const unverified=quotes.filter(q=>{ const frags=q.split(/…|\.\.\.|\[[^\]]*\]/).map(norm).filter(f=>f.split(' ').length>=4); if(!frags.length) return false; return frags.some(f=>!hay.includes(f)); });
  return { badRefs:bad, unverifiedQuotes:unverified.slice(0,3), checkedRefs:seen.size, checkedQuotes:quotes.length };
}
