// Full Learn library. Server-side only: the study text is large, so client code uses lite.js.
import RAW from './studies.json';
import EXTRAS from './extras.json';
import { parseRefs } from './refs.js';
import { studyPath, slugify, LANES } from './lanes.js';

function chaptersOf(s){const seen=new Set(),out=[];s.scripture.forEach(r=>parseRefs(r.ref).forEach(x=>{const k=x.book.slug+':'+x.ch;if(!seen.has(k)){seen.add(k);out.push({slug:x.book.slug,name:x.book.name,ch:x.ch})}}));return out}
export const STUDIES=RAW.map(s=>({...s,href:studyPath(s),chapters:chaptersOf(s)}));
const byId=new Map(STUDIES.map(s=>[s.id,s]));
export const studyById=id=>byId.get(String(id).toUpperCase());
export const studyByParam=p=>byId.get(String(p).slice(0,4).toUpperCase());
export const studiesInLane=name=>STUDIES.filter(s=>s.lane===name);
export const laneCount=name=>studiesInLane(name).length;
export const LANE_COUNTS=Object.fromEntries(LANES.map(l=>[l[1],laneCount(l[0])]));

export const PATH=[
 ...EXTRAS.path.map(p=>({n:p.n,id:p.id,why:p.why,guardrail:p.guardrail})),
 ...EXTRAS.expansion.map(p=>({n:p.n,id:p.id,why:p.why})),
].map(p=>({...p,study:byId.get(p.id)})).filter(p=>p.study);
export const pathStep=id=>PATH.find(p=>p.id===id);

export const QUESTIONS=EXTRAS.questions;
export const THEMES=EXTRAS.themes.map(t=>({...t,span:t.span.replace(/\s*->\s*/g,' → '),studies:t.entries.map(id=>byId.get(id)).filter(Boolean)}));
export const SOURCES=EXTRAS.sources;
const srcById=new Map(SOURCES.map(s=>[s.id,s]));
export const sourceById=id=>srcById.get(id);
export const SOURCE_CATEGORIES=[...new Set(SOURCES.map(s=>s.category))].map(c=>({name:c,slug:slugify(c),sources:SOURCES.filter(s=>s.category===c)}));
const citing=new Map();STUDIES.forEach(s=>s.sources.forEach(x=>{if(!citing.has(x.id))citing.set(x.id,[]);citing.get(x.id).push(s)}));
export const studiesCiting=id=>citing.get(id)||[];
export const TOOLS=EXTRAS.tools;
export const AUDIT=EXTRAS.audit;
export const VERIFICATION=EXTRAS.verification;

// Tags: doctrine, characters and places share one index keyed by slug.
const tags=new Map();
STUDIES.forEach(s=>Object.entries(s.tags).forEach(([type,list])=>list.forEach(name=>{const k=slugify(name);if(!k)return;if(!tags.has(k))tags.set(k,{slug:k,name,types:new Set(),studies:[]});const t=tags.get(k);t.types.add(type);if(!t.studies.includes(s))t.studies.push(s)})));
export const TAGS=[...tags.values()].map(t=>({...t,types:[...t.types]})).sort((a,b)=>b.studies.length-a.studies.length);
export const tagBySlug=slug=>TAGS.find(t=>t.slug===slug);

export function related(s,n=4){
 const books=new Set(s.chapters.map(c=>c.slug));
 return STUDIES.filter(x=>x.id!==s.id).map(x=>{let score=0;
  x.tags.doctrine.forEach(d=>{if(s.tags.doctrine.includes(d))score+=2});
  x.tags.characters.forEach(d=>{if(s.tags.characters.includes(d))score+=1.5});
  if(x.chapters.some(c=>books.has(c.slug)))score+=1;
  if(x.lane===s.lane)score+=.5;
  return[score,x]}).filter(([sc])=>sc>0).sort((a,b)=>b[0]-a[0]).slice(0,n).map(([,x])=>x);
}
export function neighbours(s){const lane=studiesInLane(s.lane);const i=lane.indexOf(s);return{prev:lane[i-1],next:lane[i+1]}}
