// The tabernacle in cubits. x runs east, z runs south, y up. Court centred on the origin.
import { materials, helpers, scaleFigure } from './common.js';
export const tabernacleModel={
  id:'tabernacle', diagram:'tabernacle', unit:'cubit', title:'The Tabernacle',
  camera:{ position:[78,42,70], target:[-5,3,0] },
  toggles:[['coverings','Coverings',true],['court','Courtyard curtains',true],['figure','Scale figure',true],['labels','Labels',false]],
  labels:[['ark','Ark',[-35,3,0]],['incense','Altar of incense',[-28.5,3.5,0]],['table','Table',[-20,2.8,-3.5]],['lamp','Lampstand',[-20,4.6,3.5]],['altar','Altar of burnt offering',[15,5,0]],['laver','Basin',[2,3,0]],['gate','Gate',[50,6.5,0]],['mostholy','Most Holy Place',[-35,11.5,0]],['holy','Holy Place',[-20,11.5,0]]],
  build(THREE){
    const parts=[]; const mats=materials(THREE); const H=helpers(THREE,parts); const root=new THREE.Group(); const layers={};
    const L=id=>{ if(!layers[id]){ layers[id]=new THREE.Group(); root.add(layers[id]); } return layers[id]; };
    // Ground
    const ground=new THREE.Mesh(new THREE.PlaneGeometry(240,170),mats.sand); ground.rotation.x=-Math.PI/2; ground.receiveShadow=true; root.add(ground);
    // Courtyard: 60 pillars every 5 cubits, hangings 5 high (Exodus 27:9-19)
    const court=L('court'); const posts=[];
    for(let x=-50;x<=50;x+=5){ posts.push([x,-25]); posts.push([x,25]); }
    for(let z=-20;z<=20;z+=5){ posts.push([-50,z]); posts.push([50,z]); }
    posts.forEach(([x,z])=>{ court.add(H.cyl(0.2,0.22,5,mats.bronze,x,0,z,'court',12)); court.add(H.box(0.8,0.35,0.8,mats.bronze,x,0,z,'court')); court.add(H.cyl(0.26,0.22,0.3,mats.silver,x,5,z,'court',12)); });
    // north and south hangings
    for(let x=-50;x<50;x+=5){ court.add(H.panelBetween([x,-25],[x+5,-25],5,mats.linen,'court')); court.add(H.panelBetween([x,25],[x+5,25],5,mats.linen,'court')); }
    for(let z=-25;z<25;z+=5){ court.add(H.panelBetween([-50,z],[-50,z+5],5,mats.linen,'court')); if(z<-10||z>=10) court.add(H.panelBetween([50,z],[50,z+5],5,mats.linen,'court')); }
    // the gate: 20 cubits of woven screen on four pillars
    court.add(H.panelBetween([50,-10],[50,10],5,mats.screen,'gate',0.12));
    // Altar of burnt offering 5 x 5 x 3 with horns and a ledge (Exodus 27:1-8)
    const A=L('furniture');
    A.add(H.box(5,3,5,mats.bronze,15,0,0,'altar')); A.add(H.box(6.2,0.25,6.2,mats.bronze,15,1.5,0,'altar'));
    [[-2.3,-2.3],[2.3,-2.3],[-2.3,2.3],[2.3,2.3]].forEach(([dx,dz])=>A.add(H.box(0.4,0.7,0.4,mats.bronze,15+dx,3,dz,'altar')));
    A.add(H.rod(7,0.12,mats.acacia,15,2.6,-2.8,'x','altar')); A.add(H.rod(7,0.12,mats.acacia,15,2.6,2.8,'x','altar'));
    A.add(H.box(3.6,0.5,3.6,mats.flame,15,3,0,'altar'));
    const fire=new THREE.PointLight(0xff9a3c,60,30,2); fire.position.set(15,4.5,0); A.add(fire);
    // Basin (Exodus 30:17-21)
    A.add(H.cyl(0.7,0.9,1.1,mats.bronze,2,0,0,'laver',20)); const bowl=new THREE.Mesh(new THREE.LatheGeometry([new THREE.Vector2(0.6,0),new THREE.Vector2(1.9,0.5),new THREE.Vector2(2.2,1.2),new THREE.Vector2(2.0,1.3)],28),mats.bronze); bowl.position.set(2,1.1,0); H.tag(bowl,'laver'); A.add(bowl);
    const water=new THREE.Mesh(new THREE.CircleGeometry(1.95,28),mats.water); water.rotation.x=-Math.PI/2; water.position.set(2,2.25,0); A.add(water);
    // The tent: 48 gold plated boards 1.5 x 10 x 0.5 in silver bases (Exodus 26:15-30)
    const T=L('tent');
    for(let i=0;i<20;i++){ const x=-40+0.75+i*1.5; [-5,5].forEach(z=>{ T.add(H.box(1.45,10,0.5,mats.gold,x,0,z,'tent')); T.add(H.box(0.5,0.4,0.9,mats.silver,x-0.35,0,z,'tent')); T.add(H.box(0.5,0.4,0.9,mats.silver,x+0.35,0,z,'tent')); }); }
    for(let i=0;i<8;i++){ const z=-5+0.625+i*1.25; T.add(H.box(0.5,10,1.2,mats.gold,-40,0,z,'tent')); T.add(H.box(0.9,0.4,0.5,mats.silver,-40,0,z-0.3,'tent')); T.add(H.box(0.9,0.4,0.5,mats.silver,-40,0,z+0.3,'tent')); }
    [1.5,3.5,5.5,7.5,9.5].forEach(y=>{ [-5.45,5.45].forEach(z=>T.add(H.rod(30,0.14,mats.gold,-25,y,z,'x','tent'))); T.add(H.rod(10,0.14,mats.gold,-40.45,y,0,'z','tent')); });
    // Veil on four pillars, screen on five (Exodus 26:31-37)
    [-3.75,-1.25,1.25,3.75].forEach(z=>{ T.add(H.cyl(0.2,0.2,10,mats.gold,-30,0,z,'veil',10)); T.add(H.box(0.7,0.4,0.7,mats.silver,-30,0,z,'veil')); });
    T.add(H.plane(10,10,mats.veil,-30,0,0,Math.PI/2,'veil'));
    [-4,-2,0,2,4].forEach(z=>{ T.add(H.cyl(0.2,0.2,10,mats.gold,-10,0,z,'screen',10)); T.add(H.box(0.7,0.4,0.7,mats.bronze,-10,0,z,'screen')); });
    T.add(H.plane(10,10,mats.screen,-10,0,0,Math.PI/2,'screen'));
    // Furniture inside
    A.add(H.box(2.5,1.5,1.5,mats.gold,-35,0.4,0,'ark')); A.add(H.box(2.6,0.15,1.6,mats.gold,-35,1.9,0,'ark'));
    [[-1,-0.9],[1,-0.9],[-1,0.9],[1,0.9]].forEach(([dx,dz])=>A.add(H.box(0.5,0.4,0.3,mats.acacia,-35+dx,0,dz,'ark')));
    [-0.95,0.95].forEach(z=>A.add(H.rod(4.5,0.1,mats.gold,-35,1.05,z,'x','ark')));
    [-0.85,0.85].forEach(dx=>{ A.add(H.cyl(0.18,0.22,0.9,mats.gold,-35+dx,2.05,0,'ark',10)); A.add(H.sphere(0.2,mats.gold,-35+dx,3.1,0,'ark')); const w1=H.plane(0.9,0.5,mats.gold,-35+dx*1.05,2.6,-0.45,0,'ark'); w1.rotation.set(-0.6,0,dx>0?-0.7:0.7); A.add(w1); const w2=H.plane(0.9,0.5,mats.gold,-35+dx*1.05,2.6,0.45,0,'ark'); w2.rotation.set(0.6,0,dx>0?-0.7:0.7); A.add(w2); });
    A.add(H.box(1,2,1,mats.gold,-28.5,0,0,'incense')); [[-0.4,-0.4],[0.4,-0.4],[-0.4,0.4],[0.4,0.4]].forEach(([dx,dz])=>A.add(H.box(0.18,0.3,0.18,mats.gold,-28.5+dx,2,dz,'incense'))); A.add(H.box(0.5,0.15,0.5,mats.flame,-28.5,2,0,'incense'));
    A.add(H.box(2,0.15,1,mats.gold,-20,1.35,-3.5,'table')); A.add(H.box(2.1,0.12,1.1,mats.gold,-20,1.5,-3.5,'table')); [[-0.9,-0.4],[0.9,-0.4],[-0.9,0.4],[0.9,0.4]].forEach(([dx,dz])=>A.add(H.box(0.15,1.35,0.15,mats.gold,-20+dx,0,-3.5+dz,'table')));
    for(let s=0;s<2;s++) for(let i=0;i<6;i++) A.add(H.cyl(0.28,0.3,0.12,mats.linen,-20+(s?0.5:-0.5),1.62+i*0.13,-3.5,'table',12));
    // Lampstand: shaft, six branches as half rings, seven flames (Exodus 25:31-40)
    A.add(H.cyl(0.5,0.6,0.2,mats.gold,-20,0,3.5,'lamp',16)); A.add(H.cyl(0.08,0.1,3,mats.gold,-20,0.2,3.5,'lamp',10));
    [0.5,1.0,1.5].forEach(r=>{ const t=new THREE.Mesh(new THREE.TorusGeometry(r,0.055,8,32,Math.PI),mats.gold); t.position.set(-20,3.2,3.5); t.rotation.z=Math.PI; t.castShadow=true; H.tag(t,'lamp'); A.add(t); });
    [-1.5,-1,-0.5,0,0.5,1,1.5].forEach(dx=>{ A.add(H.cyl(0.12,0.07,0.15,mats.gold,-20+dx,3.2,3.5,'lamp',10)); A.add(H.sphere(0.09,mats.flame,-20+dx,3.45,3.5,'lamp')); });
    const glow=new THREE.PointLight(0xffc478,25,18,2); glow.position.set(-20,4,3.5); A.add(glow);
    // Coverings: four layers over the boards (Exodus 26:1-14), each a lid with sides and a west end
    const C=L('coverings');
    [[mats.linen,0.15,'coverings'],[mats.goat,0.5,'coverings'],[mats.ram,0.85,'coverings'],[mats.leather,1.2,'coverings']].forEach(([m,o,id])=>{
      C.add(H.box(30+o*2,0.1,10+o*2+0.9,m,-25,10+o*0.3,0,id));
      [-1,1].forEach(s=>C.add(H.box(30+o*2,9,0.08,m,-25,1.2,s*(5.45+o),id)));
      C.add(H.box(0.08,9,10+o*2+0.9,m,-40.45-o,1.2,0,id));
    });
    // Scale figure by the gate
    L('figure').add(scaleFigure(THREE,H,mats.figure,53,13,4));
    return { group:root, parts, layers };
  },
  partMeta:{ court:'court', gate:'gate', altar:'altar', laver:'laver', tent:'tent', veil:'veil', screen:'screen', ark:'ark', incense:'incense', table:'table', lamp:'lamp', coverings:'tent', figure:null },
  figureNote:'The figure by the gate is a man of average height, four cubits or about 1.8 metres.',
  others:[
    ['Biblical Tabernacle Mishkan','thedeserttabernacle (Aleksandr Sigalov)','CC BY-NC','41d3c771c13a4cbcbc10353536ffec91','The most complete tabernacle on Sketchfab, every piece of furniture, 243,000 triangles.'],
    ['Tabernacle, hand painted','jamethy','CC BY','2c9627a1b3334e0c8fb48078376b94c9','A light low polygon model with the inner curtain’s cherubim shown.'],
    ['The Ark of the Covenant','gizacorp01','CC BY','d8fb87c24f3f40edaf564d770101552c','A detailed ark with cherubim and carrying poles.'],
    ['Golden Menorah','astrogeomanity','CC BY','d182905431c3498f82d50bb4f9e0a8de','The lampstand in the style of the Arch of Titus relief.'],
  ],
  sources:[
    ['Exodus 25 to 27, 30, 36 to 40','The measurements themselves.','/book/exodus/25'],
    ['The full scale tabernacle at Timna Park, Israel','Built to an eighteen inch cubit from Exodus alone, without later tradition. Worth comparing with this model.','https://parktimna.co.il/en/attractions/the-tabernacle/'],
    ['A. R. S. Kennedy, "Tabernacle", Hastings Dictionary of the Bible (1902)','Still the most careful discussion of boards versus frames and of how the coverings hung.','https://biblicalelearning.org/wp-content/uploads/2022/01/Kennedy-Tabernacle-HBD.pdf'],
    ['Aleksandr Sigalov, "The Corner Boards of the Tabernacle", Jewish Bible Quarterly 40 (2012)','On the two corner boards and the shape of the sockets.','https://jbqnew.jewishbible.org/assets/Uploads/403/jbq_403_cornerboards.pdf'],
    ['Michael Homan, To Your Tents, O Israel! (2002)','Compares the tabernacle plan with the war tent of Ramesses II at Kadesh.','https://library.biblicalarchaeology.org/article/the-divine-warrior-in-his-tent/'],
  ],
  choices:[
    ['Boards, not a frame','The Hebrew qerashim in Exodus 26:15 are usually taken as solid boards a cubit and a half wide, which is what is built here. A. R. S. Kennedy and others read them as open lattice frames, which would make the tent lighter and let the inner curtain show through. The Talmud (Shabbat 98b) makes them a cubit thick. The gold plating is the text’s.'],
    ['The silver bases','Ninety six of them, two per board, each a talent of silver, about 34 kilograms (Exodus 38:27). Their shape is never given; a square plinth with the board’s tenons sunk into it is the usual guess and is what is drawn. A talent of silver is only about three litres, so they were shoes, not blocks.'],
    ['How the coverings sat','Exodus gives the curtain sizes but not how they were pitched. Laid flat over a ten cubit frame, the 28 cubit inner curtain covers the roof and hangs nine cubits down each side, a cubit short of the ground, and the 30 cubit goat hair layer reaches the bases (Exodus 26:1-13). That flat reconstruction, held by Keil, Kennedy and most modern scholars, is drawn. James Fergusson’s ridge pole tent, fifteen cubits at the peak with sloping sides, sheds rain better but has no support in the text.'],
    ['The lampstand','Exodus 25 describes six branches from a central shaft with cups, buds and blossoms, but no height. The Arch of Titus shows Herod’s menorah with rounded branches; the proportions here follow it. Some reconstructions prefer straight angled branches.'],
    ['The cherubim','Winged figures at each end of the mercy seat, facing each other with wings spread over it (Exodus 25:18-20). Their form is not described; ancient Near Eastern art suggests composite creatures, and they are drawn simply here.'],
  ],
};
