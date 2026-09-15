import { NextResponse } from "next/server";
import { sb } from "../../../lib/supabase.js";
import { newSession, sessionId } from "../../../lib/state-session.js";
import { pickState } from "../../../lib/state-data.js";
export const dynamic = "force-dynamic";
const COOKIE = "emmaus-session";
const json = (data, status = 200) =>
  NextResponse.json(data, {
    status,
    headers: { "Cache-Control": "private, no-store" },
  });
const secret = () =>
  process.env.STATE_SESSION_SECRET || process.env.SUPABASE_SERVICE_ROLE_KEY;
export async function GET(req) {
  const c = sb();
  if (!c) return json(null);
  let id = sessionId(req.cookies.get(COOKIE)?.value, secret());
  // New visitors receive an isolated, signed browser identity. Never expose the legacy owner row.
  if (!id) {
    const session = newSession(secret());
    const response = json(null);
    response.cookies.set(COOKIE, session.token, {
      httpOnly: true,
      secure: new URL(req.url).protocol === "https:",
      sameSite: "strict",
      path: "/",
      maxAge: 60 * 60 * 24 * 365,
    });
    return response;
  }
  const { data, error } = await c
    .from("emmaus_state")
    .select("data")
    .eq("id", id)
    .maybeSingle();
  if (error)
    return json({ error: "Cloud backup is temporarily unavailable." }, 503);
  return json(data ? pickState(data.data) : null);
}
export async function PUT(req) {
  const c = sb();
  if (!c) return json({ ok: false, reason: "local-only" });
  const origin = req.headers.get("origin");
  if (origin && origin !== new URL(req.url).origin)
    return json({ error: "Invalid origin" }, 403);
  const id = sessionId(req.cookies.get(COOKIE)?.value, secret());
  if (!id) return json({ error: "A valid browser session is required." }, 401);
  if (!req.headers.get("content-type")?.startsWith("application/json"))
    return json({ error: "JSON required" }, 415);
  let body;
  try {
    const text = await req.text();
    if (text.length > 1_000_000)
      return json({ error: "State is too large" }, 413);
    body = JSON.parse(text);
  } catch {
    return json({ error: "Invalid JSON" }, 400);
  }
  if (!body || typeof body !== "object" || Array.isArray(body))
    return json({ error: "Invalid state" }, 400);
  const { error } = await c
    .from("emmaus_state")
    .upsert({
      id,
      data: pickState(body),
      updated_at: new Date().toISOString(),
    });
  if (error)
    return json({ error: "Cloud backup is temporarily unavailable." }, 503);
  return json({ ok: true });
}
