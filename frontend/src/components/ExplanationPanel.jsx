import { Sparkles } from "lucide-react";

export default function ExplanationPanel({ transaction, explanation, loading }) {
  if (!transaction) {
    return (
      <div className="bg-white/5 border border-white/10 rounded-xl p-5 text-sm text-slate-400">
        Click "Explain" on any transaction to see why RecoveryPilot chose that recovery action.
      </div>
    );
  }

  return (
    <div className="grid md:grid-cols-2 gap-4">
      <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-xl p-5">
        <div className="text-emerald-300 font-medium mb-3">{transaction.action_label}</div>
        <div className="text-sm text-slate-300 mb-1">
          Recovery probability: <span className="text-white">{transaction.recovery_probability}%</span>
        </div>
        <div className="text-sm text-slate-300">
          Reason: <span className="text-white">{transaction.failure_label}</span>
        </div>
      </div>

      <div className="bg-white/5 border border-white/10 rounded-xl p-5">
        <div className="flex items-center gap-2 mb-3 text-slate-200 font-medium">
          <Sparkles size={15} className="text-[#3395FF]" />
          Gemini Analysis
        </div>
        <p className="text-sm text-slate-300 leading-relaxed">
          {loading ? "Generating explanation..." : explanation}
        </p>
        <div className="text-xs text-slate-500 mt-3">Generated with Gemini 2.5 Flash</div>
      </div>
    </div>
  );
}
