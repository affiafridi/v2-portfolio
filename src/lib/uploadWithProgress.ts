import type { MediaAsset } from '@/components/admin/MediaLightbox'

export interface UploadResult {
  url?: string
  asset?: MediaAsset
  error?: string
}

// Fetch can't report upload progress reliably across browsers, so this uses
// XMLHttpRequest instead, which exposes real upload.onprogress events.
export function uploadWithProgress(file: File, onProgress: (percent: number) => void): Promise<UploadResult> {
  return new Promise((resolve) => {
    const xhr = new XMLHttpRequest()
    const formData = new FormData()
    formData.append('file', file)

    xhr.upload.onprogress = (e) => {
      if (e.lengthComputable) onProgress(Math.round((e.loaded / e.total) * 100))
    }

    xhr.onload = () => {
      let data: UploadResult = {}
      try {
        data = JSON.parse(xhr.responseText)
      } catch {
        resolve({ error: 'Upload failed' })
        return
      }
      if (xhr.status >= 200 && xhr.status < 300) {
        resolve(data)
      } else {
        resolve({ error: data.error || 'Upload failed' })
      }
    }

    xhr.onerror = () => resolve({ error: 'Network error during upload' })

    xhr.open('POST', '/api/upload')
    xhr.send(formData)
  })
}
