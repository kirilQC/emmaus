import OpenAI from 'openai';
import { NextResponse } from 'next/server';
import { TOOLS, newContext, runTool, seedContext, grounding, openedRef } from '../../../lib/tutor/tools.js';
import { verifyAnswer } from '../../../lib/tutor/verify.js';
export const runtime='nodejs'; export const maxDuration=120;
const MODEL=process.env.OPENAI_MODEL||'gpt-5';
const EFFORT=process.env.OPENAI_REASONING||'low';
const SEP='';
const SYSTEM=`You are the tutor inside Emmaus, a Bible study site whose rule is: read the passage first, grade the claim, show the caveat. Readers ask about passages, doctrine, ethics, people, places, history, how to read, and where to find things on the site.

HOW YOU WORK
- You have tools that read the real text. Before you explain or quote a passage, read it with get_passage. If you do not know which passages bear on a question, use search_verses with words that would appear in the verses themselves. Use lookup_entity for people and places, cross_references to follow a text through the canon, find_emmaus_pages to point the reader deeper. Make the calls you need, then answer.
- Quote only text you have read through a tool, word for word, in quotation marks, marked (BSB). Otherwise paraphrase and cite. Cite every claim with a reference in the form (Romans 1:26-27). Never cite a verse you have not read or are not certain of.

HOW YOU ANSWER
- Answer the question directly in the first sentence. If Scripture speaks plainly, say plainly what it says, in the words the text uses. Do not open with "Christians disagree" or "this is debated" when the texts themselves are clear; disagreement in the culture is not ambiguity in the text.
- Then do the exegesis: the key passages in their context, what the words mean (Hebrew or Greek where it matters), how the rest of the canon treats the theme, and what it asks of the reader. Give the whole counsel: where Scripture names sin it also names grace, repentance and new life, so say both.
- Say what is explicit in the text and what is inference. Reserve "debated" for questions where the text itself is genuinely unclear or where readers who hold Scripture as authoritative differ on textual grounds (mode of baptism, timing of the millennium, the identity of the sons of God in Genesis 6). There, give the main readings with their textual basis and say which the text supports best.
- When the Tyndale notes or an Emmaus study inform you, say so briefly ("the Tyndale notes observe", "Emmaus's study on X grades this as inference"). Represent Emmaus's own studies faithfully.
- Point the reader to Emmaus pages with markdown links in the form [Title](/path), using only paths a tool returned. At most three links, woven in or as a short final line. If asked where to find something on the site, answer with the links.
- Teach; do not sermonise. Usually 150 to 300 words in plain prose with short paragraphs. No headings. Bullet lists only if asked. If asked to quiz, ask one question at a time and wait.
- If the material does not settle a question, say so plainly rather than inventing.
- The reader's Bible on Emmaus is the NLT; your quotations are BSB, so wording may differ slightly. Never use em dashes or en dashes; use commas, full stops or the word "to".`;
export async function GET(req){
  const q=new URL(req.url).searchParams.get('debug'); if(!q) return NextResponse.json({ ok:true });
  const ctx=newContext(); const seed=await seedContext(ctx,q,null);
  return NextResponse.json({ grounding:grounding(ctx), seed });
}
export async function POST(req){
  if(!process.env.OPENAI_API_KEY) return NextResponse.json({ error:'OPENAI_API_KEY is not set' },{ status:500 });
  const { messages=[], book, ch } = await req.json();
  const question=[...messages].reverse().find(m=>m.role==='user')?.content||'';
  const opened=book&&ch?openedRef(book,+ch):null;
  const client=new OpenAI(); const ctx=newContext();
  const seed=await seedContext(ctx,question,opened);
  const instructions=SYSTEM+(opened?`\n\nThe reader opened this conversation from ${opened.label}; treat it as the default subject unless they ask about something else.`:'')+(seed?`\n\nALREADY RETRIEVED FOR THIS QUESTION:\n${seed}`:'');
  const enc=new TextEncoder(); const send=(ctrl,obj)=>ctrl.enqueue(enc.encode(SEP+JSON.stringify(obj)+'\n'));
  const body=new ReadableStream({ async start(ctrl){
    let answer=''; let input=messages.map(m=>({ role:m.role==='assistant'?'assistant':'user', content:String(m.content) })); let prev=undefined;
    try{
      send(ctrl,grounding(ctx));
      for(let round=0;round<6;round++){
        const stream=await client.responses.create({ model:MODEL, instructions, input, tools:TOOLS, tool_choice:round<5?'auto':'none', previous_response_id:prev, reasoning:{ effort:EFFORT }, stream:true });
        const calls=[];
        for await (const ev of stream){
          if(ev.type==='response.output_text.delta'){ answer+=ev.delta; ctrl.enqueue(enc.encode(ev.delta)); }
          else if(ev.type==='response.output_item.done'&&ev.item.type==='function_call') calls.push(ev.item);
          else if(ev.type==='response.completed') prev=ev.response.id;
        }
        if(!calls.length) break;
        const parsed=calls.map(c=>{ let args={}; try{ args=JSON.parse(c.arguments||'{}'); }catch(e){} return { c, args }; });
        send(ctrl,{ type:'status', text:parsed.map(({ c, args })=>c.name==='get_passage'?`Reading ${args.reference||''}`:c.name==='search_verses'?`Searching for “${args.query||''}”`:c.name==='lookup_entity'?`Looking up ${args.name||''}`:c.name==='cross_references'?`Following cross references for ${args.reference||''}`:c.name==='book_introduction'?`Reading the introduction to ${args.book||''}`:'Searching Emmaus').join(' · ') });
        const results=await Promise.all(parsed.map(({ c, args })=>runTool(ctx,c.name,args)));
        const outputs=parsed.map(({ c },i)=>({ type:'function_call_output', call_id:c.call_id, output:String(results[i]).slice(0,12000) }));
        send(ctrl,grounding(ctx)); input=outputs;
      }
    }catch(e){ ctrl.enqueue(enc.encode('\n\n[The tutor hit an error: '+(e.message||e)+']')); }
    send(ctrl,{ type:'verify', ...verifyAnswer(answer,ctx) });
    ctrl.close(); } });
  return new Response(body,{ headers:{ 'content-type':'text/plain; charset=utf-8', 'cache-control':'no-store' } });
}
