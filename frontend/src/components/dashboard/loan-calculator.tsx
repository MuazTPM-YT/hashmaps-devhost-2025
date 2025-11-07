"use client"

import { useState, useMemo } from "react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Slider } from "@/components/ui/slider"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts"
import { TrendingDown, TrendingUp, DollarSign } from "lucide-react"

interface CarbonEmissionProfile {
  type: string
  gasType: string
  baselineEmissions: number
  gwpMultiplier: number
  description: string
}

// Carbon emission profiles based on GHG type
const carbonProfiles: CarbonEmissionProfile[] = [
  {
    type: "Low",
    gasType: "CO₂",
    baselineEmissions: 500,
    gwpMultiplier: 1.0,
    description: "Low emissions - CO₂ only",
  },
  {
    type: "Medium-Low",
    gasType: "CO₂ + N₂O",
    baselineEmissions: 1500,
    gwpMultiplier: 1.25,
    description: "Moderate emissions with nitrous oxide",
  },
  {
    type: "Medium",
    gasType: "CO₂ + CH₄ + N₂O",
    baselineEmissions: 3000,
    gwpMultiplier: 1.5,
    description: "Mixed greenhouse gases (methane & nitrous oxide)",
  },
  {
    type: "High",
    gasType: "CH₄ Heavy",
    baselineEmissions: 5000,
    gwpMultiplier: 2.0,
    description: "High methane emissions (28x warming potential)",
  },
  {
    type: "Very High",
    gasType: "Multiple with F-gases",
    baselineEmissions: 8000,
    gwpMultiplier: 3.0,
    description: "Includes fluorinated gases (very high GWP)",
  },
]

// Interest rate model based on carbon profile
const getInterestRateAdjustment = (
  profile: CarbonEmissionProfile,
  actualEmissions: number,
): { baseRate: number; adjustment: number; finalRate: number } => {
  const emissionRatio = actualEmissions / profile.baselineEmissions

  // Base market rate
  const baseRate = 5.5

  // Calculate adjustment based on emission ratio and GWP multiplier
  // Higher emissions and higher GWP multiplier = higher rates
  // Lower emissions = rate reduction
  let adjustment = 0

  if (emissionRatio < 0.5) {
    adjustment = -2.0 // 200 basis points reduction for excellent emissions
  } else if (emissionRatio < 0.75) {
    adjustment = -1.5 // 150 basis points reduction
  } else if (emissionRatio < 1.0) {
    adjustment = -1.0 // 100 basis points reduction
  } else if (emissionRatio < 1.25) {
    adjustment = 0.5 // 50 basis points increase
  } else if (emissionRatio < 1.5) {
    adjustment = 1.5 // 150 basis points increase
  } else if (emissionRatio < 2.0) {
    adjustment = 2.5 // 250 basis points increase
  } else {
    adjustment = 4.0 // 400 basis points increase for very high emissions
  }

  // Additional adjustment for GWP multiplier (dangerous gases)
  adjustment += (profile.gwpMultiplier - 1.0) * 1.5

  const finalRate = Math.max(0.5, baseRate + adjustment) // Minimum 0.5%

  return { baseRate, adjustment, finalRate }
}

