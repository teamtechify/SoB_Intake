"use client";

import { useMemo, useRef, useState } from "react";
import { PhoneInput, PhoneValue } from "./phone-input";

type SelectOption = { label: string; value: string };

const crmOptions: SelectOption[] = [
  { label: "GoHighLevel (GHL)", value: "ghl" },
  { label: "HubSpot", value: "hubspot" },
  { label: "Mailchimp", value: "mailchimp" },
  { label: "Salesforce", value: "salesforce" },
  { label: "Pipedrive", value: "pipedrive" },
  { label: "Other / None", value: "other" },
];

type AccordionSectionProps = {
  index: number;
  title: string;
  subtitle?: string;
  open: boolean;
  completed?: boolean;
  onToggle: (index: number) => void;
  children: React.ReactNode;
};

const AccordionSection = ({ index, title, subtitle, open, completed, onToggle, children }: AccordionSectionProps) => (
  <section className={`relative rounded-2xl border border-white/15 shadow-sm overflow-hidden ${open ? "sob-card-gradient" : "sob-card-base"} text-white/90 ${completed ? "sob-complete" : ""}`} style={{ isolation: "isolate" }}>
    <button
      type="button"
      onClick={() => onToggle(index)}
      className="w-full flex items-center justify-between gap-4 px-5 md:px-7 py-4 md:py-5 border-l-4 sob-card-foreground"
      style={{ borderColor: completed ? "#16a34a" : "var(--sob-accent)" }}
    >
      <div className="text-left">
        <h2 className="text-xl md:text-2xl font-semibold tracking-tight text-white">{title}</h2>
        {subtitle ? <p className="mt-1 text-white/70 text-sm md:text-base leading-relaxed">{subtitle}</p> : null}
      </div>
      <div className="flex items-center gap-3">
        {completed ? (
          <span className="inline-flex items-center text-green-400 text-sm font-medium">Completed</span>
        ) : (
          <span className="inline-flex items-center text-white/60 text-sm">Incomplete</span>
        )}
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 20 20"
          fill="currentColor"
          className={`h-5 w-5 text-white transition-transform ${open ? "rotate-180" : "rotate-0"}`}
          aria-hidden
        >
          <path
            fillRule="evenodd"
            d="M5.23 7.21a.75.75 0 011.06.02L10 11.137l3.71-3.906a.75.75 0 111.08 1.04l-4.25 4.478a.75.75 0 01-1.08 0L5.21 8.27a.75.75 0 01.02-1.06z"
            clipRule="evenodd"
          />
        </svg>
      </div>
    </button>
    <div
      className={`grid transition-[grid-template-rows,opacity] duration-400 ease-out ${open ? "opacity-100" : "opacity-0"}`}
      style={{ gridTemplateRows: open ? "1fr" : "0fr" }}
    >
      <div className="overflow-hidden sob-card-foreground">
        <div className="p-5 md:p-7 space-y-6 text-white/90">{children}</div>
      </div>
    </div>
    {/* Green overlay when completed and open */}
    <div className="sob-card-overlay" style={{ opacity: completed && open ? 1 : 0 }} />
  </section>
);

const Field = ({ label, hint, required, children }: { label: string; hint?: string; required?: boolean; children: React.ReactNode }) => (
  <div className="space-y-2">
    <label className="block text-sm font-medium">
      {label} {required ? <span className="text-sob-accent">*</span> : null}
    </label>
     {hint ? <p className="text-xs opacity-80 text-white/80">{hint}</p> : null}
    {children}
  </div>
);

const TextInput = (props: React.InputHTMLAttributes<HTMLInputElement>) => (
  <input
    {...props}
    className={[
      "w-full rounded-lg border border-white/20 bg-white/5",
      "px-3 py-2 text-sm md:text-base text-white",
      "placeholder:text-white/50 focus:outline-none focus:ring-2 focus:ring-sob-accent/30 focus:border-sob-accent/60",
      props.className || "",
    ].join(" ")}
  />
);

