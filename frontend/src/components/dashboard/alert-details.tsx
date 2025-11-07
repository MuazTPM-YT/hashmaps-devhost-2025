"use client"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { ArrowLeft, AlertCircle, TrendingUp, CheckCircle, Clock, BarChart3, MapPin, Truck } from "lucide-react"

interface AlertDetailViewProps {
  alertId: string
  onBack: () => void
}

// Alert details with related information and actionable items
const alertDetails: Record<string, any> = {
  "1": {
    title: "Diesel Fleet Over Quota",
    severity: "high",
    message: "Your diesel vehicle fleet has exceeded the quarterly emissions limit by 15%",
    details: [
      {
        label: "Current Diesel Emissions",
        value: "3,200 tonnes CO₂e",
        subtext: "37.9% of total Scope 1",
      },
      {
        label: "Quarterly Limit",
        value: "2,780 tonnes CO₂e",
        subtext: "Based on 2025 targets",
      },
      {
        label: "Overage",
        value: "420 tonnes CO₂e",
        subtext: "+15% above limit",
      },
      {
        label: "Affected Routes",
        value: "Route A, Route B",
        subtext: "72% of diesel emissions",
      },
    ],
    actionItems: [
      { title: "Switch 3 routes to EV battery", impact: "Reduce 450 tonnes CO₂e/quarter", difficulty: "Medium" },
      { title: "Implement hybrid fleet strategy", impact: "Reduce 300 tonnes CO₂e/quarter", difficulty: "High" },
      { title: "Optimize route efficiency", impact: "Reduce 120 tonnes CO₂e/quarter", difficulty: "Low" },
    ],
    timeline: "38 days to next compliance period",
  },
  "2": {
    title: "Compliance Deadline Approaching",
    severity: "medium",
    message: "CSRD Report submission deadline in 38 days",
    details: [
      {
        label: "Deadline",
        value: "Dec 15, 2025",
        subtext: "38 days remaining",
      },
      {
        label: "Report Type",
        value: "CSRD Double Materiality Assessment",
        subtext: "EU Corporate Sustainability Reporting Directive",
      },
      {
        label: "Scope Coverage",
        value: "Scope 1, 2, and 3",
        subtext: "Full GHG accounting required",
      },
      {
        label: "Status",
        value: "Data collection in progress",
        subtext: "78% complete",
      },
    ],
    actionItems: [
      { title: "Complete Scope 3 data collection", impact: "Critical for submission", difficulty: "High" },
      { title: "Schedule external verification audit", impact: "Meets CSRD requirements", difficulty: "Medium" },
      { title: "Finalize materiality assessment", impact: "Ensure regulatory compliance", difficulty: "Medium" },
    ],
    timeline: "Next milestone: Nov 25 (2 weeks)",
  },
  "3": {
    title: "Optimization Opportunity",
    severity: "low",
    message: "Route C efficiency can be improved by 22% with vehicle routing optimization",
    details: [
      {
        label: "Route C Emissions",
        value: "420 kg CO₂e per cycle",
        subtext: "Suburban delivery network",
      },
      {
        label: "Optimization Potential",
        value: "22% reduction possible",
        subtext: "92 kg CO₂e savings per cycle",
      },
      {
        label: "Estimated Annual Impact",
        value: "~34 tonnes CO₂e",
        subtext: "With 3 cycles per week",
      },
      {
        label: "Implementation Cost",
        value: "~$12,000",
        subtext: "Route optimization software + training",
      },
    ],
    actionItems: [
      { title: "Deploy AI route optimization", impact: "22% efficiency gain", difficulty: "Low" },
      { title: "Test on pilot routes", impact: "Validate savings potential", difficulty: "Low" },
      { title: "Train drivers on new routes", impact: "Ensure smooth implementation", difficulty: "Medium" },
    ],
    timeline: "Can be implemented within 2-3 weeks",
  },
  "4": {
    title: "Fines Avoided",
    severity: "low",
    message: "Your EV fleet investments saved you $3,240 in compliance fines",
    details: [
      {
        label: "EV Fleet Size",
        value: "24 vehicles",
        subtext: "Solar & battery-powered",
      },
      {
        label: "Emissions Reduction",
        value: "450 tonnes CO₂e avoided",
        subtext: "Compared to diesel equivalent",
      },
      {
        label: "Fines Saved",
        value: "$3,240",
        subtext: "Based on $7.20 per tonne CO₂e",
      },
      {
        label: "Investment ROI",
        value: "18 months",
        subtext: "Based on compliance savings",
      },
    ],
    actionItems: [
      { title: "Expand EV fleet further", impact: "Additional $2,500 in savings", difficulty: "Medium" },
      { title: "Explore solar charging infrastructure", impact: "Reduce operational costs 35%", difficulty: "High" },
      { title: "Document success for reporting", impact: "Strengthen ESG credentials", difficulty: "Low" },
    ],
    timeline: "Ongoing opportunity",
  },
}

