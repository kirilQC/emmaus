'use client';
import { BOOKS } from '../../lib/data.js';
// Turns any "Book 5:3" or "Book 5" inside a cell into a link, leaving the rest as text.
const RX=/((?:[1-3] )?(?:Song of Songs|[A-Z][a-z]+)) (\d+)(?::(\d+(?:-\d+)?))?/g;
export function linkRefs(text){ const out=[]; let last=0; let m; RX.lastIndex=0; const s=String(text);
  while((m=RX.exec(s))){ const b=BOOKS.find(x=>x.name===m[1]); if(!b) continue; out.push(s.slice(last,m.index)); out.push(<a key={m.index} href={`/book/${b.slug}/${m[2]}`}>{m[0]}</a>); last=m.index+m[0].length; }
  out.push(s.slice(last)); return out; }
export default function TableChart({ def }){
  return <div className="tablewrap card" style={{ padding:'6px 14px' }}><table className="tc"><thead><tr>{def.columns.map(c=><th key={c}>{c}</th>)}</tr></thead>
    <tbody>{def.rows.map((r,i)=><tr key={i}>{r.map((c,j)=><td key={j} style={j===0?{ fontWeight:500, whiteSpace:'nowrap', fontFamily:'var(--f-disp)', fontSize:19 }:undefined}>{j===0?c:linkRefs(c)}</td>)}</tr>)}</tbody></table></div>;
}
