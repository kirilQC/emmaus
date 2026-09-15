-- Emmaus: one row of user state (notes, decks, card status, last opened)
create table if not exists public.emmaus_state (
  id text primary key,
  data jsonb not null default '{}'::jsonb,
  updated_at timestamptz not null default now()
);
alter table public.emmaus_state enable row level security;
-- The app writes with the service role key from the server, so no public policies are needed.