export default function AlertDetails({ alertId, onBack }: AlertDetailViewProps) {
  const alert = alertDetails[alertId]

  if (!alert) {
    return (
      <div className="text-center py-12">
        <p className="text-slate-500">Alert not found</p>
      </div>
    )
  }

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

  const config = severityConfig[alert.severity as keyof typeof severityConfig]

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <Button variant="ghost" size="sm" onClick={onBack} className="mb-4 gap-2">
          <ArrowLeft className="w-4 h-4" />
          Back to Alerts
        </Button>
        <div className={`rounded-lg p-6 border ${config.bg} ${config.border}`}>
          <div className="flex items-start gap-4">
            <div className={config.icon}>
              {alert.severity === "high" && <AlertCircle className="w-8 h-8" />}
              {alert.severity === "medium" && <Clock className="w-8 h-8" />}
              {alert.severity === "low" && <CheckCircle className="w-8 h-8" />}
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-2">
                <h1 className={`text-2xl font-bold ${config.title}`}>{alert.title}</h1>
                <span className={`text-xs font-semibold px-3 py-1 rounded-full ${config.badge}`}>
                  {alert.severity.charAt(0).toUpperCase() + alert.severity.slice(1)}
                </span>
              </div>
              <p className="text-slate-600 dark:text-slate-300">{alert.message}</p>
              <p className="text-sm text-slate-500 dark:text-slate-400 mt-2">{alert.timeline}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Details Grid */}
      <div>
        <h2 className="text-lg font-semibold text-slate-900 dark:text-white mb-4">Alert Details</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {alert.details.map((detail: any, idx: number) => (
            <Card key={idx} className="p-4">
              <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wide">
                {detail.label}
              </p>
              <p className="text-2xl font-bold text-slate-900 dark:text-white mt-1">{detail.value}</p>
              <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">{detail.subtext}</p>
            </Card>
          ))}
        </div>
      </div>

      {/* Action Items */}
      <div>
        <h2 className="text-lg font-semibold text-slate-900 dark:text-white mb-4">Recommended Actions</h2>
        <div className="space-y-3">
          {alert.actionItems.map((action: any, idx: number) => (
            <Card key={idx} className="p-4 hover:shadow-md transition-shadow">
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1">
                  <h3 className="font-semibold text-slate-900 dark:text-white">{action.title}</h3>
                  <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">{action.impact}</p>
                  <div className="mt-2 flex items-center gap-2">
                    <span className="text-xs font-semibold text-slate-600 dark:text-slate-400">
                      Difficulty:{" "}
                      <span
                        className={
                          action.difficulty === "Low"
                            ? "text-green-600 dark:text-green-400"
                            : action.difficulty === "Medium"
                              ? "text-amber-600 dark:text-amber-400"
                              : "text-red-600 dark:text-red-400"
                        }
                      >
                        {action.difficulty}
                      </span>
                    </span>
                  </div>
                </div>
                <Button className="bg-blue-600 hover:bg-blue-700 text-white">Take Action</Button>
              </div>
            </Card>
          ))}
        </div>
      </div>

      {/* Related Links */}
      <Card className="p-6 bg-slate-50 dark:bg-slate-900">
        <h2 className="text-lg font-semibold text-slate-900 dark:text-white mb-4">Related Information</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {alertId === "1" && (
            <>
              <Button variant="outline" className="justify-start gap-2 bg-transparent">
                <Truck className="w-4 h-4" />
                View Fleet Management Dashboard
              </Button>
              <Button variant="outline" className="justify-start gap-2 bg-transparent">
                <BarChart3 className="w-4 h-4" />
                View Scope 1 Emissions Breakdown
              </Button>
              <Button variant="outline" className="justify-start gap-2 bg-transparent">
                <MapPin className="w-4 h-4" />
                Route Optimization Recommendations
              </Button>
              <Button variant="outline" className="justify-start gap-2 bg-transparent">
                <TrendingUp className="w-4 h-4" />
                View EV Fleet Benefits
              </Button>
            </>
          )}
          {alertId === "2" && (
            <>
              <Button variant="outline" className="justify-start gap-2 bg-transparent">
                <BarChart3 className="w-4 h-4" />
                View CSRD Compliance Progress
              </Button>
              <Button variant="outline" className="justify-start gap-2 bg-transparent">
                <BarChart3 className="w-4 h-4" />
                Access Scope 1 & 2 Data
              </Button>
              <Button variant="outline" className="justify-start gap-2 bg-transparent">
                <CheckCircle className="w-4 h-4" />
                Schedule Verification Audit
              </Button>
              <Button variant="outline" className="justify-start gap-2 bg-transparent">
                <AlertCircle className="w-4 h-4" />
                View Materiality Assessment
              </Button>
            </>
          )}
          {alertId === "3" && (
            <>
              <Button variant="outline" className="justify-start gap-2 bg-transparent">
                <MapPin className="w-4 h-4" />
                View Route C Details
              </Button>
              <Button variant="outline" className="justify-start gap-2 bg-transparent">
                <TrendingUp className="w-4 h-4" />
                View Optimization Savings Potential
              </Button>
              <Button variant="outline" className="justify-start gap-2 bg-transparent">
                <BarChart3 className="w-4 h-4" />
                Compare Routes Performance
              </Button>
              <Button variant="outline" className="justify-start gap-2 bg-transparent">
                <Truck className="w-4 h-4" />
                Deployment Timeline
              </Button>
            </>
          )}
          {alertId === "4" && (
            <>
              <Button variant="outline" className="justify-start gap-2 bg-transparent">
                <Truck className="w-4 h-4" />
                View EV Fleet Performance
              </Button>
              <Button variant="outline" className="justify-start gap-2 bg-transparent">
                <TrendingUp className="w-4 h-4" />
                View Savings Report
              </Button>
              <Button variant="outline" className="justify-start gap-2 bg-transparent">
                <BarChart3 className="w-4 h-4" />
                View ROI Analysis
              </Button>
              <Button variant="outline" className="justify-start gap-2 bg-transparent">
                <CheckCircle className="w-4 h-4" />
                Expansion Plan Options
              </Button>
            </>
          )}
        </div>
      </Card>
    </div>
  )
}
