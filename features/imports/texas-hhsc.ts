import axios from "axios";
import * as XLSX from "xlsx";

const TEXAS_HHSC_ALF_URL =
  "https://apps.hhs.texas.gov/providers/directories/al.xlsx";

export type NormalizedTexasFacility = {
  name: string;
  facility_type: string;
  address: string | null;
  city: string | null;
  state: string;
  zip: string | null;
  county: string | null;
  phone: string | null;
  license_number: string | null;
  source_name: string;
  source_id: string;
  bed_count: number | null;
  administrator: string | null;
  provider_email: string | null;
};

type RawRow = Record<string, unknown>;

function clean(value: unknown): string | null {
  if (value === null || value === undefined) return null;
  const text = String(value).trim();
  return text.length ? text : null;
}

function numberOrNull(value: unknown): number | null {
  const cleaned = clean(value);
  if (!cleaned) return null;

  const parsed = Number(cleaned.replace(/,/g, ""));
  return Number.isFinite(parsed) ? parsed : null;
}

export async function downloadTexasHHSC() {
  const response = await axios.get<ArrayBuffer>(TEXAS_HHSC_ALF_URL, {
    responseType: "arraybuffer",
  });

  return response.data;
}

export function parseTexasHHSC(buffer: ArrayBuffer): RawRow[] {
  const workbook = XLSX.read(buffer, { type: "array" });
  const sheetName = workbook.SheetNames[0];
  const sheet = workbook.Sheets[sheetName];

  return XLSX.utils.sheet_to_json<RawRow>(sheet, {
    defval: null,
    raw: false,
    range: 1,
  });
}

export function normalizeTexasHHSC(rows: RawRow[]): NormalizedTexasFacility[] {
  return rows
    .map((row, index) => {
      const name = clean(row["Facility Name"]);
      const facilityId = clean(row["Facility ID"]);
      const serviceType = clean(row["Service  Type"]);
      const county = clean(row["County"]);
      const licenseNumber = clean(row["License No"]);
      const address = clean(row["Physical Address"]);
      const city = clean(row["Physical Address CITY"]);
      const state = clean(row["Physical Address State"]) ?? "TX";
      const zip = clean(row["Physical Address Zipcode"]);
      const phone = clean(row["Facility Phone Number"]);
      const bedCount = numberOrNull(row["Total Licensed Capacity"]);
      const administrator = clean(row["Administrator"]);
      const providerEmail = clean(row["Provider Email"]);

      if (!name) return null;

      return {
        name,
        facility_type:
          serviceType?.toLowerCase().includes("alzheimer") ? "Memory Care" : "Assisted Living",
        address,
        city,
        state,
        zip,
        county,
        phone,
        license_number: licenseNumber,
        source_name: "texas_hhsc_alf",
        source_id: facilityId ?? licenseNumber ?? `texas-hhsc-alf-${index}`,
        bed_count: bedCount,
        administrator,
        provider_email: providerEmail,
      };
    })
    .filter((facility): facility is NormalizedTexasFacility => facility !== null);
}

export async function fetchTexasHhscFacilities() {
  const file = await downloadTexasHHSC();
  const rows = parseTexasHHSC(file);
  return normalizeTexasHHSC(rows);
}