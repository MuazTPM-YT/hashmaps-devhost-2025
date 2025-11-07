"use client"

import { useState } from "react";
import { Card } from "@/components/ui/card";
import { AlertCircle, TrendingUp, Lightbulb, Send } from "lucide-react";

export default function AIInsightsPanel() {
  const [chatLog, setChatLog] = useState([
    { role: "ai", text: "Risk level is medium; compliance deadline in 45 days." },
    { role: "ai", text: "Projected savings this quarter: +$2,300." },
    { role: "ai", text: "Recommended action: Switch 3 diesel routes to EV battery fleet." }
  ]);
  const [input, setInput] = useState("");

  const handleSend = () => {
    if (!input.trim()) return;
    setChatLog([...chatLog, { role: "user", text: input }]);
    setTimeout(() => {
      setChatLog(current => [...current, { role: "ai", text: `AI suggests considering: ${input}` }]);
    }, 1000);
    setInput("");
  };

  return (
    <Card className="p-6 bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-950 dark:to-indigo-950 border-blue-200 dark:border-blue-800 mx-4 my-4 max-w-full max-h-[80vh] flex flex-col">
      <h3 className="flex items-center gap-2 text-lg font-semibold text-slate-900 dark:text-white mb-4 sticky top-0 bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-950 dark:to-indigo-950 z-10 px-2 py-1">
        <Lightbulb className="w-5 h-5 text-amber-500" />
        AI CHAT BOX     
        </h3>
      <div className="space-y-4 overflow-auto flex-grow">
        {chatLog.map((entry, idx) => (
          <div
            key={idx}
            className={`p-3 rounded-lg max-w-[80%] ${
              entry.role === "ai"
                ? "bg-white/80 dark:bg-slate-800/80 text-slate-900 dark:text-white self-start"
                : "bg-blue-600 text-white self-end ml-auto"
            }`}
          >
            {entry.text}
          </div>
        ))}
      </div>
      <div className="flex gap-2 mt-4">
        <input
          type="text"
          placeholder="Ask AI for insights or recommendations..."
          className="flex-grow rounded-lg border border-slate-300 px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-slate-900 dark:text-white"
          value={input}
          onChange={e => setInput(e.target.value)}
          onKeyDown={e => e.key === "Enter" && handleSend()}
        />
        <button
          onClick={handleSend}
          className="bg-blue-600 hover:bg-blue-700 rounded-lg p-2 text-white"
          aria-label="Send message"
        >
          <Send className="w-5 h-5" />
        </button>
      </div>
    </Card>
  );
}
