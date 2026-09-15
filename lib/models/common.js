// Shared materials and builders for the 3D reconstructions. Units are whatever the model declares (cubits or metres).
export function materials(THREE){
  const M=(c,o={})=>new THREE.MeshStandardMaterial({ color:c, roughness:0.8, metalness:0, ...o });
  return {
    gold:M(0xd9a441,{ metalness:0.9, roughness:0.28 }),
    goldDull:M(0xb98a3a,{ metalness:0.7, roughness:0.45 }),
    bronze:M(0x8a5a2b,{ metalness:0.85, roughness:0.42 }),
    silver:M(0xc9c9c9,{ metalness:0.9, roughness:0.3 }),
    acacia:M(0x6b4a2a,{ roughness:0.85 }),
    cedar:M(0x8a5a3a,{ roughness:0.8 }),
    olive:M(0x5a4a2a,{ roughness:0.8 }),
    linen:M(0xe8e0cf,{ roughness:0.95, side:THREE.DoubleSide }),
    goat:M(0x3a3128,{ roughness:1, side:THREE.DoubleSide }),
    ram:M(0x7a2e2a,{ roughness:0.9, side:THREE.DoubleSide }),
    leather:M(0x6a5646,{ roughness:0.95, side:THREE.DoubleSide }),
    stone:M(0xd8ccb0,{ roughness:0.9 }),
    stoneDark:M(0xb8a888,{ roughness:0.95 }),
    marble:M(0xefe7d8,{ roughness:0.45 }),
    pavement:M(0xcfc3a8,{ roughness:0.95 }),
    sand:M(0x8a7a5c,{ roughness:1 }),
    earth:M(0x5a4a38,{ roughness:1 }),
    dark:M(0x2a241b,{ roughness:0.9 }),
    water:M(0x3a5a6a,{ metalness:0.3, roughness:0.1, transparent:true, opacity:0.85 }),
    flame:new THREE.MeshStandardMaterial({ color:0xffb347, emissive:0xff8c1a, emissiveIntensity:2.2, roughness:0.4 }),
    figure:M(0x3a3a3a,{ roughness:0.9 }),
    screen:stripes(THREE,['#2b4c8c','#6a2e7a','#8a1f2a'],8),
    veil:stripes(THREE,['#2b4c8c','#6a2e7a','#8a1f2a','#d9a441'],10),
  };
}
// Woven screen texture: blue, purple, scarlet.
function stripes(THREE,colors,n){
  const c=document.createElement('canvas'); c.width=256; c.height=256; const g=c.getContext('2d');
  for(let i=0;i<n;i++){ g.fillStyle=colors[i%colors.length]; g.fillRect(0,i*(256/n),256,256/n+1); }
  g.strokeStyle='rgba(255,255,255,.12)'; for(let x=0;x<256;x+=16){ g.beginPath(); g.moveTo(x,0); g.lineTo(x,256); g.stroke(); }
  const t=new THREE.CanvasTexture(c); t.wrapS=t.wrapT=THREE.RepeatWrapping; t.repeat.set(1,1);
  return new THREE.MeshStandardMaterial({ map:t, roughness:0.9, side:THREE.DoubleSide });
}
// Helpers create meshes with the bottom at y and tag them with a part id for picking.
export function helpers(THREE, parts){
  const tag=(m,id)=>{ if(id) m.userData.part=id; m.castShadow=true; m.receiveShadow=true; if(id) parts.push(m); return m; };
  const box=(w,h,d,mat,x=0,y=0,z=0,id)=>{ const m=new THREE.Mesh(new THREE.BoxGeometry(w,h,d),mat); m.position.set(x,y+h/2,z); return tag(m,id); };
  const cyl=(rt,rb,h,mat,x=0,y=0,z=0,id,seg=24)=>{ const m=new THREE.Mesh(new THREE.CylinderGeometry(rt,rb,h,seg),mat); m.position.set(x,y+h/2,z); return tag(m,id); };
  const sphere=(r,mat,x,y,z,id)=>{ const m=new THREE.Mesh(new THREE.SphereGeometry(r,16,12),mat); m.position.set(x,y,z); return tag(m,id); };
  const plane=(w,h,mat,x,y,z,ry=0,id)=>{ const m=new THREE.Mesh(new THREE.PlaneGeometry(w,h),mat); m.position.set(x,y+h/2,z); m.rotation.y=ry; return tag(m,id); };
  // Horizontal rod centred at (x,y,z) running along 'x' or 'z'
  const rod=(len,r,mat,x,y,z,axis='x',id)=>{ const m=new THREE.Mesh(new THREE.CylinderGeometry(r,r,len,10),mat); m.position.set(x,y,z); if(axis==='x') m.rotation.z=Math.PI/2; else m.rotation.x=Math.PI/2; return tag(m,id); };
  const group=(id)=>{ const g=new THREE.Group(); if(id) g.userData.part=id; return g; };
  // A row of columns between two points
  const colonnade=(from,to,n,r,h,mat,id,base=true)=>{ const g=group(); for(let i=0;i<n;i++){ const t=n===1?0:i/(n-1); const x=from[0]+(to[0]-from[0])*t, z=from[1]+(to[1]-from[1])*t; g.add(cyl(r,r*1.05,h,mat,x,0,z,id,14)); if(base){ g.add(box(r*2.6,r*0.5,r*2.6,mat,x,0,z,id)); g.add(box(r*2.6,r*0.6,r*2.6,mat,x,h-r*0.6,z,id)); } } return g; };
  // Curtain wall: thin panels between consecutive posts
  const panelBetween=(a,b,h,mat,id,thick=0.08)=>{ const dx=b[0]-a[0], dz=b[1]-a[1]; const len=Math.hypot(dx,dz); const m=box(len,h,thick,mat,(a[0]+b[0])/2,0,(a[1]+b[1])/2,id); m.rotation.y=-Math.atan2(dz,dx); return m; };
  return { tag, box, cyl, sphere, plane, rod, group, colonnade, panelBetween };
}
export function scaleFigure(THREE,H,mat,x,z,heightUnits,id='figure'){ // a standing person, height in model units
  const g=new THREE.Group(); const r=heightUnits*0.11;
  const body=new THREE.Mesh(new THREE.CapsuleGeometry(r,heightUnits*0.62,6,12),mat); body.position.set(x,heightUnits*0.55,z); body.castShadow=true; body.userData.part=id;
  const head=new THREE.Mesh(new THREE.SphereGeometry(heightUnits*0.085,14,10),mat); head.position.set(x,heightUnits*0.92,z); head.castShadow=true; head.userData.part=id;
  g.add(body,head); return g;
}
