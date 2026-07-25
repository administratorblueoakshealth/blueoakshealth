export function buildVisitIntelligence(facility: any) {
  const neverVisited = !facility.last_visit_at;
  const noContact = !facility.administrator;
  const isResidential =
    String(facility.relationship_classification).includes("primary") ||
    String(facility.facility_type).toLowerCase().includes("assisted") ||
    String(facility.facility_type).toLowerCase().includes("memory") ||
    String(facility.facility_type).toLowerCase().includes("residential");

  if (neverVisited && isResidential) {
    return {
      visit_priority: "high",
      visit_goal:
        "Introduce BlueOaks, identify the decision-maker, and learn their psychiatric referral process.",
      suggested_script:
        "Hi, I’m Ashley with BlueOaks Health. We support facilities with psychiatric care and medication management. I wanted to introduce myself and learn who handles behavioral health or psych referrals here.",
      success_criteria:
        "Get administrator/clinical contact name, confirm referral process, and schedule a follow-up.",
      fallback_action:
        "If the decision-maker is unavailable, leave materials and ask for the best day/time to return.",
    };
  }

  if (facility.next_follow_up_at) {
    return {
      visit_priority: "high",
      visit_goal: "Complete scheduled follow-up and move the relationship forward.",
      suggested_script:
        "Hi, I’m Ashley with BlueOaks Health. I’m following up from our last touchpoint to see how we can support your residents with psychiatric care.",
      success_criteria:
        "Confirm current need, update contact info, and set the next follow-up date.",
      fallback_action:
        "If unavailable, document outcome and schedule another follow-up.",
    };
  }

  return {
    visit_priority: "medium",
    visit_goal: "Review facility fit and collect missing relationship information.",
    suggested_script:
      "Hi, I’m Ashley with BlueOaks Health. I’m visiting nearby care communities to introduce our psychiatric support services.",
    success_criteria:
      "Confirm whether this facility is a fit and identify the correct contact.",
    fallback_action:
      "Mark as not a fit, needs follow-up, or contact missing.",
  };
}