'use client';
import { useState } from 'react';
export default function Login(){
  const [pw,setPw]=useState('');const [err,setErr]=useState('');
  async function go(e){e.preventDefault();const r=await fetch('/api/login',{method:'POST',headers:{'content-type':'application/json'},body:JSON.stringify({password:pw})});if(r.ok)location.href='/';else setErr('That is not the password.')}
  return <form className="card login" onSubmit={go}><div className="lab">Emmaus</div><h1 className="h2">Welcome back</h1><input type="password" value={pw} onChange={e=>setPw(e.target.value)} placeholder="Password" autoFocus/><button className="btn" type="submit">Enter</button>{err&&<div className="note">{err}</div>}</form>;
}
