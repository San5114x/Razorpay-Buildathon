import { useState } from "react";

const CHANNELS = [
  { key: "whatsapp", label: "WhatsApp reminders" },
  { key: "email", label: "Email notices" },
  { key: "sms", label: "SMS retry links" },
  { key: "voice", label: "Hinglish voice calls" },
];

function Toggle({ on, onClick }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`w-10 h-6 rounded-full relative transition-colors ${on ? "bg-[#3395FF]" : "bg-white/15"}`}
    >
      <span
        className={`absolute top-0.5 w-5 h-5 rounded-full bg-white transition-transform ${on ? "translate-x-4" : "translate-x-0.5"}`}
      />
    </button>
  );
}

export default function Settings() {
  const [channels, setChannels] = useState({ whatsapp: true, email: true, sms: false, voice: false });
  const [merchant, setMerchant] = useState({ name: "DSU Cafe", location: "Bangalore, Karnataka" });

  return (
    <div className="flex flex-col gap-4 mt-2 max-w-xl">
      <div className="bg-white/5 border border-white/10 rounded-xl p-5">
        <h3 className="font-medium mb-4">Merchant profile</h3>
        <label className="block text-xs text-slate-400 mb-1">Business name</label>
        <input
          value={merchant.name}
          onChange={(e) => setMerchant((m) => ({ ...m, name: e.target.value }))}
          className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm mb-3 outline-none"
        />
        <label className="block text-xs text-slate-400 mb-1">Location</label>
        <input
          value={merchant.location}
          onChange={(e) => setMerchant((m) => ({ ...m, location: e.target.value }))}
          className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm outline-none"
        />
      </div>

      <div className="bg-white/5 border border-white/10 rounded-xl p-5">
        <h3 className="font-medium mb-4">Recovery channels</h3>
        <div className="flex flex-col gap-3">
          {CHANNELS.map((c) => (
            <div key={c.key} className="flex items-center justify-between">
              <span className="text-sm text-slate-300">{c.label}</span>
              <Toggle
                on={channels[c.key]}
                onClick={() => setChannels((prev) => ({ ...prev, [c.key]: !prev[c.key] }))}
              />
            </div>
          ))}
        </div>
      </div>

      <p className="text-xs text-slate-500">
        These settings apply to this session only — they aren't saved to the backend yet.
      </p>
    </div>
  );
}
