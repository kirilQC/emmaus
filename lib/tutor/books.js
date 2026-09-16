// One table for the three reference systems the open datasets use: Emmaus names, USFM codes (HelloAO), OSIS codes (OpenBible, Theographic).
import { BOOKS } from '../data.js';
const T=[
 ['Genesis','GEN','Gen'],['Exodus','EXO','Exod'],['Leviticus','LEV','Lev'],['Numbers','NUM','Num'],['Deuteronomy','DEU','Deut'],['Joshua','JOS','Josh'],['Judges','JDG','Judg'],['Ruth','RUT','Ruth'],['1 Samuel','1SA','1Sam'],['2 Samuel','2SA','2Sam'],['1 Kings','1KI','1Kgs'],['2 Kings','2KI','2Kgs'],['1 Chronicles','1CH','1Chr'],['2 Chronicles','2CH','2Chr'],['Ezra','EZR','Ezra'],['Nehemiah','NEH','Neh'],['Esther','EST','Esth'],['Job','JOB','Job'],['Psalms','PSA','Ps'],['Proverbs','PRO','Prov'],['Ecclesiastes','ECC','Eccl'],['Song of Songs','SNG','Song'],['Isaiah','ISA','Isa'],['Jeremiah','JER','Jer'],['Lamentations','LAM','Lam'],['Ezekiel','EZK','Ezek'],['Daniel','DAN','Dan'],['Hosea','HOS','Hos'],['Joel','JOL','Joel'],['Amos','AMO','Amos'],['Obadiah','OBA','Obad'],['Jonah','JON','Jonah'],['Micah','MIC','Mic'],['Nahum','NAM','Nah'],['Habakkuk','HAB','Hab'],['Zephaniah','ZEP','Zeph'],['Haggai','HAG','Hag'],['Zechariah','ZEC','Zech'],['Malachi','MAL','Mal'],
 ['Matthew','MAT','Matt'],['Mark','MRK','Mark'],['Luke','LUK','Luke'],['John','JHN','John'],['Acts','ACT','Acts'],['Romans','ROM','Rom'],['1 Corinthians','1CO','1Cor'],['2 Corinthians','2CO','2Cor'],['Galatians','GAL','Gal'],['Ephesians','EPH','Eph'],['Philippians','PHP','Phil'],['Colossians','COL','Col'],['1 Thessalonians','1TH','1Thess'],['2 Thessalonians','2TH','2Thess'],['1 Timothy','1TI','1Tim'],['2 Timothy','2TI','2Tim'],['Titus','TIT','Titus'],['Philemon','PHM','Phlm'],['Hebrews','HEB','Heb'],['James','JAS','Jas'],['1 Peter','1PE','1Pet'],['2 Peter','2PE','2Pet'],['1 John','1JN','1John'],['2 John','2JN','2John'],['3 John','3JN','3John'],['Jude','JUD','Jude'],['Revelation','REV','Rev'],
];
export const BOOK_TABLE=T.map(([name,usfm,osis])=>{ const b=BOOKS.find(x=>x.name===name); return { name, usfm, osis, slug:b.slug, ch:b.ch }; });
export const byUsfm=Object.fromEntries(BOOK_TABLE.map(b=>[b.usfm,b]));
export const byOsis=Object.fromEntries(BOOK_TABLE.map(b=>[b.osis,b]));
export const byName=Object.fromEntries(BOOK_TABLE.map(b=>[b.name,b]));
export const bySlug=Object.fromEntries(BOOK_TABLE.map(b=>[b.slug,b]));
const ALIAS={Psalm:'Psalms','Song of Solomon':'Song of Songs',Canticles:'Song of Songs',Philem:'Philemon',Revelations:'Revelation'};
export const bookFromName=n=>byName[ALIAS[n]||n];
// "Gen.1.1" or "Gen.1.1-Gen.1.5" -> { book, ch, v1, v2 } or null
export function parseOsis(ref){ const m=String(ref).match(/^(\w+)\.(\d+)\.(\d+)(?:-(\w+)\.(\d+)\.(\d+))?$/); if(!m) return null; const b=byOsis[m[1]]; if(!b) return null; const v2=m[4]&&m[4]===m[1]&&+m[5]===+m[2]?+m[6]:+m[3]; return { book:b, ch:+m[2], v1:+m[3], v2 }; }
export const label=({ book, ch, v1, v2 })=>`${book.name} ${ch}${v1?':'+v1+(v2&&v2!==v1?'-'+v2:''):''}`;
