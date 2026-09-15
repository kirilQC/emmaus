# Emmaus

A personal study of the whole Bible. Next.js on Vercel, Supabase for notes and decks, OpenAI for the tutor, the New Living Translation served chapter by chapter from Tyndale's API.

## Run

    npm install
    cp .env.example .env.local   # fill in what you have
    npm run dev                  # http://localhost:3111

Without any env vars the site keeps notes and decks in the browser, reads NLT anonymously (500 requests a day), and the tutor is disabled. There is no login; the site is open to whoever has the URL.

## Env

- `OPENAI_API_KEY` turns on the tutor and the content pipeline. `OPENAI_MODEL` picks the model (default `gpt-5`).
- `NLT_API_KEY` raises the NLT limit to 5,000 requests a day. Get one at https://api.nlt.to.
- `SUPABASE_URL` and `SUPABASE_SERVICE_ROLE_KEY` sync notes, decks and card status across devices. Run `supabase/schema.sql` once.

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
