"use client"

import type React from "react"
import { useState } from "react"
import { Card } from "@/components/ui/card"
import { AlertCircle, TrendingUp, CheckCircle, Clock } from "lucide-react"
import AlertDetails from "./alert-details"

interface Alert {
  id: string
  title: string
  message: string
  severity: "high" | "medium" | "low"
  action: string
  icon: React.ReactNode
}

export default function AlertsSection() {
  const [selectedAlertId, setSelectedAlertId] = useState<string | null>(null)

  const alerts: Alert[] = [
    {
      id: "1",
      title: "Diesel Fleet Over Quota",
      message: "Your diesel vehicle fleet has exceeded the quarterly emissions limit by 15%",
      severity: "high",
      action: "View Details",
      icon: <AlertCircle className="w-5 h-5" />,
    },
    {
      id: "2",
      title: "Compliance Deadline Approaching",
      message: "CSRD Report submission deadline in 38 days",
      severity: "medium",
      action: "View Details",
      icon: <Clock className="w-5 h-5" />,
    },
    {
      id: "3",
      title: "Optimization Opportunity",
      message: "Route C efficiency can be improved by 22% with vehicle routing optimization",
      severity: "low",
      action: "View Details",
      icon: <TrendingUp className="w-5 h-5" />,
    },
    {
      id: "4",
      title: "Fines Avoided",
      message: "Your EV fleet investments saved you $3,240 in compliance fines",
      severity: "low",
      action: "View Details",
      icon: <CheckCircle className="w-5 h-5" />,
    },
  ]

  const severityConfig = {
    high: {
      bg: "bg-red-50 dark:bg-red-950",
      border: "border-red-200 dark:border-red-800",
      icon: "text-red-600 dark:text-red-400",
      title: "text-red-900 dark:text-red-100",
      badge: "bg-red-100 dark:bg-red-900 text-red-800 dark:text-red-100",
    },
    medium: {
      bg: "bg-amber-50 dark:bg-amber-950",
      border: "border-amber-200 dark:border-amber-800",
      icon: "text-amber-600 dark:text-amber-400",
      title: "text-amber-900 dark:text-amber-100",
      badge: "bg-amber-100 dark:bg-amber-900 text-amber-800 dark:text-amber-100",
    },
    low: {
      bg: "bg-green-50 dark:bg-green-950",
      border: "border-green-200 dark:border-green-800",
      icon: "text-green-600 dark:text-green-400",
      title: "text-green-900 dark:text-green-100",
      badge: "bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-100",
    },
  }

  if (selectedAlertId) {
    return <AlertDetails alertId={selectedAlertId} onBack={() => setSelectedAlertId(null)} />
  }

  return (
    <div className="grid grid-cols-1 gap-4">
      {alerts.map((alert) => {
        const config = severityConfig[alert.severity]
        return (
          <Card
            key={alert.id}
            className={`p-5 border ${config.bg} ${config.border} hover:shadow-md transition-all cursor-pointer`}
            onClick={() => setSelectedAlertId(alert.id)}
          >
            <div className="flex gap-4">
              <div className={`flex-shrink-0 ${config.icon}`}>{alert.icon}</div>
              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <h4 className={`font-semibold ${config.title}`}>{alert.title}</h4>
                    <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">{alert.message}</p>
                  </div>
                  <span className={`text-xs font-semibold px-3 py-1 rounded-full flex-shrink-0 ${config.badge}`}>
                    {alert.severity.charAt(0).toUpperCase() + alert.severity.slice(1)}
                  </span>
                </div>
                <button
                  onClick={(e) => {
                    e.stopPropagation()
                    setSelectedAlertId(alert.id)
                  }}
                  className="mt-3 text-sm font-medium text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 transition-colors"
                >
                  {alert.action} →
                </button>
              </div>
            </div>
          </Card>
        )
      })}
    </div>
  )
}
