import { NextRequest, NextResponse } from "next/server";
import { createIntakeRecord, IntakePayload, UploadedFileSummary } from "@/lib/airtable";
import { uploadBufferToCloudinary } from "@/lib/cloudinary";
import { uploadBufferToDrive } from "@/lib/gdrive";

export const runtime = "nodejs";

export async function POST(req: NextRequest) {
  try {
    const contentType = req.headers.get("content-type") || "";

    if (contentType.includes("multipart/form-data")) {
      const formData = await req.formData();

      const uploadedFiles: UploadedFileSummary[] = [];
      const getText = (name: string) => (formData.get(name) as string) || "";

      const attachmentUrls: { url: string; filename?: string }[] = [];
      const provider = process.env.STORAGE_PROVIDER || "cloudinary";
      for (const [key, value] of formData.entries()) {
        if (value instanceof File && value.size > 0) {
          uploadedFiles.push({ field: key, name: value.name, size: value.size, type: value.type });
          const arrayBuffer = await value.arrayBuffer();
          const buffer = Buffer.from(arrayBuffer);
          if (provider === "cloudinary") {
            const uploaded = await uploadBufferToCloudinary(buffer, value.name);
            attachmentUrls.push({ url: uploaded.secure_url, filename: value.name });
          } else {
            const uploaded = await uploadBufferToDrive(buffer, value.name);
            attachmentUrls.push({ url: uploaded.directUrl, filename: value.name });
          }
        }
      }

      const payload: IntakePayload = {
        companyName: getText("companyName"),
        contactName: getText("contactName"),
        email: getText("email"),
        phone: getText("phone"),
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


