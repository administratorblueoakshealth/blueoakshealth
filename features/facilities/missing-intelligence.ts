/**
 * Missing Intelligence Checklist — trimmed to the 3 things that actually
 * matter for generating referrals, per the 80/20 principle: Decision Maker,
 * Current Psych Provider, Referral Process. DON, Admissions Director, bed
 * count, best time to visit, etc. still exist in facility_intelligence as
 * the org's long-term memory — they're just not primary blockers Ashley
 * needs flagged during a 5-minute visit.
 */

export type ChecklistStatus = "verified" | "known" | "missing";
export type ChecklistPriority = "critical" | "important" | "nice_to_have";

export type ChecklistItem = {
  label: string;
  status: ChecklistStatus;
  priority: ChecklistPriority;
  source?: string;
};

function buildItem(
  label: string,
  value: unknown,
  priority: ChecklistPriority,
  options?: { verified?: boolean; source?: string }
): ChecklistItem {
  const hasValue = Boolean(value);
  return {
    label,
    priority,
    status: !hasValue ? "missing" : options?.verified ? "verified" : "known",
    source: hasValue ? options?.source : undefined,
  };
}

export function buildMissingIntelligenceChecklist(
  facility: {
    administrator?: string | null;
    provider_email?: string | null;
  },
  bestContact?: {
    name: string | null;
    phone: string | null;
    email: string | null;
    needs_verification?: boolean;
  } | null,
  intelligence?: {
    current_psych_provider?: string | null;
    referral_initiator?: string | null;
    referral_method?: string | null;
  } | null
) {
  const contactVerified = Boolean(bestContact) && !bestContact?.needs_verification;

  const items: ChecklistItem[] = [
    buildItem(
      "Decision Maker",
      bestContact?.name || facility.administrator,
      "critical",
      { verified: contactVerified, source: bestContact?.name ? "CRM Contact" : "Facility" }
    ),
    buildItem(
      "Current Psych Provider",
      intelligence?.current_psych_provider,
      "critical",
      { source: "Visit" }
    ),
    buildItem(
      "Referral Process",
      intelligence?.referral_initiator || intelligence?.referral_method,
      "important",
      { source: "Visit" }
    ),
  ];

  const knownCount = items.filter((i) => i.status !== "missing").length;
  const verifiedCount = items.filter((i) => i.status === "verified").length;
  const missingItems = items.filter((i) => i.status === "missing").map((i) => i.label);

  const objectives: string[] = [];
  if (!bestContact?.name && !facility.administrator) {
    objectives.push("Identify the decision maker");
  }
  if (!intelligence?.current_psych_provider) {
    objectives.push("Learn who currently provides psychiatric care");
  }
  if (!intelligence?.referral_initiator && !intelligence?.referral_method) {
    objectives.push("Understand how referrals are made here");
  }

  return { items, knownCount, verifiedCount, totalCount: items.length, missingItems, objectives };
}