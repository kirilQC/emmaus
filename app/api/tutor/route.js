import OpenAI from 'openai';
import { NextResponse } from 'next/server';
import { heuristicPlan, normalizePlan, retrieve, contextPrompt, groundingSummary, openedRef } from '../../../lib/tutor/retrieve.js';
import { verifyAnswer } from '../../../lib/tutor/verify.js';
export const runtime='nodejs'; export const maxDuration=120;
const MODEL=process.env.OPENAI_MODEL||'gpt-5';
const PLANNER=process.env.OPENAI_PLANNER_MODEL||'gpt-5-mini';
const SEP='';
const SYSTEM=`You are the tutor inside Emmaus, a Bible study site that reads the whole Bible as one story and grades every claim by its evidence. Readers ask you anything: a passage, a doctrine, a person, a place, history, how to start reading, or where to find something on the site.
You have been given retrieved material below: Bible text (Berean Standard Bible), cross references, Tyndale Open Study Notes, entity data, and Emmaus's own graded studies and pages. Work from that material.
Rules:
- Ground every claim in Scripture and cite it with a verse reference in the form (John 3:16). Only cite verses whose text you can see below, or verses you are certain exist. Never invent a reference.
- Quote only from the BSB text provided, word for word, and only put quotation marks around real quotations. Otherwise paraphrase and cite. You may note that the reader's own Bible on Emmaus is the NLT, so wording will differ slightly.
- Say what the text states explicitly, what is inference, and what is debated. Where traditions disagree, lay out the main views fairly and briefly and let the reader weigh them. Do not present one tradition as the only Christian view.
- When the Tyndale notes or an Emmaus study inform your answer, say so briefly ("the Tyndale study notes point out", "Emmaus's study on X grades this as debated").
- Point the reader to Emmaus pages with markdown links in the form [Title](/path), using only paths from the list below, woven into the answer or as a short final line with at most three links. Never link to pages that are not listed. If asked where to find something on the site, answer with the links directly.
- Be a teacher, not a preacher. Usually 120 to 260 words in plain prose with short paragraphs. No headings; no bullet lists unless asked. If asked to quiz, ask one question at a time and wait.
- If the material does not settle the question, say so plainly rather than guessing.
- Never use em dashes or en dashes; use commas, full stops or the word "to".`;
const PLAN_PROMPT=`You plan retrieval for a Bible study tutor. Given the conversation, decide what to look up so the answer can be grounded in the actual text. Reply with JSON only:
{"passages": ["Book chapter:verse-verse", ...], "keywords": ["short search phrases for a verse search", ...], "entities": ["people or place names mentioned or implied", ...], "wholeBook": boolean, "intent": "passage" | "topic" | "person" | "place" | "site" | "general"}
Rules: name the specific passages the question is really about, even if the reader did not cite one (e.g. "the prodigal son" -> "Luke 15:11-32"; "love is patient" -> "1 Corinthians 13:4-7"). Use full book names. Keep passages to at most 4 and each under 40 verses. Keywords should be distinctive Bible words likely to appear in the relevant verses, 2 to 5 phrases. wholeBook is true only when the question is about a book as a whole. intent "site" means the reader is asking where to find something on the Emmaus website.`;
async function plan(client,messages,question){
  try{
    const convo=messages.slice(-6).map(m=>`${m.role==='assistant'?'Tutor':'Reader'}: ${String(m.content).slice(0,600)}`).join('\n');
    const r=await client.responses.create({ model:PLANNER, instructions:PLAN_PROMPT, input:`${convo}\n\nPlan retrieval for the reader's last message: "${question}"`, text:{ format:{ type:'json_object' } }, reasoning:{ effort:'low' } });
    return JSON.parse(r.output_text||'{}');
  }catch(e){ return null; }
}
export async function GET(req){
  const q=new URL(req.url).searchParams.get('debug'); if(!q) return NextResponse.json({ ok:true });
  const p=normalizePlan(null,q,null); const ctx=await retrieve(q,p,null);
  return NextResponse.json({ plan:p, grounding:groundingSummary(ctx), prompt:contextPrompt(ctx) });
}
export async function POST(req){
  if(!process.env.OPENAI_API_KEY) return NextResponse.json({ error:'OPENAI_API_KEY is not set' },{ status:500 });
  const { messages=[], book, ch } = await req.json();
  const question=[...messages].reverse().find(m=>m.role==='user')?.content||'';
  const opened=book&&ch?openedRef(book,+ch):null;
  const client=new OpenAI();
  const planned=normalizePlan(await plan(client,messages,question),question,opened);
  const ctx=await retrieve(question,planned,opened);
  let stream;
  try{ stream=await client.responses.create({ model:MODEL, instructions:SYSTEM+'\n\n'+contextPrompt(ctx), input:messages.map(m=>({ role:m.role==='assistant'?'assistant':'user', content:m.content })), stream:true }); }
  catch(e){ return NextResponse.json({ error:e.message||'OpenAI request failed' },{ status:502 }); }
  const enc=new TextEncoder(); let answer='';
  const body=new ReadableStream({ async start(ctrl){
    ctrl.enqueue(enc.encode(SEP+JSON.stringify({ type:'context', ...groundingSummary(ctx) })+'\n'));
    try{ for await (const ev of stream){ if(ev.type==='response.output_text.delta'){ answer+=ev.delta; ctrl.enqueue(enc.encode(ev.delta)); } } }
    catch(e){ ctrl.enqueue(enc.encode('\n\n[The tutor hit an error: '+(e.message||e)+']')); }
    ctrl.enqueue(enc.encode('\n'+SEP+JSON.stringify({ type:'verify', ...verifyAnswer(answer,ctx) })+'\n'));
    ctrl.close(); } });
  return new Response(body,{ headers:{ 'content-type':'text/plain; charset=utf-8', 'cache-control':'no-store' } });
}
