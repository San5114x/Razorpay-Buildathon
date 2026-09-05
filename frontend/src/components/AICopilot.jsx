import { useState } from "react";
import { Bot } from "lucide-react";
import axios from "axios";

const SUGGESTIONS = ["Which customers should I prioritize?", "What's my recovery rate this week?"];

export default function AICopilot() {
  const [messages, setMessages] = useState([
    { from: "bot", text: "Hi! I'm your RecoveryPilot Copilot. Ask me about at-risk revenue, priorities, or today's recoveries." },
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);

  async function send(question) {
    if (!question.trim()) return;
    setMessages((m) => [...m, { from: "user", text: question }]);
    setInput("");
    setLoading(true);
    try {
      const res = await axios.post("http://127.0.0.1:8000/copilot", { question });
      setMessages((m) => [...m, { from: "bot", text: res.data.answer }]);
    } catch {
      setMessages((m) => [...m, { from: "bot", text: "Copilot is unavailable right now." }]);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="bg-white/5 border border-white/10 rounded-xl p-4 flex flex-col h-full">
      <div className="flex items-center gap-2 mb-3">
        <div className="w-8 h-8 rounded-lg bg-[#3395FF]/15 flex items-center justify-center">
          <Bot size={16} className="text-[#3395FF]" />
        </div>
        <div>
          <div className="font-medium text-sm">AI Copilot</div>
          <div className="text-xs text-slate-500">Ask about your recovery batch</div>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto flex flex-col gap-2 mb-3 max-h-72">
        {messages.map((m, i) => (
          <div
            key={i}
            className={`text-sm px-3 py-2 rounded-lg max-w-[90%] ${
              m.from === "bot" ? "bg-white/5 self-start" : "bg-[#3395FF] text-white self-end"
            }`}
          >
            {m.text}
          </div>
        ))}
        {loading && <div className="text-xs text-slate-500 self-start">Thinking...</div>}
      </div>

      <div className="flex flex-wrap gap-2 mb-3">
        {SUGGESTIONS.map((s) => (
          <button
            key={s}
            onClick={() => send(s)}
            className="text-xs bg-white/5 hover:bg-white/10 border border-white/10 rounded-full px-3 py-1.5"
          >
            {s}
          </button>
        ))}
      </div>

      <div className="flex items-center gap-2">
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && send(input)}
          placeholder="Ask anything..."
          className="flex-1 bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm outline-none placeholder:text-slate-500"
        />
        <button
          onClick={() => send(input)}
          className="bg-[#3395FF] hover:bg-[#227fe0] text-white rounded-lg px-3 py-2 text-sm font-medium"
        >
          Send
        </button>
      </div>
    </div>
  );
}
