'use client';
import HtmlView from '../../components/HtmlView.jsx';
import { explore } from '../../lib/views.js';
export default function Page(){ return <HtmlView render={explore} parts={['explore']} />; }
