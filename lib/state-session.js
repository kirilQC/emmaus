import { createHmac, randomUUID, timingSafeEqual } from "node:crypto";
const UUID =
  /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/;
const sign = (id, secret) =>
  createHmac("sha256", secret).update(`emmaus-state:${id}`).digest("hex");
export function newSession(secret) {
  const id = randomUUID();
  return { id, token: `${id}.${sign(id, secret)}` };
}
export function sessionId(token, secret) {
  if (!secret || typeof token !== "string") return null;
  const [id, signature, ...rest] = token.split(".");
  if (
    rest.length ||
    !UUID.test(id) ||
    !signature ||
    !/^[0-9a-f]{64}$/.test(signature)
  )
    return null;
  return timingSafeEqual(
    Buffer.from(signature, "hex"),
    Buffer.from(sign(id, secret), "hex"),
  )
    ? id
    : null;
}
