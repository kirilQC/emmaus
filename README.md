# Emmaus

A personal study of the whole Bible. Next.js on Vercel, optional isolated Supabase backups for notes and decks, OpenAI for the tutor, the New Living Translation served chapter by chapter from Tyndale's API.

## Run

    npm install
    cp .env.example .env.local   # fill in what you have
    npm run dev                  # http://localhost:3111

Without any env vars the site keeps notes, chapter completion and decks in the browser, reads NLT anonymously (500 requests a day), and the tutor is disabled. There is no login; the site is open to whoever has the URL.

## Env

- `OPENAI_API_KEY` turns on the tutor and the content pipeline. `OPENAI_MODEL` picks the model (default `gpt-5`).
- `NLT_API_KEY` raises the NLT limit to 5,000 requests a day. Get one at https://api.nlt.to.
- `SUPABASE_URL` and `SUPABASE_SERVICE_ROLE_KEY` enable per-browser cloud backup. Run `supabase/schema.sql` once. Set `STATE_SESSION_SECRET` to a stable random secret to sign browser sessions; otherwise the service role key is used for signing. Browser sessions use signed, HttpOnly, SameSite=Strict cookies. Cross-device sync requires a future sign-in flow.

## Content

Matthew is complete in `lib/data.js`. Every other book has its thesis. To write another book:

    npm run generate:book -- "Mark"

Review `content/mark.json`, then merge it into `lib/data.js` (a `BOOKDATA` map keyed by slug is the next step in the pipeline).

## Layout

- `lib/data.js` all content data
- `lib/views.js` page renderers (HTML strings, carried over from the prototype)
- `lib/wire.js` page behaviour
- `components/` Nav, Footer, Background, NltText, Tutor, HtmlView
- `app/api/nlt` NLT proxy with a six hour in-memory cache, no text stored
- `app/api/tutor` streaming OpenAI tutor grounded in the open chapter
- `app/api/state` Supabase sync of user state

## Reading experience

- The homepage renders the canon immediately, with testament/collection filters, book search, and direct references such as `John 3:16` (opens the containing chapter).
- The reader remembers text size on this browser. Focus hides surrounding navigation and study panels; Escape exits it. Marking a chapter as read is optional and reversible.
- Reading progress, notes, and decks retain the existing `emmaus:state` localStorage key. Invalid stored data is discarded safely. Cloud requests do not delay rendering.
- `npm test` checks references across all 66 books, invalid chapters, legacy state compatibility, and browser session signatures. `npm run build` checks production compilation.

## Shared-state migration

Earlier versions exposed one `kiril` state row to every unauthenticated visitor. The state API now only reads/writes a server-signed UUID belonging to the current browser. It never reads, changes, or deletes the legacy row. Existing local data is preserved and will be backed up into the browser's new row when next saved. If your only copy is in the legacy cloud row, recover it through a trusted admin connection; do not expose that row through the public endpoint. Clearing cookies or changing the signing secret starts a new cloud identity, while local data stays on the device. This is browser isolation, not a replacement for authenticated accounts.
