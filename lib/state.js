// Client-side user state: last opened, decks, notes, card status.
// Persists to localStorage immediately and syncs to /api/state (Supabase) when available.
import { SEED_DECK } from './data.js';
const KEY='emmaus:state';
const isBrowser=typeof window!=='undefined';
export const S={
  LAST:{book:'matthew',ch:1},DECKS:[SEED_DECK],NOTES:{},CSTAT:{},REPS:{},DONE:[],updated:0,loaded:false,_t:null,
  async load(){
    if(!isBrowser)return;
    try{const v=localStorage.getItem(KEY);if(v){Object.assign(S,pick(JSON.parse(v)))}}catch(e){}
    try{const r=await fetch('/api/state',{cache:'no-store'});if(r.ok){const j=await r.json();if(j&&j.updated>(S.updated||0))Object.assign(S,pick(j))}}catch(e){}
    S.loaded=true;
  },
  save(){
    if(!isBrowser)return;S.updated=Date.now();
    const data={LAST:S.LAST,DECKS:S.DECKS,NOTES:S.NOTES,CSTAT:S.CSTAT,REPS:S.REPS,DONE:S.DONE,updated:S.updated};
    try{localStorage.setItem(KEY,JSON.stringify(data))}catch(e){}
    clearTimeout(S._t);S._t=setTimeout(()=>{fetch('/api/state',{method:'PUT',headers:{'content-type':'application/json'},body:JSON.stringify(data)}).catch(()=>{})},800);
  }
};
function pick(j){const o={};for(const k of ['LAST','DECKS','NOTES','CSTAT','REPS','DONE','updated'])if(j[k]!==undefined)o[k]=j[k];return o}
