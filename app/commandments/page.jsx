'use client';
import HtmlView from '../../components/HtmlView.jsx';
import { commandments } from '../../lib/views.js';
export default function Page(){ return <HtmlView render={commandments} parts={['commandments']} />; }
