// Herod's temple in metres. x east, z south, y up. Platform corners from the plan, centred on the origin.
import { materials, helpers, scaleFigure } from './common.js';
const CX=160, CZ=245; const P=(x,z)=>[x-CX,z-CZ];
export const herodModel={
  id:'herod-temple', diagram:'herod-temple', unit:'metre', title:'Herod’s Temple',
  camera:{ position:[300,210,380], target:[0,35,0] }, shadowSize:420, maxDistance:1800, minDistance:10, fog:[900,2200], sun:[600,700,500],
  toggles:[['porticoes','Porticoes',true],['roof','Sanctuary roof',true],['figure','Scale figure',true],['labels','Labels',true]],
  labels:[['sanctuary','Sanctuary',[100-CX,82,250-CZ]],['altar','Altar',[143-CX,34,245-CZ]],['women','Court of the Women',[200-CX,42,250-CZ]],['nicanor','Nicanor Gate',[171-CX,52,250-CZ]],['royal','Royal Stoa',[142-CX,50,467-CZ]],['antonia','Antonia',[22-CX,68,20-CZ]],['solomon','Solomon’s Portico',[301-CX,44,230-CZ]],['huldah','Huldah Gates',[140-CX,30,487-CZ]],['shushan','Shushan Gate',[312-CX,40,235-CZ]],['gentiles','Court of the Gentiles',[165-CX,30,100-CZ]]],
  build(THREE){
    const parts=[]; const mats=materials(THREE); const H=helpers(THREE,parts); const root=new THREE.Group(); const layers={};
    const L=id=>{ if(!layers[id]){ layers[id]=new THREE.Group(); root.add(layers[id]); } return layers[id]; };
    const ground=new THREE.Mesh(new THREE.PlaneGeometry(2400,2400),mats.earth); ground.rotation.x=-Math.PI/2; ground.position.y=-0.1; ground.receiveShadow=true; root.add(ground);
    // Platform: extruded trapezoid, retaining walls 25 m above the surrounding ground
    const shape=new THREE.Shape(); const pts=[[0,0],[315,0],[280,490],[0,485]].map(([x,z])=>P(x,z)); shape.moveTo(pts[0][0],pts[0][1]); pts.slice(1).forEach(p=>shape.lineTo(p[0],p[1])); shape.closePath();
    const plat=new THREE.Mesh(new THREE.ExtrudeGeometry(shape,{ depth:25, bevelEnabled:false }),mats.stone); plat.rotation.x=Math.PI/2; plat.position.y=25; H.tag(plat,'platform'); root.add(plat);
    const pave=new THREE.Mesh(new THREE.ShapeGeometry(shape),mats.pavement); pave.rotation.x=Math.PI/2; pave.position.y=25.05; pave.receiveShadow=true; root.add(pave);
    // Ashlar courses suggested by shallow ledges on the walls
    [6,12,18].forEach(y=>{ const ring=new THREE.Mesh(new THREE.ExtrudeGeometry(shape,{ depth:0.4, bevelEnabled:false }),mats.stoneDark); ring.rotation.x=Math.PI/2; ring.position.y=y; ring.scale.set(1.004,1.004,1); root.add(ring); });
    const Y=25;
    // Porticoes: double colonnades on north, east and west; the Royal Stoa on the south (Josephus, War 5.190-192; Antiquities 15.411-416)
    const Po=L('porticoes');
    const stoa=(a,b,rows,rowGap,n,h,roofDepth,id)=>{ const dx=b[0]-a[0], dz=b[1]-a[1]; const len=Math.hypot(dx,dz); const nx=-dz/len, nz=dx/len; for(let r=0;r<rows;r++){ const off=r*rowGap; Po.add(H.colonnade([a[0]+nx*off,a[1]+nz*off],[b[0]+nx*off,b[1]+nz*off],n,0.9,h,mats.marble,id,true)); } const roof=H.box(len,1.2,roofDepth,mats.cedar,(a[0]+b[0])/2+nx*(roofDepth/2-2),Y+h,(a[1]+b[1])/2+nz*(roofDepth/2-2),id); roof.rotation.y=-Math.atan2(dz,dx); Po.add(roof); };
    // north (inside the wall, running east), inset 6 m
    stoa([P(50,6)[0],P(50,6)[1]],[P(309,6)[0],P(309,6)[1]],2,7,40,10,16,'north-portico');
    // east: Solomon's Portico
    stoa([P(308,12)[0],P(308,12)[1]],[P(275,478)[0],P(275,478)[1]],2,7,60,10,16,'solomon');
    // west
    stoa([P(6,45)[0],P(6,45)[1]],[P(6,450)[0],P(6,450)[1]],2,7,55,10,16,'west-portico');
    // Royal Stoa: four rows of columns, 162 in all, the centre nave higher (Antiquities 15.411-416)
    const ra=P(10,478), rb=P(272,478);
    [0,-10,-20,-30].forEach((off,r)=>Po.add(H.colonnade([ra[0],ra[1]+off],[rb[0],rb[1]+off],41,1.1,r===1||r===2?15:11,mats.marble,'royal',true)));
    Po.add(H.box(262,1.5,32,mats.cedar,(ra[0]+rb[0])/2,Y+11,ra[1]-15,'royal')); Po.add(H.box(262,1.2,12,mats.cedar,(ra[0]+rb[0])/2,Y+15.5,ra[1]-15,'royal'));
    // Antonia fortress at the north west corner: a block with four towers, one higher (War 5.238-246)
    const An=L('antonia'); const [ax,az]=P(0,0); An.add(H.box(45,30,40,mats.stoneDark,ax+22.5,Y,az+20,'antonia'));
    [[2,2,35],[43,2,30],[2,38,30],[43,38,42]].forEach(([dx,dz,h])=>An.add(H.box(10,h,10,mats.stoneDark,ax+dx+3,Y,az+dz+3,'antonia')));
    // Soreg: the balustrade with its warning inscriptions, 1.3 m high (War 5.193-194)
    const S=L('inner'); const s0=P(85,155), s1=P(235,345);
    [[s0[0],s0[1],s1[0]-s0[0],0.4],[s0[0],s1[1],s1[0]-s0[0],0.4]].forEach(([x,z,w,d])=>S.add(H.box(w,1.3,d,mats.marble,x+w/2,Y,z,'soreg')));
    [[s0[0],s0[1],0.4,s1[1]-s0[1]],[s1[0],s0[1],0.4,s1[1]-s0[1]]].forEach(([x,z,w,d])=>S.add(H.box(w,1.3,d,mats.marble,x,Y,z+d/2,'soreg')));
    // Inner terrace raised 3 m with steps, then the courts with 12 m walls
    const t0=P(88,182), t1=P(232,318); S.add(H.box(t1[0]-t0[0],3,t1[1]-t0[1],mats.stone,(t0[0]+t1[0])/2,Y,(t0[1]+t1[1])/2,'gentiles'));
    for(let i=1;i<=4;i++) S.add(H.box(t1[0]-t0[0]+i*3,0.75,t1[1]-t0[1]+i*3,mats.stone,(t0[0]+t1[0])/2,Y+3-i*0.75,(t0[1]+t1[1])/2,'gentiles'));
    const Y2=Y+3;
    const wall=(x0,z0,x1,z1,h,id)=>{ const w=Math.max(Math.abs(x1-x0),1.5), d=Math.max(Math.abs(z1-z0),1.5); S.add(H.box(w,h,d,mats.marble,(x0+x1)/2,Y2,(z0+z1)/2,id)); };
    // Court of the Women 175..225 x 190..310 with corner chambers
    const w0=P(175,190), w1=P(225,310);
    wall(w0[0],w0[1],w1[0],w0[1]+1.5,12,'women'); wall(w0[0],w1[1]-1.5,w1[0],w1[1],12,'women'); wall(w1[0]-1.5,w0[1],w1[0],w1[1],12,'women');
    [[w0[0],w0[1]],[w1[0]-12,w0[1]],[w0[0],w1[1]-12],[w1[0]-12,w1[1]-12]].forEach(([x,z])=>S.add(H.box(12,14,12,mats.marble,x+6,Y2,z+6,'women')));
    // east gate into the women's court
    S.add(H.box(6,20,14,mats.marble,w1[0]-1,Y2,(w0[1]+w1[1])/2,'women')); S.add(H.box(7,12,8,mats.dark,w1[0]-1,Y2,(w0[1]+w1[1])/2,'women'));
    // Nicanor Gate: 20 m high, 10 wide, fifteen semicircular steps down into the women's court (Middot 2:5-6)
    const n=P(171,250); S.add(H.box(6,22,16,mats.marble,n[0],Y2,n[1],'nicanor')); S.add(H.box(7,13,7,mats.dark,n[0],Y2+1,n[1],'nicanor')); S.add(H.box(8,1.2,18,mats.goldDull,n[0],Y2+22,n[1],'nicanor'));
    for(let i=0;i<15;i++){ const r=6+i*0.9; const st=new THREE.Mesh(new THREE.CylinderGeometry(r,r,0.5,32,1,false,-Math.PI/2,Math.PI),mats.stone); st.position.set(n[0]+3.5,Y2+7.5-i*0.5,n[1]); H.tag(st,'nicanor'); S.add(st); }
    // Courts of Israel and of the Priests, walls of the azarah
    const a0=P(95,190), a1=P(171,310);
    wall(a0[0],a0[1],a1[0],a0[1]+1.5,12,'priests'); wall(a0[0],a1[1]-1.5,a1[0],a1[1],12,'priests'); wall(a0[0],a0[1],a0[0]+1.5,a1[1],12,'priests');
    S.add(H.box(1.2,1,120,mats.marble,P(163,0)[0],Y2,0,'israel'));
    S.add(H.box(8,4.5,120,mats.stone,P(167,0)[0],Y2,0,'israel'));
    // Altar 32 cubits square at the base, about 16 x 16 m, 5 m high, ramp on the south (Middot 3:1-3)
    const al=P(143,245); S.add(H.box(16,5,16,mats.stoneDark,al[0],Y2,al[1],'altar')); S.add(H.box(14,0.6,14,mats.stone,al[0],Y2+5,al[1],'altar')); [[-7,-7],[7,-7],[-7,7],[7,7]].forEach(([dx,dz])=>S.add(H.box(1.2,1,1.2,mats.stoneDark,al[0]+dx,Y2+5,al[1]+dz,'altar')));
    const ramp=H.box(5,0.8,16,mats.stone,al[0],Y2+2.2,al[1]+15.5,'altar'); ramp.rotation.x=-Math.atan2(5,16); S.add(ramp);
    S.add(H.box(7,0.5,7,mats.flame,al[0],Y2+5.2,al[1],'altar')); const fire=new THREE.PointLight(0xff9a3c,400,90,2); fire.position.set(al[0],Y2+9,al[1]); S.add(fire);
    S.add(H.cyl(2.2,1.8,2,mats.bronze,P(122,272)[0],Y2,P(122,272)[1],'laver',20));
    // The sanctuary: porch 50 m wide and high, the house 35 wide behind it, 50 m long in all (Middot 4:6-7; War 5.207-221)
    const Sa=L('sanctuary'); const f=P(127,250); // east face of the porch
    Sa.add(H.box(6,50,50,mats.marble,f[0]-3,Y2,f[1],'sanctuary'));
    Sa.add(H.box(44,50,35,mats.marble,f[0]-6-22,Y2,f[1],'sanctuary'));
    Sa.add(H.box(0.6,20,10,mats.dark,f[0]+0.1,Y2+1,f[1],'sanctuary')); Sa.add(H.box(1,22,12,mats.gold,f[0]+0.3,Y2,f[1],'sanctuary')); Sa.add(H.box(0.6,20,10,mats.dark,f[0]+0.9,Y2+1,f[1],'sanctuary'));
    [[-20],[20]].forEach(([dz])=>Sa.add(H.box(0.6,44,3,mats.gold,f[0]+0.2,Y2+3,f[1]+dz,'sanctuary')));
    Sa.add(H.box(0.6,3,48,mats.gold,f[0]+0.2,Y2+46,f[1],'sanctuary'));
    // interior of the house behind the porch: Holy Place then Most Holy, separated by the veil
    Sa.add(H.box(20,20,10,mats.dark,f[0]-6-10,Y2,f[1],'holy')); Sa.add(H.box(10,20,10,mats.dark,f[0]-6-25,Y2,f[1],'mostholy')); Sa.add(H.plane(10,20,mats.veil,f[0]-6-20,Y2,f[1],Math.PI/2,'mostholy'));
    // gold spikes along the roof to keep birds off (War 5.224)
    const R=L('roof'); for(let x=0;x<44;x+=4) for(let z=-15;z<=15;z+=6) R.add(H.cyl(0.05,0.3,1.2,mats.gold,f[0]-6-22-22+x+2,Y2+50,f[1]+z,'sanctuary',6));
    R.add(H.box(50,1,50,mats.stone,f[0]-6-22,Y2+50,f[1],'sanctuary'));
    // Gates in the platform walls
    const G=L('gates');
    [P(115,485),P(165,485)].forEach(([x,z],i)=>{ const w=i?24:16; G.add(H.box(w,14,3,mats.dark,x,Y-14,z-0.5,'huldah')); G.add(H.box(w+4,2,3,mats.stoneDark,x,Y-1,z-0.5,'huldah')); for(let k=0;k<(i?3:2);k++){ G.add(H.box(1.6,14,3.2,mats.stoneDark,x-w/2+(k+1)*(w/((i?3:2)+1))*1+((i?3:2)-1-k)*0,Y-14,z-0.5,'huldah')); } });
    G.add(H.box(3,12,20,mats.dark,P(312,235)[0]+1,Y-12,P(312,235)[1],'shushan')); G.add(H.box(4,3,24,mats.stoneDark,P(312,235)[0]+1,Y,P(312,235)[1],'shushan'));
    // Robinson's Arch: a stair from the Royal Stoa down to the street at the south west corner
    const rx=P(0,455); G.add(H.box(16,3,14,mats.stone,rx[0]-8,Y-3,rx[1],'royal')); G.add(H.box(6,22,14,mats.stone,rx[0]-16,0,rx[1],'royal')); for(let i=0;i<10;i++) G.add(H.box(3,2.2,14,mats.stone,rx[0]-19-i*3,i*2.2,rx[1]+22,'royal'));
    // the corner Josephus describes above the Kidron
    G.add(H.box(6,4,6,mats.stoneDark,P(280,490)[0]-3,Y,P(280,490)[1]-3,'pinnacle'));
    L('figure').add(scaleFigure(THREE,H,mats.figure,P(200,120)[0],P(200,120)[1],1.8));
    return { group:root, parts, layers };
  },
  partMeta:{ platform:'platform', royal:'royal', solomon:'solomon', 'north-portico':'gentiles', 'west-portico':'gentiles', antonia:'antonia', gentiles:'gentiles', soreg:'soreg', women:'women', nicanor:'nicanor', israel:'israel', priests:'priests', altar:'altar', laver:'laver', sanctuary:'sanctuary', holy:'holy', mostholy:'mostholy', huldah:'huldah', shushan:'shushan', pinnacle:'pinnacle', figure:null },
  figureNote:'The figure in the Court of the Gentiles is a man of average height, 1.8 metres. The sanctuary facade behind him is fifty metres high.',
  others:[
    ['Herod’s Temple Mount, about AD 30','OpenBible.info','Sketchfab free standard licence','e21c525f14a3493c96a6500d132e0e89','The whole Herodian platform built from Middot, Josephus and the excavations, with source code released under MIT. The author notes it is probably wrong on some details, which is honest and true of every reconstruction.'],
    ['Temple of Jerusalem','Kiefer_Ramazzina','CC BY','a7f30ea386d14efc9ed91acd2f4c6e84','A textured model of the temple complex.'],
  ],
  sources:[
    ['Mishnah, Middot','The priestly memory of the courts in cubits, written about AD 200. Chapters 2 to 4 give the gates, steps, altar and sanctuary.','https://www.sefaria.org/Mishnah_Middot.2.1'],
    ['Josephus, The Jewish War 5.184-227','An eyewitness description of the platform, porticoes, courts and facade.','https://lexundria.com/j_bj/5.184-5.227/wst'],
    ['Josephus, Antiquities 15.380-425','The Royal Stoa and Herod’s building programme.','https://lexundria.com/j_aj/15.380-15.425/wst'],
    ['Leen Ritmeyer, "The Temple Mount in the Herodian Period"','The archaeologist whose reconstructions most others follow, on the platform, walls and stoa.','https://www.biblicalarchaeology.org/daily/biblical-sites-places/temple-at-jerusalem/the-temple-mount-in-the-herodian-period/'],
    ['The Israel Museum, Model of Jerusalem in the Second Temple Period','The 1:50 Holyland model of the city in AD 66, designed by Michael Avi-Yonah.','https://www.imj.org.il/en/events/second-temple-model'],
    ['The Temple Institute, illustrated tour','A rabbinic reconstruction of the altar, courts and sanctuary following Maimonides.','https://templeinstitute.org/illustrated-tour-the-holy-temple/'],
    ['OpenBible.info, 3D Temple Mount','A self contained interactive model with its reasoning and sources published.','https://www.openbible.info/labs/3d-temple-mount/'],
  ],
  choices:[
    ['Two sources, two scales','The platform, its walls and porticoes follow Josephus and the surviving masonry, and are drawn to scale in metres. The inner courts follow the Mishnah tractate Middot in cubits, taken at 52.5 cm as Leen Ritmeyer and OpenBible do, and are placed schematically inside the soreg, since their exact position on the platform is still debated.'],
    ['The soreg and the steps','Middot 2:3 makes the balustrade ten handbreadths high, under a metre; Josephus (War 5.193) says three cubits. It is drawn at 1.3 m, between the two. Middot 2:5 gives fifteen semicircular steps from the Court of the Women to the Nicanor Gate, each half a cubit high and deep; Josephus counts fourteen. Fifteen are built.'],
    ['The altar','Middot 3:1 describes a stepped block: 32 cubits square at the base, 30 above the first cubit, 28 at the ledge, with horns of a cubit at the corners and a ramp 32 cubits long on the south. Josephus gives 50 cubits square and 15 high. The model follows Middot, at about 16 metres square.'],
    ['Where the sanctuary stood','Most reconstructions put the sanctuary over the rock now under the Dome of the Rock, which is where it is here. Minority views move it north to the Dome of the Spirits or south toward the al-Kas fountain.'],
    ['The Royal Stoa','Josephus (Antiquities 15.411-416) counts 162 Corinthian columns in four rows, each so thick that three men could barely reach around it, the side aisles 50 feet high and the nave twice that. A complete column base 1.46 m across survives in the Double Gate passage. That is what is built, at about fifteen metres. The market and money changers Jesus overturned worked here and in the court in front of it.'],
    ['The facade','Middot 4:6 stacks the hundred cubits course by course: six of foundation, forty of wall, forty of upper storey, then gutters, ceilings, a parapet and a cubit of spikes against the birds. Josephus (War 5.207-224) gives the porch opening as seventy cubits high and twenty five wide with no doors, the inner doors fifty five by sixteen, a golden vine over the entrance, and a facade that looked from a distance like a mountain of snow. The gold trim here stands for all of that.'],
    ['What is not shown','The bridge of Wilson’s Arch on the west, the Chamber of Hewn Stone where the Sanhedrin met, the underground passages, and the city around. The Kidron valley drop of 40 metres on the east is flattened.'],
  ],
};
