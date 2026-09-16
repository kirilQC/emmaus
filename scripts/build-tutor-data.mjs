// Builds the open datasets the tutor retrieves from, into lib/tutor/data/*.json.
// Sources: Berean Standard Bible and Tyndale Open Study Notes book intros via bible.helloao.org (public domain / CC BY-SA 4.0),
// OpenBible.info cross references (CC BY), Theographic Bible Metadata people, places and events (CC BY-SA 4.0).
// Usage: node scripts/build-tutor-data.mjs [path/to/cross_references.txt]
import fs from 'node:fs'; import path from 'node:path';
const OUT=path.join(import.meta.dirname,'..','lib','tutor','data'); fs.mkdirSync(OUT,{ recursive:true });
const API='https://bible.helloao.org/api';
const USFM=['GEN','EXO','LEV','NUM','DEU','JOS','JDG','RUT','1SA','2SA','1KI','2KI','1CH','2CH','EZR','NEH','EST','JOB','PSA','PRO','ECC','SNG','ISA','JER','LAM','EZK','DAN','HOS','JOL','AMO','OBA','JON','MIC','NAM','HAB','ZEP','HAG','ZEC','MAL','MAT','MRK','LUK','JHN','ACT','ROM','1CO','2CO','GAL','EPH','PHP','COL','1TH','2TH','1TI','2TI','TIT','PHM','HEB','JAS','1PE','2PE','1JN','2JN','3JN','JUD','REV'];
const OSIS=['Gen','Exod','Lev','Num','Deut','Josh','Judg','Ruth','1Sam','2Sam','1Kgs','2Kgs','1Chr','2Chr','Ezra','Neh','Esth','Job','Ps','Prov','Eccl','Song','Isa','Jer','Lam','Ezek','Dan','Hos','Joel','Amos','Obad','Jonah','Mic','Nah','Hab','Zeph','Hag','Zech','Mal','Matt','Mark','Luke','John','Acts','Rom','1Cor','2Cor','Gal','Eph','Phil','Col','1Thess','2Thess','1Tim','2Tim','Titus','Phlm','Heb','Jas','1Pet','2Pet','1John','2John','3John','Jude','Rev'];
const osisToUsfm=Object.fromEntries(OSIS.map((o,i)=>[o,USFM[i]]));
async function getJson(u){ for(let i=0;i<4;i++){ try{ const r=await fetch(u); if(r.ok) return await r.json(); }catch(e){} await new Promise(r=>setTimeout(r,500*(i+1))); } throw new Error('failed '+u); }
async function pool(items,n,fn){ const out=new Array(items.length); let i=0; await Promise.all(Array.from({ length:n },async()=>{ while(i<items.length){ const k=i++; out[k]=await fn(items[k],k); } })); return out; }
const flat=c=>{ let out=''; for(const x of c){ const t=typeof x==='string'?x:(x.text||''); if(!t) continue; if(out&&/[A-Za-z0-9.,;:!?’”)]$/.test(out)&&/^[A-Za-z0-9“(]/.test(t)) out+=' '; out+=t; } return out.replace(/\s+/g,' ').trim(); };

// 1. Berean Standard Bible, every verse.
const books=(await getJson(`${API}/BSB/books.json`)).books;
const bsb={}; let nv=0;
for(const b of books){
  const chapters=Array.from({ length:b.numberOfChapters },(_,i)=>i+1);
  const res=await pool(chapters,8,async ch=>{ const j=await getJson(`${API}/BSB/${b.id}/${ch}.json`); const vs={}; for(const item of j.chapter.content){ if(item.type==='verse'){ vs[item.number]=flat(item.content); } } return vs; });
  bsb[b.id]=res; nv+=res.reduce((a,v)=>a+Object.keys(v).length,0);
  process.stdout.write(`\r${b.id} ${nv} verses   `);
}
console.log('\nBSB verses',nv);
fs.writeFileSync(path.join(OUT,'bsb.json'),JSON.stringify(bsb));

// 2. Tyndale Open Study Notes book introductions.
const tyn=(await getJson(`${API}/c/tyndale/books.json`)).books;
const intros={}; for(const b of tyn){ if(USFM.includes(b.id)&&b.introduction) intros[b.id]=b.introduction.replace(/\s+\n/g,'\n').trim(); }
console.log('Tyndale intros',Object.keys(intros).length);
fs.writeFileSync(path.join(OUT,'intros.json'),JSON.stringify(intros));

