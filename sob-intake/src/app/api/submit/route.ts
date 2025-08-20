import { NextRequest, NextResponse } from "next/server";
import { createIntakeRecord, IntakePayload, UploadedFileSummary } from "@/lib/airtable";
import { uploadFileToAirtable } from "@/lib/airtable_upload";
import { uploadAttachmentToRecord, bufferToBase64 } from "@/lib/airtable_content";
import { getFieldIdByName } from "@/lib/airtable_schema";

export const runtime = "nodejs";

async function triggerN8nWebhook(airtableResponse: unknown): Promise<{ ok: boolean; status?: number }> {
  try {
    const url = process.env.N8N_WEBHOOK_URL || "https://n8n.techifyserver.com/webhook/1ffccbab-f785-438e-b85e-b831271e6d58";
    const bodyArray = (airtableResponse && typeof airtableResponse === "object" && (airtableResponse as any).records && Array.isArray((airtableResponse as any).records))
      ? (airtableResponse as any).records
      : [airtableResponse];
    const res = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(bodyArray),
    });
    return { ok: res.ok, status: res.status };
  } catch (err) {
    console.error("n8n webhook error:", err);
    return { ok: false };
  }
}

async function triggerSecondaryWebhook(airtableResponse: unknown): Promise<{ ok: boolean; status?: number }> {
  try {
    const url = process.env.N8N_FORM_WEBHOOK_URL || "https://n8n.techifyserver.com/webhook/19c4b559-64ea-4b6a-ab11-eb98745d58f9";
    const bodyArray = (airtableResponse && typeof airtableResponse === "object" && (airtableResponse as any).records && Array.isArray((airtableResponse as any).records))
      ? (airtableResponse as any).records
      : [airtableResponse];
    const res = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(bodyArray),
    });
    return { ok: res.ok, status: res.status };
  } catch (err) {
    console.error("n8n secondary webhook error:", err);
    return { ok: false };
  }
}

async function fetchAirtableRecordById(recordId: string): Promise<any | null> {
  try {
    const apiKey = process.env.AIRTABLE_API_KEY as string;
    const baseId = process.env.AIRTABLE_BASE_ID as string;
    const tableName = process.env.AIRTABLE_TABLE_NAME as string;
    if (!apiKey || !baseId || !tableName) return null;
    const url = `https://api.airtable.com/v0/${baseId}/${encodeURIComponent(tableName)}/${recordId}`;
    const res = await fetch(url, {
      headers: { Authorization: `Bearer ${apiKey}` },
      cache: "no-store",
    });
    if (!res.ok) return null;
    return res.json();
  } catch {
    return null;
  }
}

