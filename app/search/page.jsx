'use client';
import { Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import HtmlView from '../../components/HtmlView.jsx';
import { search } from '../../lib/views.js';
function Inner(){ const q=useSearchParams().get('q')||''; return <HtmlView render={()=>search(encodeURIComponent(q))} parts={['search',q]} />; }
export default function Page(){ return <Suspense fallback={null}><Inner/></Suspense>; }
