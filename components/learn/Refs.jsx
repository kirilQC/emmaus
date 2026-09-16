import { bookByName, chaptersOf, parseRefs } from '../../lib/learn/refs.js';
const RX=/(?<![A-Za-z])((?:[1-3] )?(?:Song of Songs|Song of Solomon|[A-Z][a-z]+)) (\d+)(?::(\d+(?:[-–]\d+)?))?/g;
// Links every "Book 5:3" or "Book 5" inside prose to its chapter, leaving the rest as text.
export function Refs({ text }){
  const s=String(text||''); const out=[]; let last=0, m; RX.lastIndex=0;
  while((m=RX.exec(s))){ const b=bookByName(m[1]); if(!b) continue; const ch=b.ch===1?1:+m[2]; if(ch<1||ch>b.ch) continue;
    out.push(s.slice(last,m.index)); out.push(<a key={m.index} href={`/book/${b.slug}/${ch}`}>{m[0]}</a>); last=m.index+m[0].length; }
  out.push(s.slice(last)); return out;
}
// A full reference string ("Ezra 1:1-4; 7:11-26; Nehemiah 2:1-8") with each segment linked to its first chapter.
export function RefLink({ refText }){
  const segs=String(refText).split(';').map(x=>x.trim()).filter(Boolean); const out=[]; let book=null;
  segs.forEach((seg,i)=>{ const hits=parseRefs((book&&!/^[1-3]? ?[A-Z]/.test(seg)?book.name+' ':'')+seg); if(hits.length) book=hits[0].book;
    out.push(hits.length?<a key={i} href={`/book/${hits[0].book.slug}/${hits[0].ch}`}>{seg}</a>:<span key={i}>{seg}</span>); if(i<segs.length-1) out.push('; '); });
  return <span className="lrn-refname">{out}</span>;
}
export { chaptersOf };
