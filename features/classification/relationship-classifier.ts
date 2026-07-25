export type RelationshipClassification =
  | "primary_target"
  | "referral_source"
  | "partner"
  | "competitor"
  | "vendor"
  | "non_target"
  | "unknown";

export type CompetitionLevel = "none" | "low" | "medium" | "high" | "unknown";

export type ClassificationResult = {
  relationship_classification: RelationshipClassification;
  competition_level: CompetitionLevel;
  relationship_classification_reason: string;
  classification_confidence: number;
  classification_method: "rule";
  needs_ai_review: boolean;
};

export type ClassifierInput = {
  name?: string | null;
  facilityType?: string | null;
  taxonomy?: string | null;
  googleTypes?: string | null;
};

type Rule = {
  classification: RelationshipClassification;
  competitionLevel: CompetitionLevel;
  reason: string;
  confidence: number;
  needsAiReview?: boolean;
  match: (text: string) => boolean;
};

const RULES: Rule[] = [
  // --- COMPETITORS: checked first, so nothing below can override a real psychiatric match ---
  {
    classification: "competitor",
    competitionLevel: "high",
    reason: "Provides psychiatric medication management — same service as BlueOaks",
    confidence: 90,
    match: (t) =>
      /\bpmhnp\b|\bpsychiatric mental health nurse practitioner\b|\btelepsychiatry\b|\bmedication management\b.*\bpsychiat/i.test(t),
  },
  {
    classification: "competitor",
    competitionLevel: "high",
    reason: "Psychiatry or psychiatrist practice — direct competitor",
    confidence: 85,
    match: (t) => /\bpsychiatr(y|ist)\b/i.test(t),
  },

  {
    classification: "referral_source",
    competitionLevel: "none",
    reason: "ABA/behavioral therapy provider — does not prescribe medication, refers out for psychiatric care",
    confidence: 75,
    match: (t) => /\baba therapy\b|\bautism\b|\bapplied behavior analysis\b/i.test(t),
  },

  {
    classification: "primary_target",
    competitionLevel: "none",
    reason: "Residential/senior-care facility — houses patients who may need psychiatric services",
    confidence: 90,
    match: (t) =>
      /\bmemory care\b|\balzheimer\b|\bdementia\b|\bassisted living\b|\bsenior living\b|\bindependent living\b|\bskilled nursing\b|\bnursing home\b|\bnursing facility\b|\bgroup home\b|\bresidential care\b|\badult care home\b|\bicf\b|\bintellectual disabilit|\bhcs\b|\bresidential treatment\b/i.test(
        t
      ),
  },

  {
    classification: "referral_source",
    competitionLevel: "none",
    reason: "Individual therapist/counselor — does not prescribe, likely refers for medication management",
    confidence: 75,
    match: (t) =>
      /\blpc\b|\blcsw\b|\blmft\b|\bpsychologist\b|\btherapist\b|\bcounselor\b|\bmental health coach\b|\blife coach\b|\bcase manager\b|\bsocial worker\b/i.test(
        t
      ),
  },

  // --- BROADENED: general medical practices (non-psychiatric) are almost
  // always referral sources — they routinely encounter patients needing
  // psychiatric care but don't provide it themselves. This now catches
  // "Family Medical Clinic", "OB/GYN", "Pediatrics", "Internal Medicine",
  // "Cardiology", etc., not just the exact phrases "primary care" or
  // "family medicine". Psychiatry is already excluded above since those
  // rules are checked first and return before reaching this one.
  {
    classification: "referral_source",
    competitionLevel: "none",
    reason: "Non-psychiatric medical practice — common referral pathway into psychiatric services",
    confidence: 65,
    match: (t) =>
      /\bprimary care\b|\bgeriatric\b|\bneurolog(y|ist)\b|\bfamily medicine\b|\bfamily practice\b|\binternal medicine\b|\bob\/?gyn\b|\bobstetric|\bgynecolog|\bpediatric|\bcardiolog|\bendocrinolog|\bmedical clinic\b|\bfamily physician\b|\bwalk-?in clinic\b|\burgent care\b|\bphysician\b|\bmd\b/i.test(
        t
      ) &&
      // Extra safety net: don't let this rule catch dental/chiropractic/vision
      // language even if a stray word overlap happened somehow.
      !/\bdentist\b|\bdental\b|\bchiropract|\boptometr/i.test(t),
  },

  {
    classification: "referral_source",
    competitionLevel: "none",
    reason: "Hospital discharge planning or senior center — common referral source",
    confidence: 65,
    match: (t) => /\bdischarge planning\b|\bsenior center\b|\bhospital discharge\b/i.test(t),
  },

  {
    classification: "partner",
    competitionLevel: "none",
    reason: "Home health or hospice — adjacent care, natural referral partner",
    confidence: 80,
    match: (t) => /\bhome health\b|\bhospice\b|\bhome and community support\b/i.test(t),
  },

  {
    classification: "unknown",
    competitionLevel: "unknown",
    reason: "Behavioral health / counseling clinic — could employ psychiatrists (competitor) or only offer therapy (referral source)",
    confidence: 40,
    needsAiReview: true,
    match: (t) =>
      /\bbehavioral health\b|\bcounseling center\b|\bcommunity mental health\b|\bpsychiatric\b/i.test(t),
  },

  {
    classification: "vendor",
    competitionLevel: "none",
    reason: "Not a care relationship — dental, chiropractic, pharmacy, lab, etc.",
    confidence: 85,
    match: (t) =>
      /\bdentist\b|\bdental\b|\bchiropract|\boptometr|\bpharmacy\b|\blaborator|\bimaging\b|\bambulance\b/i.test(t),
  },
];

export function classifyRelationship(input: ClassifierInput): ClassificationResult {
  const text = [input.facilityType, input.taxonomy, input.googleTypes, input.name]
    .filter(Boolean)
    .join(" ")
    .toLowerCase();

  for (const rule of RULES) {
    if (rule.match(text)) {
      return {
        relationship_classification: rule.classification,
        competition_level: rule.competitionLevel,
        relationship_classification_reason: rule.reason,
        classification_confidence: rule.confidence,
        classification_method: "rule",
        needs_ai_review: Boolean(rule.needsAiReview),
      };
    }
  }

  return {
    relationship_classification: "unknown",
    competition_level: "unknown",
    relationship_classification_reason: "No rule matched — needs AI review or manual classification",
    classification_confidence: 0,
    classification_method: "rule",
    needs_ai_review: true,
  };
}