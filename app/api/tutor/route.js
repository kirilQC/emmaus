import OpenAI from 'openai';
import { NextResponse } from 'next/server';
import { BOOKS, MT, THESES } from '../../../lib/data.js';
import { parseRefs } from '../../../lib/learn/refs.js';
import { SECTIONS, findPages, pageLine } from '../../../lib/catalog.js';
export const runtime='nodejs'; export const maxDuration=120;
const MODEL=process.env.OPENAI_MODEL||'gpt-5';
const SYSTEM=`You are the tutor inside Emmaus, a Bible study site that reads the whole Bible as one story in the New Living Translation and grades every claim by its evidence. Readers ask you anything: a passage, a doctrine, a person, a place, history, how to start reading, or where to find something on the site.
Rules:
- Answer from Scripture. Cite every claim with a verse reference in the form (Matthew 5:3). Never invent a verse or a reference; if you are not certain a verse says something, say so instead of quoting it.
- When you quote, quote the NLT wording from any passage text provided below. Otherwise paraphrase and cite rather than quoting from memory.
- Be a teacher, not a preacher: explain context, structure and meaning. Where traditions disagree, lay out the main views fairly and briefly and let the reader weigh them. Say what is explicit in the text, what is inference, and what is debated.
- Emmaus has pages that go deeper. A list of relevant pages is provided below with their paths. When one of them would genuinely help, point the reader to it with a markdown link in the form [Title](/path), using only paths from the list, woven into the answer or as a short "On Emmaus" line at the end with at most three links. Do not list pages that are not relevant. If the reader asks where to find something on the site, answer with the links directly.
- Keep answers focused: usually 120 to 250 words, in plain prose with short paragraphs. No headings, no bullet lists unless the reader asks for a list.
- If asked to quiz, ask one good question at a time and wait.
- Never use em dashes or en dashes; use commas, full stops or the word "to".`;
const RX=/((?:[1-3] )?(?:Song of Songs|[A-Z][a-z]+)) (\d+)(?::\d+(?:-\d+)?)?/g;
async function nlt(ref){ try{ const r=await fetch(`https://api.nlt.to/api/passages?ref=${encodeURIComponent(ref)}&version=NLT&key=${process.env.NLT_API_KEY||'TEST'}`); if(!r.ok) return ''; const t=await r.text(); return t.replace(/<[^>]+>/g,' ').replace(/\s+/g,' ').trim().slice(0,9000); }catch(e){ return ''; } }
export async function POST(req){
  if(!process.env.OPENAI_API_KEY) return NextResponse.json({ error:'OPENAI_API_KEY is not set' },{ status:500 });
  const { messages=[], book, ch } = await req.json();
  const last=[...messages].reverse().find(m=>m.role==='user')?.content||'';
  const parts=[];
  const b=book&&BOOKS.find(x=>x.slug===book||x.name===book);
  if(b&&ch){
    const summary=b.slug==='matthew'&&MT.ch[ch-1]?`Emmaus summary of this chapter: ${MT.ch[ch-1][1]}. ${MT.ch[ch-1][3]}`:'';
    const text=await nlt(`${b.name} ${ch}`);
    parts.push(`The reader opened this conversation from ${b.name} ${ch}, so treat that chapter as the default subject unless they ask about something else.\nBook thesis: ${THESES[b.name]||''}\n${summary}\n${text?`NLT text of ${b.name} ${ch}:\n${text}`:''}`);
  }else{
    const seen=new Set(); const refs=[]; let m; RX.lastIndex=0;
    while((m=RX.exec(last))&&refs.length<2){ const hit=parseRefs(m[0])[0]; if(hit){ const k=`${hit.book.name} ${hit.ch}`; if(!seen.has(k)){ seen.add(k); refs.push(k); } } }
    for(const k of refs){ const text=await nlt(k); if(text) parts.push(`NLT text of ${k}:\n${text}`); }
    if(!refs.length) parts.push('(No passage text was fetched for this question; cite carefully and do not quote from memory.)');
  }
  const pages=findPages(last); const sections=SECTIONS.filter(s=>tokensHit(s.text,last));
  parts.push(`Pages on Emmaus relevant to this question (path in parentheses):\n${[...pages,...sections].map(pageLine).join('\n')||'- none found; the main areas are the Canon (/), Explore (/explore), Memorise (/memorize) and Library (/library)'}`);
  const client=new OpenAI();
  let stream;
  try{
    stream=await client.responses.create({ model:MODEL, instructions:SYSTEM+'\n\n'+parts.join('\n\n'), input:messages.map(m=>({ role:m.role==='assistant'?'assistant':'user', content:m.content })), stream:true });
  }catch(e){ return NextResponse.json({ error:e.message||'OpenAI request failed' },{ status:502 }); }
  const enc=new TextEncoder();
  const body=new ReadableStream({ async start(ctrl){ try{ for await (const ev of stream){ if(ev.type==='response.output_text.delta') ctrl.enqueue(enc.encode(ev.delta)); } }catch(e){ ctrl.enqueue(enc.encode('\n\n[The tutor hit an error: '+(e.message||e)+']')); } ctrl.close(); } });
  return new Response(body,{ headers:{ 'content-type':'text/plain; charset=utf-8', 'cache-control':'no-store' } });
}
function tokensHit(text,q){ const words=String(q).toLowerCase().split(/[^a-z0-9]+/).filter(w=>w.length>3); return words.some(w=>text.includes(w)); }
