// Centralized logging service for tracking all major actions
export interface LogEntry {
  id: string
  timestamp: Date
  action: string
  description: string
  type: "upload" | "processing" | "report" | "delete" | "download" | "settings"
  status: "success" | "error" | "pending"
  details?: Record<string, any>
}

let logs: LogEntry[] = []

export const loggingService = {
  addLog: (
    action: string,
    description: string,
    type: LogEntry["type"],
    status: LogEntry["status"] = "success",
    details?: Record<string, any>,
  ) => {
    const logEntry: LogEntry = {
      id: `log-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      timestamp: new Date(),
      action,
      description,
      type,
      status,
      details,
    }
    logs.unshift(logEntry) // Add to beginning
    if (logs.length > 1000) logs = logs.slice(0, 1000) // Keep last 1000 logs
    return logEntry
  },

  getLogs: () => [...logs],

  getLogsByType: (type: LogEntry["type"]) => logs.filter((log) => log.type === type),

  clearLogs: () => {
    logs = []
  },

  exportLogs: () => {
    return JSON.stringify(logs, null, 2)
  },
}
