import "server-only";

const MAX_JSON_BODY_BYTES = 50_000;

export class PayloadTooLargeError extends Error {}

export async function readJsonBody(request: Request): Promise<unknown> {
  const contentLength = Number(request.headers.get("content-length") ?? "0");
  if (contentLength > MAX_JSON_BODY_BYTES) {
    throw new PayloadTooLargeError("Request body too large");
  }

  const text = await request.text();
  if (text.length > MAX_JSON_BODY_BYTES) {
    throw new PayloadTooLargeError("Request body too large");
  }

  return JSON.parse(text);
}

export function clampString(value: string, maxLength: number): string {
  return value.slice(0, maxLength);
}
