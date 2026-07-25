export function buildMissionBrief(facility: any) {
  const type = String(facility.facility_type ?? "").toLowerCase();
  const isResidential =
    type.includes("residential") ||
    type.includes("assisted") ||
    type.includes("memory") ||
    type.includes("group home") ||
    type.includes("adult care");

  const neverVisited = !facility.last_visit_at;
  const noContact =
    !facility.administrator &&
    !facility.best_contact &&
    !facility.provider_email;

  if (isResidential && neverVisited) {
    return {
      mission_objective:
        "Complete a first introduction and identify how psychiatric referrals are handled.",
      why_it_matters: [
        "Residential setting likely has residents who need psychiatric support.",
        "No prior BlueOaks visit is recorded.",
        noContact
          ? "Decision-maker contact is missing."
          : "Known contact exists but relationship still needs development.",
      ],
      ask_for_roles: [
        "Administrator",
        "Executive Director",
        "Wellness Director",
        "Director of Nursing",
        "Admissions Coordinator",
      ],
      discovery_questions: [
        "Who currently handles psychiatric medication management for your residents?",
        "Do residents usually leave the building for psych visits?",
        "Who do you call when behaviors or medication concerns escalate?",
        "How long does it usually take to get a resident seen?",
        "Who should BlueOaks coordinate with for referrals?",
      ],
      buying_signals: [
        "They say families are responsible for finding psych care.",
        "They mention long wait times.",
        "They mention residents needing transportation for appointments.",
        "They do not have a consistent psychiatric provider.",
      ],
      likely_objections: [
        {
          objection: "We already have someone.",
          response:
            "That’s great. We are not trying to disrupt what works. We can be an additional option when access, follow-up, or medication support becomes difficult.",
        },
        {
          objection: "Families usually handle that.",
          response:
            "That makes sense. We can help make the referral process easier for families and staff when a resident needs psychiatric support.",
        },
      ],
      leave_behind: [
        "BlueOaks referral sheet",
        "Provider card",
        "Administrator packet",
        "Fax/email referral instructions",
      ],
      success_checklist: [
        "Administrator or decision-maker name",
        "Phone number",
        "Email",
        "Current psychiatric provider",
        "Referral process",
        "Follow-up date",
      ],
    };
  }

  return {
    mission_objective:
      "Qualify the facility and determine whether it should become a referral relationship.",
    why_it_matters: [
      "Facility is near today’s route.",
      "Relationship status is not fully developed.",
      "More information is needed before prioritizing future visits.",
    ],
    ask_for_roles: ["Administrator", "Office Manager", "Clinical Lead"],
    discovery_questions: [
      "What population do you serve?",
      "Do your clients ever need psychiatric medication management?",
      "Who handles referrals when that need comes up?",
      "Who is the best contact for BlueOaks?",
    ],
    buying_signals: [
      "They ask what insurance BlueOaks accepts.",
      "They describe delays getting clients seen.",
      "They ask for referral instructions.",
    ],
    likely_objections: [
      {
        objection: "We do not need this right now.",
        response:
          "No problem. I’d still like to leave our information in case a need comes up later.",
      },
    ],
    leave_behind: ["Referral sheet", "Business card"],
    success_checklist: [
      "Confirm fit",
      "Identify correct contact",
      "Document current referral process",
      "Set next step",
    ],
  };
}