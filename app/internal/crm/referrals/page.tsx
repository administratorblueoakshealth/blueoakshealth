import GrowthOSShell from "@/components/growth-os/shell/GrowthOSShell";
import { getReferrals } from "@/features/referrals/repository";

export default async function ReferralsPage() {
  const referrals = await getReferrals();

  return (
    <GrowthOSShell>
      <h1 className="text-3xl font-bold">Referrals</h1>
      <p className="mt-2 text-slate-400">Referral pipeline and outcomes.</p>

      <div className="mt-6 rounded-3xl border border-white/10 bg-white/5 p-6">
        {referrals.length === 0 ? (
          <p className="text-sm text-slate-400">No referrals recorded yet.</p>
        ) : (
          <pre className="text-sm">{JSON.stringify(referrals, null, 2)}</pre>
        )}
      </div>
    </GrowthOSShell>
  );
}
