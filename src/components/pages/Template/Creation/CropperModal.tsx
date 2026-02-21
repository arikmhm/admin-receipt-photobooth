import React, { useRef, useState } from "react";
import "cropperjs/dist/cropper.css";
import { Button } from "../../../UI/Button";
import { processImageForThermal } from "../../../../utils/imageProcessing";
import { Cropper, type ReactCropperElement } from "react-cropper";

interface CropperModalProps {
  imageSrc: string | null;
  onCancel: () => void;
  onComplete: (base64Result: string) => void;
}

export const CropperModal: React.FC<CropperModalProps> = ({
  imageSrc,
  onCancel,
  onComplete,
}) => {
  const cropperRef = useRef<ReactCropperElement>(null);
  const [isProcessing, setIsProcessing] = useState(false);

  if (!imageSrc) return null;

  const handleCrop = async () => {
    const cropper = cropperRef.current?.cropper;
    if (!cropper) return;

    setIsProcessing(true);
    try {
      // 1. Ambil hasil crop dalam resolusi ASLI (High Quality)
      // Kita tidak resize di sini agar crop-nya tajam dulu.
      cropper.getCroppedCanvas().toBlob(async (blob) => {
        if (!blob) return;

        // 2. Lempar ke Utility kita untuk resize ke 576px
        const finalBase64 = await processImageForThermal(blob);

        onComplete(finalBase64);
        setIsProcessing(false);
      }, "image/jpeg");
    } catch (error) {
      console.error("Gagal crop:", error);
      setIsProcessing(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex flex-col">
      {/* 1. Header */}
      <div className="bg-surface border-b border-dim px-6 py-3.5 flex justify-between items-center shrink-0">
        <div>
          <h2 className="text-sm font-semibold text-hi">Crop Background</h2>
          <p className="font-mono text-[11px] text-lo mt-0.5">
            Drag corners to crop · scroll to zoom
          </p>
        </div>
        <span className="font-mono text-[10px] text-lo bg-surface-raised border border-dim px-2 py-1 rounded-sm hidden sm:block">
          Target: 576 px
        </span>
      </div>

      {/* 2. Cropper Area */}
      <div
        className="bg-[#1a1a1a] flex items-center justify-center px-6 py-4 overflow-hidden"
        style={{ height: "80vh" }}
      >
        <Cropper
          src={imageSrc}
          style={{ height: "80%", width: "100%", maxWidth: "960px" }}
          initialAspectRatio={576 / 800}
          aspectRatio={NaN}
          guides={true}
          viewMode={1}
          dragMode="none"
          ref={cropperRef}
          background={false}
          className="rounded-sm"
        />
      </div>

      {/* 3. Footer Actions */}
      <div className="bg-surface border-t border-dim px-6 py-3.5 flex gap-2 justify-end shrink-0">
        <Button variant="outline" onClick={onCancel} disabled={isProcessing}>
          Cancel
        </Button>
        <Button variant="primary" onClick={handleCrop} disabled={isProcessing}>
          {isProcessing ? "Processing…" : "Confirm & Resize"}
        </Button>
      </div>
    </div>
  );
};
