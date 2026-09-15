'use client';
import { useEffect, useRef, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { S } from '../lib/state.js';
import { wire } from '../lib/wire.js';
import { bySlug } from '../lib/views.js';

// Renders a string-built page, wires its behaviour, and turns internal links into client navigation.
export default function HtmlView({ render, parts = [], onRendered }) {
  const router = useRouter();
  const [ready, setReady] = useState(S.loaded);
  const [tick, setTick] = useState(0);
  const ref = useRef(null);
  useEffect(() => { if (!S.loaded) S.load().then(() => setReady(true)); }, []);
  const html = ready ? render() : '';
  useEffect(() => {
    if (!ready) return;
    wire(parts, { rerender: () => setTick(t => t + 1), navigate: p => router.push(p) });
    document.querySelectorAll('.sect').forEach((el, i) => el.style.animationDelay = Math.min(80 + i * 60, 560) + 'ms');
    if (window.__bg) { const b = (parts[0] === 'book') && bySlug(parts[1]); window.__bg.setTint(b ? b.col : null); }
    if (onRendered) onRendered(ref.current);
  }, [html, ready, tick, parts.join('/')]);
  const onClick = useCallback(e => {
    const a = e.target.closest('a[href]'); if (!a) return;
    const href = a.getAttribute('href');
    if (!href || href.startsWith('http') || href.startsWith('#') || a.target === '_blank') return;
    e.preventDefault(); router.push(href);
  }, [router]);
  if (!ready) return <div className="wrap"><div className="note">Loading…</div></div>;
  return <div ref={ref} onClick={onClick} dangerouslySetInnerHTML={{ __html: html }} />;
}
