function requireEnv(name: string): string {
  const v = process.env[name];
  if (!v) throw new Error(`Missing env var: ${name}`);
  return v;
}

/**
 * Upload a single file (<= 5MB) directly into an Airtable Attachment field
 * using the Content API. This attaches the file to the specified record's field.
 *
 * Endpoint per docs:
 *   POST https://content.airtable.com/v0/{baseId}/{recordId}/{attachmentFieldIdOrName}/uploadAttachment
 */
export async function uploadAttachmentToRecord(params: {
  recordId: string;
  field: string; // field name or field id
  base64: string;
  contentType: string;
  filename: string;
}): Promise<{ ok: true } | { ok: false; status: number; body?: string }> {
  const apiKey = requireEnv("AIRTABLE_API_KEY");
  const baseId = requireEnv("AIRTABLE_BASE_ID");

  const { recordId, field, base64, contentType, filename } = params;

  const url = `https://content.airtable.com/v0/${baseId}/${recordId}/${encodeURIComponent(field)}/uploadAttachment`;
  const res = await fetch(url, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ contentType, file: base64, filename }),
  });
  if (!res.ok) {
    const t = await res.text().catch(() => "");
    console.error("Airtable content upload failed", res.status, t);
    return { ok: false, status: res.status, body: t };
  }
  return { ok: true };
}

export function bufferToBase64(input: ArrayBuffer | Uint8Array | Buffer): string {
  const buf = input instanceof Buffer ? input : Buffer.from(input as ArrayBuffer);
  return buf.toString("base64");
}


