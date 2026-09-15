import { BOOKS } from "./data.js";
const record = (v) => v && typeof v === "object" && !Array.isArray(v);
const safeEntries = (v) =>
  record(v)
    ? Object.entries(v).filter(
        ([k]) => !["__proto__", "constructor", "prototype"].includes(k),
      )
    : [];
const validChapterKey = (key) => {
  const match = key.match(/^([^:]+):([1-9]\d*)$/);
  if (!match) return false;
  const [, slug, ch] = match;
  const book = BOOKS.find((b) => b.slug === slug);
  return book && Number.isInteger(+ch) && +ch <= book.ch;
};
export function pickState(value) {
  if (!record(value)) return {};
  const out = {};
  const book = BOOKS.find((b) => b.slug === value.LAST?.book);
  if (
    book &&
    Number.isInteger(value.LAST.ch) &&
    value.LAST.ch > 0 &&
    value.LAST.ch <= book.ch
  )
    out.LAST = { book: book.slug, ch: value.LAST.ch };
  if (Array.isArray(value.DECKS) && value.DECKS.length) {
    const decks = value.DECKS.filter(
      (d) => record(d) && typeof d.name === "string" && Array.isArray(d.cards),
    )
      .slice(0, 100)
      .map((d) => ({
        name: d.name.slice(0, 200),
        cards: d.cards
          .filter(
            (c) =>
              Array.isArray(c) &&
              typeof c[0] === "string" &&
              typeof c[1] === "string",
          )
          .slice(0, 5000)
          .map((c) => [c[0].slice(0, 200), c[1].slice(0, 10000)]),
      }));
    if (decks.length) out.DECKS = decks;
  }
  if (record(value.NOTES))
    out.NOTES = Object.fromEntries(
      safeEntries(value.NOTES)
        .filter(([k, v]) => validChapterKey(k) && typeof v === "string")
        .map(([k, v]) => [k, v.slice(0, 100000)]),
    );
  if (record(value.READ))
    out.READ = Object.fromEntries(
      safeEntries(value.READ).filter(
        ([k, v]) => validChapterKey(k) && typeof v === "boolean",
      ),
    );
  if (record(value.CSTAT))
    out.CSTAT = Object.fromEntries(
      safeEntries(value.CSTAT).filter(([, v]) =>
        ["new", "learning", "known"].includes(v),
      ),
    );
  if (Number.isFinite(value.updated) && value.updated >= 0)
    out.updated = value.updated;
  return out;
}
