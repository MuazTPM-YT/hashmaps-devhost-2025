"use client"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { ArrowLeft, AlertCircle, TrendingUp, CheckCircle, Clock, BarChart3, MapPin, Truck, X } from "lucide-react"
import { useState } from "react"

interface AlertDetailViewProps {
  alertId: string
  onBack: () => void
}

interface ActionItem {
  title: string
  impact: string
  difficulty: string
  id?: string
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
      {
        id: "1-1",
        title: "Switch 3 routes to EV battery",
        impact: "Reduce 450 tonnes CO₂e/quarter",
        difficulty: "Medium",
      },
      {
        id: "1-2",
        title: "Implement hybrid fleet strategy",
        impact: "Reduce 300 tonnes CO₂e/quarter",
        difficulty: "High",
      },
      { id: "1-3", title: "Optimize route efficiency", impact: "Reduce 120 tonnes CO₂e/quarter", difficulty: "Low" },
    ],
    timeline: "38 days to next compliance period",
    actionDescriptions: {
      "1-1": {
        description:
          "Convert 3 high-emission routes from diesel to battery electric vehicles. This involves purchasing 3 new EV units and setting up charging infrastructure.",
        steps: [
          "Identify 3 highest-emitting routes currently using diesel",
          "Assess charging infrastructure requirements",
          "Submit EV procurement request",
          "Schedule charging station installation",
          "Plan vehicle transition and driver training",
        ],
        estimatedTimeline: "8-12 weeks",
        budget: "$120,000 - $180,000",
      },
      "1-2": {
        description:
          "Transition fleet to hybrid vehicles gradually. This reduces emissions while maintaining operational flexibility.",
        steps: [
          "Evaluate hybrid vehicle options matching current fleet specs",
          "Plan phased replacement schedule",
          "Configure maintenance protocols for hybrid systems",
          "Train maintenance staff on hybrid technology",
          "Monitor performance metrics",
        ],
        estimatedTimeline: "6-9 months",
        budget: "$200,000 - $400,000",
      },
      "1-3": {
        description: "Implement AI-powered route optimization to reduce fuel consumption without vehicle changes.",
        steps: [
          "Deploy route optimization software",
          "Integrate with GPS and logistics systems",
          "Calibrate algorithm with historical data",
          "Train drivers on new route procedures",
          "Monitor savings over 30 days",
        ],
        estimatedTimeline: "2-3 weeks",
        budget: "$12,000 - $18,000",
      },
    },
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
      { id: "2-1", title: "Complete Scope 3 data collection", impact: "Critical for submission", difficulty: "High" },
      {
        id: "2-2",
        title: "Schedule external verification audit",
        impact: "Meets CSRD requirements",
        difficulty: "Medium",
      },
      {
        id: "2-3",
        title: "Finalize materiality assessment",
        impact: "Ensure regulatory compliance",
        difficulty: "Medium",
      },
    ],
    timeline: "Next milestone: Nov 25 (2 weeks)",
    actionDescriptions: {
      "2-1": {
        description:
          "Gather Scope 3 emissions data from suppliers, customers, and business partners to complete the required GHG accounting.",
        steps: [
          "Send data request to top 50 suppliers",
          "Collect customer usage emissions data",
          "Gather business travel and commute data",
          "Compile supply chain emissions",
          "Validate and consolidate all data",
        ],
        estimatedTimeline: "3-4 weeks",
        budget: "Internal resources + $5,000 consulting",
      },
      "2-2": {
        description: "Engage third-party auditors to verify emissions data and ensure compliance with CSRD standards.",
        steps: [
          "Request audit proposals from 3 certified firms",
          "Review and select audit firm",
          "Schedule audit dates",
          "Provide data and documentation",
          "Address audit findings",
        ],
        estimatedTimeline: "4-6 weeks",
        budget: "$15,000 - $25,000",
      },
      "2-3": {
        description:
          "Complete the double materiality assessment identifying financially and impact-material ESG topics.",
        steps: [
          "Conduct stakeholder engagement interviews",
          "Analyze financial impact of ESG issues",
          "Assess impact on environment and society",
          "Map against CSRD requirements",
          "Document and approve assessment",
        ],
        estimatedTimeline: "2-3 weeks",
        budget: "$8,000 - $12,000",
      },
    },
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
      { id: "3-1", title: "Deploy AI route optimization", impact: "22% efficiency gain", difficulty: "Low" },
      { id: "3-2", title: "Test on pilot routes", impact: "Validate savings potential", difficulty: "Low" },
      { id: "3-3", title: "Train drivers on new routes", impact: "Ensure smooth implementation", difficulty: "Medium" },
    ],
    timeline: "Can be implemented within 2-3 weeks",
    actionDescriptions: {
      "3-1": {
        description:
          "Install and configure AI-powered vehicle routing optimization software to reduce distance and fuel consumption.",
        steps: [
          "Purchase route optimization software license",
          "Install software on fleet management system",
          "Input current route data and parameters",
          "Configure delivery constraints and preferences",
          "Launch optimization algorithm",
        ],
        estimatedTimeline: "1 week",
        budget: "$12,000 - $15,000",
      },
      "3-2": {
        description: "Run a pilot test on Route C to validate savings projections before full deployment.",
        steps: [
          "Generate optimized route plan for Route C",
          "Run pilot for 2 weeks with current driver",
          "Collect emissions and efficiency data",
          "Compare against baseline performance",
          "Calculate actual ROI and savings",
        ],
        estimatedTimeline: "2-3 weeks",
        budget: "Internal resources only",
      },
      "3-3": {
        description: "Provide training to drivers on how to follow optimized routes and use the new system.",
        steps: [
          "Conduct group training session",
          "Distribute route optimization guides",
          "Set up in-vehicle navigation integration",
          "Provide ongoing support resources",
          "Monitor initial implementation",
        ],
        estimatedTimeline: "3-5 days",
        budget: "$2,000 - $3,000",
      },
    },
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
      { id: "4-1", title: "Expand EV fleet further", impact: "Additional $2,500 in savings", difficulty: "Medium" },
      {
        id: "4-2",
        title: "Explore solar charging infrastructure",
        impact: "Reduce operational costs 35%",
        difficulty: "High",
      },
      { id: "4-3", title: "Document success for reporting", impact: "Strengthen ESG credentials", difficulty: "Low" },
    ],
    timeline: "Ongoing opportunity",
    actionDescriptions: {
      "4-1": {
        description:
          "Add 10-15 more EV units to expand the fleet and increase emissions savings and compliance benefits.",
        steps: [
          "Evaluate market EV options for fleet requirements",
          "Calculate ROI for additional vehicles",
          "Identify best procurement channels",
          "Arrange financing or leasing options",
          "Plan delivery and integration timeline",
        ],
        estimatedTimeline: "8-12 weeks",
        budget: "$300,000 - $450,000",
      },
      "4-2": {
        description:
          "Install solar charging infrastructure to power EV fleet sustainably and reduce grid electricity costs.",
        steps: [
          "Assess available space for solar installation",
          "Conduct solar potential analysis",
          "Get quotes from solar installation firms",
          "Plan battery storage capacity",
          "Install and commission system",
        ],
        estimatedTimeline: "12-16 weeks",
        budget: "$150,000 - $250,000",
      },
      "4-3": {
        description: "Create comprehensive case study and ESG reporting materials highlighting EV investment success.",
        steps: [
          "Compile emissions reduction data",
          "Calculate financial and environmental ROI",
          "Gather stakeholder testimonials",
          "Create case study document and visuals",
          "Publish in ESG report and marketing materials",
        ],
        estimatedTimeline: "2-3 weeks",
        budget: "$3,000 - $5,000",
      },
    },
  },
}

