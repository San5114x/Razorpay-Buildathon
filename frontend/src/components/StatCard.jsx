export default function StatCard({ icon: Icon, iconColor, label, value, sublabel }) {
  return (
    <div className="bg-white/5 border border-white/10 rounded-xl p-4 flex flex-col gap-3">
      <div className="flex items-center gap-2">
        <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${iconColor}`}>
          <Icon size={16} />
        </div>
        <span className="text-sm text-slate-400">{label}</span>
      </div>
      <div>
        <div className="text-2xl font-semibold">{value}</div>
        {sublabel && <div className="text-xs text-slate-500 mt-1">{sublabel}</div>}
      </div>
    </div>
  );
}
