'use client';
import HtmlView from '../../components/HtmlView.jsx';
import { notes } from '../../lib/views.js';
export default function Page(){ return <HtmlView render={notes} parts={['notes']} />; }
