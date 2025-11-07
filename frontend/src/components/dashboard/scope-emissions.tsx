"use client"

import { Card } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from "recharts"
import { Activity, Truck, Zap } from "lucide-react"

// Scope 1: Direct Emissions from Owned/Controlled Sources
const scope1Data = {
  totalEmissions: 8450,
  unit: "tonnes CO2e",
  sources: [
    { name: "Fleet Vehicles (Diesel)", value: 3200, percentage: 37.9, description: "Company-owned delivery trucks" },
    { name: "Fleet Vehicles (Petrol)", value: 1850, percentage: 21.9, description: "Company cars and vans" },
    { name: "Fleet Vehicles (CNG)", value: 980, percentage: 11.6, description: "Natural gas vehicles" },
    { name: "Heating Oil", value: 1420, percentage: 16.8, description: "Building heating systems" },
    { name: "Refrigeration", value: 1000, percentage: 11.8, description: "Cold chain & storage facilities" },
  ],
  trend: [
    { month: "Jan", emissions: 720, target: 650 },
    { month: "Feb", emissions: 710, target: 645 },
    { month: "Mar", emissions: 705, target: 640 },
    { month: "Apr", emissions: 695, target: 635 },
    { month: "May", emissions: 680, target: 630 },
    { month: "Jun", emissions: 670, target: 625 },
  ],
}

// Scope 2: Indirect Emissions from Energy Consumption
const scope2Data = {
  totalEmissions: 3200,
  unit: "tonnes CO2e",
  sources: [
    { name: "Grid Electricity", value: 2100, percentage: 65.6, description: "Purchased grid electricity" },
    { name: "District Heating", value: 680, percentage: 21.3, description: "District heating systems" },
    { name: "District Cooling", value: 420, percentage: 13.1, description: "District cooling services" },
  ],
  gridMix: [
    { name: "Coal", value: 35, color: "#4b5563" },
    { name: "Natural Gas", value: 28, color: "#f59e0b" },
    { name: "Nuclear", value: 18, color: "#0ea5e9" },
    { name: "Renewable", value: 19, color: "#10b981" },
  ],
  trend: [
    { month: "Jan", emissions: 285, target: 280 },
    { month: "Feb", emissions: 280, target: 278 },
    { month: "Mar", emissions: 275, target: 275 },
    { month: "Apr", emissions: 270, target: 272 },
    { month: "May", emissions: 265, target: 270 },
    { month: "Jun", emissions: 260, target: 268 },
  ],
}

