import { Construction } from "lucide-react";

const COPY = {
  queue: {
    title: "Recovery Queue is part of the Dashboard for now",
    body: "The full queue with per-transaction actions lives on the Dashboard tab below the charts. A dedicated full-page view is next on the list.",
  },
  insights: {
    title: "Insights is coming next",
    body: "This will break down recovery performance by failure reason, bank, and time of day once there's enough recovered volume to chart.",
  },
  reports: {
    title: "Reports isn't built yet",
    body: "Exportable batch summaries (CSV/PDF) for merchant reporting are planned but not wired up in this build.",
  },
  settings: {
    title: "Settings isn't built yet",
    body: "Merchant profile, notification channels, and retry-rule configuration will live here.",
  },
};

export default function ComingSoon({ tab }) {
  const copy = COPY[tab] ?? COPY.reports;
  return (
    <div className="bg-white/5 border border-white/10 rounded-xl p-10 flex flex-col items-center text-center gap-3 mt-2">
      <div className="w-10 h-10 rounded-lg bg-white/10 flex items-center justify-center">
        <Construction size={18} className="text-slate-300" />
      </div>
      <h3 className="font-medium">{copy.title}</h3>
      <p className="text-sm text-slate-400 max-w-md">{copy.body}</p>
    </div>
  );
}
