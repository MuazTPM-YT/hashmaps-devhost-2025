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

// AI-generated insight functions
function generateSourcesInsight(sources: { name: string; value: number; percentage: number }[]) {
  if (!sources?.length) return "No emission sources data available.";
  const sorted = [...sources].sort((a, b) => b.percentage - a.percentage);
  const top = sorted[0];
  const second = sorted[1];
  const total = sources.reduce((sum, s) => sum + s.value, 0);
  
  return `The primary emission source is ${top.name}, contributing ${top.percentage.toFixed(1)}% (${top.value.toLocaleString()} tonnes CO2e) of total emissions. ${second.name} is the second-largest contributor at ${second.percentage.toFixed(1)}% (${second.value.toLocaleString()} tonnes CO2e). Combined, the top two sources account for ${(top.percentage + second.percentage).toFixed(1)}% of all Scope emissions, totaling ${total.toLocaleString()} tonnes CO2e.`;
}

function generateTrendInsight(trend: { month: string; emissions: number; target: number }[]) {
  if (!trend?.length) return "No trend data available.";
  const start = trend[0];
  const end = trend[trend.length - 1];
  const change = end.emissions - start.emissions;
  const changePercent = ((change / start.emissions) * 100).toFixed(1);
  const avgEmissions = (trend.reduce((sum, m) => sum + m.emissions, 0) / trend.length).toFixed(0);
  const avgTarget = (trend.reduce((sum, m) => sum + m.target, 0) / trend.length).toFixed(0);
  const meetingTarget = end.emissions <= end.target;
  
  return `Emissions ${change < 0 ? "decreased" : "increased"} from ${start.emissions} to ${end.emissions} tonnes CO2e between ${start.month} and ${end.month}, representing a ${Math.abs(parseFloat(changePercent))}% ${change < 0 ? "reduction" : "increase"}. The average monthly emissions stand at ${avgEmissions} tonnes CO2e compared to an average target of ${avgTarget} tonnes CO2e. As of ${end.month}, emissions are ${meetingTarget ? "meeting" : "exceeding"} the target by ${Math.abs(end.emissions - end.target)} tonnes CO2e.`;
}

function generateGridMixInsight(gridMix: { name: string; value: number }[]) {
  if (!gridMix?.length) return "No grid mix data available.";
  const sorted = [...gridMix].sort((a, b) => b.value - a.value);
  const fossil = gridMix.filter(g => g.name === "Coal" || g.name === "Natural Gas").reduce((sum, g) => sum + g.value, 0);
  const lowCarbon = gridMix.filter(g => g.name === "Nuclear" || g.name === "Renewable").reduce((sum, g) => sum + g.value, 0);
  
  return `The energy grid is dominated by ${sorted[0].name} at ${sorted[0].value}%, followed by ${sorted[1].name} at ${sorted[1].value}%. Fossil fuel sources (Coal and Natural Gas) collectively represent ${fossil}% of the grid mix, while low-carbon sources (Nuclear and Renewable) contribute ${lowCarbon}%. This grid composition directly impacts the carbon intensity of Scope 2 emissions from purchased electricity.`;
}

