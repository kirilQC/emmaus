"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { BOOKS, GENRES, THESES, MT, PATHS, slug, TOTAL } from "../lib/data.js";
import { GICON } from "../lib/icons.js";
import { S } from "../lib/state.js";
import { findPassage } from "../lib/passage.js";
import Icon from "./Icon.jsx";

function RoadArt() {
  return (
    <svg
      viewBox="0 0 520 440"
      className="road-art"
      role="img"
      aria-label="A winding road through hills toward the rising sun"
    >
      <defs>
        <radialGradient id="dawn">
          <stop stopColor="#c49366" stopOpacity=".23" />
          <stop offset="1" stopColor="#c49366" stopOpacity="0" />
        </radialGradient>
        <linearGradient id="path" x2="0" y2="1">
          <stop stopColor="#b8ab83" />
          <stop offset="1" stopColor="#80785b" />
        </linearGradient>
        <pattern
          id="contours"
          width="520"
          height="440"
          patternUnits="userSpaceOnUse"
        >
          <path
            d="M-80 430Q110 160 350 320T660 230M-80 452Q110 182 350 342T660 252M-80 474Q110 204 350 364T660 274M-80 496Q110 226 350 386T660 296M-80 518Q110 248 350 408T660 318"
            fill="none"
            stroke="#d3c69c"
            strokeOpacity=".12"
          />
        </pattern>
      </defs>
      <circle cx="280" cy="175" r="210" fill="url(#dawn)" />
      <g fill="none" stroke="#bcb18c" strokeOpacity=".22">
        <circle cx="280" cy="173" r="111" />
        <circle cx="280" cy="173" r="120" strokeDasharray="1 7" />
        <path d="M280 34v18m0 242v18M141 173h18m242 0h18" />
      </g>
      <circle cx="280" cy="173" r="58" fill="#d5ad79" />
      <path d="M0 270Q80 225 178 254T345 235T520 263V440H0Z" fill="#3c4032" />
      <path d="M0 328Q84 262 201 308T388 286T520 302V440H0Z" fill="#51523e" />
      <path d="M0 379Q103 330 218 357T400 337T520 360V440H0Z" fill="#2a3027" />
      <path
        d="M275 240C221 268 352 281 290 313S167 352 239 440H327C219 356 308 356 328 319S242 275 284 240Z"
        fill="url(#path)"
      />
      <rect y="240" width="520" height="200" fill="url(#contours)" />
      <g fill="#eee3c9">
        <circle cx="276" cy="279" r="2.5" />
        <path d="M274 283h4l2 11h-8z" />
        <circle cx="285" cy="283" r="2.5" />
        <path d="M283 287h4l2 11h-8z" />
      </g>
      <g fill="#c9bfa4" opacity=".45">
        <circle cx="131" cy="92" r="1.5" />
        <circle cx="392" cy="104" r="1" />
        <circle cx="174" cy="155" r="1" />
        <circle cx="344" cy="64" r="1.5" />
      </g>
    </svg>
  );
}

