'use client';
import { Suspense } from 'react';
import Tutor from '../../components/Tutor.jsx';
export default function Page(){ return <Suspense fallback={null}><Tutor/></Suspense>; }
