import OpenAI from 'openai';
import { NextResponse } from 'next/server';
import { BOOKS, MT, THESES } from '../../../lib/data.js';
export const runtime='nodejs'; export const maxDuration=120;
const MODEL=process.env.OPENAI_MODEL||'gpt-5';
const SYSTEM=`You are the tutor inside Emmaus, a personal Bible study site for one reader working through the whole Bible in the New Living Translation.
Rules:
- Answer from Scripture. Cite every claim with a verse reference in the form (Matthew 5:3). Never invent a verse or a reference; if you are not certain a verse says something, say so instead of quoting it.
- When you quote, quote the NLT wording from the chapter text provided when it is present. Otherwise paraphrase and cite rather than quoting from memory.
- Be a teacher, not a preacher: explain context, structure and meaning; where traditions disagree, lay out the main views fairly and briefly and let the reader weigh them.
- Keep answers focused: usually 120 to 250 words, in plain prose with short paragraphs. No headings, no bullet lists unless the reader asks for a list.
- If asked to quiz, ask one good question at a time and wait.
- Never use em dashes or en dashes; use commas, full stops or the word "to".`;
async function nlt(ref){ try{ const r=await fetch(`https://api.nlt.to/api/passages?ref=${encodeURIComponent(ref)}&version=NLT&key=${process.env.NLT_API_KEY||'TEST'}`); if(!r.ok) return ''; const t=await r.text(); return t.replace(/<[^>]+>/g,' ').replace(/\s+/g,' ').trim().slice(0,12000); }catch(e){ return ''; } }
export async function POST(req){
  if(!process.env.OPENAI_API_KEY) return NextResponse.json({ error:'OPENAI_API_KEY is not set' },{ status:500 });
  const { messages=[], book='Matthew', ch=1 } = await req.json();
  const b=BOOKS.find(x=>x.name===book); const text=await nlt(`${book} ${ch}`);
  const summary=b&&b.slug==='matthew'&&MT.ch[ch-1]?`Emmaus summary of this chapter: ${MT.ch[ch-1][1]}. ${MT.ch[ch-1][3]}`:'';
  const context=`The reader currently has ${book} ${ch} open.\nBook thesis: ${THESES[book]||''}\n${summary}\n${text?`NLT text of ${book} ${ch}:\n${text}`:'(Chapter text unavailable right now; cite carefully and do not quote from memory.)'}`;
  const client=new OpenAI();
  let stream;
  try{
    stream=await client.responses.create({ model:MODEL, instructions:SYSTEM+'\n\n'+context, input:messages.map(m=>({ role:m.role==='assistant'?'assistant':'user', content:m.content })), stream:true });
  }catch(e){ return NextResponse.json({ error:e.message||'OpenAI request failed' },{ status:502 }); }
  const enc=new TextEncoder();
  const body=new ReadableStream({ async start(ctrl){ try{ for await (const ev of stream){ if(ev.type==='response.output_text.delta') ctrl.enqueue(enc.encode(ev.delta)); } }catch(e){ ctrl.enqueue(enc.encode('\n\n[The tutor hit an error: '+(e.message||e)+']')); } ctrl.close(); } });
  return new Response(body,{ headers:{ 'content-type':'text/plain; charset=utf-8', 'cache-control':'no-store' } });
}
