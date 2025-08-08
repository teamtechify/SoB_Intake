export type IntakeLinks = {
  landingPages?: string;
  calendars?: string;
  webinarLinks?: string;
  formsSurveys?: string;
  otherAssets?: string;
};

export type UploadedFileSummary = {
  field: string;
  name: string;
  size: number;
  type: string;
};

export type IntakePayload = {
  companyName?: string;
  contactName?: string;
  email?: string;
  phone?: string;
  website?: string;
  instagram?: string;
  crm?: string;
  emailPlatform?: string;
  links?: IntakeLinks;
  brandVoice?: string;
  salesPitch?: string;
  offerInfo?: string;
  brandFAQ?: string;
  productFAQ?: string;
  salesGuide?: string;
  leadQualification?: string;
  credentials?: string;
  notes?: string;
  loomUrl?: string;
  uploadedFiles?: UploadedFileSummary[];
  attachments?: { url: string; filename?: string }[];
};

function requireEnv(name: string): string {
  const value = process.env[name];
  if (!value) {
    throw new Error(`Missing required env var: ${name}`);
  }
  return value;
}

export async function createIntakeRecord(payload: IntakePayload) {
  const apiKey = requireEnv("AIRTABLE_API_KEY");
  const baseId = requireEnv("AIRTABLE_BASE_ID");
  const tableName = requireEnv("AIRTABLE_TABLE_NAME");

  // Map payload to Airtable fields. Adjust field names to your Airtable schema.
  const fields: Record<string, unknown> = {};

  const setField = (name: string, value: unknown) => {
    if (value === undefined || value === null) return;
    if (typeof value === "string" && value.trim() === "") return;
    if (Array.isArray(value) && value.length === 0) return;
    fields[name] = value;
  };

  setField("Company Name", payload.companyName);
  setField("Contact Name", payload.contactName);
  setField("Email", payload.email);
  setField("Phone", payload.phone);
  setField("Website", payload.website);
  setField("Instagram", payload.instagram);
  setField("CRM", payload.crm);
  setField("Email Platform", payload.emailPlatform);
  setField("Landing Pages", payload.links?.landingPages);
  setField("Calendars", payload.links?.calendars);
  setField("Webinar Links", payload.links?.webinarLinks);
  setField("Forms/Surveys", payload.links?.formsSurveys);
  setField("Other Tech Assets", payload.links?.otherAssets);
  setField("Brand Voice (Text)", payload.brandVoice);
  setField("Sales Pitch (Text)", payload.salesPitch);
  setField("Offer Info (Text)", payload.offerInfo);
  setField("Brand FAQ (Text)", payload.brandFAQ);
  setField("Product FAQ (Text)", payload.productFAQ);
  setField("Sales Guide (Text)", payload.salesGuide);
  setField("Lead Qualification (Text)", payload.leadQualification);
  setField("Credentials/API Keys", payload.credentials);
  setField("Notes", payload.notes);
  setField("Loom URL", payload.loomUrl);
  setField("Uploaded Files (names)", payload.uploadedFiles?.map((f) => f.name).join(", "));
  const attachmentsMode = (process.env.AIRTABLE_ATTACHMENTS_MODE || "attachment").toLowerCase();
  if (attachmentsMode === "attachment") {
    setField("Attachments", payload.attachments);
  } else if (attachmentsMode === "text") {
    // Write URLs into a long-text field. Use existing field name 'Attachments' for convenience.
    setField(
      "Attachments",
      payload.attachments && payload.attachments.length > 0
        ? payload.attachments.map((a) => a.url).join(", ")
        : undefined
    );
  }
  setField("Raw JSON", JSON.stringify(payload));

  const url = `https://api.airtable.com/v0/${baseId}/${encodeURIComponent(tableName)}`;

  const res = await fetch(url, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ fields }),
    cache: "no-store",
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Airtable error: ${res.status} ${res.statusText} — ${text}`);
  }

  return res.json();
}


