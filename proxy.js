import { NextResponse } from 'next/server';
// Single-user gate: when APP_PASSWORD is set, every page needs the auth cookie.
async function sha(s){ const b=await crypto.subtle.digest('SHA-256',new TextEncoder().encode(s)); return [...new Uint8Array(b)].map(x=>x.toString(16).padStart(2,'0')).join(''); }
export async function proxy(req){
  const pw=process.env.APP_PASSWORD; if(!pw) return NextResponse.next();
  const { pathname } = req.nextUrl;
  if(pathname.startsWith('/login')||pathname.startsWith('/api/login')) return NextResponse.next();
  const want=await sha('emmaus:'+pw);
  if(req.cookies.get('emmaus_auth')?.value===want) return NextResponse.next();
  if(pathname.startsWith('/api/')) return NextResponse.json({ error:'unauthorised' },{ status:401 });
  const url=req.nextUrl.clone(); url.pathname='/login'; url.search=''; return NextResponse.redirect(url);
}
export const config={ matcher:['/((?!_next/static|_next/image|favicon.ico|icon.svg).*)'] };