export default function ReadingHome() {
  const [query, setQuery] = useState("");
  const [testament, setTestament] = useState("all");
  const [genre, setGenre] = useState("all");
  const [personal, setPersonal] = useState(null);
  useEffect(() => {
    let active = true;
    const update = () => {
      if (active)
        setPersonal({
          last: S.updated ? S.LAST : null,
          read: S.READ || {},
          notes: S.NOTES,
        });
    };
    S.load().then(update);
    window.addEventListener("emmaus:state", update);
    if (window.__bg) window.__bg.setTint(null);
    return () => {
      active = false;
      window.removeEventListener("emmaus:state", update);
    };
  }, []);
  const lastBook = BOOKS.find((b) => b.slug === personal?.last?.book);
  const lastChapter = lastBook
    ? Math.max(1, Math.min(lastBook.ch, personal.last.ch))
    : 1;
  const passage = findPassage(query);
  const filtered = BOOKS.filter(
    (b) =>
      (testament === "all" || b.t === testament) &&
      (genre === "all" || b.gid === genre) &&
      (!query.trim() ||
        b.name.toLowerCase().includes(query.trim().toLowerCase()) ||
        (passage && passage.book.slug === b.slug)),
  );
  const completed = Object.values(personal?.read || {}).filter(Boolean).length;
  const reset = () => {
    setQuery("");
    setTestament("all");
    setGenre("all");
  };

  return (
    <div className="reading-home wrap">
      <section className="home-intro" aria-labelledby="home-title">
        <div className="home-copy">
          <div className="eyebrow">
            <span /> THE WHOLE BIBLE. ONE UNFOLDING STORY.
          </div>
          <h1 id="home-title">
            Come closer
            <br />
            to the <em>Word.</em>
          </h1>
          <p>
            A quiet place to read deeply, follow the connections,
            <br className="wide-only" /> and carry Scripture into your everyday
            life.
          </p>
          <div className="home-actions">
            <Link
              className="btn"
              href={
                lastBook
                  ? `/book/${lastBook.slug}/${lastChapter}`
                  : "/book/matthew/1"
              }
            >
              <Icon name="book" />
              {lastBook ? "Continue reading" : "Begin with Matthew"}
              <span aria-hidden="true">↗</span>
            </Link>
            <a className="text-link" href="#canon">
              Browse the Bible <span aria-hidden="true">↓</span>
            </a>
          </div>
          <div className="home-facts">
            <span>
              <b>66</b> books
            </span>
            <span>
              <b>1,189</b> chapters
            </span>
            <span>
              <b>One</b> story of redemption
            </span>
          </div>
        </div>
        <div className="home-art">
          <div className="art-label">
            <Icon name="emmaus" size={17} />
            <span>ON THE ROAD TO EMMAUS</span>
            <span>24:32</span>
          </div>
          <RoadArt />
          <div className="art-caption">
            <p>“He opened to us the Scriptures.”</p>
            <span>LUKE 24 · THE JOURNEY CONTINUES</span>
          </div>
        </div>
      </section>

      <section className="reading-dashboard" aria-label="Your study">
        <Link
          className="resume-card"
          href={
            lastBook
              ? `/book/${lastBook.slug}/${lastChapter}`
              : "/book/matthew/1"
          }
        >
          <span className="dashboard-icon">
            <Icon name="book" size={24} />
          </span>
          <div>
            <span className="eyebrow">
              {lastBook ? "PICK UP WHERE YOU LEFT OFF" : "YOUR FIRST CHAPTER"}
            </span>
            <h2>
              {lastBook ? `${lastBook.name} ${lastChapter}` : "Matthew 1"}
              <span className="resume-subtitle">
                {!lastBook || lastBook.slug === "matthew"
                  ? MT.ch[lastChapter - 1]?.[1]
                  : "Return to the text"}
              </span>
            </h2>
          </div>
          <span className="round-arrow" aria-hidden="true">
            →
          </span>
        </Link>
        <div className="journey-stat">
          <span className="eyebrow">YOUR READING JOURNEY</span>
          <div>
            <strong>{completed}</strong>
            <span>of {TOTAL.toLocaleString()} chapters read</span>
          </div>
          <div
            className="journey-track"
            role="progressbar"
            aria-label="Chapters read"
            aria-valuenow={completed}
            aria-valuemin={0}
            aria-valuemax={TOTAL}
          >
            <span style={{ width: `${(completed / TOTAL) * 100}%` }} />
          </div>
        </div>
        <Link className="notes-shortcut" href="/notes">
          <Icon name="pen" size={23} />
          <span>
            Your notes<small>A place for what stays with you</small>
          </span>
          <span aria-hidden="true">↗</span>
        </Link>
      </section>

      <section
        id="canon"
        className="canon-section"
        aria-labelledby="canon-title"
      >
        <div className="section-heading">
          <div>
            <div className="eyebrow">THE CANON</div>
            <h2 id="canon-title">Find your next chapter.</h2>
          </div>
          <p>
            From the first garden to the new creation.
            <br />
            Choose a book and step into the story.
          </p>
        </div>
        <div className="canon-toolbar">
          <div
            className="testament-tabs"
            role="group"
            aria-label="Filter by testament"
          >
            {[
              ["all", "All books", "66"],
              ["OT", "Old Testament", "39"],
              ["NT", "New Testament", "27"],
            ].map(([id, label, count]) => (
              <button
                key={id}
                className={testament === id ? "active" : ""}
                aria-pressed={testament === id}
                onClick={() => {
                  setTestament(id);
                  setGenre("all");
                }}
              >
                {label}
                <span>{count}</span>
              </button>
            ))}
          </div>
          <div className="canon-search">
            <Icon name="search" size={17} />
            <input
              aria-label="Find a book or passage"
              placeholder="Book or passage, e.g. John 3:16"
              type="search"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
            />
            {query && (
              <button
                aria-label="Clear book search"
                onClick={() => setQuery("")}
              >
                ×
              </button>
            )}
          </div>
        </div>
        <div className="canon-meta">
          <label>
            Collection{" "}
            <select
              aria-label="Filter by collection"
              value={genre}
              onChange={(e) => setGenre(e.target.value)}
            >
              <option value="all">Every collection</option>
              {GENRES.filter(
                (g) => testament === "all" || g.t === testament,
              ).map((g) => (
                <option key={g.id} value={g.id}>
                  {g.name}
                </option>
              ))}
            </select>
          </label>
          <span role="status">
            {filtered.length} {filtered.length === 1 ? "book" : "books"}
            <span className="meta-divider">/</span>In biblical order
          </span>
        </div>
        {passage && (
          <Link className="passage-result" href={passage.href}>
            <Icon name="book" />
            Read {passage.book.name} {passage.chapter}
            <span>Open chapter →</span>
          </Link>
        )}
        <div className="canon-grid">
          {filtered.map((b) => {
            const read = Object.entries(personal?.read || {}).filter(
              ([key, value]) => value && key.startsWith(b.slug + ":"),
            ).length;
            return (
              <Link
                key={b.slug}
                href={`/book/${b.slug}`}
                className={`canon-book ${b.slug === "matthew" ? "featured-book" : ""}`}
                style={{ "--book-color": b.col }}
              >
                <div className="book-card-top">
                  <span className="book-collection">
                    <Icon name={GICON[b.gid]} size={16} />
                    {b.genre}
                  </span>
                  <span className="book-index">
                    {String(b.idx).padStart(2, "0")}
                  </span>
                </div>
                <h3>{b.name}</h3>
                <p>{THESES[b.name]}</p>
                <div className="book-card-bottom">
                  <span>
                    {b.ch} {b.ch === 1 ? "chapter" : "chapters"}
                    {read > 0 ? ` · ${read} read` : ""}
                  </span>
                  {b.slug === "matthew" ? (
                    <span className="study-badge">Study guide</span>
                  ) : (
                    <span className="book-arrow" aria-hidden="true">
                      ↗
                    </span>
                  )}
                </div>
              </Link>
            );
          })}
        </div>
        {filtered.length === 0 && (
          <div className="canon-empty">
            <Icon name="search" size={30} />
            <h3>No books found</h3>
            <p>Try a book name like “John”, or clear your filters.</p>
            <button className="btn ghost" onClick={reset}>
              Show all books
            </button>
          </div>
        )}
        <p className="canon-footnote">
          <span className="study-badge">Study guide</span> Matthew includes a
          full overview and chapter summaries. Every book includes Scripture
          access and study resources.
        </p>
      </section>

      <section className="path-section" aria-labelledby="paths-title">
        <div className="section-heading">
          <div>
            <div className="eyebrow">A LITTLE DIRECTION</div>
            <h2 id="paths-title">Many ways into the story.</h2>
          </div>
          <p>
            Start with what draws you in.
            <br />
            Follow a path at your own pace.
          </p>
        </div>
        <div className="home-paths">
          {PATHS.map(([title, desc, icon, books], i) => (
            <article className="home-path" key={title}>
              <div className="path-top">
                <Icon name={icon} size={24} />
                <span>
                  0{i + 1} / {books.length} BOOKS
                </span>
              </div>
              <h3>{title}</h3>
              <p>{desc}</p>
              <Link className="text-link" href={`/book/${slug(books[0])}/1`}>
                Start with {books[0]} <span aria-hidden="true">→</span>
              </Link>
              <details>
                <summary>See the reading order</summary>
                <ol>
                  {books.map((b) => (
                    <li key={b}>
                      <Link href={`/book/${slug(b)}`}>{b}</Link>
                    </li>
                  ))}
                </ol>
              </details>
            </article>
          ))}
        </div>
      </section>
      <section className="reference-invitation">
        <span className="dashboard-icon">
          <Icon name="compass" size={30} />
        </span>
        <div>
          <div className="eyebrow">SEE THE BIGGER PICTURE</div>
          <h2>Put the words in their world.</h2>
          <p>Maps, timelines, diagrams, and the people behind the passages.</p>
        </div>
        <Link className="btn ghost" href="/reference">
          Explore the reference library <span aria-hidden="true">↗</span>
        </Link>
      </section>
    </div>
  );
}
