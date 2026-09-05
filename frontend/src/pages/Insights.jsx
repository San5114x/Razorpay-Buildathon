import { useEffect, useState } from "react";
import axios from "axios";
import { Sparkles } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";

const API = "http://127.0.0.1:8000";

export default function Insights() {
  const [breakdown, setBreakdown] = useState([]);
  const [narrative, setNarrative] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    axios
      .get(`${API}/insights`)
      .then((res) => {
        setBreakdown(res.data.breakdown);
        setNarrative(res.data.narrative);
      })
      .catch(() => setError(`Couldn't reach ${API}/insights. Is the backend running?`))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="text-sm text-slate-400 mt-2">Loading insights...</div>;

  if (error) {
    return (
      <div className="bg-red-500/10 border border-red-500/20 text-red-300 text-sm rounded-lg px-4 py-2 mt-2">
        {error}
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-4 mt-2">
      <div className="bg-white/5 border border-white/10 rounded-xl p-5">
        <div className="flex items-center gap-2 mb-3 text-slate-200 font-medium">
          <Sparkles size={15} className="text-[#3395FF]" />
          What to prioritize
        </div>
        <p className="text-sm text-slate-300 leading-relaxed">{narrative}</p>
      </div>

      <div className="bg-white/5 border border-white/10 rounded-xl p-4">
        <h3 className="font-medium mb-4">At-risk amount by failure reason</h3>
        <ResponsiveContainer width="100%" height={280}>
          <BarChart data={breakdown} layout="vertical" margin={{ left: 40 }}>
            <CartesianGrid stroke="#1f2b3d" strokeDasharray="3 3" horizontal={false} />
            <XAxis type="number" stroke="#64748b" fontSize={12} />
            <YAxis type="category" dataKey="reason" stroke="#64748b" fontSize={12} width={140} />
            <Tooltip contentStyle={{ background: "#0b1526", border: "1px solid #1f2b3d", borderRadius: 8 }} />
            <Bar dataKey="total_amount" fill="#fbbf24" radius={[0, 4, 4, 0]} name="At risk (₹)" />
            <Bar dataKey="recovered_amount" fill="#34d399" radius={[0, 4, 4, 0]} name="Recovered (₹)" />
          </BarChart>
        </ResponsiveContainer>
      </div>

      <div className="bg-white/5 border border-white/10 rounded-xl p-4 overflow-x-auto">
        <table className="w-full text-sm min-w-[600px]">
          <thead>
            <tr className="text-left text-slate-400 border-b border-white/10">
              <th className="py-2 pr-3 font-normal">Failure Reason</th>
              <th className="py-2 pr-3 font-normal">Cases</th>
              <th className="py-2 pr-3 font-normal">At Risk</th>
              <th className="py-2 pr-3 font-normal">Recovered</th>
              <th className="py-2 pr-3 font-normal">Avg Recovery %</th>
            </tr>
          </thead>
          <tbody>
            {breakdown.map((r) => (
              <tr key={r.reason} className="border-b border-white/5 last:border-0">
                <td className="py-2.5 pr-3">{r.reason}</td>
                <td className="py-2.5 pr-3">{r.count}</td>
                <td className="py-2.5 pr-3">₹{r.total_amount.toLocaleString("en-IN")}</td>
                <td className="py-2.5 pr-3">₹{r.recovered_amount.toLocaleString("en-IN")}</td>
                <td className="py-2.5 pr-3">{r.avg_probability}%</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
