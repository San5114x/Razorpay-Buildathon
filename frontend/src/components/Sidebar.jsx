import { useState } from "react";
import { LayoutDashboard, ListChecks, TrendingUp, Bot, FileBarChart, Settings } from "lucide-react";

// Fallback mark shown only if /razorpay-logo.png is missing — an original
// bolt motif, not a reproduction of Razorpay's actual logo.
function FallbackMark() {
  return (
    <div className="w-11 h-11 rounded-xl bg-[#3395FF]/15 flex items-center justify-center shrink-0">
      <svg width="26" height="26" viewBox="0 0 24 24" fill="none">
        <path d="M13.5 2L4 14h6l-1.5 8L20 10h-6.5L15 2z" fill="#3395FF" />
      </svg>
    </div>
  );
}

function BrandMark() {
  const [failed, setFailed] = useState(false);
  if (failed) return <FallbackMark />;
  return (
    <img
      src="/razorpay-logo.png"
      alt="Razorpay"
      width={44}
      height={44}
      className="rounded-xl shrink-0"
      onError={() => setFailed(true)}
    />
  );
}

const NAV_ITEMS = [
  { key: "dashboard", label: "Dashboard", icon: LayoutDashboard },
  { key: "queue", label: "Recovery Queue", icon: ListChecks },
  { key: "insights", label: "Insights", icon: TrendingUp },
  { key: "copilot", label: "AI Copilot", icon: Bot },
  { key: "reports", label: "Reports", icon: FileBarChart },
  { key: "settings", label: "Settings", icon: Settings },
];

export default function Sidebar({ activeTab, onSelectTab }) {
  return (
    <aside className="w-56 shrink-0 border-r border-white/5 px-4 py-6 hidden md:flex md:flex-col gap-8">
      <div className="flex items-center gap-2.5 px-2">
        <BrandMark />
        <div className="leading-tight">
          <div className="text-[10px] text-slate-400 font-medium">Razorpay</div>
          <span className="font-semibold text-[15px]">
            Recovery<span className="text-[#3395FF]">Pilot</span>
          </span>
        </div>
      </div>

      <nav className="flex flex-col gap-1">
        {NAV_ITEMS.map(({ key, label, icon: Icon }) => (
          <button
            key={key}
            type="button"
            onClick={() => onSelectTab(key)}
            className={`flex items-center gap-3 px-3 py-2 rounded-lg text-sm text-left transition-colors ${
              activeTab === key
                ? "bg-[#3395FF]/10 text-[#3395FF]"
                : "text-slate-400 hover:text-slate-200 hover:bg-white/5"
            }`}
          >
            <Icon size={17} />
            {label}
          </button>
        ))}
      </nav>
    </aside>
  );
}
