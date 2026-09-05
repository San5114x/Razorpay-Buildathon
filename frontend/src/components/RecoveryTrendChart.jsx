import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";

export default function RecoveryTrendChart({ data }) {
  return (
    <div className="bg-white/5 border border-white/10 rounded-xl p-4 flex-1">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-medium">Recovered Revenue Trend</h3>
        <span className="text-xs text-slate-400 border border-white/10 rounded-md px-2 py-1">Last 7 checks</span>
      </div>
      <ResponsiveContainer width="100%" height={220}>
        <LineChart data={data}>
          <CartesianGrid stroke="#1f2b3d" strokeDasharray="3 3" />
          <XAxis dataKey="label" stroke="#64748b" fontSize={12} />
          <YAxis stroke="#64748b" fontSize={12} />
          <Tooltip
            contentStyle={{ background: "#0b1526", border: "1px solid #1f2b3d", borderRadius: 8 }}
            labelStyle={{ color: "#cbd5e1" }}
          />
          <Line type="monotone" dataKey="recovered" stroke="#3395FF" strokeWidth={2} dot={{ r: 3 }} />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
