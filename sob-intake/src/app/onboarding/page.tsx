"use client";

import { useMemo, useRef, useState } from "react";

type SelectOption = { label: string; value: string };

const crmOptions: SelectOption[] = [
  { label: "GoHighLevel (GHL)", value: "ghl" },
  { label: "HubSpot", value: "hubspot" },
  { label: "Mailchimp", value: "mailchimp" },
  { label: "Salesforce", value: "salesforce" },
  { label: "Pipedrive", value: "pipedrive" },
  { label: "Other / None", value: "other" },
];

const Section = ({ title, subtitle, children }: { title: string; subtitle?: string; children: React.ReactNode }) => (
  <section className="bg-white/90 rounded-2xl border border-black/5 shadow-sm p-6 md:p-8 space-y-6">
    <header>
      <h2 className="text-xl md:text-2xl font-semibold text-sob-ink">{title}</h2>
      {subtitle ? <p className="mt-1 text-sob-ink/70 text-sm md:text-base">{subtitle}</p> : null}
    </header>
    {children}
  </section>
);

const Field = ({ label, hint, required, children }: { label: string; hint?: string; required?: boolean; children: React.ReactNode }) => (
  <div className="space-y-2">
    <label className="block text-sm font-medium text-sob-ink">
      {label} {required ? <span className="text-sob-accent">*</span> : null}
    </label>
    {hint ? <p className="text-xs text-sob-ink/70">{hint}</p> : null}
    {children}
  </div>
);

const TextInput = (props: React.InputHTMLAttributes<HTMLInputElement>) => (
  <input
    {...props}
    className={[
      "w-full rounded-lg border border-sob-border bg-white/80",
      "px-3 py-2 text-sm md:text-base text-sob-ink",
      "placeholder:text-sob-ink/40 focus:outline-none focus:ring-2 focus:ring-sob-accent/30 focus:border-sob-accent",
      props.className || "",
    ].join(" ")}
  />
);

const TextArea = (props: React.TextareaHTMLAttributes<HTMLTextAreaElement>) => (
  <textarea
    {...props}
    className={[
      "w-full min-h-28 rounded-lg border border-sob-border bg-white/80",
      "px-3 py-2 text-sm md:text-base text-sob-ink",
      "placeholder:text-sob-ink/40 focus:outline-none focus:ring-2 focus:ring-sob-accent/30 focus:border-sob-accent",
      props.className || "",
    ].join(" ")}
  />
);

const FileInput = (props: React.InputHTMLAttributes<HTMLInputElement>) => (
  <input
    type="file"
    {...props}
    className={[
      "block w-full text-sm text-sob-ink/80 file:mr-4 file:py-2 file:px-4",
      "file:rounded-md file:border-0 file:text-sm file:font-medium",
      "file:bg-sob-accent/10 file:text-sob-ink hover:file:bg-sob-accent/15",
    ].join(" ")}
  />
);

