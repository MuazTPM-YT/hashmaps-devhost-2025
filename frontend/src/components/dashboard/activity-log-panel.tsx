"use client"

import { useState, useEffect } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { ScrollArea } from "@/components/ui/scroll-area"
import { loggingService, type LogEntry } from "@/lib/logging-service"
import { DotSquare as LogSquare, Download, Trash2, Search } from "lucide-react"

export default function ActivityLogPanel() {
  const [logs, setLogs] = useState<LogEntry[]>([])
  const [filteredLogs, setFilteredLogs] = useState<LogEntry[]>([])
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedType, setSelectedType] = useState<LogEntry["type"] | "all">("all")

  useEffect(() => {
    const updateLogs = () => {
      const allLogs = loggingService.getLogs()
      setLogs(allLogs)

      let filtered = allLogs
      if (selectedType !== "all") {
        filtered = filtered.filter((log) => log.type === selectedType)
      }
      if (searchTerm) {
        filtered = filtered.filter(
          (log) =>
            log.action.toLowerCase().includes(searchTerm.toLowerCase()) ||
            log.description.toLowerCase().includes(searchTerm.toLowerCase()),
        )
      }
      setFilteredLogs(filtered)
    }

    updateLogs()
  }, [searchTerm, selectedType])

  const handleExport = () => {
    const csvContent = [
      ["Timestamp", "Action", "Description", "Type", "Status"].join(","),
      ...filteredLogs.map((log) =>
        [log.timestamp.toISOString(), log.action, log.description, log.type, log.status]
          .map((field) => `"${field}"`)
          .join(","),
      ),
    ].join("\n")

    const blob = new Blob([csvContent], { type: "text/csv" })
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = `activity-logs-${new Date().toISOString().split("T")[0]}.csv`
    a.click()
  }

  const handleClearLogs = () => {
    if (confirm("Are you sure you want to clear all logs?")) {
      loggingService.clearLogs()
      setLogs([])
      setFilteredLogs([])
    }
  }

  const typeColors = {
    upload: "bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-100",
    processing: "bg-purple-100 dark:bg-purple-900 text-purple-800 dark:text-purple-100",
    report: "bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-100",
    delete: "bg-red-100 dark:bg-red-900 text-red-800 dark:text-red-100",
    download: "bg-amber-100 dark:bg-amber-900 text-amber-800 dark:text-amber-100",
    settings: "bg-gray-100 dark:bg-gray-900 text-gray-800 dark:text-gray-100",
  }

  const statusColors = {
    success: "text-green-600 dark:text-green-400",
    error: "text-red-600 dark:text-red-400",
    pending: "text-amber-600 dark:text-amber-400",
  }

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm" className="gap-2 bg-transparent">
          <LogSquare className="w-4 h-4" />
          <span className="hidden sm:inline">Activity Log</span>
          <span className="inline sm:hidden">Log</span>
          {logs.length > 0 && (
            <span className="ml-1 inline-flex items-center justify-center px-2 py-1 text-xs font-semibold leading-none text-white transform bg-slate-600 rounded-full">
              {logs.length}
            </span>
          )}
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl max-h-[80vh]">
        <DialogHeader>
          <DialogTitle>Activity Log</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {/* Filters */}
          <div className="space-y-3">
            <div className="flex gap-2">
              <div className="flex-1 relative">
                <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
                <Input
                  placeholder="Search logs..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-9"
                />
              </div>
              <Button size="sm" variant="outline" onClick={handleExport} className="gap-1 bg-transparent">
                <Download className="w-4 h-4" />
                Export
              </Button>
              <Button size="sm" variant="destructive" onClick={handleClearLogs} className="gap-1">
                <Trash2 className="w-4 h-4" />
                Clear
              </Button>
            </div>

            {/* Type Filter */}
            <div className="flex gap-2 flex-wrap">
              <Button
                size="sm"
                variant={selectedType === "all" ? "default" : "outline"}
                onClick={() => setSelectedType("all")}
              >
                All
              </Button>
              {(["upload", "processing", "report", "delete", "download", "settings"] as const).map((type) => (
                <Button
                  key={type}
                  size="sm"
                  variant={selectedType === type ? "default" : "outline"}
                  onClick={() => setSelectedType(type)}
                  className="capitalize"
                >
                  {type}
                </Button>
              ))}
            </div>
          </div>

          {/* Logs List */}
          <ScrollArea className="h-96 rounded-lg border">
            {filteredLogs.length === 0 ? (
              <div className="p-8 text-center text-slate-500">No logs found</div>
            ) : (
              <div className="space-y-2 p-4">
                {filteredLogs.map((log) => (
                  <Card key={log.id} className="p-3 space-y-1">
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <div className="flex items-center gap-2">
                          <span
                            className={`inline-block px-2 py-1 rounded text-xs font-semibold ${typeColors[log.type]}`}
                          >
                            {log.type}
                          </span>
                          <span className={`text-xs font-semibold ${statusColors[log.status]}`}>
                            {log.status.toUpperCase()}
                          </span>
                        </div>
                        <p className="font-semibold text-slate-900 dark:text-white mt-1">{log.action}</p>
                        <p className="text-sm text-slate-600 dark:text-slate-400">{log.description}</p>
                      </div>
                      <span className="text-xs text-slate-500 dark:text-slate-400 flex-shrink-0">
                        {log.timestamp.toLocaleTimeString()}
                      </span>
                    </div>
                  </Card>
                ))}
              </div>
            )}
          </ScrollArea>

          {/* Stats */}
          <Card className="p-3 bg-slate-50 dark:bg-slate-900">
            <p className="text-sm text-slate-600 dark:text-slate-300">
              Total logs: <span className="font-semibold">{logs.length}</span> | Filtered:{" "}
              <span className="font-semibold">{filteredLogs.length}</span>
            </p>
          </Card>
        </div>
      </DialogContent>
    </Dialog>
  )
}
