import { PieChart, Pie, Cell, ResponsiveContainer } from "recharts";

const COLORS = { recovered: "#34d399", pending: "#fbbf24", failed_retry: "#f87171" };
const LABELS = { recovered: "Recovered", pending: "Pending", failed_retry: "Retry Failed" };

export default function StatusDonut({ stats }) {
  const data = [
    { key: "recovered", value: stats.recovered_count },
    { key: "pending", value: stats.pending_count },
    { key: "failed_retry", value: stats.failed_retry_count },
  ].filter((d) => d.value > 0);

  const total = stats.total_transactions || 1;

  return (
    <div className="bg-white/5 border border-white/10 rounded-xl p-4 w-full md:w-72">
      <h3 className="font-medium mb-2">Batch Status</h3>
      <div className="relative flex items-center justify-center">
        <ResponsiveContainer width="100%" height={200}>
          <PieChart>
            <Pie data={data} dataKey="value" innerRadius={55} outerRadius={80} paddingAngle={3}>
              {data.map((d) => (
                <Cell key={d.key} fill={COLORS[d.key]} stroke="none" />
              ))}
            </Pie>
          </PieChart>
        </ResponsiveContainer>
        <div className="absolute flex flex-col items-center">
          <span className="text-xl font-semibold">{stats.total_transactions}</span>
          <span className="text-xs text-slate-400">Transactions</span>
        </div>
      </div>
      <div className="flex flex-col gap-2 mt-2 text-sm">
        {data.map((d) => (
          <div key={d.key} className="flex items-center justify-between">
            <span className="flex items-center gap-2 text-slate-300">
              <span className="w-2.5 h-2.5 rounded-full" style={{ background: COLORS[d.key] }} />
              {LABELS[d.key]}
            </span>
            <span className="text-slate-400">{Math.round((d.value / total) * 100)}%</span>
          </div>
        ))}
      </div>
    </div>
  );
}
