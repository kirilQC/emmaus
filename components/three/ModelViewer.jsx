'use client';
import { useEffect, useRef, useState } from 'react';
import { diagramById } from '../../lib/diagrams/index.js';
import { refHref } from '../AtlasMap.jsx';
const Ref=({ r })=>{ const h=refHref(r); return h?<a className="chip" href={h}>{r}</a>:<span className="chip">{r}</span>; };

export default function ModelViewer({ model }){
  const el=useRef(null); const api=useRef(null);
  const [toggles,setToggles]=useState(()=>Object.fromEntries(model.toggles.map(([id,,d])=>[id,d])));
  const [sel,setSel]=useState(null); const [spin,setSpin]=useState(false); const [ready,setReady]=useState(false);
  const diagram=diagramById(model.diagram);
  useEffect(()=>{
    let dead=false; let cleanup=()=>{};
    (async()=>{
      const THREE=await import('three'); const { OrbitControls }=await import('three/addons/controls/OrbitControls.js'); const { CSS2DRenderer, CSS2DObject }=await import('three/addons/renderers/CSS2DRenderer.js');
      if(dead||!el.current) return;
      const host=el.current; const W=host.clientWidth, Hh=host.clientHeight;
      const renderer=new THREE.WebGLRenderer({ antialias:true, alpha:false }); renderer.setPixelRatio(Math.min(window.devicePixelRatio||1,2)); renderer.setSize(W,Hh); renderer.shadowMap.enabled=true; renderer.shadowMap.type=THREE.PCFShadowMap; renderer.toneMapping=THREE.ACESFilmicToneMapping; renderer.toneMappingExposure=1.05; host.appendChild(renderer.domElement);
      const labelRenderer=new CSS2DRenderer(); labelRenderer.setSize(W,Hh); labelRenderer.domElement.style.position='absolute'; labelRenderer.domElement.style.top='0'; labelRenderer.domElement.style.pointerEvents='none'; host.appendChild(labelRenderer.domElement);
      const scene=new THREE.Scene(); scene.background=new THREE.Color(0x171510); scene.fog=new THREE.Fog(0x171510, model.fog?model.fog[0]:400, model.fog?model.fog[1]:900);
      const camera=new THREE.PerspectiveCamera(42,W/Hh,0.1,5000); camera.position.set(...model.camera.position);
      const controls=new OrbitControls(camera,renderer.domElement); controls.target.set(...model.camera.target); controls.enableDamping=true; controls.dampingFactor=0.08; controls.maxPolarAngle=Math.PI*0.49; controls.minDistance=model.minDistance||3; controls.maxDistance=model.maxDistance||400; controls.update();
      // Light: warm sun from the south east, cool sky fill
      const sun=new THREE.DirectionalLight(0xffe2b8,2.6); sun.position.set(...(model.sun||[120,160,110])); sun.castShadow=true; sun.shadow.mapSize.set(2048,2048); const s=model.shadowSize||130; Object.assign(sun.shadow.camera,{ left:-s, right:s, top:s, bottom:-s, near:10, far:800 }); sun.shadow.bias=-0.0006; scene.add(sun);
      scene.add(new THREE.HemisphereLight(0x8fa3b8,0x3a2f24,0.9)); scene.add(new THREE.AmbientLight(0xffffff,0.15));
      const built=model.build(THREE); scene.add(built.group); const layers=built.layers||{};
      // Labels
      const labelGroup=new THREE.Group(); scene.add(labelGroup);
      (model.labels||[]).forEach(([id,text,pos])=>{ const d=document.createElement('div'); d.className='m3d-label'; d.textContent=text; const o=new CSS2DObject(d); o.position.set(...pos); o.userData.part=id; labelGroup.add(o); });
      const applyToggles=t=>{ Object.entries(layers).forEach(([k,g])=>{ if(k in t) g.visible=!!t[k]; }); labelGroup.visible=!!t.labels; };
      applyToggles(toggles);
      // Picking
      const ray=new THREE.Raycaster(); const mouse=new THREE.Vector2(); let hover=null; const pickables=built.parts;
      const setEm=(m,on)=>{ if(!m||!m.material||!m.material.emissive) return; if(!m.userData._em){ m.userData._em=m.material; } if(on){ if(!m.userData._hl){ m.userData._hl=m.material.clone(); m.userData._hl.emissive=new THREE.Color(0xd69282); m.userData._hl.emissiveIntensity=0.35; } m.material=m.userData._hl; } else m.material=m.userData._em; };
      const pick=(ev)=>{ const r=renderer.domElement.getBoundingClientRect(); mouse.x=((ev.clientX-r.left)/r.width)*2-1; mouse.y=-((ev.clientY-r.top)/r.height)*2+1; ray.setFromCamera(mouse,camera); const hits=ray.intersectObjects(pickables.filter(p=>p.visible&&isVisible(p)),false); return hits.length?hits[0].object:null; };
      const isVisible=o=>{ let n=o; while(n){ if(n.visible===false) return false; n=n.parent; } return true; };
      let moved=false, downAt=null;
      renderer.domElement.addEventListener('pointerdown',e=>{ downAt=[e.clientX,e.clientY]; moved=false; });
      renderer.domElement.addEventListener('pointermove',e=>{ if(downAt&&Math.hypot(e.clientX-downAt[0],e.clientY-downAt[1])>4) moved=true; const o=pick(e); if(o!==hover){ if(hover) hover.userData.part&&pickables.filter(p=>p.userData.part===hover.userData.part).forEach(p=>setEm(p,false)); hover=o; if(hover){ pickables.filter(p=>p.userData.part===hover.userData.part).forEach(p=>setEm(p,true)); renderer.domElement.style.cursor='pointer'; } else renderer.domElement.style.cursor=''; } });
      renderer.domElement.addEventListener('pointerup',e=>{ if(moved) return; const o=pick(e); setSel(o?o.userData.part:null); });
      // Loop
      let raf; const tick=()=>{ controls.autoRotate=api.current.spin; controls.autoRotateSpeed=0.6; controls.update(); renderer.render(scene,camera); labelRenderer.render(scene,camera); raf=requestAnimationFrame(tick); };
      const ro=new ResizeObserver(()=>{ const w=host.clientWidth,h=host.clientHeight; if(!w||!h) return; camera.aspect=w/h; camera.updateProjectionMatrix(); renderer.setSize(w,h); labelRenderer.setSize(w,h); });
      ro.observe(host);
      api.current={ spin:false, applyToggles, reset:()=>{ camera.position.set(...model.camera.position); controls.target.set(...model.camera.target); controls.update(); }, dispose:()=>{ cancelAnimationFrame(raf); ro.disconnect(); renderer.dispose(); host.innerHTML=''; } };
      tick(); setReady(true);
      cleanup=()=>api.current&&api.current.dispose();
    })();
    return ()=>{ dead=true; cleanup(); };
  },[model.id]);
  useEffect(()=>{ if(api.current) api.current.applyToggles(toggles); },[toggles]);
  useEffect(()=>{ if(api.current) api.current.spin=spin; },[spin]);
  const metaId=sel&&model.partMeta?model.partMeta[sel]:sel; const meta=metaId&&diagram?diagram.elements.find(e=>e.id===metaId):null;
  return <div className="m3d">
    <div className="m3d-stage card"><div ref={el} className="m3d-canvas" />{!ready&&<div className="m3d-loading note">Building the model…</div>}
      <div className="m3d-bar">
        {model.toggles.map(([id,label])=><label key={id} className="m3d-tog"><input type="checkbox" checked={!!toggles[id]} onChange={e=>setToggles(t=>({ ...t, [id]:e.target.checked }))} />{label}</label>)}
        <label className="m3d-tog"><input type="checkbox" checked={spin} onChange={e=>setSpin(e.target.checked)} />Turn slowly</label>
        <button className="opt" style={{ borderRadius:999, padding:'4px 12px', fontSize:13 }} onClick={()=>api.current&&api.current.reset()}>Reset view</button>
      </div>
    </div>
    <div className="dg-side">
      <div className="card" style={{ padding:'16px 18px', minHeight:200 }}>
        {meta ? <>
          <div className="lab" style={{ color:'var(--accent)' }}>{meta.name}</div>
          {meta.dims && <div className="note" style={{ marginTop:4 }}>{meta.dims}</div>}
          {meta.what && <p style={{ margin:'12px 0 0', fontSize:17 }}>{meta.what}</p>}
          {meta.meaning && <p style={{ margin:'10px 0 0', fontSize:16, color:'var(--dim)', fontStyle:'italic' }}>{meta.meaning}</p>}
          {meta.refs && <div style={{ display:'flex', gap:6, flexWrap:'wrap', marginTop:12 }}>{meta.refs.map(r=><Ref key={r} r={r} />)}</div>}
        </> : sel==='figure' ? <><div className="lab" style={{ color:'var(--accent)' }}>Scale</div><p style={{ margin:'10px 0 0' }}>{model.figureNote}</p></> : <><div className="lab">Drag to orbit, scroll to zoom, click any part</div><p className="note" style={{ marginTop:8 }}>Right drag or two fingers to pan. Turn off the coverings or the roof to look inside. Every part is built from the measurements in the text; where the text is silent the choices are listed below the model.</p></>}
      </div>
      {diagram && <div className="card" style={{ padding:'14px 16px' }}><div className="lab" style={{ marginBottom:8 }}>Parts</div><div style={{ display:'flex', flexDirection:'column', gap:2 }}>{diagram.elements.filter(e=>e.name&&Object.values(model.partMeta||{}).includes(e.id)).map(e=><button key={e.id} className={'dg-part'+(metaId===e.id?' on':'')} onClick={()=>setSel(Object.keys(model.partMeta).find(k=>model.partMeta[k]===e.id)||e.id)}><span className="dot" style={{ background:e.fill&&e.fill!=='none'?e.fill:(e.stroke||'#c9b79a') }} />{e.name}</button>)}</div></div>}
    </div>
  </div>;
}
