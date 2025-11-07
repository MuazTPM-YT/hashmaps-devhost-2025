"use client"

import { useState, useEffect } from "react"
import MetricCards from "./metric-cards"
import EmissionsByEnergyType from "./emissions-chart"
import TopEmittingRoutes from "./top-routes-chart"
import TrendChart from "./trend-chart"
import AIInsightsPanel from "./ai-insights"
import DataUploadSection from "./data-upload"
import AlertsSection from "./alerts-section"
import ActivityLogPanel from "./activity-log-panel"
import ScopeEmissions from "./scope-emissions"
import LoanCalculator from "./loan-calculator"

export default function Dashboard() {
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    // Simulate data loading
    const timer = setTimeout(() => setIsLoading(false), 500)
    return () => clearTimeout(timer)
  }, [])

  return (
    <main className="min-h-screen bg-gradient-to-b from-slate-50 to-slate-100 dark:from-slate-950 dark:to-slate-900">
      {/* Header */}
      <div className="sticky top-0 z-40 bg-white/80 dark:bg-slate-900/80 backdrop-blur-sm border-b border-slate-200 dark:border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-slate-900 dark:text-white">ESG Dashboard</h1>
              <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
                AI-powered carbon compliance & sustainability insights
              </p>
            </div>
            <div className="flex items-center gap-4">
              {/* Activity Log button to header */}
              <ActivityLogPanel />
              <div className="hidden md:flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-green-500 animate-pulse"></div>
                <span className="text-sm font-medium text-slate-600 dark:text-slate-300">Live</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {!isLoading && (
          <div className="space-y-8">
            {/* Section 1: ESG Overview Dashboard */}
            <section className="space-y-6">
              <div className="space-y-2">
                <h2 className="text-2xl font-bold text-slate-900 dark:text-white">ESG Overview</h2>
                <p className="text-slate-600 dark:text-slate-400">
                  Real-time sustainability metrics and compliance data
                </p>
              </div>

              {/* Metric Cards */}
              <MetricCards />

              {/* Charts Grid */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <EmissionsByEnergyType />
                <TopEmittingRoutes />
              </div>

              {/* Trend Chart */}
              <div className="grid grid-cols-1">
                <TrendChart />
              </div>

              {/* AI Insights */}
              <AIInsightsPanel />
            </section>

            {/* Section 2: Data Upload & Automation */}
            <section className="space-y-6">
              <div className="space-y-2">
                <h2 className="text-2xl font-bold text-slate-900 dark:text-white">Data & Automation</h2>
                <p className="text-slate-600 dark:text-slate-400">Upload ESG data and generate compliance reports</p>
              </div>
              <DataUploadSection />
            </section>

            {/* Section 3: Predictive Alerts */}
            <section className="space-y-6">
              <div className="space-y-2">
                <h2 className="text-2xl font-bold text-slate-900 dark:text-white">Alerts & Risk Management</h2>
                <p className="text-slate-600 dark:text-slate-400">
                  Upcoming compliance deadlines and predictive alerts
                </p>
              </div>
              <AlertsSection />
            </section>

            {/* Section 4: Scope 1 & 2 Emissions */}
            <section className="space-y-6">
              <div className="space-y-2">
                <h2 className="text-2xl font-bold text-slate-900 dark:text-white">
                  Scope 1 & 2 Carbon Emissions (CSRD)
                </h2>
                <p className="text-slate-600 dark:text-slate-400">
                  EU Corporate Sustainability Reporting Directive & Taxonomy-aligned emissions data
                </p>
              </div>
              <ScopeEmissions />
            </section>

            {/* Section 5: Carbon-Linked Loan Calculator */}
            <section className="space-y-6">
              <div className="space-y-2">
                <h2 className="text-2xl font-bold text-slate-900 dark:text-white">Carbon-Linked Loan Calculator</h2>
                <p className="text-slate-600 dark:text-slate-400">
                  Interest rates adjusted based on emissions profile and greenhouse gas types
                </p>
              </div>
              <LoanCalculator />
            </section>
          </div>
        )}

        {isLoading && (
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-500"></div>
          </div>
        )}
      </div>
    </main>
  )
}
