"use client";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import Icon from "./Icon.jsx";
import { findPassage } from "../lib/passage.js";
const LINKS = [
  ["/", "Canon", "book"],
  ["/explore", "Explore", "compass"],
  ["/memorize", "Memorise", "cards"],
  ["/reference", "Reference", "map"],
  ["/notes", "Notes", "pen"],
  ["/library", "Library", "shelf"],
  ["/tutor", "Tutor", "heart"],
];
export default function Nav() {
  const path = usePathname();
  const router = useRouter();
  const inp = useRef(null);
  const menuButton = useRef(null);
  const [expanded, setExpanded] = useState(false);
  useEffect(() => setExpanded(false), [path]);
  useEffect(() => {
    const h = (e) => {
      if (e.key === "Escape") {
        setExpanded(false);
        if (document.activeElement?.closest("#primary-navigation"))
          menuButton.current?.focus();
      }
      if (
        e.target?.closest('input,textarea,select,[contenteditable="true"]') ||
        e.metaKey ||
        e.ctrlKey ||
        e.altKey
      )
        return;
      if (window.__memkeys) window.__memkeys(e);
      if (e.key === "/") {
        e.preventDefault();
        inp.current?.focus();
      }
    };
    window.addEventListener("keydown", h);
    return () => window.removeEventListener("keydown", h);
  }, []);
  const on = (h) =>
    h === "/" ? path === "/" || path.startsWith("/book") : path.startsWith(h);
  return (
    <nav className="top" aria-label="Main navigation">
      <Link className="brand" href="/">
        <span className="mark">
          <Icon name="emmaus" size={20} />
        </span>
        <span className="word">Emmaus</span>
      </Link>
      <button
        ref={menuButton}
        className="nav-menu-toggle"
        aria-expanded={expanded}
        aria-controls="primary-navigation"
        onClick={() => setExpanded((v) => !v)}
      >
        {expanded ? "Close" : "Menu"}{" "}
        <span aria-hidden="true">{expanded ? "×" : "☰"}</span>
      </button>
      <div
        id="primary-navigation"
        className={`links ${expanded ? "expanded" : ""}`}
      >
        {LINKS.map(([h, l, i]) => (
          <Link
            key={h}
            href={h}
            className={on(h) ? "on" : ""}
            aria-current={on(h) ? "page" : undefined}
          >
            <Icon name={i} size={16} />
            {l}
          </Link>
        ))}
      </div>
      <form
        className="right"
        role="search"
        onSubmit={(e) => {
          e.preventDefault();
          const q = inp.current.value.trim();
          if (q) {
            setExpanded(false);
            router.push(
              findPassage(q)?.href || "/search?q=" + encodeURIComponent(q),
            );
            inp.current.blur();
          }
        }}
      >
        <span className="srch">
          <Icon name="search" size={15} />
          <input
            ref={inp}
            type="text"
            id="gsearch"
            placeholder="Search Scripture…"
            aria-label="Search Scripture or enter a passage"
          />
          <kbd aria-hidden="true">/</kbd>
        </span>
      </form>
    </nav>
  );
}
