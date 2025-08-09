/**
 * Minimal helper to upload files directly to Airtable using the Web API
 * Upload Attachment endpoint.
 *
 * Docs:
 * - https://airtable.com/developers/web/api/upload-attachment
 */

function requireEnv(name: string): string {
  const v = process.env[name];
  if (!v) throw new Error(`Missing env var: ${name}`);
  return v;
}

export async function uploadFileToAirtable(file: File, overrideFilename?: string): Promise<string | null> {
  const apiKey = requireEnv("AIRTABLE_API_KEY");
  const baseId = requireEnv("AIRTABLE_BASE_ID");

  // Convert the incoming File to a Blob we can send via FormData in Node.
  const arr = await file.arrayBuffer();
  const blob = new Blob([arr], { type: file.type || "application/octet-stream" });

  const form = new FormData();
  const filename = overrideFilename && overrideFilename.trim().length > 0 ? overrideFilename : file.name;
  form.append("file", blob, filename);

  // Try new Web API endpoint first; fallback to legacy-style path if 404/Not Found
  const urlPrimary = `https://api.airtable.com/v0/bases/${baseId}/attachments`;
  let res = await fetch(urlPrimary, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
    },
    body: form,
  });

  if (!res.ok) {
    // If 404, attempt alternate path used by some accounts
    const firstErrBody = await res.text().catch(() => "");
    if (res.status === 404) {
      const urlFallback = `https://api.airtable.com/v0/${baseId}/attachments`;
      res = await fetch(urlFallback, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${apiKey}`,
        },
        body: form,
      });
      if (!res.ok) {
        const t = await res.text().catch(() => "");
        console.error("Airtable upload failed 404 on both endpoints", { primary: firstErrBody, fallback: t });
        return null;
      }
    } else {
      console.error("Airtable upload failed", res.status, firstErrBody);
      return null;
    }
  }

  const json: any = await res.json();
  // According to Airtable Web API, the response contains an id token reference
  // that can be used when creating the record (as { id: token } in attachment field).
  const token = json?.id || json?.attachment?.id || json?.token || null;
  return token;
}


