"use client";

import { useEffect, useState } from "react";

type ContactRow = {
  role: string;
  name: string;
  phone: string;
  email: string;
  is_primary: boolean;
};

type KnownContact = {
  id: string;
  name: string;
  role: string | null;
  phone: string | null;
  email: string | null;
  is_primary: boolean;
};

const ROLE_OPTIONS = [
  "Administrator",
  "Executive Director",
  "Admissions Director",
  "Marketing Director",
  "DON",
  "Social Worker",
  "Other",
];

function emptyContact(): ContactRow {
  return { role: "Administrator", name: "", phone: "", email: "", is_primary: false };
}

export default function LogVisitForm({ facilityId }: { facilityId: string }) {
  const [loading, setLoading] = useState(false);
  const [saved, setSaved] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [contacts, setContacts] = useState<ContactRow[]>([emptyContact()]);
  const [knownContacts, setKnownContacts] = useState<KnownContact[]>([]);
  const [openSuggestionIndex, setOpenSuggestionIndex] = useState<number | null>(null);

  useEffect(() => {
    let cancelled = false;
    async function loadKnownContacts() {
      try {
        const res = await fetch(`/api/internal/crm/facilities/${facilityId}/contacts`);
        const data = await res.json();
        if (!cancelled && data.ok) {
          setKnownContacts(data.contacts ?? []);
        }
      } catch {
        // Suggestions are a convenience, not required.
      }
    }
    loadKnownContacts();
    return () => {
      cancelled = true;
    };
  }, [facilityId]);

  function updateContact(index: number, patch: Partial<ContactRow>) {
    setContacts((prev) => prev.map((c, i) => (i === index ? { ...c, ...patch } : c)));
  }

  function selectSuggestion(index: number, suggestion: KnownContact) {
    updateContact(index, {
      name: suggestion.name,
      role: ROLE_OPTIONS.includes(suggestion.role ?? "") ? (suggestion.role as string) : "Other",
      phone: suggestion.phone ?? "",
      email: suggestion.email ?? "",
      is_primary: suggestion.is_primary,
    });
    setOpenSuggestionIndex(null);
  }

  function addContact() {
    setContacts((prev) => [...prev, emptyContact()]);
  }

  function removeContact(index: number) {
    setContacts((prev) => prev.filter((_, i) => i !== index));
  }

  function matchingSuggestions(query: string): KnownContact[] {
    if (query.trim().length === 0) return knownContacts.slice(0, 5);
    const lower = query.toLowerCase();
    return knownContacts.filter((c) => c.name.toLowerCase().includes(lower)).slice(0, 5);
  }

  async function submit(formData: FormData) {
    setLoading(true);
    setSaved(false);
    setErrorMsg("");

    const contactsToSend = contacts.filter((c) => c.name.trim().length > 0);

    const payload = {
      facility_id: facilityId,
      purpose: formData.get("purpose"),
      outcome: formData.get("outcome"),
      notes: formData.get("notes"),
      next_action: formData.get("next_action"),
      next_follow_up_at: formData.get("next_follow_up_at"),
      relationship_stage: formData.get("relationship_stage"),
      current_psych_provider: formData.get("current_psych_provider"),
      contacts: contactsToSend,
    };

    try {
      const res = await fetch("/api/internal/crm/visits", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json();

      if (!data.ok) {
        setErrorMsg(data.error ?? "Failed to save visit.");
        return;
      }

      setSaved(true);
      window.location.reload();
    } catch {
      setErrorMsg("Could not reach the server. Check your connection and try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <form action={submit} className="space-y-3">
      <input
        name="current_psych_provider"
        placeholder="Current psychiatric provider (e.g. Dr. Smith, ABC Psychiatry, None, Unknown)"
        className="w-full rounded-xl border border-white/10 bg-slate-900 px-4 py-3 text-sm outline-none"
      />

      <input
        name="purpose"
        placeholder="Visit purpose"
        className="w-full rounded-xl border border-white/10 bg-slate-900 px-4 py-3 text-sm outline-none"
      />

      <textarea
        name="notes"
        placeholder="Anything important to remember"
        className="min-h-28 w-full rounded-xl border border-white/10 bg-slate-900 px-4 py-3 text-sm outline-none"
      />

      <input
        name="outcome"
        placeholder="Outcome"
        className="w-full rounded-xl border border-white/10 bg-slate-900 px-4 py-3 text-sm outline-none"
      />

      <input
        name="next_action"
        placeholder="Next action"
        className="w-full rounded-xl border border-white/10 bg-slate-900 px-4 py-3 text-sm outline-none"
      />

      <input
        name="next_follow_up_at"
        type="date"
        className="w-full rounded-xl border border-white/10 bg-slate-900 px-4 py-3 text-sm outline-none"
      />

      <select
        name="relationship_stage"
        className="w-full rounded-xl border border-white/10 bg-slate-900 px-4 py-3 text-sm outline-none"
        defaultValue="introduced"
      >
        <option value="new">New</option>
        <option value="introduced">Introduced</option>
        <option value="interested">Interested</option>
        <option value="referral_partner">Referral Partner</option>
        <option value="cold">Cold</option>
      </select>

      <div className="rounded-xl border border-white/10 bg-slate-900/50 p-3 space-y-3">
        <p className="text-sm font-medium text-slate-300">Who did you meet?</p>

        {contacts.map((contact, index) => {
          const suggestions = matchingSuggestions(contact.name);
          const showSuggestions = openSuggestionIndex === index && suggestions.length > 0;

          return (
            <div
              key={index}
              className="grid grid-cols-1 gap-2 rounded-lg border border-white/10 bg-slate-900 p-3 md:grid-cols-2"
            >
              <select
                value={contact.role}
                onChange={(e) => updateContact(index, { role: e.target.value })}
                className="rounded-lg border border-white/10 bg-slate-800 px-3 py-2 text-sm outline-none"
              >
                {ROLE_OPTIONS.map((role) => (
                  <option key={role} value={role}>
                    {role}
                  </option>
                ))}
              </select>

              <div className="relative">
                <input
                  value={contact.name}
                  onChange={(e) => updateContact(index, { name: e.target.value })}
                  onFocus={() => setOpenSuggestionIndex(index)}
                  onBlur={() => setTimeout(() => setOpenSuggestionIndex(null), 150)}
                  placeholder="Name"
                  autoComplete="off"
                  className="w-full rounded-lg border border-white/10 bg-slate-800 px-3 py-2 text-sm outline-none"
                />
                {showSuggestions && (
                  <div className="absolute z-10 mt-1 w-full rounded-lg border border-white/10 bg-slate-800 shadow-lg">
                    {suggestions.map((s) => (
                      <button
                        key={s.id}
                        type="button"
                        onMouseDown={() => selectSuggestion(index, s)}
                        className="flex w-full flex-col items-start px-3 py-2 text-left text-sm hover:bg-slate-700 first:rounded-t-lg last:rounded-b-lg"
                      >
                        <span className="text-slate-200">{s.name}</span>
                        {s.role && <span className="text-xs text-slate-500">{s.role}</span>}
                      </button>
                    ))}
                  </div>
                )}
              </div>

              <input
                value={contact.phone}
                onChange={(e) => updateContact(index, { phone: e.target.value })}
                placeholder="Phone (optional)"
                className="rounded-lg border border-white/10 bg-slate-800 px-3 py-2 text-sm outline-none"
              />

              <input
                value={contact.email}
                onChange={(e) => updateContact(index, { email: e.target.value })}
                placeholder="Email (optional)"
                className="rounded-lg border border-white/10 bg-slate-800 px-3 py-2 text-sm outline-none"
              />

              <label className="flex items-center gap-2 text-xs text-slate-400 md:col-span-2">
                <input
                  type="checkbox"
                  checked={contact.is_primary}
                  onChange={(e) => updateContact(index, { is_primary: e.target.checked })}
                  className="rounded border-white/10 bg-slate-800"
                />
                Primary contact for this facility
              </label>

              {contacts.length > 1 && (
                <button
                  type="button"
                  onClick={() => removeContact(index)}
                  className="md:col-span-2 text-left text-xs text-red-400 hover:text-red-300"
                >
                  Remove this contact
                </button>
              )}
            </div>
          );
        })}

        <button
          type="button"
          onClick={addContact}
          className="text-sm text-blue-300 hover:text-blue-200"
        >
          + Add another contact
        </button>
      </div>

      {errorMsg && (
        <p className="rounded-lg border border-red-500/30 bg-red-500/10 p-3 text-sm text-red-300">
          {errorMsg}
        </p>
      )}

      <button
        disabled={loading}
        className="w-full rounded-xl bg-blue-500 px-4 py-3 text-sm font-semibold hover:bg-blue-400 disabled:opacity-50"
      >
        {loading ? "Saving..." : "Log Visit"}
      </button>

      {saved && <p className="text-sm text-emerald-300">Visit saved.</p>}
    </form>
  );
}