export default function ScopeEmissions() {
  return (
    <div className="space-y-6">
      {/* Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="p-4 border-l-4 border-red-500">
          <div className="space-y-1">
            <p className="text-sm text-slate-600 dark:text-slate-400">Scope 1 Emissions</p>
            <p className="text-3xl font-bold text-slate-900 dark:text-white">
              {scope1Data.totalEmissions.toLocaleString()}
            </p>
            <p className="text-xs text-slate-500 dark:text-slate-400">{scope1Data.unit}</p>
            <p className="text-xs text-red-600 dark:text-red-400 mt-2">Direct emissions from owned sources</p>
          </div>
        </Card>

        <Card className="p-4 border-l-4 border-orange-500">
          <div className="space-y-1">
            <p className="text-sm text-slate-600 dark:text-slate-400">Scope 2 Emissions</p>
            <p className="text-3xl font-bold text-slate-900 dark:text-white">
              {scope2Data.totalEmissions.toLocaleString()}
            </p>
            <p className="text-xs text-slate-500 dark:text-slate-400">{scope2Data.unit}</p>
            <p className="text-xs text-orange-600 dark:text-orange-400 mt-2">Indirect energy-related emissions</p>
          </div>
        </Card>

        <Card className="p-4 border-l-4 border-purple-500">
          <div className="space-y-1">
            <p className="text-sm text-slate-600 dark:text-slate-400">Total Scope 1+2</p>
            <p className="text-3xl font-bold text-slate-900 dark:text-white">
              {(scope1Data.totalEmissions + scope2Data.totalEmissions).toLocaleString()}
            </p>
            <p className="text-xs text-slate-500 dark:text-slate-400">{scope1Data.unit}</p>
            <p className="text-xs text-purple-600 dark:text-purple-400 mt-2">CSRD Reporting Category</p>
          </div>
        </Card>
      </div>

      {/* Detailed Breakdown */}
      <Tabs defaultValue="scope1" className="space-y-4">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="scope1" className="gap-2">
            <Truck className="w-4 h-4" />
            <span className="hidden sm:inline">Scope 1</span>
            <span className="inline sm:hidden">Direct</span>
          </TabsTrigger>
          <TabsTrigger value="scope2" className="gap-2">
            <Zap className="w-4 h-4" />
            <span className="hidden sm:inline">Scope 2</span>
            <span className="inline sm:hidden">Indirect</span>
          </TabsTrigger>
        </TabsList>

        {/* Scope 1 Tab */}
        <TabsContent value="scope1" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Scope 1 Breakdown */}
            <Card className="p-6">
              <h3 className="font-semibold text-slate-900 dark:text-white mb-4">
                Scope 1 Emission Sources (CSRD Art. 8)
              </h3>
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={scope1Data.sources}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ name, percentage }) => `${name.split("(")[0]}: ${percentage}%`}
                      outerRadius={120}
                      dataKey="value"
                    >
                      {scope1Data.sources.map((entry, index) => (
                        <Cell
                          key={`cell-${index}`}
                          fill={["#ef4444", "#dc2626", "#f59e0b", "#3b82f6", "#8b5cf6"][index]}
                        />
                      ))}
                    </Pie>
                    <Tooltip formatter={(value) => `${value.toLocaleString()} tonnes CO2e`} />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </Card>

            {/* Scope 1 Trend */}
            <Card className="p-6">
              <h3 className="font-semibold text-slate-900 dark:text-white mb-4">Monthly Scope 1 Trend</h3>
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={scope1Data.trend}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="month" />
                    <YAxis />
                    <Tooltip formatter={(value) => `${value} tonnes CO2e`} />
                    <Legend />
                    <Bar dataKey="emissions" fill="#ef4444" name="Actual Emissions" />
                    <Bar dataKey="target" fill="#10b981" name="Target" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </Card>
          </div>

          {/* Scope 1 Detailed Table */}
          <Card className="p-6">
            <h3 className="font-semibold text-slate-900 dark:text-white mb-4">Scope 1 Detailed Breakdown</h3>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-slate-200 dark:border-slate-700">
                    <th className="text-left py-3 px-4 font-semibold text-slate-900 dark:text-white">
                      Emission Source
                    </th>
                    <th className="text-right py-3 px-4 font-semibold text-slate-900 dark:text-white">Tonnes CO₂e</th>
                    <th className="text-right py-3 px-4 font-semibold text-slate-900 dark:text-white">% of Scope 1</th>
                    <th className="text-left py-3 px-4 font-semibold text-slate-900 dark:text-white">
                      Description (CSRD)
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {scope1Data.sources.map((source, idx) => (
                    <tr
                      key={idx}
                      className="border-b border-slate-100 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-900/50"
                    >
                      <td className="py-3 px-4 text-slate-900 dark:text-white font-medium">{source.name}</td>
                      <td className="py-3 px-4 text-right text-slate-600 dark:text-slate-400">
                        {source.value.toLocaleString()}
                      </td>
                      <td className="py-3 px-4 text-right text-slate-600 dark:text-slate-400">
                        {source.percentage.toFixed(1)}%
                      </td>
                      <td className="py-3 px-4 text-slate-500 dark:text-slate-400">{source.description}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>
        </TabsContent>

        {/* Scope 2 Tab */}
        <TabsContent value="scope2" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Scope 2 Sources */}
            <Card className="p-6">
              <h3 className="font-semibold text-slate-900 dark:text-white mb-4">
                Scope 2 Energy Sources (CSRD Art. 8)
              </h3>
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={scope2Data.sources}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ name, percentage }) => `${name}: ${percentage}%`}
                      outerRadius={120}
                      dataKey="value"
                    >
                      {scope2Data.sources.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={["#3b82f6", "#f59e0b", "#8b5cf6"][index]} />
                      ))}
                    </Pie>
                    <Tooltip formatter={(value) => `${value.toLocaleString()} tonnes CO2e`} />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </Card>

            {/* Grid Mix */}
            <Card className="p-6">
              <h3 className="font-semibold text-slate-900 dark:text-white mb-4">Grid Energy Mix Composition</h3>
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie data={scope2Data.gridMix} cx="50%" cy="50%" innerRadius={60} outerRadius={120} dataKey="value">
                      {scope2Data.gridMix.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip formatter={(value) => `${value}%`} />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </Card>
          </div>

          {/* Scope 2 Trend */}
          <Card className="p-6">
            <h3 className="font-semibold text-slate-900 dark:text-white mb-4">Monthly Scope 2 Trend</h3>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={scope2Data.trend}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis />
                  <Tooltip formatter={(value) => `${value} tonnes CO2e`} />
                  <Legend />
                  <Bar dataKey="emissions" fill="#f59e0b" name="Actual Emissions" />
                  <Bar dataKey="target" fill="#10b981" name="Target" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </Card>

          {/* Scope 2 Detailed Table */}
          <Card className="p-6">
            <h3 className="font-semibold text-slate-900 dark:text-white mb-4">Scope 2 Detailed Breakdown</h3>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-slate-200 dark:border-slate-700">
                    <th className="text-left py-3 px-4 font-semibold text-slate-900 dark:text-white">Energy Source</th>
                    <th className="text-right py-3 px-4 font-semibold text-slate-900 dark:text-white">Tonnes CO₂e</th>
                    <th className="text-right py-3 px-4 font-semibold text-slate-900 dark:text-white">% of Scope 2</th>
                    <th className="text-left py-3 px-4 font-semibold text-slate-900 dark:text-white">
                      Description (CSRD)
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {scope2Data.sources.map((source, idx) => (
                    <tr
                      key={idx}
                      className="border-b border-slate-100 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-900/50"
                    >
                      <td className="py-3 px-4 text-slate-900 dark:text-white font-medium">{source.name}</td>
                      <td className="py-3 px-4 text-right text-slate-600 dark:text-slate-400">
                        {source.value.toLocaleString()}
                      </td>
                      <td className="py-3 px-4 text-right text-slate-600 dark:text-slate-400">
                        {source.percentage.toFixed(1)}%
                      </td>
                      <td className="py-3 px-4 text-slate-500 dark:text-slate-400">{source.description}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>
        </TabsContent>
      </Tabs>

      {/* CSRD & EU Taxonomy Compliance Notes */}
      <Card className="p-6 bg-blue-50 dark:bg-blue-950 border-blue-200 dark:border-blue-800">
        <div className="space-y-3">
          <h3 className="font-semibold text-slate-900 dark:text-white flex items-center gap-2">
            <Activity className="w-5 h-5 text-blue-600" />
            CSRD & EU Taxonomy Compliance
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
            <div>
              <p className="font-semibold text-slate-900 dark:text-white mb-1">CSRD Requirements (Art. 8):</p>
              <ul className="list-disc list-inside space-y-1 text-slate-600 dark:text-slate-300">
                <li>Scope 1 & 2 emissions must be reported</li>
                <li>Data quality and assurance requirements</li>
                <li>Science-based targets alignment</li>
                <li>Annual verification required</li>
              </ul>
            </div>
            <div>
              <p className="font-semibold text-slate-900 dark:text-white mb-1">EU Taxonomy Alignment:</p>
              <ul className="list-disc list-inside space-y-1 text-slate-600 dark:text-slate-300">
                <li>Substantial contribution to climate action</li>
                <li>Do no significant harm (DNSH) principle</li>
                <li>Minimum social safeguards compliance</li>
                <li>Technical screening criteria met</li>
              </ul>
            </div>
          </div>
        </div>
      </Card>
    </div>
  )
}
