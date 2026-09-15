import { NextResponse } from 'next/server';
import { COOKIE, token } from '../../../lib/auth.js';
export async function POST(req){
  const { password } = await req.json().catch(()=>({}));
  if(!process.env.APP_PASSWORD) return NextResponse.json({ ok:true });
  if(password!==process.env.APP_PASSWORD) return NextResponse.json({ error:'wrong password' },{ status:401 });
  const res=NextResponse.json({ ok:true });
  res.cookies.set(COOKIE, token(), { httpOnly:true, sameSite:'lax', secure:process.env.NODE_ENV==='production', path:'/', maxAge:60*60*24*365 });
  return res;
}
