import { useEffect, useState, useCallback, useRef } from "react";
import axios from "axios";
import { ShieldCheck, IndianRupee, Store, ListChecks } from "lucide-react";

import Sidebar from "../components/Sidebar";
import Insights from "./Insights";
import Reports from "./Reports";
import Settings from "./Settings";
import Navbar from "../components/Navbar";
import StatCard from "../components/StatCard";
import RecoveryTrendChart from "../components/RecoveryTrendChart";
import StatusDonut from "../components/StatusDonut";
import RecoveryQueue from "../components/RecoveryQueue";
import ExplanationPanel from "../components/ExplanationPanel";
import AICopilot from "../components/AICopilot";
import RecentRecoveryAlert from "../components/RecentRecoveryAlert";

const API = "http://127.0.0.1:8000";

export default function Dashboard() {
  const [transactions, setTransactions] = useState([]);
  const [stats, setStats] = useState({
    total_transactions: 0, pending_count: 0, recovered_count: 0,
    failed_retry_count: 0, total_at_risk: 0, total_recovered: 0,
  });
  const [trend, setTrend] = useState([]);
  const [recoveringId, setRecoveringId] = useState(null);
  const [selectedTx, setSelectedTx] = useState(null);
  const [explanation, setExplanation] = useState("");
  const [explainLoading, setExplainLoading] = useState(false);
  const [lastRecovered, setLastRecovered] = useState(null);
  const [errorMsg, setErrorMsg] = useState("");
  const [activeTab, setActiveTab] = useState("dashboard");
  const explainRef = useRef(null);
  const queueRef = useRef(null);
  const copilotRef = useRef(null);

  function handleSelectTab(tab) {
    setActiveTab(tab);
    if (tab === "queue") setTimeout(() => queueRef.current?.scrollIntoView({ behavior: "smooth" }), 50);
    if (tab === "copilot") setTimeout(() => copilotRef.current?.scrollIntoView({ behavior: "smooth" }), 50);
  }

  const fetchData = useCallback(async () => {
    try {
      const [txRes, statsRes] = await Promise.all([
        axios.get(`${API}/transactions`),
        axios.get(`${API}/stats`),
      ]);
      setTransactions(txRes.data);
      setStats(statsRes.data);
      setTrend((prev) => {
        const next = [...prev, {
          label: new Date().toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" }),
          recovered: statsRes.data.total_recovered,
        }];
        return next.slice(-7);
      });
      setErrorMsg("");
    } catch (err) {
      console.error("Failed to reach backend:", err);
      setErrorMsg("Can't reach the backend at " + API + ". Is uvicorn running?");
    }
  }, []);

  useEffect(() => {
    fetchData();
    const interval = setInterval(fetchData, 6000);
    return () => clearInterval(interval);
  }, [fetchData]);

  async function handleRecover(id) {
    setRecoveringId(id);
    try {
      const res = await axios.post(`${API}/transactions/${id}/recover`);
      if (res.data.status === "recovered") setLastRecovered(res.data);
      await fetchData();
      setErrorMsg("");
    } catch (err) {
      console.error(err);
      setErrorMsg(
        err.response
          ? `Recover failed: ${err.response.status} ${JSON.stringify(err.response.data)}`
          : `Recover failed: couldn't reach ${API}. Is the backend running?`
      );
    } finally {
      setRecoveringId(null);
    }
  }

  async function handleExplain(id) {
    const tx = transactions.find((t) => t.id === id);
    setSelectedTx(tx);
    setExplainLoading(true);
    setExplanation("");
    explainRef.current?.scrollIntoView({ behavior: "smooth", block: "center" });
    try {
      const res = await axios.post(`${API}/transactions/${id}/explain`);
      setExplanation(res.data.explanation);
    } catch {
      setExplanation("Couldn't reach the explanation service.");
    } finally {
      setExplainLoading(false);
    }
  }

  return (
    <div className="flex min-h-screen">
      <Sidebar activeTab={activeTab} onSelectTab={handleSelectTab} />

      <main className="flex-1 p-6 flex gap-6">
        <div className="flex-1 min-w-0 flex flex-col gap-6">
          <Navbar merchant="DSU Cafe" />

          {errorMsg && (
            <div className="bg-red-500/10 border border-red-500/20 text-red-300 text-sm rounded-lg px-4 py-2">
              {errorMsg}
            </div>
          )}

          {activeTab === "insights" && <Insights />}
          {activeTab === "reports" && <Reports />}
          {activeTab === "settings" && <Settings />}
          {activeTab !== "insights" && activeTab !== "reports" && activeTab !== "settings" && (
            <>
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                <StatCard
                  icon={ShieldCheck}
                  iconColor="bg-emerald-500/15 text-emerald-400"
                  label="Recovery Rate"
                  value={stats.total_transactions ? `${Math.round((stats.recovered_count / stats.total_transactions) * 100)}%` : "—"}
                  sublabel={`${stats.recovered_count} of ${stats.total_transactions} recovered`}
                />
                <StatCard
                  icon={IndianRupee}
                  iconColor="bg-amber-500/15 text-amber-400"
                  label="Total At Risk"
                  value={`₹${stats.total_at_risk.toLocaleString("en-IN")}`}
                  sublabel={`${stats.pending_count} pending`}
                />
                <StatCard
                  icon={Store}
                  iconColor="bg-sky-500/15 text-sky-400"
                  label="Merchant"
                  value="DSU Cafe"
                  sublabel="Bangalore, Karnataka"
                />
                <StatCard
                  icon={ListChecks}
                  iconColor="bg-violet-500/15 text-violet-400"
                  label="Revenue Recovered"
                  value={`₹${stats.total_recovered.toLocaleString("en-IN")}`}
                  sublabel="This session"
                />
              </div>

              <div className="flex flex-col md:flex-row gap-4">
                <RecoveryTrendChart data={trend} />
                <StatusDonut stats={stats} />
              </div>

              <RecoveryQueue
                transactions={transactions}
                onRecover={handleRecover}
                onExplain={handleExplain}
                recoveringId={recoveringId}
                queueRef={queueRef}
              />

              <div ref={explainRef}>
                <ExplanationPanel transaction={selectedTx} explanation={explanation} loading={explainLoading} />
              </div>
            </>
          )}
        </div>

        <div ref={copilotRef} className="w-80 shrink-0 hidden xl:flex flex-col gap-4">
          <AICopilot />
          <RecentRecoveryAlert transaction={lastRecovered} />
        </div>
      </main>
    </div>
  );
}
