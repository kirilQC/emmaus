'use client';
import HtmlView from '../../components/HtmlView.jsx';
import { timeline } from '../../lib/views.js';
export default function Page(){ return <HtmlView render={timeline} parts={['timeline']} />; }
