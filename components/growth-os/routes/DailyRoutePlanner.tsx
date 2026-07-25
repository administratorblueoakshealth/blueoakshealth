"use client";

import { useState } from "react";
import { RouteStopCard, type Stop } from "./RouteStopCard";

export default function DailyRoutePlanner() {
  const [startingLocation, setStartingLocation] = useState("78253");
  const [maxDistanceMiles, setMaxDistanceMiles] = useState(25);
  const [maxFacilities, setMaxFacilities] = useState(8);
  const [includeAllCategories, setIncludeAllCategories] = useState(false);
  const [loading, setLoading] = useState(false);
  const [stops, setStops] = useState<Stop[]>([]);
  const [summary, setSummary] = useState("");
  const [errorMsg, setErrorMsg] = useState("");

  async function generateRoute() {
    setLoading(true);
    setErrorMsg("");

    try {
      const res = await fetch("/api/internal/crm/daily-route", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          startingLocation,
          maxDistanceMiles,
          maxFacilities,
          includeAllCategories,
        }),
      });

      const data = await res.json();

      if (!data.ok) {
        setErrorMsg(data.error ?? "Something went wrong generating the route.");
        setStops([]);
        setSummary("");
        return;
      }

      setSummary(data.summary ?? "");
      setStops(data.stops ?? []);
    } catch (err) {
      setErrorMsg("Could not reach the route service. Check your connection and try again.");
      setStops([]);
      setSummary("");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div>
      <div className="mb-6">
        <p className="text-sm font-medium text-blue-300">Daily Route</p>
        <h1 className="mt-2 text-3xl font-bold">Today's Visit Route</h1>
        <p className="mt-2 max-w-3xl text-slate-400">
          Enter a starting ZIP or address and generate nearby facility visit priorities.
        </p>
      </div>

      <div className="mb-6 grid gap-3 rounded-3xl border border-white/10 bg-white/5 p-5 md:grid-cols-4">
        <input
          value={startingLocation}
          onChange={(e) => setStartingLocation(e.target.value)}
          className="rounded-xl border border-white/10 bg-slate-900 px-4 py-3 text-sm outline-none"
          placeholder="Starting ZIP or address"
        />

        <input
          value={maxDistanceMiles}
          onChange={(e) => setMaxDistanceMiles(Number(e.target.value))}
          className="rounded-xl border border-white/10 bg-slate-900 px-4 py-3 text-sm outline-none"
          type="number"
          placeholder="Max miles"
        />

        <input
          value={maxFacilities}
          onChange={(e) => setMaxFacilities(Number(e.target.value))}
          className="rounded-xl border border-white/10 bg-slate-900 px-4 py-3 text-sm outline-none"
          type="number"
          placeholder="Max facilities"
        />

        <button
          onClick={generateRoute}
          disabled={loading}
          className="rounded-xl bg-blue-500 px-4 py-3 text-sm font-semibold hover:bg-blue-400 disabled:opacity-50"
        >
          {loading ? "Generating..." : "Generate Route"}
        </button>

        <label className="md:col-span-4 flex items-center gap-2 text-sm text-slate-400">
          <input
            type="checkbox"
            checked={includeAllCategories}
            onChange={(e) => setIncludeAllCategories(e.target.checked)}
            className="rounded border-white/10 bg-slate-900"
          />
          Include all categories (dentists, pharmacies, individual therapists, etc.)
        </label>
      </div>

      {errorMsg && (
        <div className="mb-6 rounded-2xl border border-red-500/30 bg-red-500/10 p-4 text-sm text-red-300">
          {errorMsg}
        </div>
      )}

      {summary && !errorMsg && (
        <div className="mb-6 rounded-2xl border border-white/10 bg-slate-900/70 p-4 text-sm text-slate-300">
          {summary}
        </div>
      )}

      <div className="space-y-4">
        {stops.map((stop, index) => (
          <RouteStopCard key={stop.id} stop={stop} index={index} />
        ))}
      </div>
    </div>
  );
}