/**
 * NPI Registry Verifier
 * ----------------------
 * Replaces AI guessing with a real, checkable fact: the taxonomy code a
 * provider registered under with NPPES (the federal NPI registry).
 *
 * Pipeline position: Rule classifier -> NPI verifier (this file) -> Human
 * review -> AI only as last resort. This runs AFTER the rule classifier
 * flags something ambiguous, and BEFORE any AI call is made.
 *
 * HONEST LIMITATIONS (read before trusting this blindly):
 * - Name matching between a Google Places listing and an NPPES registration
 *   is inherently fuzzy. A facility named "Nueva Vida Behavioral Health" on
 *   Google Places might be registered slightly differently with NPPES.
 *   This module scores match confidence and refuses to classify below a
 *   threshold rather than guessing.
 * - A multi-provider clinic's ORGANIZATIONAL NPI often has a generic
 *   taxonomy ("Community/Behavioral Health") even if the individual
 *   prescribers inside it have their own NPIs with a Psychiatry taxonomy.
 *   This module only checks the org-level match by default — it does NOT
 *   currently cross-check co-located individual NPIs. That's a known gap,
 *   not a silent one.
 * - No match found ≠ confirmed safe. It means "the registry didn't have a
 *   clean match," which should route to human review, not to any specific
 *   classification.
 */

export type RelationshipClassification =
  | "primary_target"
  | "referral_source"
  | "partner"
  | "competitor"
  | "vendor"
  | "non_target"
  | "unknown";

export type CompetitionLevel = "none" | "low" | "medium" | "high" | "unknown";

export type NpiVerificationResult = {
  matched: boolean;
  npi_number: string | null;
  matched_name: string | null;
  taxonomy_description: string | null;
  name_match_score: number; // 0-1
  relationship_classification: RelationshipClassification;
  competition_level: CompetitionLevel;
  relationship_classification_reason: string;
  classification_confidence: number; // 0-100
  classification_method: "npi_registry";
  needs_human_review: boolean;
};

const NAME_MATCH_THRESHOLD = 0.55; // below this, we don't trust the match at all

// --- Taxonomy -> classification mapping. These are FACTS from the registry,
// not inferred text. Ordered most-specific first. ---
const TAXONOMY_RULES: Array<{
  classification: RelationshipClassification;
  competitionLevel: CompetitionLevel;
  reason: string;
  match: (taxonomy: string) => boolean;
}> = [
  {
    classification: "competitor",
    competitionLevel: "high",
    reason: "NPI registry taxonomy confirms psychiatric prescribing practice",
    match: (t) =>
      /psychiatry|psychiatric.*nurse practitioner|psychiatric mental health/i.test(t),
  },
  {
    classification: "referral_source",
    competitionLevel: "none",
    reason: "NPI registry taxonomy confirms non-prescribing therapy/counseling practice",
    match: (t) =>
      /professional counselor|clinical social worker|marriage.*family therapist|psychologist|counselor/i.test(
        t
      ),
  },
  {
    classification: "primary_target",
    competitionLevel: "none",
    reason: "NPI registry taxonomy confirms residential/senior-care facility",
    match: (t) =>
      /assisted living|residential care|group home|nursing facility|skilled nursing|intermediate care/i.test(
        t
      ),
  },
];

// --- Simple, dependency-free fuzzy name matching ---
// Token-overlap (Jaccard) similarity. Good enough to catch "Nueva Vida
// Behavioral Health" vs "Nueva Vida Behavioral Health LLC" as a strong
// match, and to correctly reject a coincidental partial match. Not as good
// as a real string-distance library — worth upgrading later if false
// matches show up in practice.
function normalizeForMatch(name: string): Set<string> {
  const stopWords = new Set(["llc", "inc", "the", "of", "and", "a", "pllc", "pc", "ltd"]);
  return new Set(
    name
      .toLowerCase()
      .replace(/[^a-z0-9\s]/g, " ")
      .split(/\s+/)
      .filter((tok) => tok.length > 0 && !stopWords.has(tok))
  );
}

function jaccardSimilarity(a: string, b: string): number {
  const setA = normalizeForMatch(a);
  const setB = normalizeForMatch(b);
  if (setA.size === 0 || setB.size === 0) return 0;

  let intersection = 0;
  for (const tok of setA) {
    if (setB.has(tok)) intersection++;
  }
  const union = new Set([...setA, ...setB]).size;
  return intersection / union;
}

// --- NPPES API search ---
type NppesResult = {
  number: string;
  basic: {
    organization_name?: string;
    name?: string;
    first_name?: string;
    last_name?: string;
  };
  taxonomies?: Array<{ desc: string; primary: boolean }>;
};

async function searchNppesOrganization(
  name: string,
  city?: string | null,
  state?: string | null
): Promise<NppesResult[]> {
  const url = new URL("https://npiregistry.cms.hhs.gov/api/");
  url.searchParams.set("version", "2.1");
  url.searchParams.set("enumeration_type", "NPI-2"); // organizations
  url.searchParams.set("organization_name", name);
  if (city) url.searchParams.set("city", city);
  if (state) url.searchParams.set("state", state);
  url.searchParams.set("limit", "10");

  const res = await fetch(url.toString(), { cache: "no-store" });
  if (!res.ok) return [];
  const json = await res.json();
  return json.results ?? [];
}

