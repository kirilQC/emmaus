// Server-side index of everything on Emmaus, so the tutor can point a reader to the right page.
import { BOOKS, THESES, PEOPLE, PARABLES, EVENTS, slug } from './data.js';
import { MAPS } from './atlas/maps.js';
import { DIAGRAMS } from './diagrams/index.js';
import { MODELS } from './models/index.js';
import { CHARTS } from './charts/tables.js';
import { ESSAYS } from './background.js';
import { STUDIES, QUESTIONS } from './learn/index.js';

const item=(kind,title,path,text='')=>({ kind, title, path, text:`${title} ${text}`.toLowerCase() });
export const SECTIONS=[
  item('section','Canon: all 66 books','/','books chapters read bible canon old new testament'),
  item('section','Explore: studies, reference, people and places','/explore','explore learn reference hub'),
  item('section','Start here: a guided path of 35 studies','/explore#start','beginner start where to begin first'),
  item('section','Memorise: flashcards for verses','/memorize','memorize memorise flashcards decks verses learn by heart'),
  item('section','Notes: everything you wrote','/notes','notes journal'),
  item('section','Library: the sources this site links into','/library','resources tools blue letter bible hub step bibleproject videos'),
  item('section','Harder questions: 50 open questions','/learn/questions','rabbit holes open questions debated'),
  item('section','Sources: the registry behind the studies','/learn/sources','sources registry bibliography citations'),
  item('section','The method: how the studies grade evidence','/learn/method','method evidence grades explicit inference historical debated speculative'),
  item('section','Atlas: interactive maps','/reference/atlas','maps geography routes journeys'),
  item('section','Diagrams: the tabernacle and temples to the cubit','/reference/diagrams','diagrams drawings plans'),
  item('section','3D models','/reference/models','3d models tabernacle temple'),
  item('section','Charts and timelines','/reference/charts','charts tables timelines kings prophets feasts'),
  item('section','Background essays','/reference/background','background history context first century'),
  item('section','People','/people','people characters who'),
  item('section','Parables of Jesus','/parables','parables stories jesus told'),
  item('section','Places','/places','places map geography'),
  item('section','Major events timeline','/timeline','events timeline dates history'),
  item('section','Commandments and teachings','/commandments','commandments ten beatitudes lord’s prayer teachings'),
];
export const CATALOG=[
  ...STUDIES.map(s=>item('study',s.title,s.href,`${s.lane} ${s.evidence} ${s.core} ${s.tags.doctrine.join(' ')} ${s.tags.characters.join(' ')} ${s.tags.places.join(' ')} ${s.scripture.map(r=>r.ref).join(' ')}`)),
  ...MAPS.map(m=>item('map',m.title,`/reference/atlas/${m.id}`,`${m.subtitle} ${m.intro} ${(m.books||[]).join(' ')} map atlas geography`)),
  ...DIAGRAMS.map(d=>item('diagram',d.title,`/reference/diagrams/${d.id}`,`${d.subtitle} ${d.intro} diagram drawing plan`)),
  ...MODELS.map(m=>item('3D model',m.title,`/reference/models/${m.id}`,`${m.subtitle||''} 3d model reconstruction`)),
  ...CHARTS.map(c=>item('chart',c.title,`/reference/charts/${c.id}`,`${c.subtitle} ${c.intro||''} chart table`)),
  item('chart','Kings and prophets timeline','/reference/charts/kings','kings prophets judah israel divided kingdom reigns timeline chart'),
  ...ESSAYS.map(e=>item('essay',e.title,`/reference/background/${e.id}`,`${e.subtitle} ${e.intro} background essay`)),
  ...PEOPLE.map(p=>item('person',p[0],`/people/${slug(p[0])}`,`${p[1]} ${p[2]} ${p[3]}`)),
  ...PARABLES.map(p=>item('parable',p[0],'/parables',`${p[1]} ${p[2]} parable`)),
  ...EVENTS.map(e=>item('event',e[3],'/timeline',`${e[2]} ${e[4]} event timeline`)),
  ...BOOKS.map(b=>item('book',`${b.name} (book overview)`,`/book/${b.slug}`,`${THESES[b.name]||''} ${b.genre}`)),
  ...QUESTIONS.map(q=>item('question',q.q,`/learn/questions#${q.id}`,`${q.body} ${q.posture} open question`)),
];
const STOP=new Set('the a an and or of to in on for with what who why how does did is are was were be about from by as at it its this that these those tell me show can you your i my we our do explain mean means meaning bible scripture verse verses chapter chapters book books emmaus site page pages where find have has any some'.split(' '));
const tokens=s=>[...new Set(String(s).toLowerCase().replace(/[’']/g,'').split(/[^a-z0-9]+/).filter(w=>w.length>2&&!STOP.has(w)))];
// Top pages for a question, scored by word overlap, with title hits weighted higher.
export function findPages(question,n=18){
  const q=tokens(question); if(!q.length) return [];
  const stem=w=>w.replace(/(ies|es|s|ing|ed)$/,'');
  const qs=q.map(stem);
  return CATALOG.map(c=>{ let score=0; const title=c.title.toLowerCase(); qs.forEach((w,i)=>{ if(w.length<3) return; if(title.includes(q[i])||title.includes(w)) score+=3; else if(c.text.includes(q[i])||c.text.includes(w)) score+=1; }); return [score,c]; })
    .filter(([s])=>s>0).sort((a,b)=>b[0]-a[0]).slice(0,n).map(([,c])=>c);
}
export const pageLine=c=>`- [${c.title}](${c.path}) (${c.kind})`;
