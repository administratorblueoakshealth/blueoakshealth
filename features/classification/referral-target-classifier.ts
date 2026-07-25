export function classifyReferralTarget(input: {
  name?: string | null;
  facilityType?: string | null;
  taxonomy?: string | null;
  googleTypes?: string | null;
}) {
  const text = [
    input.name,
    input.facilityType,
    input.taxonomy,
    input.googleTypes,
  ]
    .filter(Boolean)
    .join(" ")
    .toLowerCase();

  const excludeTerms = [
    "dentist",
    "chiropractor",
    "pharmacy",
    "optometry",
    "massage",
    "spa",
    "mental health coach",
    "aba therapy",
    "autism therapy",
    "home builder",
    "real estate",
  ];

  if (excludeTerms.some((term) => text.includes(term))) {
    return {
      referral_target: false,
      referral_category: "non_target",
      referral_target_reason: "Not a primary BlueOaks referral target",
    };
  }

  const primaryTargets = [
    "assisted living",
    "memory care",
    "residential care",
    "group home",
    "adult care home",
    "senior care",
    "alzheimer",
    "dementia",
    "icf",
    "intellectual disability",
    "developmental disability",
  ];

  if (primaryTargets.some((term) => text.includes(term))) {
    return {
      referral_target: true,
      referral_category: "primary_referral_target",
      referral_target_reason: "Likely residential or senior-care referral source",
    };
  }

  const secondaryTargets = [
    "home health",
    "hospice",
    "skilled nursing",
    "behavioral health",
    "mental health clinic",
    "psychiatric",
  ];

  if (secondaryTargets.some((term) => text.includes(term))) {
    return {
      referral_target: true,
      referral_category: "secondary_referral_target",
      referral_target_reason: "Potential referral partner; verify fit",
    };
  }

  return {
    referral_target: false,
    referral_category: "needs_review",
    referral_target_reason: "Needs manual review before routing",
  };
}