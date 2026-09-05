import { Zap, Sparkles } from "lucide-react";

const STATUS_STYLE = {
  pending: "text-amber-300 bg-amber-500/10",
  recovered: "text-emerald-300 bg-emerald-500/10",
  failed_retry: "text-red-300 bg-red-500/10",
};

const STATUS_LABEL = {
  pending: "Pending",
  recovered: "Recovered",
  failed_retry: "Retry Failed",
};

const PRIORITY_STYLE = {
  High: "text-emerald-300 bg-emerald-500/10",
  Medium: "text-amber-300 bg-amber-500/10",
  Low: "text-slate-300 bg-slate-500/10",
};

export default function RecoveryQueue({ transactions, onRecover, onExplain, recoveringId, queueRef }) {
  return (
    <div ref={queueRef} className="bg-white/5 border border-white/10 rounded-xl p-4">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <h3 className="font-medium">Recovery Queue</h3>
          <span className="text-xs text-emerald-300 bg-emerald-500/10 rounded-full px-2 py-0.5 flex items-center gap-1">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" /> Live
          </span>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-sm min-w-[760px]">
          <thead>
            <tr className="text-left text-slate-400 border-b border-white/10">
              <th className="py-2 pr-2 font-normal">Customer</th>
              <th className="py-2 pr-2 font-normal">Amount</th>
              <th className="py-2 pr-2 font-normal">Failure Reason</th>
              <th className="py-2 pr-2 font-normal">Recovery %</th>
              <th className="py-2 pr-2 font-normal">Priority</th>
              <th className="py-2 pr-2 font-normal">Status</th>
              <th className="py-2 pr-2 font-normal w-[170px]">Actions</th>
            </tr>
          </thead>
          <tbody>
            {transactions.map((tx) => (
              <tr key={tx.id} className="border-b border-white/5 last:border-0">
                <td className="py-2.5 pr-2 whitespace-nowrap">{tx.customer}</td>
                <td className="py-2.5 pr-2 whitespace-nowrap">₹{tx.amount.toLocaleString("en-IN")}</td>
                <td className="py-2.5 pr-2 text-slate-300 whitespace-nowrap">{tx.failure_label}</td>
                <td className="py-2.5 pr-2">{tx.recovery_probability}%</td>
                <td className="py-2.5 pr-2">
                  <span className={`px-2 py-0.5 rounded-md text-xs ${PRIORITY_STYLE[tx.priority]}`}>
                    {tx.priority}
                  </span>
                </td>
                <td className="py-2.5 pr-2">
                  <span className={`px-2 py-0.5 rounded-md text-xs whitespace-nowrap ${STATUS_STYLE[tx.status]}`}>
                    {STATUS_LABEL[tx.status]}
                  </span>
                </td>
                <td className="py-2.5 pr-2">
                  <div className="flex items-center gap-1.5">
                    {tx.status === "pending" && (
                      <button
                        type="button"
                        onClick={() => onRecover(tx.id)}
                        disabled={recoveringId === tx.id}
                        className="flex items-center gap-1 bg-[#3395FF] hover:bg-[#227fe0] disabled:opacity-50 text-white text-xs font-medium px-2 py-1.5 rounded-md whitespace-nowrap"
                      >
                        <Zap size={12} />
                        {recoveringId === tx.id ? "Working..." : "Recover"}
                      </button>
                    )}
                    <button
                      type="button"
                      onClick={() => onExplain(tx.id)}
                      className="flex items-center gap-1 bg-white/10 hover:bg-white/15 text-xs px-2 py-1.5 rounded-md whitespace-nowrap"
                    >
                      <Sparkles size={12} />
                      Explain
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
