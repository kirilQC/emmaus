// Compact study index safe to ship to the client: used by chapter pages, book pages and search.
import LITE from './lite.json';
import { chapterKeys } from './refs.js';
import { studyPath } from './lanes.js';
export const STUDIES_LITE=LITE.map(s=>({...s,href:studyPath(s),keys:chapterKeys(s.refs)}));
export const studiesForChapter=(slug,ch)=>STUDIES_LITE.filter(s=>s.keys.includes(slug+':'+ch));
export const studiesForBook=slug=>STUDIES_LITE.filter(s=>s.keys.some(k=>k.startsWith(slug+':')));
export const chaptersInBook=(s,slug)=>s.keys.filter(k=>k.startsWith(slug+':')).map(k=>+k.split(':')[1]).sort((a,b)=>a-b);
export const searchStudies=hit=>STUDIES_LITE.filter(s=>hit(s.title)||hit(s.lane)||s.doctrine.some(hit));
