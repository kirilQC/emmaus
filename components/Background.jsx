'use client';
import { useEffect, useRef } from 'react';
import { P } from '../lib/icons.js';
export default function Background(){
 const ref=useRef(null);
 useEffect(()=>{

 const c=ref.current;if(!c)return;const ctx=c.getContext('2d');
 const reduce=matchMedia('(prefers-reduced-motion: reduce)').matches;
 const names=['tablets','crown','harp','flame','horn','lamp','star','mountain','road','cross','scroll','seed','flag','map','fish','bread','key','emmaus'];
 const glyphs=names.map(n=>[...P[n].matchAll(/d="([^"]+)"/g)].map(m=>new Path2D(m[1])));
 let W,H,dpr,parts=[],orbs=[],mouse={x:-1e4,y:-1e4},tint='#8a3b2e',t0=performance.now(),raf=0;
 const cssVar=v=>getComputedStyle(document.documentElement).getPropertyValue(v).trim();
 const rgba=(hex,a)=>{const h=hex.replace('#','');const n=parseInt(h.length===3?h.split('').map(x=>x+x).join(''):h,16);return `rgba(${n>>16&255},${n>>8&255},${n&255},${a})`};
 function resize(){dpr=Math.min(devicePixelRatio||1,2);W=innerWidth;H=innerHeight;c.width=W*dpr;c.height=H*dpr;c.style.width=W+'px';c.style.height=H+'px';ctx.setTransform(dpr,0,0,dpr,0,0);seed()}
 function seed(){const n=Math.round(W*H/38000);parts=Array.from({length:n},(_,i)=>({x:Math.random()*W,y:Math.random()*H,vx:(Math.random()-.5)*.12,vy:-(.05+Math.random()*.1),r:Math.random()*Math.PI*2,vr:(Math.random()-.5)*.002,s:1.2+Math.random()*1.6,g:i%glyphs.length,ph:Math.random()*Math.PI*2}));
  orbs=[{x:.2,y:.15,r:.5,ax:.08,ay:.05,sp:.00011},{x:.8,y:.35,r:.45,ax:.06,ay:.08,sp:.00008},{x:.5,y:.95,r:.55,ax:.1,ay:.04,sp:.00006}]}
 function draw(now){const t=now-t0;ctx.clearRect(0,0,W,H);const ink=cssVar('--ink')||'#1c1a17';const dark=true;
  orbs.forEach((o,i)=>{const x=(o.x+Math.sin(t*o.sp+i)*o.ax)*W,y=(o.y+Math.cos(t*o.sp*1.3+i)*o.ay)*H,r=o.r*Math.max(W,H);const g=ctx.createRadialGradient(x,y,0,x,y,r);const col=i===1?(dark?'#4d6f95':'#b08d3f'):tint;g.addColorStop(0,rgba(col,dark?.16:.13));g.addColorStop(1,rgba(col,0));ctx.fillStyle=g;ctx.fillRect(0,0,W,H)});
  ctx.lineCap='round';ctx.lineJoin='round';
  parts.forEach(p=>{if(!reduce){p.x+=p.vx;p.y+=p.vy;p.r+=p.vr;if(p.y<-40){p.y=H+40;p.x=Math.random()*W}if(p.x<-40)p.x=W+40;if(p.x>W+40)p.x=-40}
   const dx=p.x-mouse.x,dy=p.y-mouse.y,d=Math.hypot(dx,dy);const near=d>0?Math.max(0,1-d/220):0;const a=(dark?.10:.085)+near*.35+Math.sin(t*.0008+p.ph)*.015;const sc=p.s*(1+near*.35);
   ctx.save();ctx.translate(p.x+(near?dx/d*near*10:0),p.y+(near?dy/d*near*10:0));ctx.rotate(p.r);ctx.scale(sc,sc);ctx.translate(-12,-12);ctx.strokeStyle=rgba(near>.05?tint:ink,a);ctx.lineWidth=1.3/sc;glyphs[p.g].forEach(g=>ctx.stroke(g));ctx.restore()});
  if(!reduce&&!document.hidden)raf=requestAnimationFrame(draw)}
 function start(){cancelAnimationFrame(raf);tint=cssVar('--accent')||'#8a3b2e';raf=requestAnimationFrame(draw)}
 const onResize=()=>{resize();if(reduce)start()};
 const onMove=e=>{mouse.x=e.clientX;mouse.y=e.clientY};
 const onLeave=()=>{mouse.x=-1e4;mouse.y=-1e4};
 const onVisibility=()=>{if(!document.hidden)start()};
 addEventListener('resize',onResize);addEventListener('pointermove',onMove);addEventListener('pointerleave',onLeave);
 document.addEventListener('visibilitychange',onVisibility);
 window.__bg={setTint(col){tint=col||cssVar('--accent');if(reduce)start()},restart:start};
 resize();start();
 return ()=>{cancelAnimationFrame(raf);removeEventListener('resize',onResize);removeEventListener('pointermove',onMove);removeEventListener('pointerleave',onLeave);document.removeEventListener('visibilitychange',onVisibility);window.__bg=null};

 },[]);
 return <canvas id="bg" ref={ref} aria-hidden="true"/>;
}