export default function AlertDetails({ alertId, onBack }: AlertDetailViewProps) {
  const [selectedAction, setSelectedAction] = useState<ActionItem | null>(null)
  const [completedActions, setCompletedActions] = useState<string[]>([])
  const [navigationTarget, setNavigationTarget] = useState<string | null>(null)

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

  const handleTakeAction = (action: ActionItem) => {
    setSelectedAction(action)
  }

  const handleCompleteAction = (actionId: string) => {
    if (!completedActions.includes(actionId)) {
      setCompletedActions([...completedActions, actionId])
    }
    setSelectedAction(null)
  }

  const handleNavigate = (target: string) => {
    setNavigationTarget(target)
    console.log("[v0] Navigating to:", target)
  }

  const config = severityConfig[alert.severity as keyof typeof severityConfig]

  if (selectedAction && selectedAction.id) {
    const actionDetail = alert.actionDescriptions[selectedAction.id]
    return (
      <div className="fixed inset-0 bg-black/50 dark:bg-black/70 flex items-center justify-center p-4 z-50">
        <Card className="w-full max-w-2xl max-h-[90vh] overflow-y-auto">
          <div className="sticky top-0 flex items-center justify-between p-6 border-b border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900">
            <h3 className="text-xl font-bold text-slate-900 dark:text-white">{selectedAction.title}</h3>
            <button
              onClick={() => setSelectedAction(null)}
              className="text-slate-500 hover:text-slate-700 dark:hover:text-slate-300"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="p-6 space-y-6">
            <div>
              <p className="text-slate-700 dark:text-slate-300 mb-4">{actionDetail.description}</p>
              <div className="flex gap-8 text-sm">
                <div>
                  <span className="font-semibold text-slate-900 dark:text-white">Timeline:</span>
                  <p className="text-slate-600 dark:text-slate-400">{actionDetail.estimatedTimeline}</p>
                </div>
                <div>
                  <span className="font-semibold text-slate-900 dark:text-white">Budget:</span>
                  <p className="text-slate-600 dark:text-slate-400">{actionDetail.budget}</p>
                </div>
              </div>
            </div>

            <div>
              <h4 className="font-semibold text-slate-900 dark:text-white mb-3">Implementation Steps</h4>
              <ol className="space-y-2">
                {actionDetail.steps.map((step: string, idx: number) => (
                  <li key={idx} className="flex gap-3">
                    <span className="flex-shrink-0 w-6 h-6 rounded-full bg-blue-100 dark:bg-blue-900 flex items-center justify-center text-sm font-semibold text-blue-700 dark:text-blue-300">
                      {idx + 1}
                    </span>
                    <span className="text-slate-700 dark:text-slate-300 pt-0.5">{step}</span>
                  </li>
                ))}
              </ol>
            </div>

            <div className="flex gap-3 pt-4 border-t border-slate-200 dark:border-slate-700">
              <Button onClick={() => setSelectedAction(null)} variant="outline">
                Back
              </Button>
              <Button
                onClick={() => handleCompleteAction(selectedAction.id!)}
                className="bg-green-600 hover:bg-green-700 text-white flex-1"
              >
                Mark as Started
              </Button>
            </div>
          </div>
        </Card>
      </div>
    )
  }

  if (navigationTarget) {
    return (
      <div className="space-y-6">
        <Button variant="ghost" size="sm" onClick={() => setNavigationTarget(null)} className="mb-4 gap-2">
          <ArrowLeft className="w-4 h-4" />
          Back
        </Button>
        <Card className="p-12 text-center">
          <BarChart3 className="w-16 h-16 mx-auto text-blue-500 mb-4" />
          <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">
            {navigationTarget === "fleet" && "Fleet Management Dashboard"}
            {navigationTarget === "scope1" && "Scope 1 Emissions"}
            {navigationTarget === "scope2" && "Scope 2 Emissions"}
            {navigationTarget === "csrd" && "CSRD Compliance Status"}
            {navigationTarget === "routes" && "Route Optimization"}
          </h2>
          <p className="text-slate-600 dark:text-slate-400 mb-6">
            This section would show detailed data and controls for the selected area. Click Back to return to the alert
            details.
          </p>
          <Button onClick={() => setNavigationTarget(null)}>Return to Alert Details</Button>
        </Card>
      </div>
    )
  }

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
            <Card
              key={idx}
              className={`p-4 hover:shadow-md transition-all cursor-pointer border-2 ${
                completedActions.includes(action.id)
                  ? "border-green-500 bg-green-50 dark:bg-green-950"
                  : "border-slate-200 dark:border-slate-700"
              }`}
            >
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    {completedActions.includes(action.id) && (
                      <CheckCircle className="w-5 h-5 text-green-600 dark:text-green-400 flex-shrink-0" />
                    )}
                    <h3 className="font-semibold text-slate-900 dark:text-white">{action.title}</h3>
                  </div>
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
                <Button
                  onClick={() => handleTakeAction(action)}
                  className={`bg-blue-600 hover:bg-blue-700 text-white flex-shrink-0 ${
                    completedActions.includes(action.id) ? "opacity-50 cursor-default" : ""
                  }`}
                  disabled={completedActions.includes(action.id)}
                >
                  {completedActions.includes(action.id) ? "Started" : "View Plan"}
                </Button>
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
              <Button
                onClick={() => handleNavigate("fleet")}
                variant="outline"
                className="justify-start gap-2 bg-white dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700"
              >
                <Truck className="w-4 h-4" />
                View Fleet Management
              </Button>
              <Button
                onClick={() => handleNavigate("scope1")}
                variant="outline"
                className="justify-start gap-2 bg-white dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700"
              >
                <BarChart3 className="w-4 h-4" />
                View Scope 1 Emissions
              </Button>
              <Button
                onClick={() => handleNavigate("routes")}
                variant="outline"
                className="justify-start gap-2 bg-white dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700"
              >
                <MapPin className="w-4 h-4" />
                Route Optimization
              </Button>
              <Button
                onClick={() => handleNavigate("fleet")}
                variant="outline"
                className="justify-start gap-2 bg-white dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700"
              >
                <TrendingUp className="w-4 h-4" />
                EV Fleet Benefits
              </Button>
            </>
          )}
          {alertId === "2" && (
            <>
              <Button
                onClick={() => handleNavigate("csrd")}
                variant="outline"
                className="justify-start gap-2 bg-white dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700"
              >
                <BarChart3 className="w-4 h-4" />
                CSRD Compliance Progress
              </Button>
              <Button
                onClick={() => handleNavigate("scope1")}
                variant="outline"
                className="justify-start gap-2 bg-white dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700"
              >
                <BarChart3 className="w-4 h-4" />
                Scope 1 & 2 Data
              </Button>
              <Button
                onClick={() => handleNavigate("csrd")}
                variant="outline"
                className="justify-start gap-2 bg-white dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700"
              >
                <CheckCircle className="w-4 h-4" />
                Verification Audit
              </Button>
              <Button
                onClick={() => handleNavigate("csrd")}
                variant="outline"
                className="justify-start gap-2 bg-white dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700"
              >
                <AlertCircle className="w-4 h-4" />
                Materiality Assessment
              </Button>
            </>
          )}
          {alertId === "3" && (
            <>
              <Button
                onClick={() => handleNavigate("routes")}
                variant="outline"
                className="justify-start gap-2 bg-white dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700"
              >
                <MapPin className="w-4 h-4" />
                Route C Details
              </Button>
              <Button
                onClick={() => handleNavigate("routes")}
                variant="outline"
                className="justify-start gap-2 bg-white dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700"
              >
                <TrendingUp className="w-4 h-4" />
                Optimization Potential
              </Button>
              <Button
                onClick={() => handleNavigate("routes")}
                variant="outline"
                className="justify-start gap-2 bg-white dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700"
              >
                <BarChart3 className="w-4 h-4" />
                Routes Performance
              </Button>
              <Button
                onClick={() => handleNavigate("routes")}
                variant="outline"
                className="justify-start gap-2 bg-white dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700"
              >
                <Truck className="w-4 h-4" />
                Deployment Timeline
              </Button>
            </>
          )}
          {alertId === "4" && (
            <>
              <Button
                onClick={() => handleNavigate("fleet")}
                variant="outline"
                className="justify-start gap-2 bg-white dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700"
              >
                <Truck className="w-4 h-4" />
                EV Fleet Performance
              </Button>
              <Button
                onClick={() => handleNavigate("fleet")}
                variant="outline"
                className="justify-start gap-2 bg-white dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700"
              >
                <TrendingUp className="w-4 h-4" />
                Savings Report
              </Button>
              <Button
                onClick={() => handleNavigate("fleet")}
                variant="outline"
                className="justify-start gap-2 bg-white dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700"
              >
                <BarChart3 className="w-4 h-4" />
                ROI Analysis
              </Button>
              <Button
                onClick={() => handleNavigate("fleet")}
                variant="outline"
                className="justify-start gap-2 bg-white dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700"
              >
                <CheckCircle className="w-4 h-4" />
                Expansion Options
              </Button>
            </>
          )}
        </div>
      </Card>
    </div>
  )
}
