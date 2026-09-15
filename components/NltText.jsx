"use client";
import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { BOOKS } from "../lib/data.js";
import { S } from "../lib/state.js";
import Icon from "./Icon.jsx";

export default function NltText({ book, ch }) {
  const [state, setState] = useState({ status: "loading" });
  const [attempt, setAttempt] = useState(0);
  const [size, setSize] = useState(21);
  const [focus, setFocus] = useState(false);
  const [complete, setComplete] = useState(false);
  const panel = useRef(null);
  const current = BOOKS.find((b) => b.name === book);
  const key = current ? `${current.slug}:${ch}` : "";
  useEffect(() => {
    try {
      const v = Number(localStorage.getItem("emmaus:reading-size"));
      if (v >= 18 && v <= 28) setSize(v);
    } catch {}
  }, []);
  useEffect(() => {
    setComplete(Boolean(S.READ?.[key]));
  }, [key]);
  useEffect(() => {
    document.body.classList.toggle("reading-focus", focus);
    if (focus) panel.current?.scrollIntoView({ block: "start" });
    const escape = (e) => {
      if (e.key === "Escape") setFocus(false);
    };
    window.addEventListener("keydown", escape);
    return () => {
      document.body.classList.remove("reading-focus");
      window.removeEventListener("keydown", escape);
    };
  }, [focus]);
  useEffect(() => {
    const controller = new AbortController();
    setState({ status: "loading" });
    fetch(`/api/nlt?ref=${encodeURIComponent(book + " " + ch)}`, {
      signal: controller.signal,
    })
      .then(async (r) => {
        if (!r.ok) throw new Error("The passage is temporarily unavailable.");
        return r.text();
      })
      .then((html) => setState({ status: "ok", html }))
      .catch((e) => {
        if (e.name !== "AbortError") setState({ status: "error" });
      });
    return () => controller.abort();
  }, [book, ch, attempt]);
  const resize = (delta) => {
    const v = Math.max(18, Math.min(28, size + delta));
    setSize(v);
    try {
      localStorage.setItem("emmaus:reading-size", String(v));
    } catch {}
  };
  const toggleRead = () => {
    S.READ = { ...S.READ, [key]: !complete };
    S.save();
    setComplete(!complete);
  };
  const next =
    current &&
    (+ch < current.ch
      ? `/book/${current.slug}/${+ch + 1}`
      : BOOKS[current.idx]
        ? `/book/${BOOKS[current.idx].slug}/1`
        : null);
  return (
    <section
      ref={panel}
      className="scripture-panel card"
      aria-label={`${book} ${ch} Scripture`}
    >
      <div className="reader-toolbar">
        <div>
          <span className="eyebrow">NEW LIVING TRANSLATION</span>
          <h2>
            {book} {ch}
          </h2>
        </div>
        <div className="reader-tools">
          <div
            className="font-controls"
            role="group"
            aria-label="Reading text size"
          >
            <button
              disabled={size <= 18}
              aria-label="Decrease text size"
              onClick={() => resize(-1)}
            >
              A−
            </button>
            <button
              disabled={size >= 28}
              aria-label="Increase text size"
              onClick={() => resize(1)}
            >
              A+
            </button>
          </div>
          <button
            className="focus-toggle"
            aria-pressed={focus}
            onClick={() => setFocus((v) => !v)}
          >
            <Icon name="book" size={15} />
            {focus ? "Exit focus" : "Focus"}
          </button>
        </div>
      </div>
      {state.status === "loading" && (
        <div className="reader-loading" role="status">
          <span /> <span /> <span />
          <p>
            Opening {book} {ch}…
          </p>
        </div>
      )}
      {state.status === "error" && (
        <div className="reader-error" role="alert">
          <h3>The passage couldn’t be loaded.</h3>
          <p>
            Your study tools are still here. Try again, or open the passage on
            Bible Gateway.
          </p>
          <button
            className="btn ghost sm"
            onClick={() => setAttempt((v) => v + 1)}
          >
            Try again
          </button>{" "}
          <a
            className="text-link"
            href={`https://www.biblegateway.com/passage/?search=${encodeURIComponent(book + " " + ch)}&version=NLT`}
            target="_blank"
            rel="noopener noreferrer"
          >
            Read on Bible Gateway ↗
          </a>
        </div>
      )}
      {state.status === "ok" && (
        <div
          className="nlt reader"
          style={{ fontSize: size }}
          dangerouslySetInnerHTML={{ __html: state.html }}
        />
      )}
      {current && (
        <div className="reader-bottom">
          <button
            className={`btn ghost ${complete ? "chapter-complete" : ""}`}
            aria-pressed={complete}
            onClick={toggleRead}
          >
            <Icon name={complete ? "check" : "book"} size={16} />
            {complete ? "Chapter read" : "Mark chapter as read"}
          </button>
          {next && (
            <Link className="text-link" href={next}>
              Next chapter <span aria-hidden="true">→</span>
            </Link>
          )}
          <span className="reader-progress-note" role="status">
            {complete
              ? "Added to your reading journey."
              : "Move at your own pace."}
          </span>
        </div>
      )}
    </section>
  );
}
