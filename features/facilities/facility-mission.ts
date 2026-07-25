/**
 * Facility Mission + Last Conversation
 * --------------------------------------
 * Replaces the "AI Intelligence" paragraph with a scannable briefing, and
 * surfaces the most recent visit's real notes instead of burying them in a
 * scrollable history list. Both are deterministic — built from real data
 * you already have, not another AI call.
 */

export function buildTodaysMission(
  facility: { name: string },
  bestContact?: { name: string | null } | null,
  intelligence?: { current_psych_provider?: string | null } | null,
  lastVisitAt?: string | null
): { goal: string; status: string[] } {
  const neverVisited = !lastVisitAt;
  const hasContact = Boolean(bestContact?.name);
  const hasProvider = Boolean(intelligence?.current_psych_provider);

  const status: string[] = [
    neverVisited ? "Never visited" : "Previously visited",
    hasContact ? `Decision maker known: ${bestContact?.name}` : "Decision maker unknown",
    hasProvider
      ? `Current provider known: ${intelligence?.current_psych_provider}`
      : "Current psychiatric provider unknown",
  ];

  let goal: string;
  if (neverVisited) {
    goal = "Meet the decision maker and learn who currently handles psychiatric referrals.";
  } else if (!hasContact) {
    goal = "Identify and get contact information for the decision maker.";
  } else if (!hasProvider) {
    goal = "Learn who currently provides psychiatric care for residents.";
  } else {
    goal = "Deepen the relationship and check on referral opportunities.";
  }

  return { goal, status };
}

export function buildLastConversation(
  mostRecentVisit?: {
    visit_date: string;
    notes: string | null;
    outcome: string | null;
    next_action: string | null;
  } | null
): string {
  if (!mostRecentVisit) return "No conversations yet.";

  const date = new Date(mostRecentVisit.visit_date).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
  });

  const parts: string[] = [`${date}:`];
  if (mostRecentVisit.notes) parts.push(mostRecentVisit.notes);
  if (mostRecentVisit.outcome) parts.push(`Outcome: ${mostRecentVisit.outcome}`);
  if (mostRecentVisit.next_action) parts.push(`Next: ${mostRecentVisit.next_action}`);

  return parts.join(" ");
}