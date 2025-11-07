// Client-side file storage service for managing uploaded files
export interface UploadedFile {
  id: string
  name: string
  size: number
  type: string
  uploadedAt: Date
  data: ArrayBuffer
}

let uploadedFiles: UploadedFile[] = []

export const fileStorageService = {
  addFile: (name: string, type: string, data: ArrayBuffer): UploadedFile => {
    const file: UploadedFile = {
      id: `file-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      name,
      type,
      size: data.byteLength,
      uploadedAt: new Date(),
      data,
    }
    uploadedFiles.push(file)
    return file
  },

  getFiles: () => [...uploadedFiles],

  deleteFile: (id: string) => {
    uploadedFiles = uploadedFiles.filter((f) => f.id !== id)
  },

  getFile: (id: string) => uploadedFiles.find((f) => f.id === id),

  clearAllFiles: () => {
    uploadedFiles = []
  },

  getFileSize: (bytes: number): string => {
    if (bytes === 0) return "0 B"
    const k = 1024
    const sizes = ["B", "KB", "MB", "GB"]
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + " " + sizes[i]
  },
}
