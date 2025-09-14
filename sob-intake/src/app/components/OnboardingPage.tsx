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

  const ACCEPTED_FILE_TYPES = ".pdf,.doc,.docx,.md,.txt,.csv,.xlsx";
  const [filesByField, setFilesByField] = useState<Record<string, File[]>>({});

  const defaultState = useMemo(
    () => ({
      companyName: "",
      contactName: "",
      email: "",
      phone: "",
      provider: "",
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

  const addSelectedFiles = (fieldKey: string, list: FileList | null) => {
    if (!list) return;
    const incoming = Array.from(list);
    const filtered = incoming.filter((f) => {
      const dot = f.name.lastIndexOf(".");
      const ext = dot >= 0 ? f.name.slice(dot).toLowerCase() : "";
      return ACCEPTED_FILE_TYPES.split(",").map((s) => s.trim().toLowerCase()).includes(ext);
    });
    setFilesByField((prev) => {
      const existing = prev[fieldKey] || [];
      // Merge by filename+size to avoid duplicate chips if user reopens the picker and selects same files
      const dedupeKey = (f: File) => `${f.name}::${f.size}`;
      const map = new Map<string, File>();
      [...existing, ...filtered].forEach((f) => map.set(dedupeKey(f), f));
      const next = Array.from(map.values());
      // Update counts alongside
      setFileCounts((p) => ({ ...p, [fieldKey]: next.length }));
      return { ...prev, [fieldKey]: next };
    });
  };

  const removeFile = (fieldKey: string, index: number) => {
    setFilesByField((prev) => {
      const current = prev[fieldKey] ? [...prev[fieldKey]] : [];
      if (index >= 0 && index < current.length) current.splice(index, 1);
      const next = { ...prev, [fieldKey]: current };
      setFileCounts((p) => ({ ...p, [fieldKey]: current.length }));
      return next;
    });
  };

  const clearFiles = (fieldKey: string) => {
    setFilesByField((prev) => {
      const next = { ...prev, [fieldKey]: [] };
      setFileCounts((p) => ({ ...p, [fieldKey]: 0 }));
      return next;
    });
  };

  // Removed clearAllFiles as bulk removal UI is no longer present

  const renderFileList = (fieldKey: string) => {
    const items = filesByField[fieldKey] || [];
    if (items.length === 0) return null;
    return (
      <div className="mt-2">
        <div className="mb-2 flex items-center justify-between text-xs text-white/80">
          <span>{items.length} file{items.length === 1 ? "" : "s"} attached</span>
          <button type="button" className="underline hover:text-white" onClick={() => clearFiles(fieldKey)}>Clear</button>
        </div>
        <ul className="flex flex-wrap gap-2">
          {items.map((f, idx) => (
            <li key={`${f.name}-${idx}`} className="flex items-center gap-2 rounded-md border border-white/20 bg-white/5 px-2 py-1 text-xs">
              <span className="text-white/90 truncate max-w-[14rem]" title={f.name}>{f.name}</span>
              <button
                type="button"
                aria-label="Remove file"
                className="inline-flex h-5 w-5 items-center justify-center rounded bg-white/10 hover:bg-white/20 text-white"
                onClick={() => removeFile(fieldKey, idx)}
              >
                ×
              </button>
            </li>
          ))}
        </ul>
      </div>
    );
  };

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
        if (!values.provider) return false;
        if (!phoneValue.e164) return false;
        if (!values.website || !isValidUrl(values.website)) return false;
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
    // Provider required
    if (!values.provider) {
      setError("Provider is required");
      setOpenSections((prev) => prev.map((v, i) => (i === 0 ? true : v)));
      return false;
    }
    // Phone required (must be valid E.164)
    if (!phoneValue.e164) {
      setFieldErrors((p) => ({ ...p, phone: "Enter a valid phone number" }));
      setError("Phone number is required");
      setOpenSections((prev) => prev.map((v, i) => (i === 0 ? true : v)));
      return false;
    }
    // Website required and must be valid URL
    if (!values.website || !isValidUrl(values.website)) {
      setFieldErrors((p) => ({ ...p, website: "Enter a valid URL" }));
      setError("Valid Website URL is required");
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
      // Build FormData manually to avoid duplicate file entries from native inputs
      const form = new FormData();
      // Include text fields
      Object.entries(values).forEach(([k, v]) => {
        if (typeof v === "string") form.append(k, v);
      });
      Object.entries(values.links).forEach(([k, v]) => form.append(`links.${k}`, v));
      // Hidden phone fields usually added by PhoneInput; mirror them explicitly
      form.append("phone_e164", phoneValue.raw || "");
      form.append("phone_country", (phoneValue.country || "").toUpperCase());

      // Append managed files explicitly so selections persist until X removal
      Object.entries(filesByField).forEach(([fieldKey, files]) => {
        files.forEach((file) => form.append(fieldKey, file, file.name));
      });

      const res = await fetch("/api/submit", {
        method: "POST",
        body: form,
      });

      if (!res.ok) throw new Error("Submission failed");
      const json = await res.json();
      console.log("Submitted:", json);
      setSuccess("Thanks! We received your submission.");
      setValues(defaultState);
      setFilesByField({});
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
              <Field label="Provider" required>
                <select
                  name="provider"
                  value={values.provider}
                  onChange={handleChange}
                  required
                  className="w-full rounded-lg sob-select px-3 py-2 text-sm md:text-base focus:outline-none"
               >
                  <option value="" disabled>
                    Choose an option
                  </option>
                  <option value="Blooio">Blooio</option>
                  <option value="SMS">SMS</option>
                </select>
              </Field>
              <Field label="Phone Number" required>
                <PhoneInput
                  value={phoneValue}
                  onChange={(v) => {
                    setPhoneValue(v);
                    setValues((prev) => ({ ...prev, phone: v.raw }));
                    if (v.raw && !v.e164) setFieldErrors((p) => ({ ...p, phone: "Enter a valid phone number" }));
                    else setFieldErrors((p) => ({ ...p, phone: undefined }));
                  }}
                  name="phone"
                  required
                />
                {fieldErrors.phone ? <p className="text-xs text-red-400 mt-1">{fieldErrors.phone}</p> : null}
              </Field>
              <Field label="Website" required>
                <TextInput name="website" value={values.website} onChange={handleChange} placeholder="https://yourdomain.com" required />
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
                    accept={ACCEPTED_FILE_TYPES}
                   multiple
                    onChange={(e)=>{
                     addSelectedFiles("brandVoiceFile", (e.target as HTMLInputElement).files);
                    }}
                 />
                  {renderFileList("brandVoiceFile")}
              </div>
              <div className="space-y-4">
                 <Field label="Sales Pitch Script" hint="Paste content or upload a file." required>
                  <TextArea name="salesPitch" value={values.salesPitch} onChange={handleChange} placeholder="Openers, hooks, objection handling..." />
                </Field>
                 <FileInput
                   name="salesPitchFile"
                    accept={ACCEPTED_FILE_TYPES}
                   multiple
                    onChange={(e)=>{
                     addSelectedFiles("salesPitchFile", (e.target as HTMLInputElement).files);
                    }}
                 />
                  {renderFileList("salesPitchFile")}
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
                 accept={ACCEPTED_FILE_TYPES}
                 multiple
                 onChange={(e)=>{
                   addSelectedFiles("offerInfoFile", (e.target as HTMLInputElement).files);
                 }}
               />
               {renderFileList("offerInfoFile")}
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
                    accept={ACCEPTED_FILE_TYPES}
                   multiple
                    onChange={(e)=>{
                      addSelectedFiles("brandFAQFile", (e.target as HTMLInputElement).files);
                    }}
                 />
                  {renderFileList("brandFAQFile")}
              </div>
              <div className="space-y-4">
                 <Field label="Product FAQ" required>
                  <TextArea name="productFAQ" value={values.productFAQ} onChange={handleChange} placeholder="Features, benefits, pricing, guarantees..." />
                </Field>
                 <FileInput
                   name="productFAQFile"
                    accept={ACCEPTED_FILE_TYPES}
                   multiple
                    onChange={(e)=>{
                      addSelectedFiles("productFAQFile", (e.target as HTMLInputElement).files);
                    }}
                 />
                  {renderFileList("productFAQFile")}
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
              <div className="space-y-4">
                 <Field label="Sales Guide (How to Sell via DM/Text)" required>
                  <TextArea name="salesGuide" value={values.salesGuide} onChange={handleChange} placeholder="Process, scripts, decision trees..." />
                </Field>
                 <FileInput
                   name="salesGuideFile"
                    accept={ACCEPTED_FILE_TYPES}
                   multiple
                    onChange={(e)=>{
                      addSelectedFiles("salesGuideFile", (e.target as HTMLInputElement).files);
                    }}
                 />
                  {renderFileList("salesGuideFile")}
              </div>
              <div className="space-y-4">
                 <Field label="Lead Qualification Criteria / Target Market" required>
                  <TextArea name="leadQualification" value={values.leadQualification} onChange={handleChange} placeholder="Who is a qualified lead? What disqualifies them?" />
                </Field>
                 <FileInput
                   name="leadQualificationFile"
                    accept={ACCEPTED_FILE_TYPES}
                   multiple
                    onChange={(e)=>{
                      addSelectedFiles("leadQualificationFile", (e.target as HTMLInputElement).files);
                    }}
                 />
                  {renderFileList("leadQualificationFile")}
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
                <FileInput name="accessDocs" multiple accept={ACCEPTED_FILE_TYPES} onChange={(e)=>{ addSelectedFiles("accessDocs", (e.target as HTMLInputElement).files); }} />
                {renderFileList("accessDocs")}
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
            {/* Removed 'Remove all files' button */}
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


