import { NextResponse } from 'next/server';
// Proxies one passage from Tyndale's NLT API. Personal, non-commercial use; text is not stored.
const mem=new Map();
export async function GET(req){
  const ref=new URL(req.url).searchParams.get('ref');
  if(!ref) return NextResponse.json({ error:'ref required' },{ status:400 });
  const hit=mem.get(ref); if(hit&&hit.t>Date.now()-6*60*60*1000) return html(hit.v);
  const key=process.env.NLT_API_KEY||'TEST';
  const r=await fetch(`https://api.nlt.to/api/passages?ref=${encodeURIComponent(ref)}&version=NLT&key=${key}`,{ headers:{ 'user-agent':'Emmaus personal study' } });
  if(!r.ok) return NextResponse.json({ error:`NLT API ${r.status}` },{ status:502 });
  let body=await r.text();
  // Keep only the passage markup; drop scripts, styles and wrappers Tyndale sends around it.
  body=body.replace(/<script[\s\S]*?<\/script>/gi,'').replace(/<style[\s\S]*?<\/style>/gi,'').replace(/<link[^>]*>/gi,'').replace(/on\w+="[^"]*"/gi,'');
  const m=body.match(/<body[^>]*>([\s\S]*)<\/body>/i); if(m) body=m[1];
  mem.set(ref,{ v:body, t:Date.now() });
  return html(body);
}
const html=b=>new NextResponse(b,{ headers:{ 'content-type':'text/html; charset=utf-8', 'cache-control':'private, max-age=3600' } });
