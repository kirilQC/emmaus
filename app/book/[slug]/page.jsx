'use client';
import { use } from 'react';
import HtmlView from '../../../components/HtmlView.jsx';
import { book } from '../../../lib/views.js';
export default function Page({ params }){ const { slug } = use(params); return <HtmlView render={()=>book(slug)} parts={['book',slug]} />; }