/**
 * Fallback for facility names that look like an individual practitioner
 * rather than an organization (e.g. "Celina Zamora, Mental Health Coach").
 * Heuristic name-splitting — imperfect, but better than skipping entirely.
 */
async function searchNppesIndividual(
  name: string,
  city?: string | null,
  state?: string | null
): Promise<NppesResult[]> {
  const personPart = name.split(",")[0].trim(); // "Celina Zamora" from "Celina Zamora, Mental Health Coach"
  const tokens = personPart.split(/\s+/).filter(Boolean);
  if (tokens.length < 2) return []; // can't confidently split into first/last

  const firstName = tokens[0];
  const lastName = tokens[tokens.length - 1];

  const url = new URL("https://npiregistry.cms.hhs.gov/api/");
  url.searchParams.set("version", "2.1");
  url.searchParams.set("enumeration_type", "NPI-1"); // individuals
  url.searchParams.set("first_name", firstName);
  url.searchParams.set("last_name", lastName);
  if (city) url.searchParams.set("city", city);
  if (state) url.searchParams.set("state", state);
  url.searchParams.set("limit", "10");

  const res = await fetch(url.toString(), { cache: "no-store" });
  if (!res.ok) return [];
  const json = await res.json();
  return json.results ?? [];
}

function resultDisplayName(r: NppesResult): string {
  if (r.basic.organization_name) return r.basic.organization_name;
  return [r.basic.first_name, r.basic.last_name].filter(Boolean).join(" ");
}

function primaryTaxonomy(r: NppesResult): string | null {
  if (!r.taxonomies?.length) return null;
  const primary = r.taxonomies.find((t) => t.primary);
  return (primary ?? r.taxonomies[0]).desc ?? null;
}

export async function verifyWithNpiRegistry(input: {
  name: string;
  city?: string | null;
  state?: string | null;
}): Promise<NpiVerificationResult> {
  const noMatch: NpiVerificationResult = {
    matched: false,
    npi_number: null,
    matched_name: null,
    taxonomy_description: null,
    name_match_score: 0,
    relationship_classification: "unknown",
    competition_level: "unknown",
    relationship_classification_reason: "No confident NPI registry match found — needs human review",
    classification_confidence: 0,
    classification_method: "npi_registry",
    needs_human_review: true,
  };

  try {
    // Try organization search first, then individual as fallback
    let candidates = await searchNppesOrganization(input.name, input.city, input.state);
    if (candidates.length === 0) {
      candidates = await searchNppesIndividual(input.name, input.city, input.state);
    }

    if (candidates.length === 0) return noMatch;

    // Score every candidate, pick the best
    let best: { result: NppesResult; score: number } | null = null;
    for (const candidate of candidates) {
      const score = jaccardSimilarity(input.name, resultDisplayName(candidate));
      if (!best || score > best.score) {
        best = { result: candidate, score };
      }
    }

    if (!best || best.score < NAME_MATCH_THRESHOLD) return noMatch;

    const taxonomy = primaryTaxonomy(best.result);
    if (!taxonomy) {
      return {
        ...noMatch,
        matched: true,
        npi_number: best.result.number,
        matched_name: resultDisplayName(best.result),
        name_match_score: best.score,
        relationship_classification_reason:
          "NPI match found but no taxonomy on record — needs human review",
      };
    }

    const rule = TAXONOMY_RULES.find((r) => r.match(taxonomy));

    if (!rule) {
      // Matched a real provider, but their taxonomy doesn't map to any
      // known bucket. Still evidence-worthy to record, but not enough to
      // auto-classify.
      return {
        matched: true,
        npi_number: best.result.number,
        matched_name: resultDisplayName(best.result),
        taxonomy_description: taxonomy,
        name_match_score: best.score,
        relationship_classification: "unknown",
        competition_level: "unknown",
        relationship_classification_reason: `NPI match found (taxonomy: "${taxonomy}") but doesn't map to a known category — needs human review`,
        classification_confidence: Math.round(best.score * 50), // capped lower since classification itself is inconclusive
        classification_method: "npi_registry",
        needs_human_review: true,
      };
    }

    // Confident match + confident taxonomy mapping
    const confidence = Math.round(best.score * 100);

    return {
      matched: true,
      npi_number: best.result.number,
      matched_name: resultDisplayName(best.result),
      taxonomy_description: taxonomy,
      name_match_score: best.score,
      relationship_classification: rule.classification,
      competition_level: rule.competitionLevel,
      relationship_classification_reason: `${rule.reason} (NPI taxonomy: "${taxonomy}")`,
      classification_confidence: confidence,
      classification_method: "npi_registry",
      // High-confidence + high name-match matches from an authoritative
      // federal registry are treated as human-equivalent verification.
      // Lower-confidence matches still get flagged for a person to confirm.
      needs_human_review: confidence < 75,
    };
  } catch (err) {
    console.error(`[npi-verifier] lookup failed for "${input.name}"`, err);
    return noMatch;
  }
}