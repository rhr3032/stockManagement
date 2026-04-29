"use client";

import { useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/button";

interface BarcodeScannerProps {
  isActive: boolean;
  onBarcodeDetected: (barcode: string) => void;
  onClose: () => void;
}

export function BarcodeScanner({ isActive, onBarcodeDetected, onClose }: BarcodeScannerProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [error, setError] = useState<string | null>(null);
  const [hasPermission, setHasPermission] = useState(false);
  const barcodeBufferRef = useRef<string>("");
  const timeoutRef = useRef<ReturnType<typeof window.setTimeout> | null>(null);

  useEffect(() => {
    if (!isActive) return;

    const startScanner = async () => {
      try {
        setError(null);
        const stream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: "environment" },
        });
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          setHasPermission(true);
        }
      } catch (err) {
        setError("Camera access denied. Using keyboard input mode.");
        setHasPermission(false);
      }
    };

    startScanner();

    // Handle keyboard input for barcode scanners (most scanners simulate keyboard input)
    const handleKeyPress = (e: KeyboardEvent) => {
      if (!isActive) return;

      // Most barcode scanners end with Enter key
      if (e.key === "Enter") {
        if (barcodeBufferRef.current.length > 3) {
          onBarcodeDetected(barcodeBufferRef.current);
          barcodeBufferRef.current = "";
        }
      } else if (e.key.length === 1 && e.key.match(/[0-9A-Za-z-]/)) {
        // Add character to buffer
        barcodeBufferRef.current += e.key;

        // Clear timeout and reset if too much time passes
        if (timeoutRef.current) clearTimeout(timeoutRef.current);
        timeoutRef.current = setTimeout(() => {
          barcodeBufferRef.current = "";
        }, 2000);
      }
    };

    window.addEventListener("keydown", handleKeyPress);

    return () => {
      window.removeEventListener("keydown", handleKeyPress);
      if (timeoutRef.current) clearTimeout(timeoutRef.current);

      // Stop video stream
      if (videoRef.current?.srcObject) {
        const stream = videoRef.current.srcObject as MediaStream;
        stream.getTracks().forEach((track) => track.stop());
      }
    };
  }, [isActive, onBarcodeDetected]);

  if (!isActive) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4">
      <div className="w-full max-w-md rounded-lg bg-white p-6 shadow-lg dark:bg-slate-900">
        <h3 className="mb-4 text-lg font-semibold">Barcode Scanner</h3>

        {hasPermission ? (
          <div className="mb-4 aspect-video overflow-hidden rounded-lg bg-black">
            <video
              ref={videoRef}
              autoPlay
              playsInline
              className="h-full w-full object-cover"
            />
          </div>
        ) : (
          <div className="mb-4 aspect-video flex items-center justify-center rounded-lg border-2 border-dashed border-slate-300 bg-slate-50 dark:border-slate-600 dark:bg-slate-800">
            <div className="text-center">
              <p className="text-sm text-slate-600 dark:text-slate-400">
                Using keyboard input mode
              </p>
              <p className="mt-2 text-xs text-slate-500 dark:text-slate-500">
                Scan barcode or type manually
              </p>
            </div>
          </div>
        )}

        {error && (
          <div className="mb-4 rounded-lg bg-blue-50 p-3 text-sm text-blue-700 dark:bg-blue-900 dark:text-blue-200">
            {error}
          </div>
        )}

        <div className="text-center">
          <p className="mb-3 text-sm text-slate-600 dark:text-slate-400">
            Point camera at barcode or use barcode scanner device
          </p>
          <Button
            type="button"
            onClick={onClose}
            variant="secondary"
            className="w-full"
          >
            Close Scanner
          </Button>
        </div>
      </div>
    </div>
  );
}
