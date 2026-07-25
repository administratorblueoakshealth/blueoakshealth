import type { Facility } from "./types";

export function calculateOpportunityScore(facility: Facility) {
  const serviceFitScore = getServiceFitScore(facility);
  const relationshipScore = getRelationshipScore(facility);
  const followUpScore = getFollowUpScore(facility);
  const dataConfidenceScore = getDataConfidenceScore(facility);

  const opportunityScore = Math.round(
    serviceFitScore * 0.35 +
      relationshipScore * 0.2 +
      followUpScore * 0.25 +
      dataConfidenceScore * 0.2
  );

  return {
    opportunity_score: opportunityScore,
    service_fit_score: serviceFitScore,
    relationship_score: relationshipScore,
    follow_up_score: followUpScore,
    data_confidence_score: dataConfidenceScore,
  };
}

function getServiceFitScore(facility: Facility) {
  const name = facility.name?.toLowerCase() ?? "";
  const type = facility.facility_type?.toLowerCase() ?? "";

  if (name.includes("memory") || type.includes("memory")) return 95;
  if (name.includes("alzheimer")) return 95;
  if (type.includes("assisted")) return 80;

  return 50;
}

function getRelationshipScore(facility: Facility) {
  switch (facility.relationship_stage) {
    case "referral_partner":
      return 95;
    case "interested":
      return 85;
    case "introduced":
      return 70;
    case "cold":
      return 40;
    case "new":
    default:
      return 55;
  }
}

function getFollowUpScore(facility: Facility) {
  if (!facility.next_follow_up_at) return 50;

  const due = new Date(facility.next_follow_up_at).getTime();
  const now = Date.now();

  if (due < now) return 95;

  const daysUntilDue = Math.ceil((due - now) / (1000 * 60 * 60 * 24));

  if (daysUntilDue <= 3) return 85;
  if (daysUntilDue <= 7) return 70;

  return 45;
}

function getDataConfidenceScore(facility: Facility) {
  let score = 40;

  if (facility.address) score += 15;
  if (facility.phone) score += 15;
  if (facility.license_number) score += 15;
  if (facility.bed_count) score += 15;

  return Math.min(score, 100);
}