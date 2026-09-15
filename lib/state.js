// Browser data is available immediately. Optional cloud backup never blocks reading.
import { SEED_DECK } from "./data.js";
import { pickState } from "./state-data.js";
const KEY = "emmaus:state";
export const S = {
  LAST: { book: "matthew", ch: 1 },
  DECKS: [structuredClone(SEED_DECK)],
  NOTES: {},
  CSTAT: {},
  READ: {},
  updated: 0,
  loaded: false,
  _t: null,
  _syncReady: null,
  async load() {
    if (typeof window === "undefined" || S.loaded) return;
    try {
      const value = localStorage.getItem(KEY);
      if (value) Object.assign(S, pickState(JSON.parse(value)));
    } catch {}
    S.loaded = true;
    S._syncReady = fetch("/api/state", {
      cache: "no-store",
      signal: AbortSignal.timeout(4000),
    })
      .then(async (r) => {
        if (!r.ok) return;
        const data = await r.json();
        if (data && data.updated > S.updated) {
          Object.assign(S, pickState(data));
          try {
            localStorage.setItem(KEY, JSON.stringify(snapshot()));
          } catch {}
          window.dispatchEvent(new Event("emmaus:state"));
        }
      })
      .catch(() => {});
  },
  save() {
    if (typeof window === "undefined") return;
    S.updated = Date.now();
    const data = snapshot();
    try {
      localStorage.setItem(KEY, JSON.stringify(data));
    } catch {}
    clearTimeout(S._t);
    S._t = setTimeout(async () => {
      await S._syncReady;
      fetch("/api/state", {
        method: "PUT",
        headers: { "content-type": "application/json" },
        body: JSON.stringify(data),
        signal: AbortSignal.timeout(5000),
      }).catch(() => {});
    }, 800);
  },
};
function snapshot() {
  return {
    LAST: S.LAST,
    DECKS: S.DECKS,
    NOTES: S.NOTES,
    CSTAT: S.CSTAT,
    READ: S.READ,
    updated: S.updated,
  };
}
