import OpenAI from 'openai';
import { NextResponse } from 'next/server';
import { TOOLS, newContext, runTool, seedContext, grounding, openedRef } from '../../../lib/tutor/tools.js';
import { verifyAnswer } from '../../../lib/tutor/verify.js';
import { systemPrompt, promptSource } from '../../../lib/tutor/prompt.js';
export const runtime='nodejs'; export const maxDuration=120;
const MODEL=process.env.OPENAI_MODEL||'gpt-5';
const EFFORT=process.env.OPENAI_REASONING||'low';
const SEP='';

export async function GET(req){
  const q=new URL(req.url).searchParams.get('debug'); if(!q) return NextResponse.json({ ok:true, model:MODEL, reasoning:EFFORT, prompt:promptSource(), promptChars:systemPrompt().length });
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
  const instructions=systemPrompt()+(opened?`\n\nThe reader opened this conversation from ${opened.label}; treat it as the default subject unless they ask about something else.`:'')+(seed?`\n\nALREADY RETRIEVED FOR THIS QUESTION:\n${seed}`:'');
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
