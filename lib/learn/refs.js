// Turns Scripture references like "Jeremiah 25:11-12; 29:10" or "Jude 6-7" into book and chapter targets.
import { BOOKS } from '../data.js';
const ALIAS={Psalm:'Psalms','Song of Solomon':'Song of Songs',Canticles:'Song of Songs'};
const BOOKRX=/^((?:[1-3] )?[A-Z][a-z]+(?: of (?:Songs|Solomon))?)\s*(.*)$/;
export const bookByName=n=>BOOKS.find(b=>b.name===(ALIAS[n]||n));
const clamp=(arr,book)=>arr.filter(n=>n>=1&&n<=book.ch);
function range(a,b,book){if(b<a||b-a>60)return clamp([a],book);const o=[];for(let i=a;i<=b;i++)o.push(i);return clamp(o,book)}
export function chaptersOf(book,rest){
 if(book.ch===1)return[1];rest=String(rest||'').trim();if(!rest)return[];
 let m=rest.match(/^(\d+):\d+(?:[-–]\d+)?[-–](\d+):\d+/);if(m)return range(+m[1],+m[2],book);
 m=rest.match(/^(\d+):/);if(m)return clamp([+m[1]],book);
 m=rest.match(/^(\d+)\s*(?:[-–]|to)\s*(\d+)$/);if(m)return range(+m[1],+m[2],book);
 m=rest.match(/^(\d+)/);if(m)return clamp([+m[1]],book);
 return[];
}
// -> [{book, ch, label}] where label is the reference segment the chapter came from.
export function parseRefs(str){
 const out=[];let book=null;
 for(const seg of String(str).split(';')){
  const s=seg.trim();if(!s)continue;let rest=s;const m=s.match(BOOKRX);
  if(m&&bookByName(m[1])){book=bookByName(m[1]);rest=m[2]}else if(!book)continue;
  chaptersOf(book,rest).forEach(ch=>out.push({book,ch,label:s}));
 }
 return out;
}
export function chapterKeys(refs){const set=new Set();refs.forEach(r=>parseRefs(r).forEach(x=>set.add(x.book.slug+':'+x.ch)));return[...set]}
