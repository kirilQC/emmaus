// Content pipeline: writes a book overview + chapter summaries in the Matthew format.
// Usage: OPENAI_API_KEY=... node scripts/generate-book.mjs "Mark"
// Output: content/<slug>.json, reviewed by you, then imported into lib/data.js.
import OpenAI from 'openai';
import { writeFileSync, mkdirSync } from 'node:fs';
import { BOOKS, MT, THESES } from '../lib/data.js';
const name=process.argv[2]; const b=BOOKS.find(x=>x.name===name);
if(!b){ console.error('Unknown book. Example: node scripts/generate-book.mjs "Mark"'); process.exit(1); }
const client=new OpenAI();const MODEL=process.env.OPENAI_MODEL||'gpt-5';
const example={ thesis:MT.thesis, why:MT.why, ctx:MT.ctx, themes:MT.themes, sections:MT.sections.map(([n,a,z,t])=>({name:n,from:a,to:z,type:t})), ch:MT.ch.slice(0,3).map(c=>({n:c[0],title:c[1],type:c[2],summary:c[3],keyVerse:c[4],tags:c[5]})) };
const prompt=`Write the Emmaus overview for the book of ${b.name} (${b.ch} chapters, ${b.genre}). Follow EXACTLY the JSON shape of this Matthew example, producing all ${b.ch} chapters in "ch":
${JSON.stringify(example,null,1)}

Requirements:
- thesis: one sentence. Start from this one and improve it if you can: "${THESES[b.name]}"
- why: four [title, paragraph] pairs on why the book matters.
- ctx: six [label, headline, nuance] triples with labels exactly: "Who wrote it", "When", "For whom", "Where from", "Why", "Built from". Where scholars disagree, say so plainly and give both views.
- themes: five [name, icon, one line] with icon from: crown, scroll, road, scales, globe, heart, flame, lamp, key, bread, tablets, star, mountain, seed, fish, letter, map, harp.
- sections: the book's movements as {name, from, to, type} covering every chapter once; type is one of inf (opening), disc (teaching or speech), narr (narrative), pass (climax or ending).
- ch: for every chapter, {n, title (2 to 5 words), type, summary (one or two sentences, specific, naming people and places), keyVerse ("chapter:verse"), tags {people:[], parables:[], events:[], teachings:[], places:[]}} using only names that actually appear in the chapter.
- Plain prose, no em dashes or en dashes anywhere, British spelling.
Return only JSON.`;
const res=await client.responses.create({ model:MODEL, input:prompt, text:{ format:{ type:'json_object' } } });
const text=res.output_text;
const json=JSON.parse(text.slice(text.indexOf('{'),text.lastIndexOf('}')+1));
if(!Array.isArray(json.ch)||json.ch.length!==b.ch) console.warn(`Expected ${b.ch} chapters, got ${json.ch&&json.ch.length}`);
mkdirSync('content',{ recursive:true }); writeFileSync(`content/${b.slug}.json`,JSON.stringify(json,null,2));
console.log(`Wrote content/${b.slug}.json (${json.ch.length} chapters). Review it, then import.`);