export default function OnboardingPage() {
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const formRef = useRef<HTMLFormElement | null>(null);

  const defaultState = useMemo(
    () => ({
      companyName: "",
      contactName: "",
      email: "",
      phone: "",
      website: "",
      instagram: "",
      crm: "",
      emailPlatform: "",
      links: {
        landingPages: "",
        calendars: "",
        webinarLinks: "",
        formsSurveys: "",
        otherAssets: "",
      },
      // long-form text fields
      brandVoice: "",
      salesPitch: "",
      offerInfo: "",
      brandFAQ: "",
      productFAQ: "",
      salesGuide: "",
      leadQualification: "",
      credentials: "",
      notes: "",
    }),
    []
  );

  const [values, setValues] = useState(defaultState);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    if (name.startsWith("links.")) {
      const key = name.split(".")[1] as keyof (typeof defaultState)["links"];
      setValues((prev) => ({ ...prev, links: { ...prev.links, [key]: value } }));
    } else {
      setValues((prev) => ({ ...prev, [name]: value }));
    }
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setSubmitting(true);
    setSuccess(null);
    setError(null);

    try {
      const formElement = formRef.current;
      if (!formElement) throw new Error("Form not available");
      const form = new FormData(formElement);
      // Include text fields
      Object.entries(values).forEach(([k, v]) => {
        if (typeof v === "string") form.append(k, v);
      });
      Object.entries(values.links).forEach(([k, v]) => form.append(`links.${k}`, v));

      const res = await fetch("/api/submit", {
        method: "POST",
        body: form,
      });

      if (!res.ok) throw new Error("Submission failed");
      const json = await res.json();
      console.log("Submitted:", json);
      setSuccess("Thanks! We received your submission.");
      setValues(defaultState);
      formElement.reset();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-sob-paper text-sob-ink">
      <div className="mx-auto max-w-5xl px-4 md:px-6 py-10 md:py-14">
        <header className="mb-8 md:mb-12">
          <h1 className="text-2xl md:text-4xl font-bold tracking-tight text-sob-ink">School of Bots — Client Onboarding</h1>
          <p className="mt-2 text-sob-ink/70 max-w-3xl">
            Provide the details below to set up your AI-powered Instagram DM sales funnel. You can paste text or upload
            files for each content section.
          </p>
        </header>

        <form ref={formRef} onSubmit={handleSubmit} className="space-y-8" encType="multipart/form-data">
          <Section
            title="1) Brand Info"
            subtitle="Who are we launching for and how can we reach you?"
          >
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Field label="Company Name" required>
                <TextInput name="companyName" value={values.companyName} onChange={handleChange} required placeholder="e.g., Acme Inc." />
              </Field>
              <Field label="Contact Person Full Name" required>
                <TextInput name="contactName" value={values.contactName} onChange={handleChange} required placeholder="e.g., Jane Doe" />
              </Field>
              <Field label="Email Address" required>
                <TextInput name="email" type="email" value={values.email} onChange={handleChange} required placeholder="you@company.com" />
              </Field>
              <Field label="Phone Number">
                <TextInput name="phone" type="tel" value={values.phone} onChange={handleChange} placeholder="e.g., +1 555 123 4567" />
              </Field>
              <Field label="Website">
                <TextInput name="website" value={values.website} onChange={handleChange} placeholder="https://yourdomain.com" />
              </Field>
              <Field label="Instagram Handle">
                <TextInput name="instagram" value={values.instagram} onChange={handleChange} placeholder="@yourbrand" />
              </Field>
            </div>
          </Section>

          <Section
            title="2) Brand Voice & Offers"
            subtitle="Share the assets that shape your voice, pitch, and offer."
          >
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <Field label="Brand Voice Guide" hint="Paste content or upload a file.">
                  <TextArea name="brandVoice" value={values.brandVoice} onChange={handleChange} placeholder="Tone, style, dos/don'ts..." />
                </Field>
                <FileInput name="brandVoiceFile" accept=".pdf,.doc,.docx,.md,.txt" />
              </div>
              <div className="space-y-4">
                <Field label="Sales Pitch Script" hint="Paste content or upload a file.">
                  <TextArea name="salesPitch" value={values.salesPitch} onChange={handleChange} placeholder="Openers, hooks, objection handling..." />
                </Field>
                <FileInput name="salesPitchFile" accept=".pdf,.doc,.docx,.md,.txt" />
              </div>
            </div>
            <div className="mt-6 space-y-4">
              <Field
                label="Offer Information"
                hint="Include investment, what's included, how/why it works, scarcity, urgency, and risk reversal."
              >
                <TextArea name="offerInfo" value={values.offerInfo} onChange={handleChange} />
              </Field>
              <FileInput name="offerInfoFile" accept=".pdf,.doc,.docx,.md,.txt" />
            </div>
          </Section>

          <Section
            title="3) Sales Process & FAQs"
            subtitle="Help our AI agents answer accurately and qualify leads."
          >
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <Field label="Brand FAQ">
                  <TextArea name="brandFAQ" value={values.brandFAQ} onChange={handleChange} placeholder="Company background, policies, etc." />
                </Field>
                <FileInput name="brandFAQFile" accept=".pdf,.doc,.docx,.md,.txt" />
              </div>
              <div className="space-y-4">
                <Field label="Product FAQ">
                  <TextArea name="productFAQ" value={values.productFAQ} onChange={handleChange} placeholder="Features, benefits, pricing, guarantees..." />
                </Field>
                <FileInput name="productFAQFile" accept=".pdf,.doc,.docx,.md,.txt" />
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
              <div className="space-y-4">
                <Field label="Sales Guide (How to Sell via DM/Text)">
                  <TextArea name="salesGuide" value={values.salesGuide} onChange={handleChange} placeholder="Process, scripts, decision trees..." />
                </Field>
                <FileInput name="salesGuideFile" accept=".pdf,.doc,.docx,.md,.txt" />
              </div>
              <div className="space-y-4">
                <Field label="Lead Qualification Criteria / Target Market">
                  <TextArea name="leadQualification" value={values.leadQualification} onChange={handleChange} placeholder="Who is a qualified lead? What disqualifies them?" />
                </Field>
                <FileInput name="leadQualificationFile" accept=".pdf,.doc,.docx,.md,.txt" />
              </div>
            </div>
          </Section>

          <Section
            title="4) Tech Access & Integrations"
            subtitle="Connect the tools needed for attribution, scheduling, and follow-up."
          >
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Field label="CRM Platform" required hint="Select the primary CRM or pipeline tool you use.">
                <select
                  name="crm"
                  value={values.crm}
                  onChange={handleChange}
                  required
                  className="w-full rounded-lg border border-sob-border bg-white/80 px-3 py-2 text-sm md:text-base text-sob-ink focus:outline-none focus:ring-2 focus:ring-sob-accent/30 focus:border-sob-accent"
                >
                  <option value="" disabled>
                    Choose an option
                  </option>
                  {crmOptions.map((o) => (
                    <option key={o.value} value={o.value}>
                      {o.label}
                    </option>
                  ))}
                </select>
              </Field>
              <Field label="Email Marketing Platform" hint="Optional (e.g., Klaviyo, Mailchimp, ConvertKit)">
                <TextInput name="emailPlatform" value={values.emailPlatform} onChange={handleChange} placeholder="e.g., Klaviyo" />
              </Field>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
              <Field label="Landing Pages (links)" hint="Comma or line-separated URLs">
                <TextArea name="links.landingPages" value={values.links.landingPages} onChange={handleChange} />
              </Field>
              <Field label="Calendars (links)" hint="Calendly or GHL Calendar URLs">
                <TextArea name="links.calendars" value={values.links.calendars} onChange={handleChange} />
              </Field>
              <Field label="Webinar/Video Links">
                <TextArea name="links.webinarLinks" value={values.links.webinarLinks} onChange={handleChange} />
              </Field>
              <Field label="Forms / Surveys">
                <TextArea name="links.formsSurveys" value={values.links.formsSurveys} onChange={handleChange} />
              </Field>
              <Field label="Any other relevant tech assets">
                <TextArea name="links.otherAssets" value={values.links.otherAssets} onChange={handleChange} />
              </Field>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
              <div className="space-y-2">
                <label className="block text-sm font-medium text-sob-ink">Upload any access documents (PDF, DOCX, etc.)</label>
                <FileInput name="accessDocs" multiple accept=".pdf,.doc,.docx,.txt" />
              </div>
              <div className="space-y-2">
                <label className="block text-sm font-medium text-sob-ink">Optional: Credentials / API Keys (secured)</label>
                <TextArea name="credentials" value={values.credentials} onChange={handleChange} placeholder="If sharing here, mask sensitive parts or provide password manager links." />
              </div>
            </div>
          </Section>

          <Section title="5) Final Notes" subtitle="Share anything else we should know.">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Field label="Additional Notes">
                <TextArea name="notes" value={values.notes} onChange={handleChange} placeholder="Timeline, stakeholders, constraints..." />
              </Field>
              <div className="space-y-2">
                <label className="block text-sm font-medium text-sob-ink">Optional: Loom video walkthrough (URL)</label>
                <TextInput name="loomUrl" placeholder="https://www.loom.com/share/..." />
              </div>
            </div>
          </Section>

          <div className="pt-2 flex items-center gap-3">
            <button
              type="submit"
              disabled={submitting}
              className="inline-flex items-center gap-2 rounded-lg bg-sob-ink text-white px-5 py-2.5 text-sm md:text-base font-medium hover:bg-black focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-sob-accent disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {submitting ? "Submitting…" : "Submit Onboarding"}
            </button>
            {success ? <span className="text-green-700 text-sm">{success}</span> : null}
            {error ? <span className="text-red-700 text-sm">{error}</span> : null}
          </div>
        </form>

        <footer className="mt-12 text-xs text-sob-ink/60">
          By submitting, you agree to securely share the materials necessary to configure your DM funnel. Avoid
          plaintext secrets; use a password manager link if possible.
        </footer>
      </div>
    </div>
  );
}


