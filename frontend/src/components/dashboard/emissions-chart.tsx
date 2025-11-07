"use client"

import { Card } from "@/components/ui/card"
import { PieChart, Pie, Cell, Legend, Tooltip, ResponsiveContainer } from "recharts"

const data = [
  { name: "EV - Solar", value: 35, color: "#10b981", description: "Clean solar power" },
  { name: "EV - Battery", value: 28, color: "#0ea5e9", description: "Grid recharged batteries" },
  { name: "EV - Nuclear", value: 12, color: "#3b82f6", description: "Nuclear energy" },
  { name: "Fossil - CNG", value: 10, color: "#f59e0b", description: "Compressed natural gas" },
  { name: "Fossil - Diesel", value: 10, color: "#ef4444", description: "Diesel fuel" },
  { name: "Fossil - Petrol", value: 5, color: "#dc2626", description: "Petrol/gasoline" },
]

const CustomTooltip = ({ active, payload }: any) => {
  if (active && payload && payload.length) {
    const data = payload[0].payload
    return (
      <div className="bg-white dark:bg-slate-800 p-3 rounded-lg shadow-lg border border-slate-200 dark:border-slate-700">
        <p className="font-semibold text-slate-900 dark:text-white">{data.name}</p>
        <p className="text-sm text-slate-600 dark:text-slate-300">
          <span className="font-medium">{data.value}%</span> of emissions
        </p>
        <p className="text-xs text-slate-500 dark:text-slate-400">{data.description}</p>
      </div>
    )
  }
  return null
}

const renderLegendText = (value: string, entry: any) => {
  return <span className="text-sm text-slate-700 dark:text-slate-300">{value}</span>
}

export default function EmissionsByEnergyType() {
  return (
    <Card className="p-6">
      <div className="space-y-4">
        <div>
          <h3 className="text-lg font-semibold text-slate-900 dark:text-white">Emissions by Energy Type</h3>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">Distribution of energy sources across fleet</p>
        </div>

        <div className="w-full h-80">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie data={data} cx="50%" cy="50%" innerRadius={80} outerRadius={120} paddingAngle={2} dataKey="value">
                {data.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip content={<CustomTooltip />} />
              <Legend verticalAlign="bottom" height={36} formatter={renderLegendText} />
            </PieChart>
          </ResponsiveContainer>
        </div>

        <div className="border-t border-slate-200 dark:border-slate-700 pt-4">
          <h4 className="font-semibold text-slate-900 dark:text-white mb-3">Energy Source Breakdown</h4>
          <div className="space-y-2">
            {data.map((item, idx) => (
              <div
                key={idx}
                className="flex items-center justify-between p-2 rounded hover:bg-slate-50 dark:hover:bg-slate-900/50 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <div
                    className="w-4 h-4 rounded-full shadow-sm flex-shrink-0"
                    style={{ backgroundColor: item.color }}
                  />
                  <div>
                    <p className="text-sm font-medium text-slate-900 dark:text-white">{item.name}</p>
                    <p className="text-xs text-slate-500 dark:text-slate-400">{item.description}</p>
                  </div>
                </div>
                <span className="text-sm font-semibold text-slate-900 dark:text-white bg-slate-100 dark:bg-slate-800 px-3 py-1 rounded">
                  {item.value}%
                </span>
              </div>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3 bg-slate-50 dark:bg-slate-900 rounded-lg p-4">
          <div>
            <p className="text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase tracking-wide">
              Renewable Energy
            </p>
            <p className="text-xl font-bold text-green-600 dark:text-green-400 mt-1">75%</p>
            <p className="text-xs text-slate-500 dark:text-slate-400">Solar, Battery, Nuclear</p>
          </div>
          <div>
            <p className="text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase tracking-wide">
              Fossil Fuels
            </p>
            <p className="text-xl font-bold text-red-600 dark:text-red-400 mt-1">25%</p>
            <p className="text-xs text-slate-500 dark:text-slate-400">CNG, Diesel, Petrol</p>
          </div>
        </div>

        <div className="bg-blue-50 dark:bg-blue-950 rounded-lg p-4 border border-blue-200 dark:border-blue-800">
          <p className="text-sm text-slate-700 dark:text-slate-300">
            <span className="font-semibold">Current Status:</span> Your fleet is 75% powered by renewable or low-carbon
            energy sources, significantly exceeding industry averages of 35%.
          </p>
        </div>
      </div>
    </Card>
  )
}
