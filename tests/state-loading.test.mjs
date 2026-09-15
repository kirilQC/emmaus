import test from "node:test";
import assert from "node:assert/strict";
import { S } from "../lib/state.js";
import { wire } from "../lib/wire.js";

test("reading renders immediately and a visit does not overwrite pending cloud notes", async () => {
  const originals = Object.fromEntries(
    ["window", "document", "localStorage", "location", "fetch"].map((key) => [
      key,
      globalThis[key],
    ]),
  );
  let resolveBackup,
    calls = 0;
  const stored = new Map();
  globalThis.window = new EventTarget();
  globalThis.document = {
    querySelector: () => null,
    querySelectorAll: () => [],
  };
  globalThis.location = { pathname: "/book/john/3" };
  globalThis.localStorage = {
    getItem: (key) => stored.get(key) || null,
    setItem: (key, value) => stored.set(key, value),
  };
  globalThis.fetch = () => {
    calls++;
    return new Promise((resolve) => (resolveBackup = resolve));
  };
  try {
    await S.load();
    await S.load();
    assert.equal(S.loaded, true);
    assert.equal(calls, 1);
    wire(["book", "john", "3"], { rerender() {}, navigate() {} });
    assert.equal(
      S.updated,
      0,
      "a visit must wait for backup hydration before saving",
    );
    resolveBackup({
      ok: true,
      json: async () => ({
        LAST: { book: "matthew", ch: 5 },
        NOTES: { "matthew:5": "Saved cloud reflection" },
        updated: 123,
      }),
    });
    await S._syncReady;
    await Promise.resolve();
    assert.equal(S.NOTES["matthew:5"], "Saved cloud reflection");
    assert.deepEqual(S.LAST, { book: "john", ch: 3 });
    assert.equal(
      JSON.parse(stored.get("emmaus:state")).NOTES["matthew:5"],
      "Saved cloud reflection",
    );
  } finally {
    clearTimeout(S._t);
    for (const [key, value] of Object.entries(originals)) {
      if (value === undefined) delete globalThis[key];
      else globalThis[key] = value;
    }
  }
});
