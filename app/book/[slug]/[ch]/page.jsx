'use client';
import { use, useState } from 'react';
import { createPortal } from 'react-dom';
import HtmlView from '../../../../components/HtmlView.jsx';
import NltText from '../../../../components/NltText.jsx';
import { chapter } from '../../../../lib/views.js';
export default function Page({ params }){
  const { slug, ch } = use(params);
  const [mount,setMount]=useState(null);
  return <>
    <HtmlView render={()=>chapter(slug,ch)} parts={['book',slug,ch]} onRendered={()=>setMount(document.getElementById('nlt-mount'))} />
    {mount && createPortal(<NltText book={mount.dataset.book} ch={mount.dataset.ch} />, mount)}
  </>;
}
