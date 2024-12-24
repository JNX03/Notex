"use client"

import { useEffect, useRef, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useSearchParams } from "next/navigation";
import { Expand, Download, Share } from 'lucide-react';
import { FullScreenPDFViewer } from "./full-screen-pdf-viewer";
import { ShareDialog } from "./share-dialog";
import * as pdfjsLib from 'pdfjs-dist';
import 'pdfjs-dist/web/pdf_viewer.css';

// Match API and Worker versions
const PDFJS_VERSION = pdfjsLib.version;
const WORKER_SRC = `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/4.9.155/pdf.worker.min.mjs`;
pdfjsLib.GlobalWorkerOptions.workerSrc = WORKER_SRC;

export function PDFViewer() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [pdfDoc, setPdfDoc] = useState<any>(null);
  const [pageNum, setPageNum] = useState(1);
  const [isFullScreen, setIsFullScreen] = useState(false);
  const [isShareOpen, setIsShareOpen] = useState(false);
  const searchParams = useSearchParams();

  useEffect(() => {
    const loadPDF = () => {
      const summaryParam = searchParams.get("summary");
      if (summaryParam) {
        renderPDF(summaryParam);
      }
    };

    loadPDF();

    // Listen for changes to the summary parameter
    window.addEventListener('summarychange', loadPDF);

    return () => {
      window.removeEventListener('summarychange', loadPDF);
    };
  }, [searchParams]);

  const renderPDF = async (url: string) => {
    try {
      const loadingTask = pdfjsLib.getDocument(url);
      const pdf = await loadingTask.promise;
      setPdfDoc(pdf);
      renderPage(1, pdf);
    } catch (error) {
      console.error("Error loading PDF:", error);
    }
  };

  const renderPage = async (num: number, pdf: any) => {
    try {
      const page = await pdf.getPage(num);
      const scale = 1.5;
      const viewport = page.getViewport({ scale });
      const canvas = canvasRef.current;
      const context = canvas?.getContext("2d");

      if (canvas && context) {
        canvas.height = viewport.height;
        canvas.width = viewport.width;

        const renderContext = {
          canvasContext: context,
          viewport: viewport,
        };
        await page.render(renderContext).promise;
      }
    } catch (error) {
      console.error("Error rendering page:", error);
    }
  };

  const handleFullScreen = () => {
    setIsFullScreen(true);
  };

  const handleDownload = () => {
    const summaryParam = searchParams.get("summary");
    if (summaryParam) {
      const link = document.createElement("a");
      link.href = summaryParam;
      link.download = "document.pdf";
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  };

  const handleShare = () => {
    setIsShareOpen(true);
  };

  return (
    <>
      <Card className="w-full md:w-2/3">
        <CardContent className="p-6">
          <div className="flex justify-end space-x-2 mb-4">
            <Button onClick={handleFullScreen} size="sm">
              <Expand className="w-4 h-4 mr-2" />
              Full Screen
            </Button>
            <Button onClick={handleDownload} size="sm">
              <Download className="w-4 h-4 mr-2" />
              Download
            </Button>
            <Button onClick={handleShare} size="sm">
              <Share className="w-4 h-4 mr-2" />
              Share
            </Button>
          </div>
          <canvas ref={canvasRef} className="w-full h-auto" />
        </CardContent>
      </Card>
      {isFullScreen && (
        <FullScreenPDFViewer
          pdfUrl={searchParams.get("summary") || ""}
          onClose={() => setIsFullScreen(false)}
        />
      )}
      <ShareDialog
        isOpen={isShareOpen}
        onClose={() => setIsShareOpen(false)}
        pdfUrl={searchParams.get("summary") || ""}
      />
    </>
  );
}
