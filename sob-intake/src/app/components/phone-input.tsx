"use client";

import { useEffect, useState, type ComponentType } from "react";
import PhoneInputLib, { CountryData } from "react-phone-input-2";
import "react-phone-input-2/lib/style.css";
import { parsePhoneNumberFromString } from "libphonenumber-js";

export type PhoneValue = {
  country: string; // ISO2 lowercase (react-phone-input-2 uses lowercase, e.g. 'us')
  raw: string; // full international number (e.g., +12125550100)
  national: string; // national formatted number
  e164?: string; // +E.164 if valid
};

export function PhoneInput({
  value,
  onChange,
  name = "phone",
  required,
}: {
  value?: PhoneValue;
  onChange: (val: PhoneValue) => void;
  name?: string;
  required?: boolean;
}) {
  const [val, setVal] = useState<string>(value?.raw || "");
  const [country, setCountry] = useState<string>(value?.country?.toLowerCase() || "us");

  useEffect(() => {
    const parsed = val ? parsePhoneNumberFromString(val) : undefined;
    onChange({
      country,
      raw: val,
      national: parsed?.formatNational() || "",
      e164: parsed?.isValid() ? parsed?.format("E.164") : undefined,
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [val, country]);

  return (
    <div>
      {(() => {
        const PhoneComp = PhoneInputLib as unknown as ComponentType<Record<string, unknown>>;
        return (
          <PhoneComp
            country={country as string}
            value={val}
            onChange={(phone: string, data: CountryData | object) => {
              const normalized = phone ? (phone.startsWith("+") ? phone : `+${phone}`) : "";
              setVal(normalized);
              const c = (data as CountryData).countryCode as string | undefined;
              if (c) setCountry(c.toLowerCase());
            }}
            inputProps={{
              name,
              required,
              autoComplete: "tel",
              "aria-label": "Phone number",
            }}
            enableSearch
            disableSearchIcon
            searchPlaceholder="Search country or code"
            searchClass="sob-phone-search"
            countryCodeEditable={false}
            preferredCountries={["us", "gb", "ca", "au"]}
            separateDialCode
            containerClass="w-full"
            inputClass="!w-full !bg-white/5 !text-white !border !border-white/20 !rounded-lg !py-2 !pl-12 !pr-3 !placeholder-white/50 focus:!outline-none focus:!ring-2 focus:!ring-sob-accent/30 focus:!border-sob-accent/60"
            buttonClass="!bg-white/5 !border !border-white/20 !text-white"
            dropdownClass="!bg-[#0b0b0f] !text-white"
            dropdownStyle={{ zIndex: 1000 }}
          />
        );
      })()}
      <input type="hidden" name={`${name}_e164`} value={val} />
      <input type="hidden" name={`${name}_country`} value={country.toUpperCase()} />
    </div>
  );
}


