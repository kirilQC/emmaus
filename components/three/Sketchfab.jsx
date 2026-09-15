'use client';
import { useState } from 'react';
// Click to load, so the page stays light until you ask for someone else's model.
export default function Sketchfab({ uid, title, author, licence, note }){
  const [on,setOn]=useState(false);
  return <div className="card" style={{ overflow:'hidden' }}>
    <div style={{ position:'relative', aspectRatio:'16/10', background:'#221d16' }}>
      {on ? <iframe title={title} src={`https://sketchfab.com/models/${uid}/embed?autostart=1&ui_theme=dark&ui_infos=0&ui_watermark=0`} style={{ position:'absolute', inset:0, width:'100%', height:'100%', border:0 }} allow="autoplay; fullscreen; xr-spatial-tracking" allowFullScreen />
      : <button onClick={()=>setOn(true)} className="btn ghost" style={{ position:'absolute', left:'50%', top:'50%', transform:'translate(-50%,-50%)' }}>Load from Sketchfab</button>}
    </div>
    <div style={{ padding:'12px 16px' }}><div style={{ fontWeight:500 }}>{title}</div><div className="note">{author} · {licence}</div>{note && <div style={{ fontSize:15, color:'var(--dim)', marginTop:6 }}>{note}</div>}<a className="note" href={`https://sketchfab.com/3d-models/${uid}`} target="_blank" rel="noopener" style={{ display:'inline-block', marginTop:6 }}>Open on Sketchfab</a></div>
  </div>;
}
