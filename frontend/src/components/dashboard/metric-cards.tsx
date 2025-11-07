"use client"

import type React from "react"

import { Card } from "@/components/ui/card"
import { TrendingDown, TrendingUp, BarChart3, DollarSign } from "lucide-react"

interface MetricCardProps {
  title: string
  value: string
  subtitle: string
  icon: React.ReactNode
  trend?: {
    value: string
    isPositive: boolean
  }
  color: "green" | "blue" | "amber" | "emerald"
}

function MetricCard({ title, value, subtitle, icon, trend, color }: MetricCardProps) {
  const colorClasses = {
    green: "bg-green-50 dark:bg-green-950 text-green-600 dark:text-green-400",
    blue: "bg-blue-50 dark:bg-blue-950 text-blue-600 dark:text-blue-400",
    amber: "bg-amber-50 dark:bg-amber-950 text-amber-600 dark:text-amber-400",
    emerald: "bg-emerald-50 dark:bg-emerald-950 text-emerald-600 dark:text-emerald-400",
  }

  return (
    <Card className="p-6 hover:shadow-lg transition-shadow">
      <div className="flex items-start justify-between">
        <div className="space-y-2 flex-1">
          <p className="text-sm font-medium text-slate-600 dark:text-slate-400">{title}</p>
          <p className="text-3xl font-bold text-slate-900 dark:text-white">{value}</p>
          <div className="flex items-center gap-2 pt-1">
            {trend && (
              <>
                {trend.isPositive ? (
                  <TrendingDown className="w-4 h-4 text-green-500" />
                ) : (
                  <TrendingUp className="w-4 h-4 text-red-500" />
                )}
                <span className={`text-xs font-semibold ${trend.isPositive ? "text-green-600" : "text-red-600"}`}>
                  {trend.value}
                </span>
              </>
            )}
            <span className="text-xs text-slate-500 dark:text-slate-400">{subtitle}</span>
          </div>
        </div>
        <div className={`p-3 rounded-lg ${colorClasses[color]}`}>{icon}</div>
      </div>
    </Card>
  )
}

export default function MetricCards() {
  const metrics = [
    {
      title: "Total CO₂ This Week",
      value: "12,450 kg",
      subtitle: "from last week",
      icon: <TrendingDown className="w-6 h-6" />,
      trend: { value: "↓12%", isPositive: true },
      color: "green" as const,
    },
    {
      title: "CO₂ per Delivery",
      value: "2.1 kg",
      subtitle: "Industry Avg: 2.3 kg",
      icon: <BarChart3 className="w-6 h-6" />,
      color: "blue" as const,
    },
    {
      title: "Fleet Efficiency Score",
      value: "78/100",
      subtitle: "Good",
      icon: <BarChart3 className="w-6 h-6" />,
      color: "amber" as const,
    },
    {
      title: "Compliance Savings",
      value: "$3,240",
      subtitle: "Fines Avoided This Month",
      icon: <DollarSign className="w-6 h-6" />,
      color: "emerald" as const,
    },
  ]

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      {metrics.map((metric, idx) => (
        <MetricCard key={idx} {...metric} />
      ))}
    </div>
  )
}
