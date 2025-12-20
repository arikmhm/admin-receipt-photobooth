import React from "react";
import { Button } from "../UI/Button";
import { ArrowLeft, Printer, CheckCircle2 } from "lucide-react";
import type { Template } from "../../types";

interface ResultPageProps {
  template: Template;
  photos: Record<string, string>; // Map ID -> Base64
  onBack: () => void;
}

export const ResultPage: React.FC<ResultPageProps> = ({ template, photos, onBack }) => {
  return (
    <div className="fixed inset-0 bg-gray-900 flex flex-col z-50 h-[100dvh]">
      
      {/* A. HEADER (FIXED) */}
      <div className="bg-white border-b-4 border-black p-4 flex justify-between items-center shrink-0 z-10 shadow-neo">
        <div className="flex items-center gap-3 text-green-700">
          <CheckCircle2 className="w-6 h-6" />
          <h1 className="font-mono font-bold text-xl tracking-tight">PRINT PREVIEW</h1>
        </div>
        <div className="font-mono text-xs text-gray-500 hidden sm:block bg-gray-100 px-2 py-1 border border-gray-300">
          {template.width}px THERMAL READY
        </div>
      </div>

      {/* B. PREVIEW AREA (FLEXIBLE & SCROLLABLE) */}
      <div className="flex-1 bg-gray-800 p-4 md:p-8 overflow-hidden flex items-center justify-center relative">
        
        {/* Container Logic: Scale gambar agar muat di sisa ruang (Fit Contain) */}
        <div className="relative shadow-[0px_0px_50px_rgba(0,0,0,0.5)] bg-white border-4 border-gray-700">
          <div 
            style={{
               width: template.width,
               height: template.height,
               // Rumus: Hitung skala berdasarkan tinggi/lebar layar dikurangi header/footer
               transform: `scale(${Math.min(
                  (window.innerHeight - 180) / template.height, 
                  (window.innerWidth - 32) / template.width
               )})`,
               transformOrigin: "center center",
            }}
          >
             {/* 1. Background Template */}
             <img src={template.backgroundData} className="absolute inset-0 w-full h-full" alt="bg" />
             
             {/* 2. Foto-foto Hasil */}
             {template.slots.map((slot) => (
                photos[slot.id] && (
                    <img 
                        key={slot.id}
                        src={photos[slot.id]}
                        className="absolute filter grayscale contrast-125 brightness-110"
                        style={{
                            left: slot.x,
                            top: slot.y,
                            width: slot.width,
                            height: slot.height,
                            objectFit: "cover",
                            transform: `rotate(${slot.rotation}deg)`
                        }}
                    />
                )
             ))}
          </div>
        </div>
      </div>

      {/* C. FOOTER ACTIONS (FIXED) */}
      <div className="bg-white border-t-4 border-black p-4 flex gap-4 justify-center shrink-0 z-10 shadow-[0_-4px_10px_rgba(0,0,0,0.1)]">
        <Button onClick={onBack} variant="outline" className="flex items-center gap-2">
          <ArrowLeft className="w-4 h-4" /> NEW SESSION
        </Button>
        <Button onClick={() => window.print()} variant="primary" className="flex items-center gap-2 w-40 justify-center">
          <Printer className="w-4 h-4" /> PRINT
        </Button>
      </div>
    </div>
  );
};