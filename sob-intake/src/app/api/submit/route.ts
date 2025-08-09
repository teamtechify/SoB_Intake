import { NextRequest, NextResponse } from "next/server";
import { createIntakeRecord, IntakePayload, UploadedFileSummary } from "@/lib/airtable";
import { uploadFileToAirtable } from "@/lib/airtable_upload";
import { uploadAttachmentToRecord, bufferToBase64 } from "@/lib/airtable_content";
import { getFieldIdByName } from "@/lib/airtable_schema";

export const runtime = "nodejs";

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
      try {
        type CreateResponse = { id: string } | { records: { id: string }[] };
        const at = airtable as unknown as CreateResponse;
        const recordId: string | undefined = (at as { id: string }).id || (Array.isArray((at as { records: { id: string }[] }).records) ? (at as { records: { id: string }[] }).records[0]?.id : undefined);
        if (recordId) {
          // Resolve field id for Attachments once for reliability
          const fieldRef = await getFieldIdByName(process.env.AIRTABLE_TABLE_NAME as string, "Attachments");
          const fieldTarget = fieldRef?.fieldId || "Attachments";
          for (const entry of fileEntries) {
            const meta = uploadedFiles.find((u) => u.field === entry.field && u.name === entry.newName);
            if (!meta?.airtableTokenId && entry.file.size <= 5 * 1024 * 1024) {
              const arr = await entry.file.arrayBuffer();
              const base64 = bufferToBase64(arr);
              await uploadAttachmentToRecord({ recordId, field: fieldTarget, base64, contentType: entry.file.type || "application/octet-stream", filename: entry.newName });
            }
          }
        }
      } catch {
        // best-effort; ignore
      }
      return NextResponse.json({ ok: true, airtable });
    }

    // JSON fallback (e.g., if sending application/json)
    const body = (await req.json().catch(() => ({}))) as IntakePayload;
    const airtable = await createIntakeRecord(body);
    return NextResponse.json({ ok: true, airtable });
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error("/api/submit error:", error);
    return NextResponse.json({ ok: false, error: "Submission failed" }, { status: 500 });
  }
}


