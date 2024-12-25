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

const WORKER_SRC = `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/4.9.155/pdf.worker.min.mjs`;
pdfjsLib.GlobalWorkerOptions.workerSrc = WORKER_SRC;

export function PDFViewer() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [pdfDoc, setPdfDoc] = useState<pdfjsLib.PDFDocumentProxy | null>(null);
  const [pageNum, setPageNum] = useState(1);
  const [isFullScreen, setIsFullScreen] = useState(false);
  const [isShareOpen, setIsShareOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [pdfName, setPdfName] = useState("");
  const [imageIndex, setImageIndex] = useState(0);
  const [pdfNotFound, setPdfNotFound] = useState(false);
  const searchParams = useSearchParams();

  const placeholderImages = ["/images/banner1.png"];

  const renderPDF = useCallback(async (url: string) => {
    try {
      setIsLoading(true);
      setPdfNotFound(false);
      const loadingTask = pdfjsLib.getDocument(url);
      const pdf = await loadingTask.promise;
      setPdfDoc(pdf);
      renderPage(1, pdf);
    } catch (error) {
      console.error("Error loading PDF:", error);
      setPdfNotFound(true);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const renderPage = useCallback(async (num: number, pdf: pdfjsLib.PDFDocumentProxy) => {
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
  }, []);

  useEffect(() => {
    const loadPDF = () => {
      const summaryParam = searchParams.get("summary");
      if (summaryParam) {
        setPdfName(summaryParam.split("/").pop() || "PDF Document");
        renderPDF(summaryParam);
      } else {
        setPdfNotFound(false);
        setPdfDoc(null);
      }
    };

    loadPDF();

    window.addEventListener("summarychange", loadPDF);

    return () => {
      window.removeEventListener("summarychange", loadPDF);
    };
  }, [searchParams, renderPDF]);

  useEffect(() => {
    if (!pdfDoc && !isLoading && placeholderImages.length > 0) {
      const interval = setInterval(() => {
        setImageIndex((prevIndex) => (prevIndex + 1) % placeholderImages.length);
      }, 3000);

      return () => clearInterval(interval);
    }
  }, [pdfDoc, isLoading, placeholderImages.length]);

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

  const changePage = (offset: number) => {
    if (pdfDoc) {
      const newPageNum = pageNum + offset;
      if (newPageNum > 0 && newPageNum <= pdfDoc.numPages) {
        setPageNum(newPageNum);
        renderPage(newPageNum, pdfDoc);
      }
    }
  };

  return (
    <>
      <Card className="w-full md:w-2/3">
        <CardContent className="p-6">
          {searchParams.get("summary") && pdfNotFound ? (
            <Alert variant="destructive">
              <AlertDescription className="text-red-600 font-semibold">
                Note/Summary Not Found
              </AlertDescription>
            </Alert>
          ) : !searchParams.get("summary") || isLoading ? (
            <Image
              src={placeholderImages[imageIndex]}
              alt="Placeholder"
              width={800}
              height={600}
              className="w-full h-auto mb-4"
            />
          ) : pdfDoc ? (
            <>
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-lg font-semibold">{pdfName}</h2>
                <div className="flex space-x-2">
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
              </div>
              <div className="flex justify-between items-center mb-4">
                <div className="flex space-x-2">
                  <Button onClick={() => changePage(-1)} size="sm" disabled={pageNum === 1}>
                    Previous
                  </Button>
                  <Button onClick={() => changePage(1)} size="sm" disabled={pageNum === pdfDoc.numPages}>
                    Next
                  </Button>
                </div>
                <div className="text-sm">Page {pageNum} of {pdfDoc.numPages}</div>
              </div>
            </>
          ) : (
            <Skeleton className="w-full h-64 mb-4" />
          )}
          <canvas ref={canvasRef} className="w-full h-auto" style={{ display: pdfDoc ? "block" : "none" }} />
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