export default function LoanCalculator() {
  const [loanAmount, setLoanAmount] = useState<number>(100000)
  const [loanTerm, setLoanTerm] = useState<number>(60)
  const [carbonProfile, setCarbonProfile] = useState<CarbonEmissionProfile>(carbonProfiles[2]) // Default to Medium
  const [actualEmissions, setActualEmissions] = useState<number>(carbonProfile.baselineEmissions)

  const rates = useMemo(
    () => getInterestRateAdjustment(carbonProfile, actualEmissions),
    [carbonProfile, actualEmissions],
  )

  // Calculate loan details
  const monthlyRate = rates.finalRate / 100 / 12
  const monthlyPayment =
    (loanAmount * monthlyRate * Math.pow(1 + monthlyRate, loanTerm)) / (Math.pow(1 + monthlyRate, loanTerm) - 1)
  const totalPayment = monthlyPayment * loanTerm
  const totalInterest = totalPayment - loanAmount

  // Generate amortization schedule for chart
  const scheduleData = []
  let remainingBalance = loanAmount
  for (let i = 1; i <= Math.min(loanTerm, 60); i++) {
    const interestPayment = remainingBalance * monthlyRate
    const principalPayment = monthlyPayment - interestPayment
    remainingBalance -= principalPayment
    scheduleData.push({
      month: i,
      balance: Math.max(0, remainingBalance),
      interest: interestPayment,
      principal: principalPayment,
    })
  }

  const emissionRatio = actualEmissions / carbonProfile.baselineEmissions

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Calculator Card */}
        <Card className="lg:col-span-2 p-6 space-y-6">
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-slate-900 dark:text-white">Carbon-Linked Loan Calculator</h3>
            <p className="text-sm text-slate-600 dark:text-slate-400">
              Interest rates are adjusted based on your carbon emissions profile. Lower emissions reduce rates; higher
              emissions increase rates.
            </p>
          </div>

          {/* Input Fields */}
          <div className="space-y-4">
            {/* Loan Amount */}
            <div>
              <label className="text-sm font-medium text-slate-900 dark:text-white">
                Loan Amount: ${loanAmount.toLocaleString()}
              </label>
              <Slider
                value={[loanAmount]}
                onValueChange={(val) => setLoanAmount(val[0])}
                min={10000}
                max={500000}
                step={5000}
                className="mt-2"
              />
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">$10,000 - $500,000</p>
            </div>

            {/* Loan Term */}
            <div>
              <label className="text-sm font-medium text-slate-900 dark:text-white">
                Loan Term: {loanTerm} months ({(loanTerm / 12).toFixed(1)} years)
              </label>
              <Slider
                value={[loanTerm]}
                onValueChange={(val) => setLoanTerm(val[0])}
                min={12}
                max={360}
                step={12}
                className="mt-2"
              />
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">1 - 30 years</p>
            </div>

            {/* Carbon Profile Selection */}
            <div>
              <label className="text-sm font-medium text-slate-900 dark:text-white">Carbon Emission Profile</label>
              <Select
                value={carbonProfile.type}
                onValueChange={(val) => {
                  const profile = carbonProfiles.find((p) => p.type === val)
                  if (profile) {
                    setCarbonProfile(profile)
                    setActualEmissions(profile.baselineEmissions)
                  }
                }}
              >
                <SelectTrigger className="mt-2">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {carbonProfiles.map((profile) => (
                    <SelectItem key={profile.type} value={profile.type}>
                      {profile.type} - {profile.gasType} (GWP: {profile.gwpMultiplier}x)
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-2">{carbonProfile.description}</p>
            </div>

            {/* Actual Emissions */}
            <div>
              <label className="text-sm font-medium text-slate-900 dark:text-white">
                Actual Emissions: {actualEmissions.toLocaleString()} tonnes CO₂e
              </label>
              <Slider
                value={[actualEmissions]}
                onValueChange={(val) => setActualEmissions(val[0])}
                min={carbonProfile.baselineEmissions * 0.3}
                max={carbonProfile.baselineEmissions * 2.5}
                step={100}
                className="mt-2"
              />
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                Baseline: {carbonProfile.baselineEmissions.toLocaleString()} tonnes CO₂e
              </p>
            </div>
          </div>

          {/* Interest Rate Breakdown */}
          <div className="bg-slate-50 dark:bg-slate-900 rounded-lg p-4 space-y-2">
            <h4 className="font-semibold text-slate-900 dark:text-white">Interest Rate Calculation</h4>
            <div className="space-y-1 text-sm">
              <div className="flex justify-between text-slate-600 dark:text-slate-400">
                <span>Base Market Rate:</span>
                <span>{rates.baseRate.toFixed(2)}%</span>
              </div>
              <div className="flex justify-between text-slate-600 dark:text-slate-400">
                <span>Carbon Adjustment:</span>
                <span
                  className={
                    rates.adjustment < 0 ? "text-green-600 dark:text-green-400" : "text-red-600 dark:text-red-400"
                  }
                >
                  {rates.adjustment > 0 ? "+" : ""}
                  {rates.adjustment.toFixed(2)}%
                </span>
              </div>
              <div className="border-t border-slate-200 dark:border-slate-700 pt-1 mt-1 flex justify-between font-semibold text-slate-900 dark:text-white">
                <span>Final Interest Rate:</span>
                <span>{rates.finalRate.toFixed(2)}%</span>
              </div>
            </div>
          </div>
        </Card>

        {/* Summary Card */}
        <Card className="p-6 space-y-4">
          <h3 className="text-lg font-semibold text-slate-900 dark:text-white">Loan Summary</h3>

          {/* Emission Ratio Indicator */}
          <div
            className={`rounded-lg p-4 ${
              emissionRatio < 0.75
                ? "bg-green-50 dark:bg-green-950"
                : emissionRatio < 1.0
                  ? "bg-blue-50 dark:bg-blue-950"
                  : emissionRatio < 1.5
                    ? "bg-amber-50 dark:bg-amber-950"
                    : "bg-red-50 dark:bg-red-950"
            }`}
          >
            <div className="flex items-center gap-2 mb-2">
              {emissionRatio < 1.0 ? (
                <TrendingDown className="w-5 h-5 text-green-600" />
              ) : (
                <TrendingUp className="w-5 h-5 text-red-600" />
              )}
              <span className="font-semibold text-slate-900 dark:text-white">
                Emission Ratio: {emissionRatio.toFixed(2)}x
              </span>
            </div>
            <p className="text-xs text-slate-600 dark:text-slate-400">
              {emissionRatio < 0.75
                ? "✓ Excellent - Well below baseline"
                : emissionRatio < 1.0
                  ? "✓ Good - Below baseline"
                  : emissionRatio < 1.5
                    ? "⚠ At risk - Above baseline"
                    : "✗ Critical - Significantly over baseline"}
            </p>
          </div>

          <div className="space-y-3 text-sm">
            <div className="flex justify-between">
              <span className="text-slate-600 dark:text-slate-400">Monthly Payment</span>
              <span className="font-semibold text-slate-900 dark:text-white">${monthlyPayment.toFixed(2)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-600 dark:text-slate-400">Total Payment</span>
              <span className="font-semibold text-slate-900 dark:text-white">
                ${totalPayment.toLocaleString("en-US", { maximumFractionDigits: 0 })}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-600 dark:text-slate-400">Total Interest</span>
              <span className="font-semibold text-red-600 dark:text-red-400">
                ${totalInterest.toLocaleString("en-US", { maximumFractionDigits: 0 })}
              </span>
            </div>

            {rates.adjustment < 0 && (
              <div className="border-t border-slate-200 dark:border-slate-700 pt-3 bg-green-50 dark:bg-green-950/30 p-3 rounded">
                <p className="text-xs font-semibold text-green-700 dark:text-green-300">
                  Savings vs Market Rate: $
                  {(((5.5 - rates.finalRate) / 5.5) * totalInterest).toLocaleString("en-US", {
                    maximumFractionDigits: 0,
                  })}
                </p>
              </div>
            )}
          </div>

          <Button className="w-full bg-blue-600 hover:bg-blue-700 mt-4">
            <DollarSign className="w-4 h-4 mr-2" />
            Apply for Loan
          </Button>
        </Card>
      </div>

      {/* Amortization Chart */}
      <Card className="p-6">
        <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-4">Loan Balance Over Time</h3>
        <div className="h-80">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={scheduleData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" />
              <YAxis />
              <Tooltip formatter={(value) => `$${value.toLocaleString("en-US", { maximumFractionDigits: 0 })}`} />
              <Legend />
              <Line type="monotone" dataKey="balance" stroke="#ef4444" name="Remaining Balance" />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </Card>

      {/* Educational Note */}
      <Card className="p-4 bg-blue-50 dark:bg-blue-950 border-blue-200 dark:border-blue-800">
        <p className="text-sm text-slate-700 dark:text-slate-300">
          <span className="font-semibold">How it works:</span> This carbon-linked loan model incentivizes
          sustainability. Companies with lower emissions benefit from reduced interest rates, while those with higher
          emissions or more harmful greenhouse gases pay higher rates. The interest rate adjustment is based on emission
          levels relative to baseline and the Global Warming Potential (GWP) multiplier of gases involved.
        </p>
      </Card>
    </div>
  )
}
