'use client';
import { useRouter } from 'next/navigation';
import { S } from '../../lib/state.js';
import { ico } from '../../lib/icons.js';
// Sends a question to the tutor, first pointing the tutor at the study's own passage.
export default function AskChip({ q, book, ch, label='Ask the tutor' }){
  const router=useRouter();
  async function go(e){ e.preventDefault(); if(!S.loaded) await S.load(); if(book&&ch){ S.LAST={ book, ch }; S.save(); } router.push('/tutor?q='+encodeURIComponent(q)); }
  return <a className="chip" href={'/tutor?q='+encodeURIComponent(q)} onClick={go}><span dangerouslySetInnerHTML={{ __html:ico('spark',12) }}/>{label}</a>;
}
