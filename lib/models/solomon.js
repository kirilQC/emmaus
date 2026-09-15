// Solomon's temple in cubits. x east, z south, y up. The house sits on a two cubit podium in a paved inner court.
import { materials, helpers, scaleFigure } from './common.js';
export const solomonModel={
  id:'solomon-temple', diagram:'solomon-temple', unit:'cubit', title:'Solomon’s Temple',
  camera:{ position:[118,58,98], target:[12,10,0] }, shadowSize:160, maxDistance:600,
  toggles:[['roof','Roof and ceilings',true],['court','Court wall',true],['figure','Scale figure',true],['labels','Labels',false]],
  labels:[['debir','Most Holy Place',[-20,34,0]],['hekal','Holy Place',[10,34,0]],['porch','Porch',[35,34,0]],['jachin','Jachin',[41.5,26,7]],['boaz','Boaz',[41.5,26,-7]],['altar','Bronze altar',[58,13,0]],['sea','Bronze sea',[60,9,20]],['side-n','Side chambers',[0,18,-15]]],
  build(THREE){
    const parts=[]; const mats=materials(THREE); const H=helpers(THREE,parts); const root=new THREE.Group(); const layers={};
    const L=id=>{ if(!layers[id]){ layers[id]=new THREE.Group(); root.add(layers[id]); } return layers[id]; };
    const ground=new THREE.Mesh(new THREE.PlaneGeometry(400,300),mats.sand); ground.rotation.x=-Math.PI/2; ground.position.y=-0.05; ground.receiveShadow=true; root.add(ground);
    // Inner court: pavement and a low wall of three courses of stone and cedar (1 Kings 6:36)
    const court=L('court'); const fl=H.box(130,0.3,66,mats.pavement,12,-0.3,0,'court'); root.add(fl);
    [[-53,0,0.5,66],[77,0,0.5,66]].forEach(([x,z,w,d])=>court.add(H.box(w,3,d,mats.stone,x,0,z,'court')));
    [[12,-33,130,0.5],[12,33,130,0.5]].forEach(([x,z,w,d])=>court.add(H.box(w,3,d,mats.stone,x,0,z,'court')));
    [[-53,0,0.7,66],[77,0,0.7,66],[12,-33,130,0.7],[12,33,130,0.7]].forEach(([x,z,w,d])=>court.add(H.box(w,0.5,d,mats.cedar,x,3,z,'court')));
    // Podium and the house: interior 60 x 20 x 30, walls 1 cubit (1 Kings 6:2)
    const house=L('house');
    house.add(H.box(80,2,32,mats.stone,4,0,0,'hekal'));
    const Y=2; // floor level
    // walls: west, north, south; east wall with door opening into the porch
    house.add(H.box(1,30,22,mats.stone,-30.5,Y,0,'debir'));
    house.add(H.box(62,30,1,mats.stone,0,Y,-10.5,'hekal')); house.add(H.box(62,30,1,mats.stone,0,Y,10.5,'hekal'));
    [[-7.5,5],[7.5,5]].forEach(([z,w])=>house.add(H.box(1,30,w,mats.stone,30.5,Y,z,'porch'))); house.add(H.box(1,10,10,mats.stone,30.5,Y+20,0,'porch'));
    // gold lining and floor inside (1 Kings 6:20-22, 30)
    house.add(H.box(60,0.2,20,mats.goldDull,0,Y,0,'hekal'));
    house.add(H.box(0.2,29.6,20,mats.goldDull,-29.9,Y+0.2,0,'debir')); house.add(H.box(60,29.6,0.2,mats.goldDull,0,Y+0.2,-9.9,'hekal')); house.add(H.box(60,29.6,0.2,mats.goldDull,0,Y+0.2,9.9,'hekal'));
    // partition between debir and hekal with olive wood doors (1 Kings 6:31-32); debir is a 20 cubit cube so its ceiling is lower
    house.add(H.box(0.6,30,5,mats.goldDull,-10,Y,-7.5,'debir')); house.add(H.box(0.6,30,5,mats.goldDull,-10,Y,7.5,'debir')); house.add(H.box(0.6,10,10,mats.goldDull,-10,Y+20,0,'debir'));
    [[-4,1],[4,-1]].forEach(([z,s])=>{ const d=H.box(0.3,18,4.6,mats.olive,-10+s*2.2,Y,z+s*0.6,'debir'); d.rotation.y=s*0.9; house.add(d); });
    [[-4,1],[4,-1]].forEach(([z,s])=>{ const d=H.box(0.3,20,4.8,mats.olive,30.5+s*2.4,Y,z+s*0.8,'porch'); d.rotation.y=s*1.0; house.add(d); });
    // windows, narrow and high (1 Kings 6:4)
    for(let x=-25;x<=25;x+=6.25){ [-10.55,10.55].forEach(z=>house.add(H.box(1.2,4,0.5,mats.dark,x,Y+22,z,'hekal'))); }
    // side chambers, three storeys of 5, 6 and 7 cubits (1 Kings 6:5-10)
    const S=L('side'); [[0,5,'side-n',-1],[1,6,'side-n',-1],[2,7,'side-n',-1],[0,5,'side-s',1],[1,6,'side-s',1],[2,7,'side-s',1]].forEach(([i,w,id,sgn])=>S.add(H.box(62,5,w,mats.stoneDark,0,Y+i*5,sgn*(11+w/2),id)));
    [[0,5],[1,6],[2,7]].forEach(([i,w])=>S.add(H.box(w,5,22+2*(5+i),mats.stoneDark,-31-w/2,Y+i*5,0,'side-w')));
    // small doors into the chambers on the south side
    S.add(H.box(2,3,0.6,mats.dark,20,Y,16.3,'side-s'));
    // Porch 20 x 10 with two free standing pillars, 18 high with 5 cubit capitals (1 Kings 7:15-22)
    house.add(H.box(10,1,22,mats.stone,36,Y-1,0,'porch')); house.add(H.box(10,30,1,mats.stone,36,Y,-10.5,'porch')); house.add(H.box(10,30,1,mats.stone,36,Y,10.5,'porch'));
    for(let i=0;i<3;i++) house.add(H.box(2,0.7,22,mats.stone,42+i*2,Y-1-(i+1)*0.7,0,'porch'));
    [['jachin',7],['boaz',-7]].forEach(([id,z])=>{ house.add(H.cyl(1.9,1.9,18,mats.bronze,41.5,Y-1,z,id,28)); house.add(H.cyl(2.7,1.9,2.5,mats.bronze,41.5,Y+17,z,id,28)); const t=new THREE.Mesh(new THREE.TorusGeometry(2.6,0.35,10,32),mats.bronze); t.position.set(41.5,Y+20.3,z); t.rotation.x=Math.PI/2; H.tag(t,id); house.add(t); house.add(H.cyl(3.2,2.4,1.8,mats.bronze,41.5,Y+20.6,z,id,28)); for(let k=0;k<24;k++){ const a=k/24*Math.PI*2; house.add(H.sphere(0.28,mats.bronze,41.5+Math.cos(a)*2.9,Y+20.3,z+Math.sin(a)*2.9,id)); } });
    // Roof and ceilings (cedar beams, 1 Kings 6:9)
    const R=L('roof'); R.add(H.box(62,1,22,mats.cedar,0,Y+30,0,'hekal')); R.add(H.box(62,1.2,0.6,mats.stone,0,Y+31,-10.7,'hekal')); R.add(H.box(62,1.2,0.6,mats.stone,0,Y+31,10.7,'hekal')); R.add(H.box(0.6,1.2,22,mats.stone,-30.7,Y+31,0,'debir'));
    R.add(H.box(10,1,22,mats.cedar,36,Y+30,0,'porch')); R.add(H.box(20,1,10,mats.cedar,-20,Y+20,0,'debir'));
    [[0,5],[1,6],[2,7]].forEach(([i,w])=>{ [-1,1].forEach(sgn=>R.add(H.box(62,0.6,w,mats.cedar,0,Y+5+i*5,sgn*(11+w/2),'side-n'))); R.add(H.box(w,0.6,22+2*(5+i),mats.cedar,-31-w/2,Y+5+i*5,0,'side-w')); });
    // Inside the Most Holy Place: the ark under two cherubim ten cubits high (1 Kings 6:23-28)
    const F=L('furniture');
    F.add(H.box(2.5,1.5,1.5,mats.gold,-20,Y,0,'ark')); F.add(H.box(2.6,0.15,1.6,mats.gold,-20,Y+1.5,0,'ark')); [-0.95,0.95].forEach(z=>F.add(H.rod(5,0.1,mats.gold,-20,Y+1.05,z,'x','ark')));
    [-5,5].forEach(z=>{ F.add(H.cyl(1,1.2,6,mats.gold,-20,Y,z,'ark',16)); F.add(H.sphere(0.9,mats.gold,-20,Y+6.9,z,'ark')); const w1=H.box(0.3,2.5,4.8,mats.gold,-20,Y+6,z+(z>0?2.6:-2.6),'ark'); w1.rotation.x=z>0?-0.35:0.35; F.add(w1); const w2=H.box(0.3,2.5,4.8,mats.gold,-20,Y+6.2,z+(z>0?-2.5:2.5),'ark'); w2.rotation.x=z>0?0.5:-0.5; F.add(w2); });
    // Holy Place: golden altar before the inner doors, ten tables north, ten lampstands south (1 Kings 7:48-49)
    F.add(H.box(1,2,1,mats.gold,-7,Y,0,'gold-altar'));
    for(let i=0;i<5;i++){ const x=-4+i*7; F.add(H.box(2,0.15,1,mats.gold,x,Y+1.35,-7.5,'tables')); [[-0.9,-0.4],[0.9,-0.4],[-0.9,0.4],[0.9,0.4]].forEach(([dx,dz])=>F.add(H.box(0.12,1.35,0.12,mats.gold,x+dx,Y,-7.5+dz,'tables'))); }
    for(let i=0;i<5;i++){ const x=-4+i*7; F.add(H.cyl(0.45,0.55,0.2,mats.gold,x,Y,7.5,'lamps',12)); F.add(H.cyl(0.08,0.1,3,mats.gold,x,Y+0.2,7.5,'lamps',8)); [0.5,1.0,1.5].forEach(r=>{ const t=new THREE.Mesh(new THREE.TorusGeometry(r,0.05,6,24,Math.PI),mats.gold); t.position.set(x,Y+3.2,7.5); t.rotation.z=Math.PI; H.tag(t,'lamps'); F.add(t); }); [-1.5,-1,-0.5,0,0.5,1,1.5].forEach(dx=>F.add(H.sphere(0.09,mats.flame,x+dx,Y+3.4,7.5,'lamps'))); }
    const glow=new THREE.PointLight(0xffc478,40,40,2); glow.position.set(5,Y+8,5); F.add(glow);
    // Outside: bronze altar 20 x 20 x 10 east of the porch (2 Chronicles 4:1) with a ramp
    const O=L('outside'); O.add(H.box(20,10,20,mats.bronze,60,0,0,'altar')); O.add(H.box(21,0.6,21,mats.bronze,60,5,0,'altar'));
    [[-9,-9],[9,-9],[-9,9],[9,9]].forEach(([dx,dz])=>O.add(H.box(1.2,1.4,1.2,mats.bronze,60+dx,10,dz,'altar')));
    const ramp=H.box(6,1,20,mats.stone,60,4.5,19.5,'altar'); ramp.rotation.x=-Math.atan2(10,20); ramp.position.y=5; O.add(ramp);
    O.add(H.box(12,0.6,12,mats.flame,60,10,0,'altar')); const fire=new THREE.PointLight(0xff9a3c,120,60,2); fire.position.set(60,13,0); O.add(fire);
    // Bronze sea on twelve oxen at the south east (1 Kings 7:23-26, 39)
    const sea=new THREE.Mesh(new THREE.SphereGeometry(5,32,16,0,Math.PI*2,Math.PI/2,Math.PI/2),mats.bronze); sea.position.set(60,5.6,20); sea.material=mats.bronze; H.tag(sea,'sea'); O.add(sea); O.add(H.cyl(5.2,5.2,0.6,mats.bronze,60,5.3,20,'sea',32)); const water=new THREE.Mesh(new THREE.CircleGeometry(4.9,32),mats.water); water.rotation.x=-Math.PI/2; water.position.set(60,5.75,20); O.add(water);
    for(let k=0;k<12;k++){ const a=k/12*Math.PI*2; const ox=H.box(1.1,1.4,2.4,mats.bronze,60+Math.cos(a)*3.6,0,20+Math.sin(a)*3.6,'sea'); ox.rotation.y=-a; O.add(ox); const hd=H.box(0.8,0.8,0.8,mats.bronze,60+Math.cos(a)*4.9,0.9,20+Math.sin(a)*4.9,'sea'); hd.rotation.y=-a; O.add(hd); }
    // Ten basins on wheeled stands, five each side (1 Kings 7:27-39)
    for(let i=0;i<5;i++){ [[-18,'lavers-n'],[18,'lavers-s']].forEach(([z,id])=>{ const x=36+i*4; O.add(H.box(4,3,4,mats.bronze,x,0.8,z,id)); [[-1.6,-1.6],[1.6,-1.6],[-1.6,1.6],[1.6,1.6]].forEach(([dx,dz])=>{ const w=new THREE.Mesh(new THREE.TorusGeometry(0.7,0.15,8,16),mats.bronze); w.position.set(x+dx,0.8,z+dz); w.rotation.y=Math.PI/2; H.tag(w,id); O.add(w); }); const b=new THREE.Mesh(new THREE.LatheGeometry([new THREE.Vector2(0.6,0),new THREE.Vector2(1.8,0.6),new THREE.Vector2(2.0,1.4)],20),mats.bronze); b.position.set(x,3.8,z); H.tag(b,id); O.add(b); }); }
    L('figure').add(scaleFigure(THREE,H,mats.figure,72,-8,4));
    return { group:root, parts, layers };
  },
  partMeta:{ court:'court', hekal:'hekal', debir:'debir', porch:'porch', jachin:'jachin', boaz:'boaz', 'side-n':'side-n', 'side-s':'side-s', 'side-w':'side-w', ark:'ark', 'gold-altar':'gold-altar', tables:'tables', lamps:'lamps', altar:'altar', sea:'sea', 'lavers-n':'lavers-n', 'lavers-s':'lavers-s', figure:null },
  figureNote:'The figure beside the altar is a man of average height, four cubits or about 1.8 metres. The altar is ten cubits high.',
  others:[
    ['Jerusalem in the First Temple period, Bible Lands Museum','moshecaine','CC BY','1f6b15ceb017484b859b17875c14ce5a','A photogrammetry scan of the museum’s model of Solomon’s Jerusalem and temple.'],
    ['Solomon’s Temple','Mahlerin','CC BY-SA','97a4c0e253124ec7bfdc2b96623a37b4','A detailed exterior with porch, pillars and side chambers.'],
  ],
  sources:[
    ['1 Kings 6 to 7 and 2 Chronicles 3 to 4','The two accounts, read side by side.','/book/1-kings/6'],
    ['John Monson, "The New Ain Dara Temple: Closest Solomonic Parallel", Biblical Archaeology Review','A Syrian temple with the same tripartite plan, porch columns and multi storey side chambers, thirty shared features in all.','https://library.biblicalarchaeology.org/article/the-new-ain-dara-temple-closest-solomonic-parallel/'],
    ['Mumcuoglu and Garfinkel, "The Doorways of Solomon’s Temple"','Reads the puzzling door descriptions as recessed frames, three at the porch, four at the Holy Place, five at the Most Holy.','https://www.biblicalarchaeology.org/daily/biblical-artifacts/artifacts-and-the-bible/the-doorways-of-solomons-temple/'],
    ['Encyclopaedia Judaica, "Jachin and Boaz"','The capitals part by part: lily, network, pomegranates, bowl, with their Iron Age parallels.','https://www.jewishvirtuallibrary.org/jachin-and-boaz'],
    ['Leen Ritmeyer, Solomon’s Temple in 3D','A leading archaeological reconstruction, with the temple set on its platform.','https://ritmeyer.com/2018/07/22/3d-model-solomons-temple-explained/'],
  ],
  choices:[
    ['Wall thickness and podium','1 Kings gives interior dimensions only. Walls of one cubit and a two cubit podium with steps are assumed, following the pattern of excavated Syrian temples of the same plan (Ain Dara, Tell Tayinat).'],
    ['The porch height','2 Chronicles 3:4 gives 120 cubits, which would make the porch a tower four times the height of the house. Most scholars and most ancient versions read 20, and the porch here is level with the roof.'],
    ['The cherubim','Ten cubits high with five cubit wings meeting in the middle of the room and touching the walls (1 Kings 6:24-27). Their shape is not given; they are drawn as standing winged figures, following ancient Near Eastern throne guardians.'],
    ['Where the altar stood','Neither Kings nor Chronicles fixes the altar’s position. It is set east of the porch on the axis of the entrance, as in the tabernacle and the later temple. The ramp on the south follows later Jewish practice; Ezekiel 43:17 has steps on the east.'],
    ['Carving and colour','The cedar panels were carved with gourds, open flowers, palm trees and cherubim and overlaid with gold (1 Kings 6:18, 29). The gold is shown; the carving is beyond this model.'],
  ],
};
