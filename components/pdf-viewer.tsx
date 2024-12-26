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

  const placeholderImages = ["/images/6.png", "/images/7.png"];

  const getScale = useCallback(() => {
    const width = window.innerWidth;
    if (width < 640) return 1; // Mobile
    if (width < 1024) return 1.25; // Tablet
    return 1.5; // Desktop
  }, []);

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
      const scale = getScale();
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
  }, [getScale]);

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
      }, 5000); // Changed to 5 seconds for a slower transition

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

  useEffect(() => {
    const handleResize = () => {
      if (pdfDoc) {
        renderPage(pageNum, pdfDoc);
      }
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [pdfDoc, pageNum, renderPage]);

  return (
    <>
      <Card className="w-full max-w-4xl mx-auto">
        <CardContent className="p-6">
          {searchParams.get("summary") && pdfNotFound ? (
            <Alert variant="destructive">
              <AlertDescription className="text-red-600 font-semibold">
                Note/Summary Not Found
              </AlertDescription>
            </Alert>
          ) : !searchParams.get("summary") || isLoading ? (
            <div className="relative w-full h-[200px] sm:h-[300px] md:h-[400px] overflow-hidden">
              {placeholderImages.map((src, index) => (
                <Image
                  key={src}
                  src={src}
                  alt={`Placeholder ${index + 1}`}
                  fill
                  style={{
                    objectFit: 'cover',
                    transition: 'opacity 1s ease-in-out',
                    opacity: index === imageIndex ? 1 : 0,
                  }}
                  priority
                />
              ))}
            </div>
          ) : pdfDoc ? (
            <>
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-4 space-y-2 sm:space-y-0">
                <h2 className="text-lg font-semibold">{pdfName}</h2>
                <div className="flex flex-wrap gap-2">
                  <Button onClick={handleFullScreen} size="sm" className="flex-grow sm:flex-grow-0">
                    <Expand className="w-4 h-4 mr-2" />
                    <span className="hidden sm:inline">Full Screen</span>
                  </Button>
                  <Button onClick={handleDownload} size="sm" className="flex-grow sm:flex-grow-0">
                    <Download className="w-4 h-4 mr-2" />
                    <span className="hidden sm:inline">Download</span>
                  </Button>
                  <Button onClick={handleShare} size="sm" className="flex-grow sm:flex-grow-0">
                    <Share className="w-4 h-4 mr-2" />
                    <span className="hidden sm:inline">Share</span>
                  </Button>
                </div>
              </div>
              <div className="flex flex-col sm:flex-row justify-between items-center mb-4 space-y-2 sm:space-y-0">
                <div className="flex space-x-2 w-full sm:w-auto justify-between sm:justify-start">
                  <Button onClick={() => changePage(-1)} size="sm" disabled={pageNum === 1} className="flex-grow sm:flex-grow-0">
                    Previous
                  </Button>
                  <Button onClick={() => changePage(1)} size="sm" disabled={pageNum === pdfDoc.numPages} className="flex-grow sm:flex-grow-0">
                    Next
                  </Button>
                </div>
                <div className="text-sm">Page {pageNum} of {pdfDoc.numPages}</div>
              </div>
            </>
          ) : (
            <Skeleton className="w-full h-64 mb-4" />
          )}
          <div className="w-full overflow-x-auto">
            <canvas ref={canvasRef} className="max-w-full h-auto" style={{ display: pdfDoc ? "block" : "none" }} />
          </div>
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

