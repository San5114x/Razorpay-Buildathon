import { useEffect, useState } from "react";
import axios from "axios";
import { Download } from "lucide-react";

const API = "http://127.0.0.1:8000";

function toCSV(rows) {
  const headers = ["id", "customer", "amount", "failure_label", "recovery_probability", "priority", "status", "recovered_amount", "created_at"];
  const lines = [headers.join(",")];
  for (const r of rows) {
    lines.push(headers.map((h) => JSON.stringify(r[h] ?? "")).join(","));
  }
  return lines.join("\n");
}

export default function Reports() {
  const [transactions, setTransactions] = useState([]);
  const [stats, setStats] = useState(null);
  const [error, setError] = useState("");

  useEffect(() => {
    Promise.all([axios.get(`${API}/transactions`), axios.get(`${API}/stats`)])
      .then(([txRes, statsRes]) => {
        setTransactions(txRes.data);
        setStats(statsRes.data);
      })
      .catch(() => setError(`Couldn't reach ${API}. Is the backend running?`));
  }, []);

  function downloadCSV() {
    const csv = toCSV(transactions);
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `recoverypilot-batch-${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  }

  if (error) {
    return <div className="bg-red-500/10 border border-red-500/20 text-red-300 text-sm rounded-lg px-4 py-2 mt-2">{error}</div>;
  }

  if (!stats) return <div className="text-sm text-slate-400 mt-2">Loading report...</div>;

  return (
    <div className="flex flex-col gap-4 mt-2">
      <div className="bg-white/5 border border-white/10 rounded-xl p-5 flex items-center justify-between flex-wrap gap-4">
        <div>
          <h3 className="font-medium mb-1">Batch summary</h3>
          <p className="text-sm text-slate-400">
            {stats.total_transactions} transactions · ₹{stats.total_recovered.toLocaleString("en-IN")} recovered ·
            {" "}₹{stats.total_at_risk.toLocaleString("en-IN")} still at risk
          </p>
        </div>
        <button
          onClick={downloadCSV}
          className="flex items-center gap-2 bg-[#3395FF] hover:bg-[#227fe0] text-white text-sm font-medium px-4 py-2 rounded-lg"
        >
          <Download size={15} />
          Download CSV
        </button>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white/5 border border-white/10 rounded-xl p-4">
          <div className="text-xs text-slate-400 mb-1">Recovery rate</div>
          <div className="text-xl font-semibold">
            {stats.total_transactions ? Math.round((stats.recovered_count / stats.total_transactions) * 100) : 0}%
          </div>
        </div>
        <div className="bg-white/5 border border-white/10 rounded-xl p-4">
          <div className="text-xs text-slate-400 mb-1">Recovered</div>
          <div className="text-xl font-semibold">{stats.recovered_count}</div>
        </div>
        <div className="bg-white/5 border border-white/10 rounded-xl p-4">
          <div className="text-xs text-slate-400 mb-1">Pending</div>
          <div className="text-xl font-semibold">{stats.pending_count}</div>
        </div>
        <div className="bg-white/5 border border-white/10 rounded-xl p-4">
          <div className="text-xs text-slate-400 mb-1">Retry failed</div>
          <div className="text-xl font-semibold">{stats.failed_retry_count}</div>
        </div>
      </div>

      <p className="text-xs text-slate-500">
        Exports the current batch as-is — every transaction, its failure reason, recovery probability, and outcome.
      </p>
    </div>
  );
}
