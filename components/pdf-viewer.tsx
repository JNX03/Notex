"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useSearchParams } from "next/navigation";
import { Expand, Download, Share } from 'lucide-react';
import { FullScreenPDFViewer } from "./full-screen-pdf-viewer";
import { ShareDialog } from "./share-dialog";
import * as pdfjsLib from "pdfjs-dist";
import "pdfjs-dist/web/pdf_viewer.css";
import { Skeleton } from "@/components/ui/skeleton";
import Image from "next/image";
import { Alert, AlertDescription } from "@/components/ui/alert";
import type { PDFDocumentProxy, PDFPageProxy } from 'pdfjs-dist'

pdfjsLib.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.js`

interface PDFViewerProps {
  pdfUrl: string;
}

export function PDFViewer({ pdfUrl }: PDFViewerProps) {
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
    <div ref={containerRef} className="flex flex-col items-center pb-8" />
  )
}

