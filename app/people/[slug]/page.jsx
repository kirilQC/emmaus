'use client';
import { use } from 'react';
import HtmlView from '../../../components/HtmlView.jsx';
import { person } from '../../../lib/views.js';
export default function Page({ params }){ const { slug } = use(params); return <HtmlView render={()=>person(slug)} parts={['people',slug]} />; }
