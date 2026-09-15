'use client';
import HtmlView from '../../components/HtmlView.jsx';
import { places } from '../../lib/views.js';
export default function Page(){ return <HtmlView render={places} parts={['places']} />; }
