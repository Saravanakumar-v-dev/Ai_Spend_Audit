export const HONEYPOT_FIELD_NAME = "website_url";

export function getHoneypotValue(body: unknown): unknown {
  if (!body || typeof body !== "object") {
    return undefined;
  }

  return (body as Record<string, unknown>)[HONEYPOT_FIELD_NAME];
}

export function isHoneypotTripped(value: unknown): boolean {
  if (typeof value === "string") {
    return value.trim().length > 0;
  }

  return Boolean(value);
}
