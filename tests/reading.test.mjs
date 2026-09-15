import test from "node:test";
import assert from "node:assert/strict";
import { findPassage } from "../lib/passage.js";
import { pickState } from "../lib/state-data.js";
import { newSession, sessionId } from "../lib/state-session.js";
import { BOOKS, SEED_DECK } from "../lib/data.js";
import { book, chapter } from "../lib/views.js";

test("every book supports its first and last chapter", () => {
  for (const book of BOOKS) {
    assert.equal(findPassage(`${book.name} 1`).href, `/book/${book.slug}/1`);
    assert.equal(findPassage(`${book.name} ${book.ch}`).chapter, book.ch);
    assert.equal(findPassage(`${book.name} ${book.ch + 1}`), null);
  }
});
test("references handle verses, numbered books, aliases and invalid input", () => {
  for (const [q, path] of [
    ["John 3:16", "/book/john/3"],
    ["1 John 2:1-4", "/book/1-john/2"],
    ["Psalm 23", "/book/psalms/23"],
    ["Gen. 1", "/book/genesis/1"],
    ["Song of Solomon 2", "/book/song-of-songs/2"],
  ])
    assert.equal(findPassage(q)?.href, path);
  for (const q of ["John 0", "John 22", "Fake 1", "John 1.5", "John", "love"])
    assert.equal(findPassage(q), null);
});
test("legacy notes and decks survive while malformed state is discarded", () => {
  const state = {
    LAST: { book: "matthew", ch: 28 },
    DECKS: [SEED_DECK],
    NOTES: { "matthew:5": "A reflection" },
    CSTAT: { "Matthew 5:3": "known" },
    READ: { "matthew:1": true },
    updated: 123,
  };
  assert.deepEqual(pickState(state), state);
  assert.deepEqual(
    pickState({
      LAST: { book: "matthew", ch: 1000 },
      DECKS: [],
      NOTES: { bad: 3 },
      READ: { "john:99": true, "john:1": "yes" },
      updated: "bad",
    }),
    { NOTES: {}, READ: {} },
  );
  assert.deepEqual(pickState(null), {});
  assert.deepEqual(
    pickState({
      DECKS: [null, { name: "x", cards: [null, ["ref", "text"], ["bad", 42]] }],
    }).DECKS,
    [{ name: "x", cards: [["ref", "text"]] }],
  );
});
test("signed browser sessions are isolated and cannot select the legacy owner", () => {
  const secret = "test-only-session-secret";
  const a = newSession(secret),
    b = newSession(secret);
  assert.notEqual(a.id, b.id);
  assert.equal(sessionId(a.token, secret), a.id);
  assert.equal(sessionId(a.token, "wrong"), null);
  assert.equal(sessionId(`${b.id}.${a.token.split(".")[1]}`, secret), null);
  for (const value of [
    null,
    "kiril",
    "kiril.signature",
    `${a.token}.extra`,
    a.id,
    "",
  ])
    assert.equal(sessionId(value, secret), null);
});
test("all book pages render without placeholder panels, with a direct reading action", () => {
  for (const b of BOOKS) {
    const html = book(b.slug);
    assert.ok(html.includes(`Start reading ${b.name}`));
    assert.ok(html.includes("Chapter by chapter"));
    if (b.slug !== "matthew") assert.ok(!html.includes("not yet written"));
  }
  for (const n of [0, 29, 1.5, "NaN"])
    assert.match(chapter("matthew", n), /not found/i);
});
