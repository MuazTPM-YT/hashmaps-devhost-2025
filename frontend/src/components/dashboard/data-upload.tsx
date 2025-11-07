"use client"

import type React from "react"

import { useState } from "react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Upload, FileText, Zap, CheckCircle, Trash2, Download } from "lucide-react"
import { fileStorageService, type UploadedFile } from "@/lib/file-storage-service"
import { loggingService } from "@/lib/logging-service"

export default function DataUploadSection() {
  const [uploading, setUploading] = useState(false)
  const [generating, setGenerating] = useState(false)
  const [uploadedFiles, setUploadedFiles] = useState<UploadedFile[]>([])

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (!files) return

    setUploading(true)

    Array.from(files).forEach((file) => {
      const reader = new FileReader()
      reader.onload = (event) => {
        if (event.target?.result instanceof ArrayBuffer) {
          const uploadedFile = fileStorageService.addFile(file.name, file.type, event.target.result)
          setUploadedFiles([...fileStorageService.getFiles()])

          loggingService.addLog(
            "File Uploaded",
            `Uploaded ${file.name} (${fileStorageService.getFileSize(file.size)})`,
            "upload",
            "success",
            { fileName: file.name, fileSize: file.size, fileType: file.type },
          )
        }
      }
      reader.readAsArrayBuffer(file)
    })

    setTimeout(() => setUploading(false), 1000)
  }

  const handleDeleteFile = (fileId: string) => {
    const file = fileStorageService.getFile(fileId)
    if (file) {
      fileStorageService.deleteFile(fileId)
      setUploadedFiles([...fileStorageService.getFiles()])

      loggingService.addLog("File Deleted", `Deleted ${file.name}`, "delete", "success", { fileName: file.name })
    }
  }

  const handleDownloadFile = (fileId: string) => {
    const file = fileStorageService.getFile(fileId)
    if (file) {
      const blob = new Blob([file.data], { type: file.type })
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement("a")
      a.href = url
      a.download = file.name
      a.click()
      window.URL.revokeObjectURL(url)

      loggingService.addLog("File Downloaded", `Downloaded ${file.name}`, "download", "success", {
        fileName: file.name,
      })
    }
  }

  const handleGenerate = () => {
    if (uploadedFiles.length === 0) {
      alert("Please upload at least one file before generating a report")
      return
    }

    setGenerating(true)

    loggingService.addLog(
      "Report Generation Started",
      `Generating CSRD report from ${uploadedFiles.length} file(s)`,
      "report",
      "pending",
      { fileCount: uploadedFiles.length },
    )

    setTimeout(() => {
      setGenerating(false)
      loggingService.addLog(
        "Report Generation Complete",
        `Successfully generated CSRD-compliant report`,
        "report",
        "success",
        { fileCount: uploadedFiles.length, timestamp: new Date().toISOString() },
      )
    }, 2000)
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      {/* File Upload Card */}
      <Card className="p-6 hover:shadow-lg transition-shadow">
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <Upload className="w-5 h-5 text-blue-500" />
            <h4 className="font-semibold text-slate-900 dark:text-white">Upload ESG Data</h4>
          </div>
          <p className="text-sm text-slate-600 dark:text-slate-400">
            Upload CSV or PDF files for AI-powered parsing and analysis
          </p>

          <label className="block">
            <input
              type="file"
              multiple
              accept=".csv,.pdf,.xlsx,.xls"
              onChange={handleFileUpload}
              disabled={uploading}
              className="hidden"
              id="file-input"
            />
            <label
              htmlFor="file-input"
              className="block border-2 border-dashed border-slate-300 dark:border-slate-600 rounded-lg p-8 text-center cursor-pointer hover:border-blue-500 transition-colors"
            >
              <Upload className="w-8 h-8 text-slate-400 mx-auto mb-2" />
              <p className="text-sm font-medium text-slate-700 dark:text-slate-300">Drag and drop or click to upload</p>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">CSV, PDF, XLSX • Max 10MB per file</p>
            </label>
          </label>

          <Button
            onClick={() => document.getElementById("file-input")?.click()}
            disabled={uploading}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white"
          >
            {uploading ? (
              <>
                <Zap className="w-4 h-4 mr-2 animate-spin" />
                Parsing via AI (OCR + NLP)
              </>
            ) : (
              <>
                <Upload className="w-4 h-4 mr-2" />
                Upload Files
              </>
            )}
          </Button>

          {uploadedFiles.length > 0 && (
            <div className="bg-blue-50 dark:bg-blue-950 rounded-lg p-3 text-sm">
              <p className="text-blue-900 dark:text-blue-100">
                <span className="font-semibold">{uploadedFiles.length}</span> file(s) uploaded
              </p>
            </div>
          )}
        </div>
      </Card>

      {/* Report Generation Card */}
      <Card className="p-6 hover:shadow-lg transition-shadow">
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <FileText className="w-5 h-5 text-green-500" />
            <h4 className="font-semibold text-slate-900 dark:text-white">Generate Report</h4>
          </div>
          <p className="text-sm text-slate-600 dark:text-slate-400">
            Generate CSRD-compliant ESG reports automatically
          </p>

          <div className="bg-green-50 dark:bg-green-950 rounded-lg p-4 space-y-3">
            <div className="flex items-center gap-2">
              <CheckCircle className="w-5 h-5 text-green-600 dark:text-green-400" />
              <div>
                <p className="text-sm font-medium text-slate-900 dark:text-white">Last Successful Report</p>
                <p className="text-xs text-slate-600 dark:text-slate-400">Generated Nov 5, 2025</p>
              </div>
            </div>
          </div>

          <Button
            onClick={handleGenerate}
            disabled={generating || uploadedFiles.length === 0}
            className="w-full bg-green-600 hover:bg-green-700 text-white disabled:opacity-50"
          >
            {generating ? (
              <>
                <Zap className="w-4 h-4 mr-2 animate-spin" />
                Generating Report
              </>
            ) : (
              <>
                <FileText className="w-4 h-4 mr-2" />
                Generate ESG Report (CSRD)
              </>
            )}
          </Button>
        </div>
      </Card>

      {/* Uploaded Files List */}
      {uploadedFiles.length > 0 && (
        <Card className="md:col-span-2 p-6">
          <h4 className="font-semibold text-slate-900 dark:text-white mb-4">Uploaded Files ({uploadedFiles.length})</h4>
          <div className="space-y-2">
            {uploadedFiles.map((file) => (
              <div
                key={file.id}
                className="flex items-center justify-between p-3 bg-slate-50 dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700"
              >
                <div className="flex items-center gap-3 flex-1 min-w-0">
                  <FileText className="w-4 h-4 text-slate-400 flex-shrink-0" />
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-medium text-slate-900 dark:text-white truncate">{file.name}</p>
                    <p className="text-xs text-slate-500 dark:text-slate-400">
                      {fileStorageService.getFileSize(file.size)} • {file.uploadedAt.toLocaleTimeString()}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2 flex-shrink-0">
                  <Button size="sm" variant="ghost" onClick={() => handleDownloadFile(file.id)} className="gap-1">
                    <Download className="w-4 h-4" />
                    <span className="hidden sm:inline">Download</span>
                  </Button>
                  <Button
                    size="sm"
                    variant="ghost"
                    className="text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-900/20"
                    onClick={() => handleDeleteFile(file.id)}
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </Card>
      )}

      {/* Automation Status Cards */}
      <Card className="md:col-span-2 p-6">
        <h4 className="font-semibold text-slate-900 dark:text-white mb-4">Automation Status</h4>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-amber-50 dark:bg-amber-950 rounded-lg p-4 border border-amber-200 dark:border-amber-800">
            <p className="text-sm font-medium text-slate-600 dark:text-slate-300">Next Compliance Deadline</p>
            <p className="text-2xl font-bold text-slate-900 dark:text-white mt-2">Dec 15</p>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">38 days remaining</p>
          </div>

          <div className="bg-red-50 dark:bg-red-950 rounded-lg p-4 border border-red-200 dark:border-red-800">
            <p className="text-sm font-medium text-slate-600 dark:text-slate-300">Predictive Alert</p>
            <p className="text-2xl font-bold text-slate-900 dark:text-white mt-2">High Risk</p>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">3 pending actions</p>
          </div>

          <div className="bg-green-50 dark:bg-green-950 rounded-lg p-4 border border-green-200 dark:border-green-800">
            <p className="text-sm font-medium text-slate-600 dark:text-slate-300">Last Successful Report</p>
            <p className="text-2xl font-bold text-slate-900 dark:text-white mt-2">Nov 5</p>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">2 days ago</p>
          </div>
        </div>
      </Card>
    </div>
  )
}
