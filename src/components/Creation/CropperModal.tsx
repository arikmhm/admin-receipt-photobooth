import React, { useRef, useState } from "react";
import "cropperjs/dist/cropper.css"; 
import { Button } from "../UI/Button";
import { processImageForThermal } from "../../utils/imageProcessing";
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
      }, 'image/jpeg');
    } catch (error) {
      console.error("Gagal crop:", error);
      setIsProcessing(false);
    }
  };

  return (
    // Overlay Hitam Pekat (z-50)
    <div className="fixed inset-0 bg-black/90 z-50 flex flex-col animate-in fade-in duration-200">
      
      {/* 1. Sticky Header */}
      <div className="bg-white border-b-4 border-black p-4 flex justify-between items-center shrink-0">
        <div>
          <h2 className="text-xl font-black uppercase">CROP BACKGROUND</h2>
          <p className="font-mono text-xs text-gray-500">Scroll to view full image. Drag corners to crop.</p>
        </div>
        <div className="font-mono text-sm bg-gray-200 px-2 py-1 border border-black hidden sm:block">
           Target Width: 576px
        </div>
      </div>

      {/* 2. Scrollable Cropper Area */}
      {/* Kita set background 'pattern' agar terlihat transparan */}
      <div className="flex-1 bg-gray-800 overflow-hidden relative flex items-center justify-center p-4">
        <Cropper
          src={imageSrc}
          style={{ height: "85vh", width: "100%" }}
          initialAspectRatio={576 / 800} // Estimasi rasio awal struk
          aspectRatio={NaN} // Bebas (Free crop vertikal)
          guides={true}
          viewMode={1} // Restrict crop box to canvas
          dragMode="move" // User bisa geser gambar
          ref={cropperRef}
          background={false} // Matikan grid default cropperjs biar bersih
          className="max-w-4xl mx-auto border-2 border-dashed border-white/50"
        />
      </div>

      {/* 3. Sticky Footer Actions */}
      <div className="bg-white border-t-4 border-black p-4 flex gap-4 justify-end shrink-0">
        <Button variant="destructive" onClick={onCancel} disabled={isProcessing}>
          CANCEL
        </Button>
        <Button 
            variant="primary" 
            className="bg-green-600 border-black text-white hover:bg-green-700" 
            onClick={handleCrop}
            disabled={isProcessing}
        >
          {isProcessing ? "PROCESSING..." : "CONFIRM & RESIZE"}
        </Button>
      </div>
    </div>
  );
};