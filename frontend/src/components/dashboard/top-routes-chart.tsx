"use client"

import { Card } from "@/components/ui/card"
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell, Legend } from "recharts"

const data = [
  {
    name: "Route A - Downtown",
    value: 520,
    unit: "kg CO₂e",
    displayValue: "520 kg",
    emissions: 520,
    percentage: 22.0,
  },
  {
    name: "Route B - Midtown",
    value: 480,
    unit: "kg CO₂e",
    displayValue: "480 kg",
    emissions: 480,
    percentage: 20.3,
  },
  {
    name: "Route C - Suburban",
    value: 420,
    unit: "kg CO₂e",
    displayValue: "420 kg",
    emissions: 420,
    percentage: 17.8,
  },
  {
    name: "Route D - Harbor",
    value: 350,
    unit: "kg CO₂e",
    displayValue: "350 kg",
    emissions: 350,
    percentage: 14.8,
  },
  {
    name: "Route E - Harbor",
    value: 340,
    unit: "kg CO₂e",
    displayValue: "340 kg",
    emissions: 340,
    percentage: 14.4,
  },
]

const CustomTooltip = ({ active, payload }: any) => {
  if (active && payload && payload.length) {
    const data = payload[0].payload
    return (
      <div className="bg-white dark:bg-slate-800 p-3 rounded-lg shadow-lg border border-slate-200 dark:border-slate-700">
        <p className="font-semibold text-slate-900 dark:text-white">{data.name}</p>
        <p className="text-sm text-slate-600 dark:text-slate-300">
          <span className="font-medium">
            {data.value} {data.unit}
          </span>
        </p>
        <p className="text-xs text-slate-500 dark:text-slate-400">{data.percentage}% of total emissions</p>
      </div>
    )
  }
  return null
}

export default function TopEmittingRoutes() {
  const totalEmissions = data.reduce((sum, route) => sum + route.value, 0)

  return (
    <Card className="p-6">
      <div className="space-y-6">
        <div className="space-y-1">
          <h3 className="text-lg font-semibold text-slate-900 dark:text-white">Top Emitting Routes</h3>
          <p className="text-sm text-slate-500 dark:text-slate-400">Emissions measured in kg CO₂e per delivery cycle</p>
        </div>

        {/* Chart */}
        <div className="w-full h-80">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={data} margin={{ top: 20, right: 30, left: 20, bottom: 80 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
              <XAxis dataKey="name" angle={-45} textAnchor="end" height={100} tick={{ fontSize: 12 }} />
              <YAxis label={{ value: "kg CO₂e", angle: -90, position: "insideLeft" }} tick={{ fontSize: 12 }} />
              <Tooltip content={<CustomTooltip />} />
              <Legend />
              <Bar dataKey="value" name="Emissions" radius={[8, 8, 0, 0]}>
                {data.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={["#ef4444", "#f59e0b", "#f59e0b", "#10b981", "#10b981"][index]} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Detailed Route Breakdown */}
        <div className="border-t border-slate-200 dark:border-slate-700 pt-4">
          <h4 className="font-semibold text-slate-900 dark:text-white mb-3">Route Breakdown (kg CO₂e)</h4>
          <div className="space-y-2">
            {data.map((route, idx) => (
              <div
                key={idx}
                className="flex items-center justify-between p-2 rounded hover:bg-slate-50 dark:hover:bg-slate-900/50 transition-colors"
              >
                <div className="flex items-center gap-3 flex-1">
                  <div
                    className="w-3 h-3 rounded-full flex-shrink-0"
                    style={{
                      backgroundColor: ["#ef4444", "#f59e0b", "#f59e0b", "#10b981", "#10b981"][idx],
                    }}
                  />
                  <span className="text-sm text-slate-600 dark:text-slate-400">{route.name}</span>
                </div>
                <div className="flex items-center gap-2 flex-shrink-0">
                  <span className="text-sm font-semibold text-slate-900 dark:text-white">
                    {route.value} {route.unit}
                  </span>
                  <span className="text-xs text-slate-500 dark:text-slate-400 bg-slate-100 dark:bg-slate-800 px-2 py-1 rounded">
                    {route.percentage}%
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Summary Stats */}
        <div className="grid grid-cols-2 gap-3 bg-slate-50 dark:bg-slate-900 rounded-lg p-4">
          <div>
            <p className="text-xs text-slate-500 dark:text-slate-400">Total Emissions</p>
            <p className="text-lg font-bold text-slate-900 dark:text-white">{totalEmissions} kg</p>
          </div>
          <div>
            <p className="text-xs text-slate-500 dark:text-slate-400">Per Route Average</p>
            <p className="text-lg font-bold text-slate-900 dark:text-white">
              {(totalEmissions / data.length).toFixed(0)} kg
            </p>
          </div>
        </div>
      </div>
    </Card>
  )
}