export default function ScopeEmissions() {
  return (
    <div className="space-y-6">
      {/* Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="p-6 border-l-4 border-red-500">
          <div className="space-y-2">
            <p className="text-base text-slate-600 dark:text-slate-400 font-medium">Scope 1 Emissions</p>
            <p className="text-4xl font-bold text-slate-900 dark:text-white">
              {scope1Data.totalEmissions.toLocaleString()}
            </p>
            <p className="text-sm text-slate-500 dark:text-slate-400">{scope1Data.unit}</p>
            <p className="text-sm text-red-600 dark:text-red-400 mt-2">Direct emissions from owned sources</p>
          </div>
        </Card>

        <Card className="p-6 border-l-4 border-orange-500">
          <div className="space-y-2">
            <p className="text-base text-slate-600 dark:text-slate-400 font-medium">Scope 2 Emissions</p>
            <p className="text-4xl font-bold text-slate-900 dark:text-white">
              {scope2Data.totalEmissions.toLocaleString()}
            </p>
            <p className="text-sm text-slate-500 dark:text-slate-400">{scope2Data.unit}</p>
            <p className="text-sm text-orange-600 dark:text-orange-400 mt-2">Indirect energy-related emissions</p>
          </div>
        </Card>

        <Card className="p-6 border-l-4 border-purple-500">
          <div className="space-y-2">
            <p className="text-base text-slate-600 dark:text-slate-400 font-medium">Total Scope 1+2</p>
            <p className="text-4xl font-bold text-slate-900 dark:text-white">
              {(scope1Data.totalEmissions + scope2Data.totalEmissions).toLocaleString()}
            </p>
            <p className="text-sm text-slate-500 dark:text-slate-400">{scope1Data.unit}</p>
            <p className="text-sm text-purple-600 dark:text-purple-400 mt-2">CSRD Reporting Category</p>
          </div>
        </Card>
      </div>

      {/* Detailed Breakdown */}
      <Tabs defaultValue="scope1" className="space-y-4">
        <TabsList className="grid w-full grid-cols-2 text-base">
          <TabsTrigger value="scope1" className="gap-2 text-base">
            <Truck className="w-5 h-5" />
            <span className="hidden sm:inline">Scope 1</span>
            <span className="inline sm:hidden">Direct</span>
          </TabsTrigger>
          <TabsTrigger value="scope2" className="gap-2 text-base">
            <Zap className="w-5 h-5" />
            <span className="hidden sm:inline">Scope 2</span>
            <span className="inline sm:hidden">Indirect</span>
          </TabsTrigger>
        </TabsList>

        {/* Scope 1 Tab */}
        <TabsContent value="scope1" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Scope 1 Breakdown */}
            <Card className="p-6">
              <h3 className="font-bold text-lg text-slate-900 dark:text-white mb-4">
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
              
              {/* AI Insight Table */}
              <div className="mt-4 bg-blue-50 dark:bg-blue-950/50 rounded-lg p-4 border border-blue-200 dark:border-blue-800">
                <h4 className="text-base font-bold text-blue-900 dark:text-blue-100 mb-3">AI Analysis</h4>
                <p className="text-sm text-slate-700 dark:text-slate-300 leading-relaxed">
                  {generateSourcesInsight(scope1Data.sources)}
                </p>
              </div>
            </Card>

            {/* Scope 1 Trend */}
            <Card className="p-6">
              <h3 className="font-bold text-lg text-slate-900 dark:text-white mb-4">Monthly Scope 1 Trend</h3>
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
              
              {/* AI Insight Table */}
              <div className="mt-4 bg-blue-50 dark:bg-blue-950/50 rounded-lg p-4 border border-blue-200 dark:border-blue-800">
                <h4 className="text-base font-bold text-blue-900 dark:text-blue-100 mb-3">AI Analysis</h4>
                <p className="text-sm text-slate-700 dark:text-slate-300 leading-relaxed">
                  {generateTrendInsight(scope1Data.trend)}
                </p>
              </div>
            </Card>
          </div>

          {/* Scope 1 Detailed Table */}
          <Card className="p-6">
            <h3 className="font-bold text-lg text-slate-900 dark:text-white mb-4">Scope 1 Detailed Breakdown</h3>
            <div className="overflow-x-auto">
              <table className="w-full text-base">
                <thead>
                  <tr className="border-b border-slate-200 dark:border-slate-700">
                    <th className="text-left py-3 px-4 font-bold text-slate-900 dark:text-white">
                      Emission Source
                    </th>
                    <th className="text-right py-3 px-4 font-bold text-slate-900 dark:text-white">Tonnes CO₂e</th>
                    <th className="text-right py-3 px-4 font-bold text-slate-900 dark:text-white">% of Scope 1</th>
                    <th className="text-left py-3 px-4 font-bold text-slate-900 dark:text-white">
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
                      <td className="py-3 px-4 text-slate-900 dark:text-white font-semibold">{source.name}</td>
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
              <h3 className="font-bold text-lg text-slate-900 dark:text-white mb-4">
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
              
              {/* AI Insight Table */}
              <div className="mt-4 bg-blue-50 dark:bg-blue-950/50 rounded-lg p-4 border border-blue-200 dark:border-blue-800">
                <h4 className="text-base font-bold text-blue-900 dark:text-blue-100 mb-3">AI Analysis</h4>
                <p className="text-sm text-slate-700 dark:text-slate-300 leading-relaxed">
                  {generateSourcesInsight(scope2Data.sources)}
                </p>
              </div>
            </Card>

            {/* Grid Mix */}
            <Card className="p-6">
              <h3 className="font-bold text-lg text-slate-900 dark:text-white mb-4">Grid Energy Mix Composition</h3>
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
              
              {/* AI Insight Table */}
              <div className="mt-4 bg-blue-50 dark:bg-blue-950/50 rounded-lg p-4 border border-blue-200 dark:border-blue-800">
                <h4 className="text-base font-bold text-blue-900 dark:text-blue-100 mb-3">AI Analysis</h4>
                <p className="text-sm text-slate-700 dark:text-slate-300 leading-relaxed">
                  {generateGridMixInsight(scope2Data.gridMix)}
                </p>
              </div>
            </Card>
          </div>

          {/* Scope 2 Trend */}
          <Card className="p-6">
            <h3 className="font-bold text-lg text-slate-900 dark:text-white mb-4">Monthly Scope 2 Trend</h3>
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
            
            {/* AI Insight Table */}
            <div className="mt-4 bg-blue-50 dark:bg-blue-950/50 rounded-lg p-4 border border-blue-200 dark:border-blue-800">
              <h4 className="text-base font-bold text-blue-900 dark:text-blue-100 mb-3">AI Analysis</h4>
              <p className="text-sm text-slate-700 dark:text-slate-300 leading-relaxed">
                {generateTrendInsight(scope2Data.trend)}
              </p>
            </div>
          </Card>

          {/* Scope 2 Detailed Table */}
          <Card className="p-6">
            <h3 className="font-bold text-lg text-slate-900 dark:text-white mb-4">Scope 2 Detailed Breakdown</h3>
            <div className="overflow-x-auto">
              <table className="w-full text-base">
                <thead>
                  <tr className="border-b border-slate-200 dark:border-slate-700">
                    <th className="text-left py-3 px-4 font-bold text-slate-900 dark:text-white">Energy Source</th>
                    <th className="text-right py-3 px-4 font-bold text-slate-900 dark:text-white">Tonnes CO₂e</th>
                    <th className="text-right py-3 px-4 font-bold text-slate-900 dark:text-white">% of Scope 2</th>
                    <th className="text-left py-3 px-4 font-bold text-slate-900 dark:text-white">
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
                      <td className="py-3 px-4 text-slate-900 dark:text-white font-semibold">{source.name}</td>
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
          <h3 className="font-bold text-lg text-slate-900 dark:text-white flex items-center gap-2">
            <Activity className="w-6 h-6 text-blue-600" />
            CSRD & EU Taxonomy Compliance
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-base">
            <div>
              <p className="font-bold text-slate-900 dark:text-white mb-2">CSRD Requirements (Art. 8):</p>
              <ul className="list-disc list-inside space-y-1 text-slate-600 dark:text-slate-300">
                <li>Scope 1 & 2 emissions must be reported</li>
                <li>Data quality and assurance requirements</li>
                <li>Science-based targets alignment</li>
                <li>Annual verification required</li>
              </ul>
            </div>
            <div>
              <p className="font-bold text-slate-900 dark:text-white mb-2">EU Taxonomy Alignment:</p>
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
