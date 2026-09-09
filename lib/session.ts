const SESSION_COOKIE_NAME = "epfo_session";
const encoder = new TextEncoder();

function getSecret() {
  const secret = process.env.SESSION_SECRET;
  if (!secret || secret === "replace-with-a-long-random-secret") {
    throw new Error("SESSION_SECRET must be configured before signing in.");
  }
  return secret;
}

async function sign(value: string) {
  const key = await crypto.subtle.importKey(
    "raw",
    encoder.encode(getSecret()),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"],
  );
  const signature = await crypto.subtle.sign("HMAC", key, encoder.encode(value));
  return Array.from(new Uint8Array(signature), (byte) => byte.toString(16).padStart(2, "0")).join(
    "",
  );
}

export async function createSessionToken(userId: string) {
  return `${userId}.${await sign(userId)}`;
}

export async function verifySessionToken(token: string | undefined) {
  if (!token) return null;
  const separator = token.lastIndexOf(".");
  if (separator < 1) return null;

  const userId = token.slice(0, separator);
  const signature = token.slice(separator + 1);
  try {
    return signature === (await sign(userId)) ? userId : null;
  } catch {
    return null;
  }
}

export { SESSION_COOKIE_NAME };
