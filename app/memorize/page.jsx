'use client';
import HtmlView from '../../components/HtmlView.jsx';
import { memorize } from '../../lib/views.js';
export default function Page(){ return <HtmlView render={memorize} parts={['memorize']} />; }
