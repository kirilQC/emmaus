// Berean Standard Bible text (public domain), lexical verse search, and OpenBible cross references.
import BSB from './data/bsb.json';
import XREFS from './data/xrefs.json';
import { BOOK_TABLE, byUsfm, parseOsis } from './books.js';
export const verseText=(book,ch,v)=>BSB[book.usfm]?.[ch-1]?.[v]||null;
export const chapterVerseCount=(book,ch)=>Object.keys(BSB[book.usfm]?.[ch-1]||{}).length;
export const verseExists=(book,ch,v)=>!!verseText(book,ch,v);
// Verses for a reference, capped so a whole chapter cannot flood the prompt.
export function getVerses({ book, ch, v1, v2 },cap=40){
  const n=chapterVerseCount(book,ch); if(!n) return [];
  let a=v1||1, b=v2||v1||n; if(b<a) [a,b]=[b,a]; a=Math.max(1,a); b=Math.min(n,b);
  if(!v1&&n>cap){ b=Math.min(n,cap); }
  const out=[]; for(let v=a;v<=b&&out.length<cap;v++){ const t=verseText(book,ch,v); if(t) out.push({ ref:`${book.name} ${ch}:${v}`, book:book.slug, ch, v, text:t }); }
  return out;
}
export function crossRefs(book,ch,v,n=6){
  const list=XREFS[`${book.osis}.${ch}.${v}`]||[]; const out=[];
  for(const o of list){ const r=parseOsis(o); if(!r) continue; const vs=getVerses(r,3); if(!vs.length) continue; out.push({ ref:vs.length>1?`${r.book.name} ${r.ch}:${vs[0].v}-${vs[vs.length-1].v}`:vs[0].ref, book:r.book.slug, ch:r.ch, v:vs[0].v, text:vs.map(x=>x.text).join(' ') }); if(out.length>=n) break; }
  return out;
}
// ---- BM25 over every verse, built once per process ----
const STOP=new Set('the a an and or of to in on for with is are was were be been by as at it its this that these those from he she they them his her their you your we our i me my not no but so then than which who whom whose what when where why how all any some into unto upon shall will would may might have has had do does did there here also very'.split(' '));
const stem=w=>w.length>4?w.replace(/(ies)$/,'y').replace(/(sses)$/,'ss').replace(/(ing|edly|ed|es|s|ly)$/,''):w;
export const tokenize=s=>String(s).toLowerCase().replace(/[’']/g,'').split(/[^a-z0-9]+/).filter(w=>w.length>1&&!STOP.has(w)).map(stem);
let INDEX=null;
function build(){
  const docs=[]; const df=new Map(); let total=0;
  for(const b of BOOK_TABLE){ const chs=BSB[b.usfm]||[]; chs.forEach((vs,ci)=>{ for(const v in vs){ const toks=tokenize(vs[v]); const tf=new Map(); toks.forEach(t=>tf.set(t,(tf.get(t)||0)+1)); tf.forEach((_,t)=>df.set(t,(df.get(t)||0)+1)); docs.push({ book:b, ch:ci+1, v:+v, len:toks.length, tf }); total+=toks.length; } }); }
  const post=new Map(); docs.forEach((d,i)=>d.tf.forEach((c,t)=>{ if(!post.has(t)) post.set(t,[]); post.get(t).push([i,c]); }));
  INDEX={ docs, df, post, avg:total/docs.length, N:docs.length };
}
// Question words that are noise in a verse search but real words inside verses, so they stay in the index.
const QSTOP=new Set('show tell explain mean meaning say says said about bible scripture verse verses passage chapter book books emmaus site page map maps find where like want know think'.split(' ').map(stem));
export function searchVerses(query,n=10,boost=[]){
  if(!INDEX) build(); const { docs, df, post, avg, N }=INDEX;
  const q=[...new Set([...tokenize(query),...boost.flatMap(tokenize)])].filter(t=>!QSTOP.has(t)); const scores=new Map(); const k1=1.5,b=0.75;
  for(const t of q){ const p=post.get(t); if(!p||p.length>N*0.08) continue; const idf=Math.log(1+(N-df.get(t)+0.5)/(df.get(t)+0.5)); for(const [i,c] of p){ const d=docs[i]; const s=idf*(c*(k1+1))/(c+k1*(1-b+b*d.len/avg)); scores.set(i,(scores.get(i)||0)+s); } }
  return [...scores.entries()].sort((a,c)=>c[1]-a[1]).slice(0,n).map(([i,score])=>{ const d=docs[i]; return { ref:`${d.book.name} ${d.ch}:${d.v}`, book:d.book.slug, ch:d.ch, v:d.v, text:verseText(d.book,d.ch,d.v), score:+score.toFixed(2) }; });
}
export const usfmBook=code=>byUsfm[code];