// 3. OpenBible cross references: top 8 by votes for each source verse.
const xrPath=process.argv[2]||path.join(process.env.HOME,'Downloads','cross_references.txt');
if(fs.existsSync(xrPath)){
  const rows=fs.readFileSync(xrPath,'utf8').split('\n').slice(1).map(l=>l.split('\t')).filter(r=>r.length>=3);
  const by={}; for(const [from,to,votes] of rows){ if(from.includes('-')) continue; (by[from]=by[from]||[]).push([to,+votes]); }
  const xrefs={}; for(const k in by){ xrefs[k]=by[k].sort((a,b)=>b[1]-a[1]).slice(0,8).map(x=>x[0]); }
  console.log('cross refs for',Object.keys(xrefs).length,'verses');
  fs.writeFileSync(path.join(OUT,'xrefs.json'),JSON.stringify(xrefs));
}else console.log('skipping cross references (file not found):',xrPath);

// 4. Theographic people, places, events.
function csv(text){ const rows=[]; let row=[],cell='',q=false; text=text.replace(/^﻿/,''); for(let i=0;i<text.length;i++){ const c=text[i]; if(q){ if(c==='"'){ if(text[i+1]==='"'){ cell+='"'; i++; } else q=false; } else cell+=c; } else if(c==='"') q=true; else if(c===','){ row.push(cell); cell=''; } else if(c==='\n'){ row.push(cell); rows.push(row); row=[]; cell=''; } else if(c!=='\r') cell+=c; } if(cell||row.length){ row.push(cell); rows.push(row); } const h=rows[0]; return rows.slice(1).filter(r=>r.length>1).map(r=>Object.fromEntries(h.map((k,i)=>[k.trim(),r[i]??'']))); }
const RAW='https://raw.githubusercontent.com/robertrouse/theographic-bible-metadata/master/CSV/';
const [peopleRows,placeRows,eventRows]=await Promise.all(['People','Places','Events'].map(async f=>csv(await (await fetch(RAW+f+'.csv')).text())));
const strip=s=>String(s||'').replace(/\[([^\]]+)\]\([^)]*\)/g,'$1').replace(/\s+/g,' ').trim();
const cut=(s,n)=>s.length>n?s.slice(0,n).replace(/\s+\S*$/,'')+'…':s;
const refsOf=s=>String(s||'').split(',').map(x=>x.trim()).filter(x=>/^\w+\.\d+\.\d+/.test(x)&&osisToUsfm[x.split('.')[0]]);
const nameOf=Object.fromEntries(peopleRows.map(p=>[p.personLookup,p.displayTitle||p.name]));
const placeName=Object.fromEntries(placeRows.map(p=>[p.placeLookup,p.displayTitle]));
const names=s=>String(s||'').split(',').map(x=>nameOf[x.trim()]||placeName[x.trim()]).filter(Boolean);
const people=peopleRows.filter(p=>p.displayTitle&&(+p.verseCount>0||p.dictText)).map(p=>({
  id:p.personLookup, name:p.displayTitle, also:p.alsoCalled||'', gender:p.gender||'', group:p.memberOf||'', born:p.birthYear||'', died:p.deathYear||'',
  father:names(p.father)[0]||'', mother:names(p.mother)[0]||'', partners:names(p.partners), children:names(p.children).slice(0,12),
  summary:cut(strip(p.dictText),700), verses:refsOf(p.verses).slice(0,12), count:+p.verseCount||0,
})).sort((a,b)=>b.count-a.count);
const places=placeRows.filter(p=>p.status!=='wip'||p.dictText).filter(p=>p.displayTitle).map(p=>({
  id:p.placeLookup, name:p.displayTitle, type:[p.featureType,p.featureSubType].filter(Boolean).join(' · '), lat:+p.latitude||+p.openBibleLat||null, lon:+p.longitude||+p.openBibleLong||null,
  summary:cut(strip(p.dictText||p.comment),500), verses:refsOf(p.verses).slice(0,12), count:+p.verseCount||0,
})).sort((a,b)=>b.count-a.count);
const events=eventRows.filter(e=>e.title).map(e=>({ id:e.eventID, title:e.title, year:e.startDate||'', verses:refsOf(e.verses).slice(0,6), people:names(e.participants).slice(0,8), places:names(e.locations).slice(0,4), part:e.partOf||'' }));
console.log('people',people.length,'places',places.length,'events',events.length);
fs.writeFileSync(path.join(OUT,'people.json'),JSON.stringify(people));
fs.writeFileSync(path.join(OUT,'places.json'),JSON.stringify(places));
fs.writeFileSync(path.join(OUT,'events.json'),JSON.stringify(events));
for(const f of fs.readdirSync(OUT)) console.log(f,(fs.statSync(path.join(OUT,f)).size/1e6).toFixed(2)+' MB');
