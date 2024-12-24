"use client"

import { useEffect, useRef } from "react"
import { Button } from "@/components/ui/button"
import { X } from 'lucide-react'
import * as pdfjsLib from 'pdfjs-dist'
import type { PDFDocumentProxy, PDFPageProxy } from 'pdfjs-dist'

// pdfjsLib.GlobalWorkerOptions.workerSrc = `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.js`;
pdfjsLib.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.js`

interface FullScreenPDFViewerProps {
  pdfUrl: string
  onClose: () => void
}

export function FullScreenPDFViewer({ pdfUrl, onClose }: FullScreenPDFViewerProps) {
  const containerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const container = containerRef.current
    if (!container) return

    const loadingTask = pdfjsLib.getDocument(pdfUrl)
    loadingTask.promise.then((pdf: PDFDocumentProxy) => {
      for (let pageNum = 1; pageNum <= pdf.numPages; pageNum++) {
        pdf.getPage(pageNum).then((page: PDFPageProxy) => {
          const scale = 1.5
          const viewport = page.getViewport({ scale })
          const canvas = document.createElement("canvas")
          const context = canvas.getContext("2d")
          if (!context) return

          canvas.height = viewport.height
          canvas.width = viewport.width

          const renderContext = {
            canvasContext: context,
            viewport: viewport,
          }
          page.render(renderContext)

          container.appendChild(canvas)
        })
      }
    })
  }, [pdfUrl])

  return (
    <div className="fixed inset-0 bg-background z-50 overflow-auto">
      <div className="sticky top-0 flex justify-end p-4 bg-background">
        <Button onClick={onClose} variant="ghost" size="icon">
          <X className="h-4 w-4" />
        </Button>
      </div>
      <div ref={containerRef} className="flex flex-col items-center pb-8" />
    </div>
  )
}
