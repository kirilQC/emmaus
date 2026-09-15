// The camp of Israel, schematic. Cubits, but distances between camps are not given in the text and are chosen for legibility.
import { materials, helpers } from './common.js';
import { tabernacleModel } from './tabernacle.js';
const TRIBES={ judah:[['Judah',74600],['Issachar',54400],['Zebulun',57400]], reuben:[['Reuben',46500],['Simeon',59300],['Gad',45650]], ephraim:[['Ephraim',40500],['Manasseh',32200],['Benjamin',35400]], dan:[['Dan',62700],['Asher',41500],['Naphtali',53400]] };
const COLORS={ judah:0x8a3b2e, reuben:0x5c7f5c, ephraim:0x7a5c96, dan:0x4d6f95 };
export const campModel={
  id:'camp', diagram:'camp', unit:'schematic', title:'The Camp of Israel',
  camera:{ position:[1000,540,1000], target:[0,0,0] }, shadowSize:1400, maxDistance:4000, minDistance:20, fog:[2000,5000], sun:[1200,1500,900],
  toggles:[['tents','Tents',true],['standards','Standards',true],['labels','Labels',true]],
  labels:[['judah','Judah · Issachar · Zebulun',[620,60,0]],['reuben','Reuben · Simeon · Gad',[0,60,620]],['ephraim','Ephraim · Manasseh · Benjamin',[-620,60,0]],['dan','Dan · Asher · Naphtali',[0,60,-620]],['tab','The tabernacle',[0,40,0]],['moses','Moses, Aaron and the priests',[150,30,0]],['kohath','Kohathites',[0,30,150]],['gershon','Gershonites',[-150,30,0]],['merari','Merarites',[0,30,-150]]],
  build(THREE){
    const parts=[]; const mats=materials(THREE); const H=helpers(THREE,parts); const root=new THREE.Group(); const layers={};
    const L=id=>{ if(!layers[id]){ layers[id]=new THREE.Group(); root.add(layers[id]); } return layers[id]; };
    const ground=new THREE.Mesh(new THREE.PlaneGeometry(6000,6000),mats.sand); ground.rotation.x=-Math.PI/2; ground.position.y=-0.2; ground.receiveShadow=true; root.add(ground);
    // The tabernacle itself, reused from its own model
    const tab=tabernacleModel.build(THREE); tab.group.children.forEach(c=>{ if(c.geometry&&c.geometry.type==='PlaneGeometry') c.visible=false; }); tab.parts.forEach(p=>{ p.userData.part='tab'; parts.push(p); }); root.add(tab.group);
    // Tents as instanced cones
    const tentGeo=new THREE.ConeGeometry(4.5,5.5,6); const rnd=(a,b)=>a+Math.random()*(b-a);
    const tents=(id,count,cx,cz,w,d,color,layer)=>{ const m=new THREE.MeshStandardMaterial({ color, roughness:0.95 }); const im=new THREE.InstancedMesh(tentGeo,m,count); const o=new THREE.Object3D(); for(let i=0;i<count;i++){ o.position.set(cx+rnd(-w/2,w/2),2.75,cz+rnd(-d/2,d/2)); o.rotation.y=rnd(0,Math.PI); const s=rnd(0.8,1.2); o.scale.set(s,s,s); o.updateMatrix(); im.setMatrixAt(i,o.matrix); } im.castShadow=true; im.receiveShadow=true; im.userData.part=id; parts.push(im); layer.add(im); return im; };
    const T=L('tents');
    // Levites close around the tent, one clan on each side (Numbers 3)
    tents('moses',40,150,0,90,120,0x4a3a2a,T); tents('kohath',60,0,150,140,80,0x4a3a2a,T); tents('gershon',55,-150,0,90,140,0x4a3a2a,T); tents('merari',50,0,-150,140,80,0x4a3a2a,T);
    // The four camps, three tribes each, tents in proportion to the census (Numbers 1 to 2)
    const St=L('standards');
    const camp=(id,angleDeg,color)=>{ const a=angleDeg*Math.PI/180; const dist=620; const cx=Math.cos(a)*dist, cz=Math.sin(a)*dist; const along=[ -Math.sin(a), Math.cos(a) ]; let offset=-1; TRIBES[id].forEach(([name,n])=>{ const k=n/300; const w=Math.max(120,k*0.9); const tcx=cx+along[0]*offset*260, tcz=cz+along[1]*offset*260; tents(id,Math.round(k),tcx,tcz,w,w,color,T); offset+=1; }); St.add(H.cyl(1.2,1.6,60,mats.acacia,cx*0.72,0,cz*0.72,id,8)); const flag=H.box(0.6,14,26,new THREE.MeshStandardMaterial({ color, roughness:0.9 }),cx*0.72,44,cz*0.72,id); flag.rotation.y=-a; St.add(flag); };
    camp('judah',0,COLORS.judah); camp('reuben',90,COLORS.reuben); camp('ephraim',180,COLORS.ephraim); camp('dan',270,COLORS.dan);
    return { group:root, parts, layers };
  },
  partMeta:{ tab:'tab', moses:'moses', kohath:'kohath', gershon:'gershon', merari:'merari', judah:'judah', reuben:'reuben', ephraim:'ephraim', dan:'dan' },
  figureNote:'',
  others:[],
  sources:[
    ['Numbers 1 to 4 and 10','The census, the arrangement by standards, the Levite clans and the order of march.','/book/numbers/2'],
    ['Song of Songs 1:5','"Dark like the tents of Kedar": what an Israelite tent looked like.','/book/song-of-songs/1'],
  ],
  choices:[
    ['Not to scale','Numbers 2 gives the arrangement and the numbers but no distances. Each tent here stands for about three hundred men, and the camps are placed close enough to see at once. A real camp of two million would have stretched for kilometres.'],
    ['Tent shapes','Israelite tents were goat hair on poles, dark and low (Song of Songs 1:5 "dark like the tents of Kedar"). They are drawn as simple cones; the tabernacle at the centre is the full model.'],
    ['The standards','Each camp had a standard (Numbers 2:2) that the text does not describe. They are drawn as plain banners in the colour of the camp on this site’s maps. The lion, man, ox and eagle come from later tradition.'],
    ['Where the Levites camped','Numbers 3:23, 29, 35 and 38 give a side for each clan: Gershon west, Kohath south, Merari north, and Moses, Aaron and the priests on the east in front of the entrance.'],
  ],
};
