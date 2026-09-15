'use client';
import HtmlView from '../../components/HtmlView.jsx';
import { library } from '../../lib/views.js';
export default function Page(){ return <HtmlView render={library} parts={['library']} />; }