export async function POST(req: NextRequest) {
  try {
    const contentType = req.headers.get("content-type") || "";

    if (contentType.includes("multipart/form-data")) {
      const formData = await req.formData();

      const uploadedFiles: UploadedFileSummary[] = [];
      const fileEntries: { field: string; file: File; newName: string }[] = [];
      const getText = (name: string) => (formData.get(name) as string) || "";

      const attachmentUrls: { url: string; filename?: string }[] = [];
      for (const [key, value] of formData.entries()) {
        if (value instanceof File && value.size > 0) {
          // Rename uploaded file to match the input field for consistency
          // Example: brandVoiceFile -> brandVoiceFile-originalName.ext
          const safeField = key.replace(/[^a-zA-Z0-9_.-]/g, "_");
          const ext = value.name.includes(".") ? value.name.substring(value.name.lastIndexOf(".")) : "";
          const newName = `${safeField}${ext}`;
          const tokenId = await uploadFileToAirtable(value, newName);
          uploadedFiles.push({ field: key, name: newName, size: value.size, type: value.type, airtableTokenId: tokenId || undefined });
          fileEntries.push({ field: key, file: value, newName });
        }
      }

      const code = getText("phone_code");
      const nat = getText("phone_national");
      const combinedPhone = code && nat ? `${code}${nat.replace(/[^0-9]/g, "")}` : getText("phone");

      const payload: IntakePayload = {
        companyName: getText("companyName"),
        contactName: getText("contactName"),
        email: getText("email"),
        // Prefer E.164, else fall back to concatenated code+national, else raw
        phone: getText("phone_e164") || combinedPhone,
        website: getText("website"),
        instagram: getText("instagram"),
        crm: getText("crm"),
        emailPlatform: getText("emailPlatform"),
        links: {
          landingPages: getText("links.landingPages"),
          calendars: getText("links.calendars"),
          webinarLinks: getText("links.webinarLinks"),
          formsSurveys: getText("links.formsSurveys"),
          otherAssets: getText("links.otherAssets"),
        },
        brandVoice: getText("brandVoice"),
        salesPitch: getText("salesPitch"),
        offerInfo: getText("offerInfo"),
        brandFAQ: getText("brandFAQ"),
        productFAQ: getText("productFAQ"),
        salesGuide: getText("salesGuide"),
        leadQualification: getText("leadQualification"),
        credentials: getText("credentials"),
        notes: getText("notes"),
        loomUrl: getText("loomUrl"),
        uploadedFiles,
        attachments: attachmentUrls,
      };

      const airtable = await createIntakeRecord(payload);

      // If Web API token upload failed (no token ids), try Content API to
      // attach files directly to the created record (<=5MB per file)
      let createdRecordId: string | undefined;
      try {
        type CreateResponse = { id: string } | { records: { id: string }[] };
        const at = airtable as unknown as CreateResponse;
        createdRecordId = (at as { id: string }).id || (Array.isArray((at as { records: { id: string }[] }).records) ? (at as { records: { id: string }[] }).records[0]?.id : undefined);
        if (createdRecordId) {
          // Resolve field id for Attachments once for reliability
          const fieldRef = await getFieldIdByName(process.env.AIRTABLE_TABLE_NAME as string, "Attachments");
          const fieldTarget = fieldRef?.fieldId || "Attachments";
          for (const entry of fileEntries) {
            const meta = uploadedFiles.find((u) => u.field === entry.field && u.name === entry.newName);
            if (!meta?.airtableTokenId && entry.file.size <= 5 * 1024 * 1024) {
              const arr = await entry.file.arrayBuffer();
              const base64 = bufferToBase64(arr);
              await uploadAttachmentToRecord({ recordId: createdRecordId, field: fieldTarget, base64, contentType: entry.file.type || "application/octet-stream", filename: entry.newName });
            }
          }
        }
      } catch {
        // best-effort; ignore
      }
      // Fetch the full, current Airtable record (to include resolved attachments) if possible
      const fullRecord = createdRecordId ? await fetchAirtableRecordById(createdRecordId) : null;
      const payloadForWebhooks = fullRecord || airtable;
      const [webhook, webhook2] = await Promise.all([
        triggerN8nWebhook(payloadForWebhooks),
        triggerSecondaryWebhook(payloadForWebhooks),
      ]);
      return NextResponse.json({ ok: true, airtable, record: payloadForWebhooks, webhook, webhook2 });
    }

    // JSON fallback (e.g., if sending application/json)
    const body = (await req.json().catch(() => ({}))) as IntakePayload;
    const airtable = await createIntakeRecord(body);
    // Determine recordId and attempt to fetch full record
    let recordId: string | undefined;
    try {
      type CreateResponse = { id: string } | { records: { id: string }[] };
      const at = airtable as unknown as CreateResponse;
      recordId = (at as { id: string }).id || (Array.isArray((at as { records: { id: string }[] }).records) ? (at as { records: { id: string }[] }).records[0]?.id : undefined);
    } catch {}
    const fullRecord = recordId ? await fetchAirtableRecordById(recordId) : null;
    const payloadForWebhooks = fullRecord || airtable;
    const [webhook, webhook2] = await Promise.all([
      triggerN8nWebhook(payloadForWebhooks),
      triggerSecondaryWebhook(payloadForWebhooks),
    ]);
    return NextResponse.json({ ok: true, airtable, record: payloadForWebhooks, webhook, webhook2 });
  } catch (error) {
    console.error("/api/submit error:", error);
    return NextResponse.json({ ok: false, error: "Submission failed" }, { status: 500 });
  }
}


