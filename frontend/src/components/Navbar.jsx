import { Search, Bell } from "lucide-react";

export default function Navbar({ merchant }) {
  return (
    <header className="flex items-center justify-between gap-4 mb-6">
      <div>
        <h1 className="text-2xl font-semibold">RecoveryPilot AI</h1>
        <p className="text-sm text-slate-400">Failed payments, found and won back.</p>
      </div>

      <div className="flex items-center gap-4">
        <div className="hidden lg:flex items-center gap-2 bg-white/5 border border-white/10 rounded-lg px-3 py-2 w-72">
          <Search size={15} className="text-slate-400" />
          <input
            placeholder="Search customer, amount, reason..."
            className="bg-transparent outline-none text-sm placeholder:text-slate-500 w-full"
          />
        </div>

        <button className="relative w-9 h-9 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center">
          <Bell size={16} className="text-slate-300" />
        </button>

        <div className="flex items-center gap-2 pl-2 border-l border-white/10">
          <div className="w-8 h-8 rounded-full bg-[#3395FF] flex items-center justify-center text-sm font-semibold">
            {merchant?.[0] ?? "M"}
          </div>
          <div className="text-sm leading-tight hidden sm:block">
            <div className="font-medium">{merchant ?? "Loading..."}</div>
            <div className="text-slate-400 text-xs">Merchant</div>
          </div>
        </div>
      </div>
    </header>
  );
}
