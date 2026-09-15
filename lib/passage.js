import { BOOKS, BLB } from "./data.js";

// A reference opens the chapter containing the verse; text search stays separate.
export function findPassage(value) {
  const match = value.trim().match(/^(.+?)\s+(\d+)(?::\d+(?:-\d+)?)?$/);
  if (!match) return null;
  const name = match[1].toLowerCase().replace(/[.\s-]+/g, "");
  const book = BOOKS.find((b) =>
    [
      b.name,
      b.slug,
      BLB[b.slug],
      ...(b.slug === "psalms" ? ["psalm", "ps"] : []),
      ...(b.slug === "song-of-songs" ? ["song of solomon"] : []),
    ].some((n) => n.toLowerCase().replace(/[.\s-]+/g, "") === name),
  );
  const chapter = Number(match[2]);
  return book && chapter >= 1 && chapter <= book.ch
    ? { book, chapter, href: `/book/${book.slug}/${chapter}` }
    : null;
}
