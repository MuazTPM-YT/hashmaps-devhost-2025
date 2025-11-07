"use client"

import { Card } from "@/components/ui/card"
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts"

const data = [
  { day: "Day 1", actual: 450, baseline: 480, saved: 30 },
  { day: "Day 2", actual: 420, baseline: 480, saved: 60 },
  { day: "Day 3", actual: 410, baseline: 480, saved: 70 },
  { day: "Day 4", actual: 385, baseline: 480, saved: 95 },
  { day: "Day 5", actual: 360, baseline: 480, saved: 120 },
  { day: "Day 6", actual: 350, baseline: 480, saved: 130 },
  { day: "Day 7", actual: 340, baseline: 480, saved: 140 },
  { day: "Day 8", actual: 320, baseline: 480, saved: 160 },
]

export default function TrendChart() {
  return (
    <Card className="p-6">
      <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-6">30-Day Emission Trend</h3>
      <div className="w-full h-80">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={data} margin={{ top: 5, right: 30, left: 0, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
            <XAxis dataKey="day" tick={{ fontSize: 12 }} />
            <YAxis tick={{ fontSize: 12 }} />
            <Tooltip />
            <Legend />
            <Line
              type="monotone"
              dataKey="actual"
              stroke="#3b82f6"
              strokeWidth={2}
              name="Actual Emissions"
              dot={{ fill: "#3b82f6", r: 4 }}
            />
            <Line
              type="monotone"
              dataKey="baseline"
              stroke="#9ca3af"
              strokeWidth={2}
              strokeDasharray="5 5"
              name="Baseline"
              dot={false}
            />
            <Line
              type="monotone"
              dataKey="saved"
              stroke="#10b981"
              strokeWidth={2}
              name="CO₂ Saved"
              dot={{ fill: "#10b981", r: 4 }}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </Card>
  )
}
