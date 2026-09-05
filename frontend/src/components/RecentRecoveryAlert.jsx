import { CheckCircle2 } from "lucide-react";

export default function RecentRecoveryAlert({ transaction }) {
  if (!transaction) {
    return (
      <div className="bg-white/5 border border-white/10 rounded-xl p-4 text-sm text-slate-400">
        No recoveries yet in this session — click "Recover" on a pending transaction to run one.
      </div>
    );
  }

  return (
    <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-xl p-4">
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2 text-emerald-300 font-medium text-sm">
          <CheckCircle2 size={16} />
          Recently Recovered
        </div>
        <span className="text-xs text-slate-500">just now</span>
      </div>
      <div className="text-xl font-semibold">₹{transaction.amount.toLocaleString("en-IN")}</div>
      <p className="text-sm text-slate-400 mt-1">
        {transaction.customer}'s payment came through via {transaction.action_label.toLowerCase()}.
      </p>
    </div>
  );
}
