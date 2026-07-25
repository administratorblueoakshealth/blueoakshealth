/**
 * Website Relationship Verifier
 * -------------------------------
 * Scans ACTUAL page content (not just the business name) for real signals
 * of whether a practice prescribes psychiatric medication or not. Built on
 * top of extractWebsiteData() — takes its `text` output, doesn't re-fetch.
 *
 * Pipeline position: Rule classifier -> NPI verifier -> THIS -> Human
 * review / AI as last resort.
 *
 * DESIGN DECISION: if a page shows ANY prescriber signal, competitor wins,
 * even if the same page also lists therapists. A practice with one
 * psychiatrist and three LPCs on staff still directly competes with
 * BlueOaks for the psychiatric-medication piece of the business — it's not
 * "mostly a referral source." Err toward flagging competition, not missing it.
 *
 * HONEST LIMITATION: this is page-level keyword/phrase detection, not
 * per-provider parsing. The name+credential extraction below is
 * best-effort — messy HTML text doesn't always yield clean "Name, XX"
 * pairs. When extraction fails, the page-level signal (credentials and
 * phrases found anywhere on the page) is still used and is real evidence,
 * just not attributed to a specific person.
 */

import { extractWebsiteData } from "@/features/enrichment/website-extractor";

export type RelationshipClassification =
  | "primary_target"
  | "referral_source"
  | "partner"
  | "competitor"
  | "vendor"
  | "non_target"
  | "unknown";

export type CompetitionLevel = "none" | "low" | "medium" | "high" | "unknown";

export type ExtractedProvider = {
  name: string;
  credential: string;
};

export type WebsiteVerificationResult = {
  matched: boolean; // did we get usable page content at all
  relationship_classification: RelationshipClassification;
  competition_level: CompetitionLevel;
  relationship_classification_reason: string;
  classification_confidence: number;
  classification_method: "website_scan";
  needs_human_review: boolean;
  extracted_providers: ExtractedProvider[];
  matched_signals: string[]; // raw phrases/credentials found, for transparency
};

// Credentials/phrases indicating the practice PRESCRIBES psychiatric medication
const PRESCRIBER_CREDENTIALS = /\b(md|d\.?o\.?|pmhnp(-bc)?|aprn|np|nurse practitioner)\b/i;
const PRESCRIBER_PHRASES =
  /\bmedication management\b|\bpsychiatric evaluation\b|\bprescri(be|ption|bing)\b|\bpsychiatrist\b|\bpsychiatric care\b/i;

// Credentials/phrases indicating therapy-only, non-prescribing practice
const NON_PRESCRIBER_CREDENTIALS = /\b(lpc(-a|-s)?|lcsw|lmft|lmsw|psyd|phd)\b/i;
const NON_PRESCRIBER_PHRASES =
  /\bdoes not prescribe\b|\bnon-?medical\b|\btalk therapy\b|\bcounseling services\b|\bpsychotherapy\b/i;

// Best-effort name+credential pairing, e.g. "Jane Smith, LPC" or "Dr. John Doe, MD"
const NAME_CREDENTIAL_PATTERN =
  /([A-Z][a-z]+(?:\s[A-Z]\.)?\s[A-Z][a-z]+),?\s*(MD|D\.?O\.?|PMHNP(-BC)?|APRN|NP|LPC(-A|-S)?|LCSW|LMFT|LMSW|PsyD|PhD)\b/g;

function extractProviders(text: string): ExtractedProvider[] {
  const providers: ExtractedProvider[] = [];
  const seen = new Set<string>();

  let match: RegExpExecArray | null;
  const regex = new RegExp(NAME_CREDENTIAL_PATTERN);
  while ((match = regex.exec(text)) !== null) {
    const name = match[1].trim();
    const credential = match[2].trim();
    const key = `${name}|${credential}`;
    if (!seen.has(key)) {
      seen.add(key);
      providers.push({ name, credential });
    }
  }

  return providers.slice(0, 10); // cap — a very long page could false-match repeatedly
}

export async function verifyViaWebsite(website: string | null): Promise<WebsiteVerificationResult> {
  const noContent: WebsiteVerificationResult = {
    matched: false,
    relationship_classification: "unknown",
    competition_level: "unknown",
    relationship_classification_reason: "No website available or page could not be read",
    classification_confidence: 0,
    classification_method: "website_scan",
    needs_human_review: true,
    extracted_providers: [],
    matched_signals: [],
  };

  if (!website) return noContent;

  try {
    const site = await extractWebsiteData(website);
    const text = site.text;

    const matchedSignals: string[] = [];

    const hasPrescriberCredential = PRESCRIBER_CREDENTIALS.test(text);
    const hasPrescriberPhrase = PRESCRIBER_PHRASES.test(text);
    const hasNonPrescriberCredential = NON_PRESCRIBER_CREDENTIALS.test(text);
    const hasNonPrescriberPhrase = NON_PRESCRIBER_PHRASES.test(text);

    if (hasPrescriberCredential) matchedSignals.push("prescriber credential on page");
    if (hasPrescriberPhrase) matchedSignals.push("prescribing language on page");
    if (hasNonPrescriberCredential) matchedSignals.push("non-prescriber credential on page");
    if (hasNonPrescriberPhrase) matchedSignals.push("non-prescribing language on page");

    const extractedProviders = extractProviders(text);
    const providerHasPrescriberCredential = extractedProviders.some((p) =>
      PRESCRIBER_CREDENTIALS.test(p.credential)
    );

    const anyPrescriberSignal = hasPrescriberCredential || hasPrescriberPhrase || providerHasPrescriberCredential;
    const anyNonPrescriberSignal = hasNonPrescriberCredential || hasNonPrescriberPhrase;

    // Prescriber signal wins by design — see file header for why.
    if (anyPrescriberSignal) {
      return {
        matched: true,
        relationship_classification: "competitor",
        competition_level: "high",
        relationship_classification_reason: `Website shows prescriber evidence: ${matchedSignals.join(", ")}`,
        classification_confidence: hasPrescriberPhrase && hasPrescriberCredential ? 85 : 65,
        classification_method: "website_scan",
        needs_human_review: !(hasPrescriberPhrase && hasPrescriberCredential), // both signals together = confident enough to trust
        extracted_providers: extractedProviders,
        matched_signals: matchedSignals,
      };
    }

    if (anyNonPrescriberSignal) {
      return {
        matched: true,
        relationship_classification: "referral_source",
        competition_level: "none",
        relationship_classification_reason: `Website shows non-prescriber evidence, no prescriber signal found: ${matchedSignals.join(", ")}`,
        classification_confidence: hasNonPrescriberPhrase && hasNonPrescriberCredential ? 80 : 60,
        classification_method: "website_scan",
        needs_human_review: !(hasNonPrescriberPhrase && hasNonPrescriberCredential),
        extracted_providers: extractedProviders,
        matched_signals: matchedSignals,
      };
    }

    // Page loaded fine but neither signal appeared — genuinely inconclusive
    return {
      matched: true,
      relationship_classification: "unknown",
      competition_level: "unknown",
      relationship_classification_reason: "Website content had no clear prescriber or non-prescriber signal",
      classification_confidence: 0,
      classification_method: "website_scan",
      needs_human_review: true,
      extracted_providers: extractedProviders,
      matched_signals: [],
    };
  } catch (err) {
    console.error(`[website-relationship-verifier] failed for ${website}`, err);
    return noContent;
  }
}