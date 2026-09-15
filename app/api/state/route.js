import { NextResponse } from 'next/server';
import { sb } from '../../../lib/supabase.js';
export const dynamic='force-dynamic';
const ID='kiril';
export async function GET(){
  const c=sb(); if(!c) return NextResponse.json(null);
  const { data, error } = await c.from('emmaus_state').select('data').eq('id',ID).maybeSingle();
  if(error) return NextResponse.json({ error:error.message },{ status:500 });
  return NextResponse.json(data?data.data:null);
}
export async function PUT(req){
  const c=sb(); if(!c) return NextResponse.json({ ok:false, reason:'no supabase' });
  const body=await req.json();
  const { error } = await c.from('emmaus_state').upsert({ id:ID, data:body, updated_at:new Date().toISOString() });
  if(error) return NextResponse.json({ error:error.message },{ status:500 });
  return NextResponse.json({ ok:true });
}