const TextArea = (props: React.TextareaHTMLAttributes<HTMLTextAreaElement>) => (
  <textarea
    {...props}
    className={[
      "w-full min-h-28 rounded-lg border border-white/20 bg-white/5",
      "px-3 py-2 text-sm md:text-base text-white",
      "placeholder:text-white/50 focus:outline-none focus:ring-2 focus:ring-sob-accent/30 focus:border-sob-accent/60",
      props.className || "",
    ].join(" ")}
  />
);

const FileInput = (props: React.InputHTMLAttributes<HTMLInputElement>) => {
  const wrapperRef = useRef<HTMLDivElement | null>(null);
  return (
    <div ref={wrapperRef} className="sob-file">
      <input
        type="file"
        {...props}
        onChange={(e) => {
          props.onChange?.(e);
          const has = e.currentTarget.files && e.currentTarget.files.length > 0;
          const el = wrapperRef.current;
          if (!el) return;
          if (has) el.classList.add("has-file");
          else el.classList.remove("has-file");
        }}
        className={["block w-full text-sm", props.className || ""].join(" ")}
      />
    </div>
  );
};

export default function OnboardingPage() {
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const formRef = useRef<HTMLFormElement | null>(null);
  const [fieldErrors, setFieldErrors] = useState<{
    email?: string;
    phone?: string;
    instagram?: string;
    website?: string;
  }>({});

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
  const [phoneValue, setPhoneValue] = useState<PhoneValue>({ country: "US", raw: "", national: "" });
  const [openSections, setOpenSections] = useState<boolean[]>([true, false, false, false, false]);
  const [fileCounts, setFileCounts] = useState<Record<string, number>>({});

  const isValidEmail = (v: string) => /.+@.+\..+/.test(v);
  const isValidPhone = (v: string) => /^\+?[0-9()\-\s]{7,20}$/.test(v);
  const isValidInstagram = (v: string) => /^[a-zA-Z0-9._]{1,30}$/.test(v) && !v.endsWith(".");
  const isValidUrl = (v: string) =>
    /^(https?:\/\/)?([\w-]+\.)+[\w-]{2,}(\/[\w\-._~:\/?#[\]@!$&'()*+,;=.]+)?$/.test(v);

  const validateField = (name: string, value: string) => {
    if (name === "email") {
      const ok = value ? isValidEmail(value) : true;
      setFieldErrors((prev) => ({ ...prev, email: ok ? undefined : "Enter a valid email address" }));
    }
    // phone handled by phone component
    if (name === "instagram") {
      const stripped = value.replace(/@/g, "");
      const ok = stripped ? isValidInstagram(stripped) : true;
      setFieldErrors((prev) => ({ ...prev, instagram: ok ? undefined : "Use letters/numbers/._ (max 30); @ is added automatically" }));
    }
    if (name === "website") {
      const ok = value ? isValidUrl(value) : true;
      setFieldErrors((prev) => ({ ...prev, website: ok ? undefined : "Enter a valid URL" }));
    }
  };
  const toggleOpen = (idx: number) => {
    setOpenSections((prev) => prev.map((v, i) => (i === idx ? !v : v)));
  };

  const sectionCompleted = (idx: number): boolean => {
    switch (idx) {
      case 0:
        // Required: companyName, contactName, email (valid), instagram handle present & valid
        if (!values.companyName || !values.contactName || !values.email || !isValidEmail(values.email)) return false;
        if (!values.instagram || !isValidInstagram(values.instagram)) return false;
        if (values.phone && !isValidPhone(values.phone)) return false;
        if (values.website && !isValidUrl(values.website)) return false;
        return true;
      case 1:
        // Required: Brand Voice, Sales Pitch, Offer Info (each: text OR file)
        const hasBrandVoice = Boolean(values.brandVoice || (fileCounts["brandVoiceFile"] || 0) > 0);
        const hasSalesPitch = Boolean(values.salesPitch || (fileCounts["salesPitchFile"] || 0) > 0);
        const hasOfferInfo = Boolean(values.offerInfo || (fileCounts["offerInfoFile"] || 0) > 0);
        return hasBrandVoice && hasSalesPitch && hasOfferInfo;
      case 2:
        // Required: Brand FAQ, Product FAQ, Sales Guide, Lead Qualification (each: text OR file)
        const hasBrandFAQ = Boolean(values.brandFAQ || (fileCounts["brandFAQFile"] || 0) > 0);
        const hasProductFAQ = Boolean(values.productFAQ || (fileCounts["productFAQFile"] || 0) > 0);
        const hasSalesGuide = Boolean(values.salesGuide || (fileCounts["salesGuideFile"] || 0) > 0);
        const hasLeadQual = Boolean(values.leadQualification || (fileCounts["leadQualificationFile"] || 0) > 0);
        return hasBrandFAQ && hasProductFAQ && hasSalesGuide && hasLeadQual;
      case 3:
        // Only CRM is required for completion indicator. Other fields are optional
        // and do not block the green state even if filled with invalid URLs.
        return Boolean(values.crm);
      case 4:
        const loom = (values as { loomUrl?: string }).loomUrl;
        if (loom && !isValidUrl(loom)) return false;
        return Boolean(values.notes || loom);
      default:
        return false;
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    if (name.startsWith("links.")) {
      const key = name.split(".")[1] as keyof (typeof defaultState)["links"];
      setValues((prev) => ({ ...prev, links: { ...prev.links, [key]: value } }));
    } else {
      setValues((prev) => ({ ...prev, [name]: value }));
    }
    validateField(name, value);
  };

  const validateRequired = (): boolean => {
    // Instagram required
    if (!values.instagram) {
      setError("Instagram Handle is required");
      setOpenSections((prev) => prev.map((v, i) => (i === 0 ? true : v)));
      return false;
    }
    // Section 2 required items (text OR file)
    if (!values.brandVoice && (fileCounts["brandVoiceFile"] || 0) === 0) {
      setError("Brand Voice Guide is required (paste or upload)");
      setOpenSections((prev) => prev.map((v, i) => (i === 1 ? true : v)));
      return false;
    }
    if (!values.salesPitch && (fileCounts["salesPitchFile"] || 0) === 0) {
      setError("Sales Pitch Script is required (paste or upload)");
      setOpenSections((prev) => prev.map((v, i) => (i === 1 ? true : v)));
      return false;
    }
    if (!values.offerInfo && (fileCounts["offerInfoFile"] || 0) === 0) {
      setError("Offer Information is required (paste or upload)");
      setOpenSections((prev) => prev.map((v, i) => (i === 1 ? true : v)));
      return false;
    }
    // Section 3 required items (text OR file)
    if (!values.brandFAQ && (fileCounts["brandFAQFile"] || 0) === 0) {
      setError("Brand FAQ is required (paste or upload)");
      setOpenSections((prev) => prev.map((v, i) => (i === 2 ? true : v)));
      return false;
    }
    if (!values.productFAQ && (fileCounts["productFAQFile"] || 0) === 0) {
      setError("Product FAQ is required (paste or upload)");
      setOpenSections((prev) => prev.map((v, i) => (i === 2 ? true : v)));
      return false;
    }
    if (!values.salesGuide && (fileCounts["salesGuideFile"] || 0) === 0) {
      setError("Sales Guide is required (paste or upload)");
      setOpenSections((prev) => prev.map((v, i) => (i === 2 ? true : v)));
      return false;
    }
    if (!values.leadQualification && (fileCounts["leadQualificationFile"] || 0) === 0) {
      setError("Lead Qualification criteria is required (paste or upload)");
      setOpenSections((prev) => prev.map((v, i) => (i === 2 ? true : v)));
      return false;
    }
    setError(null);
    return true;
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setSubmitting(true);
    setSuccess(null);
    setError(null);

    try {
      if (!validateRequired()) {
        setSubmitting(false);
        return;
      }
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
      setFileCounts({});
      setPhoneValue({ country: "US", raw: "", national: "" });
      setFieldErrors({});
      formElement.reset();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen text-sob-ink">
      <div className="bg-transparent">
        <div className="mx-auto max-w-5xl px-4 md:px-6 pt-10 md:pt-14">
          <header className="mb-6 md:mb-8 text-center">
            <h1 className="mt-0 text-2xl md:text-4xl font-bold tracking-tight text-white" style={{ fontFamily: 'Druk Wide, var(--font-sans)', textTransform: 'uppercase', letterSpacing: '.02em' }}>
              New Account Onboarding
            </h1>
            <p className="mt-2 text-white/80 max-w-3xl mx-auto text-sm md:text-base">
              Provide the details below to set up your AI-powered Instagram DM sales funnel. You can paste text or upload
              files for each content section.
            </p>
          </header>
        </div>
      </div>
      <div className="mx-auto max-w-5xl px-4 md:px-6 pb-10 md:pb-14">

        <form ref={formRef} onSubmit={handleSubmit} className="space-y-6 md:space-y-8" encType="multipart/form-data">
          {/* Section 1: Brand Info */}
          <AccordionSection
            index={0}
            title="1) Brand Info"
            subtitle="Who are we launching for and how can we reach you?"
            open={openSections[0]}
            completed={sectionCompleted(0)}
            onToggle={toggleOpen}
          >
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Field label="Company Name" required>
                <TextInput name="companyName" value={values.companyName} onChange={handleChange} required placeholder="e.g., Acme Inc." />
              </Field>
              <Field label="Contact Person Full Name" required>
                <TextInput name="contactName" value={values.contactName} onChange={handleChange} required placeholder="e.g., Jane Doe" />
              </Field>
              <Field label="Email Address" required>
                <TextInput
                  name="email"
                  type="email"
                  value={values.email}
                  onChange={handleChange}
                  required
                  placeholder="you@company.com"
                />
                {fieldErrors.email ? <p className="text-xs text-red-600 mt-1">{fieldErrors.email}</p> : null}
              </Field>
              <Field label="Phone Number">
                <PhoneInput
                  value={phoneValue}
                  onChange={(v) => {
                    setPhoneValue(v);
                    setValues((prev) => ({ ...prev, phone: v.raw }));
                    if (v.raw && !v.e164) setFieldErrors((p) => ({ ...p, phone: "Enter a valid phone number" }));
                    else setFieldErrors((p) => ({ ...p, phone: undefined }));
                  }}
                  name="phone"
                />
                {fieldErrors.phone ? <p className="text-xs text-red-400 mt-1">{fieldErrors.phone}</p> : null}
              </Field>
              <Field label="Website">
                <TextInput name="website" value={values.website} onChange={handleChange} placeholder="https://yourdomain.com" />
                {fieldErrors.website ? <p className="text-xs text-red-600 mt-1">{fieldErrors.website}</p> : null}
              </Field>
               <Field label="Instagram Handle" required>
                 <div className="relative">
                   <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-white/60">@</span>
                   <input
                     name="instagram"
                     value={values.instagram}
                     onChange={(e) => {
                       const stripped = e.target.value.replace(/@/g, "");
                       setValues((prev) => ({ ...prev, instagram: stripped }));
                       validateField("instagram", stripped);
                     }}
                     placeholder="yourbrand"
                      required
                      className="w-full rounded-lg border border-white/20 bg-white/5 px-7 py-2 text-sm md:text-base text-white placeholder:text-white/50 focus:outline-none focus:ring-2 focus:ring-sob-accent/30 focus:border-sob-accent/60"
                   />
                 </div>
                 {fieldErrors.instagram ? <p className="text-xs text-red-600 mt-1">{fieldErrors.instagram}</p> : null}
               </Field>
            </div>
          </AccordionSection>

          {/* Section 2: Brand Voice & Offers */}
          <AccordionSection
            index={1}
            title="2) Brand Voice & Offers"
            subtitle="Share the assets that shape your voice, pitch, and offer."
            open={openSections[1]}
            completed={sectionCompleted(1)}
            onToggle={toggleOpen}
          >
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
               <Field label="Brand Voice Guide" hint="Paste content or upload a file." required>
                  <TextArea name="brandVoice" value={values.brandVoice} onChange={handleChange} placeholder="Tone, style, dos/don'ts..." />
                </Field>
                 <FileInput
                   name="brandVoiceFile"
                   accept=".pdf,.doc,.docx,.md,.txt"
                   multiple
                   onChange={(e)=>{
                     const count = (e.target as HTMLInputElement).files?.length ?? 0;
                     setFileCounts((p)=>({...p, brandVoiceFile: count}));
                   }}
                 />
              </div>
              <div className="space-y-4">
                 <Field label="Sales Pitch Script" hint="Paste content or upload a file." required>
                  <TextArea name="salesPitch" value={values.salesPitch} onChange={handleChange} placeholder="Openers, hooks, objection handling..." />
                </Field>
                 <FileInput
                   name="salesPitchFile"
                   accept=".pdf,.doc,.docx,.md,.txt"
                   multiple
                   onChange={(e)=>{
                     const count = (e.target as HTMLInputElement).files?.length ?? 0;
                     setFileCounts((p)=>({...p, salesPitchFile: count}));
                   }}
                 />
              </div>
            </div>
            <div className="mt-6 space-y-4">
               <Field
                 label="Offer Information"
                 hint="Include investment, what's included, how/why it works, scarcity, urgency, and risk reversal."
                 required
               >
                <TextArea name="offerInfo" value={values.offerInfo} onChange={handleChange} />
              </Field>
               <FileInput
                 name="offerInfoFile"
                 accept=".pdf,.doc,.docx,.md,.txt"
                 multiple
                 onChange={(e)=>{
                   const count = (e.target as HTMLInputElement).files?.length ?? 0;
                   setFileCounts((p)=>({...p, offerInfoFile: count}));
                 }}
               />
            </div>
          </AccordionSection>

          {/* Section 3: Sales Process & FAQs */}
          <AccordionSection
            index={2}
            title="3) Sales Process & FAQs"
            subtitle="Help our AI agents answer accurately and qualify leads."
            open={openSections[2]}
            completed={sectionCompleted(2)}
            onToggle={toggleOpen}
          >
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                 <Field label="Brand FAQ" required>
                  <TextArea name="brandFAQ" value={values.brandFAQ} onChange={handleChange} placeholder="Company background, policies, etc." />
                </Field>
                 <FileInput
                   name="brandFAQFile"
                   accept=".pdf,.doc,.docx,.md,.txt"
                   multiple
                   onChange={(e)=>{
                     const count = (e.target as HTMLInputElement).files?.length ?? 0;
                     setFileCounts((p)=>({...p, brandFAQFile: count}));
                   }}
                 />
              </div>
              <div className="space-y-4">
                 <Field label="Product FAQ" required>
                  <TextArea name="productFAQ" value={values.productFAQ} onChange={handleChange} placeholder="Features, benefits, pricing, guarantees..." />
                </Field>
                 <FileInput
                   name="productFAQFile"
                   accept=".pdf,.doc,.docx,.md,.txt"
                   multiple
                   onChange={(e)=>{
                     const count = (e.target as HTMLInputElement).files?.length ?? 0;
                     setFileCounts((p)=>({...p, productFAQFile: count}));
                   }}
                 />
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
              <div className="space-y-4">
                 <Field label="Sales Guide (How to Sell via DM/Text)" required>
                  <TextArea name="salesGuide" value={values.salesGuide} onChange={handleChange} placeholder="Process, scripts, decision trees..." />
                </Field>
                 <FileInput
                   name="salesGuideFile"
                   accept=".pdf,.doc,.docx,.md,.txt"
                   multiple
                   onChange={(e)=>{
                     const count = (e.target as HTMLInputElement).files?.length ?? 0;
                     setFileCounts((p)=>({...p, salesGuideFile: count}));
                   }}
                 />
              </div>
              <div className="space-y-4">
                 <Field label="Lead Qualification Criteria / Target Market" required>
                  <TextArea name="leadQualification" value={values.leadQualification} onChange={handleChange} placeholder="Who is a qualified lead? What disqualifies them?" />
                </Field>
                 <FileInput
                   name="leadQualificationFile"
                   accept=".pdf,.doc,.docx,.md,.txt"
                   multiple
                   onChange={(e)=>{
                     const count = (e.target as HTMLInputElement).files?.length ?? 0;
                     setFileCounts((p)=>({...p, leadQualificationFile: count}));
                   }}
                 />
              </div>
            </div>
          </AccordionSection>

          {/* Section 4: Tech Access & Integrations */}
          <AccordionSection
            index={3}
            title="4) Tech Access & Integrations"
            subtitle="Connect the tools needed for attribution, scheduling, and follow-up."
            open={openSections[3]}
            completed={sectionCompleted(3)}
            onToggle={toggleOpen}
          >
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Field label="CRM Platform" required hint="Select the primary CRM or pipeline tool you use.">
                <select
                  name="crm"
                  value={values.crm}
                  onChange={handleChange}
                  required
                  className="w-full rounded-lg sob-select px-3 py-2 text-sm md:text-base focus:outline-none"
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
                 <label className="block text-sm font-medium text-white">Upload any access documents (PDF, DOCX, etc.)</label>
                <FileInput name="accessDocs" multiple accept=".pdf,.doc,.docx,.txt" />
              </div>
              <div className="space-y-2">
                 <label className="block text-sm font-medium text-white">Optional: Credentials / API Keys (secured)</label>
                <TextArea name="credentials" value={values.credentials} onChange={handleChange} placeholder="If sharing here, mask sensitive parts or provide password manager links." />
              </div>
            </div>
          </AccordionSection>

          {/* Section 5: Final Notes */}
          <AccordionSection
            index={4}
            title="5) Final Notes"
            subtitle="Share anything else we should know."
            open={openSections[4]}
            completed={sectionCompleted(4)}
            onToggle={toggleOpen}
          >
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Field label="Additional Notes">
                <TextArea name="notes" value={values.notes} onChange={handleChange} placeholder="Timeline, stakeholders, constraints..." />
              </Field>
              <div className="space-y-2">
                 <label className="block text-sm font-medium text-white">Optional: Loom video walkthrough (URL)</label>
                <TextInput name="loomUrl" placeholder="https://www.loom.com/share/..." />
              </div>
            </div>
          </AccordionSection>

          <div className="pt-2 flex items-center justify-center gap-3">
            <button type="submit" disabled={submitting} className="sob-pill-btn px-6 py-2.5 text-sm md:text-base disabled:opacity-60 disabled:cursor-not-allowed">
              <span className="sob-pill-label">{submitting ? "Submitting…" : "Submit"}</span>
            </button>
            {success ? <span className="text-green-700 text-sm">{success}</span> : null}
            {error ? <span className="text-red-700 text-sm">{error}</span> : null}
          </div>
        </form>

        <footer className="mt-12 text-xs text-white/80 text-center">
          By submitting, you agree to securely share the materials necessary to configure your DM funnel. Avoid plaintext
          secrets; use a password manager link if possible.
        </footer>
      </div>
    </div>
  );
}


