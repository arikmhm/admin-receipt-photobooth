/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/ban-ts-comment */
import React, { useEffect, useRef, useState } from "react";
import { fabric } from "fabric";
import { Button } from "../UI/Button";
import { PlusSquare, Save, Trash2, Undo } from "lucide-react";
import { v4 as uuidv4 } from "uuid";
import type { PhotoSlot, Template } from "../../types";
import { useToast } from "../../contexts/ToastContext";

// OVERRIDE DEFAULT STYLE FABRIC (NEO-BRUTALIST)
fabric.Object.prototype.set({
  transparentCorners: false,
  cornerColor: "#000000",      
  cornerStrokeColor: "#000000",
  borderColor: "#000000",      
  cornerSize: 12,              
  padding: 10,
  borderDashArray: [6, 6],     
  strokeWidth: 2,
});

interface FabricCanvasProps {
  backgroundBase64: string;
  existingTemplate?: Template | null; 
  onSave: (template: Template) => Promise<void>;
  onCancel: () => void;
}

export const FabricCanvas: React.FC<FabricCanvasProps> = ({
  backgroundBase64,
  existingTemplate,
  onSave,
  onCancel,
}) => {

  const { addToast } = useToast();
  const canvasEl = useRef<HTMLCanvasElement>(null);
  const canvasInstance = useRef<fabric.Canvas | null>(null);
  
  const [templateName, setTemplateName] = useState(existingTemplate?.name || "Untitled Template");
  const [zoomLevel, setZoomLevel] = useState(1); 
  const [isSaving, setIsSaving] = useState(false);

  // INIT CANVAS
  useEffect(() => {
    if (!canvasEl.current) return;

    // 1. Setup Canvas 576px
    const canvas = new fabric.Canvas(canvasEl.current, {
      width: 576,
      height: 800, 
      backgroundColor: "#f3f4f6",
      selectionColor: "rgba(0,0,0,0.1)",
      selectionBorderColor: "black",
      selectionLineWidth: 2,
      preserveObjectStacking: true, 
    });

    // 2. Load Background Image
    fabric.Image.fromURL(backgroundBase64, (img) => {
      // Logic tinggi canvas
      const canvasHeight = img.height || existingTemplate?.height || 800;
      canvas.setHeight(canvasHeight);
      
      img.set({
        selectable: false,
        evented: false,
        left: 0,
        top: 0,
      });
      
      canvas.add(img);
      canvas.sendToBack(img);

      // 3. REHYDRATE SLOTS (Existing Data)
      if (existingTemplate && existingTemplate.slots.length > 0) {
        existingTemplate.slots.forEach((slot) => {
            const rect = new fabric.Rect({
                left: slot.x,
                top: slot.y,
                width: slot.width,
                height: slot.height,
                angle: slot.rotation,
                fill: "rgba(255, 255, 255, 0.5)",
                stroke: "black",
                strokeWidth: 1,
                strokeDashArray: [10, 5],
                
                // --- FIX 1: AGAR GARIS TIDAK MELAR ---
                strokeUniform: true, 
                noScaleCache: false,
            });

            // @ts-ignore
            rect.id = slot.id;
            // @ts-ignore
            rect.isSlot = true;

            canvas.add(rect);
        });
      }

      canvas.renderAll();
    });

    // 4. Snapping Logic (Agar menempel ke tengah)
    canvas.on("object:moving", (options) => {
      const obj = options.target;
      if (!obj) return;
      
      const canvasWidth = canvas.getWidth();
      const centerX = canvasWidth / 2;
      
      // Hitung titik tengah objek saat ini
      const objCenterX = obj.left! + (obj.getScaledWidth()) / 2;

      // Jika mendekati tengah (toleransi 10px)
      if (Math.abs(objCenterX - centerX) < 10) {
        // Snap ke tengah
        obj.set({ left: centerX - (obj.getScaledWidth()) / 2 });
        
        // Visual feedback (Garis bantu merah sementara)
        // Opsional, bisa ditambah nanti
      }
    });

    canvasInstance.current = canvas;

    return () => {
      canvas.dispose();
    };
  }, [backgroundBase64]); 


  // ACTION: ADD SLOT (Baru)
  const addSlot = () => {
    if (!canvasInstance.current) return;

    const rect = new fabric.Rect({
      left: 100,
      top: 100,
      width: 200,
      height: 150,
      fill: "rgba(255, 255, 255, 0.5)",
      stroke: "black",
      strokeWidth: 3,
      strokeDashArray: [10, 5],
      
      // --- FIX 2: AGAR GARIS TIDAK MELAR (NEW SLOT) ---
      strokeUniform: true,
      noScaleCache: false,
    });

    // @ts-ignore
    rect.id = uuidv4(); 
    // @ts-ignore
    rect.isSlot = true;

    canvasInstance.current.add(rect);
    canvasInstance.current.setActiveObject(rect);
  };

  // ACTION: DELETE SELECTED
  const deleteSelected = () => {
    const active = canvasInstance.current?.getActiveObject();
    if (active) {
      canvasInstance.current?.remove(active);
    }
  };

  // ACTION: SAVE
  const handleSave = async() => {
    if (!canvasInstance.current) return;

    // VALIDASI: Cek apakah user sudah menambahkan slot?
    const objects = canvasInstance.current.getObjects();
    // @ts-ignore
    const hasSlots = objects.some(obj => obj.isSlot);

    if (!hasSlots) {
        addToast("Please add at least 1 Photo Slot!", "error"); // <--- VALIDASI TOAST
        return;
    }
    
    
    const slots: PhotoSlot[] = [];
    // const objects = canvasInstance.current.getObjects();
    
    setIsSaving(true);
    // Sort visual order berdasarkan posisi Y (Atas ke Bawah)
    // Supaya urutan foto (1, 2, 3) logis dari atas ke bawah
    const sortedObjects = objects.filter((o: any) => o.isSlot).sort((a, b) => {
        return (a.top || 0) - (b.top || 0);
    });

    let sequence = 1;
    sortedObjects.forEach((obj) => {
        slots.push({
          // @ts-ignore
          id: obj.id || uuidv4(),
          sequence: sequence++,
          x: Math.round(obj.left || 0),
          y: Math.round(obj.top || 0),
          // Gunakan getScaledWidth agar dimensi akurat setelah resize
          width: Math.round(obj.getScaledWidth()), 
          height: Math.round(obj.getScaledHeight()), 
          rotation: Math.round(obj.angle || 0),
        });
    });

    const templateId = existingTemplate?.id || "";

    const templateData: Template = {
      id: templateId, 
      name: templateName,
      createdAt: existingTemplate?.createdAt || Date.now(),
      width: 576,
      height: canvasInstance.current.getHeight(),
      backgroundData: backgroundBase64,
      slots: slots,
    };

    try {
        await onSave(templateData); // Tunggu App.tsx selesai
    } catch (e) {
        setIsSaving(false); // Jika error, matikan loading biar bisa klik lagi
    }
  };

  return (
    <div className="flex flex-col h-screen overflow-hidden bg-gray-100">
      {/* 1. TOOLBAR HEADER */}
      <div className="bg-white border-b-4 border-black p-4 flex justify-between items-center z-10 shadow-neo">
        <div className="flex gap-4 items-center">
            <Button variant="outline" size="sm" onClick={onCancel}>
                <Undo className="w-4 h-4 mr-2 inline" /> BACK
            </Button>
            <input 
                value={templateName}
                onChange={(e) => setTemplateName(e.target.value)}
                className="font-mono font-bold text-lg border-b-2 border-black focus:outline-none focus:bg-yellow-100 px-2 w-48 md:w-auto"
                placeholder="Template Name"
            />
        </div>
        <div className="flex gap-2">
            <div className="hidden md:flex items-center gap-2 mr-4 border-r-2 border-gray-300 pr-4">
                <span className="font-mono text-xs font-bold">ZOOM:</span>
                <input 
                    type="range" min="0.5" max="2" step="0.1" 
                    value={zoomLevel} 
                    onChange={(e) => setZoomLevel(parseFloat(e.target.value))}
                    className="accent-black"
                />
            </div>
            <Button onClick={addSlot} className="flex items-center gap-2 px-3">
                <PlusSquare className="w-4 h-4" /> <span className="hidden sm:inline">ADD SLOT</span>
            </Button>
            <Button variant="destructive" onClick={deleteSelected} className="px-3">
                <Trash2 className="w-4 h-4" />
            </Button>
            <Button 
            variant="accent" 
            onClick={handleSave} 
            disabled={isSaving} // Disable saat loading
            className="flex items-center gap-2 px-4"
        >
            {isSaving ? (
                <>SAVING...</>
            ) : (
                <>
                   <Save className="w-4 h-4" /> <span className="hidden sm:inline">SAVE</span>
                </>
            )}
        </Button>
        </div>
      </div>

      {/* 2. CANVAS WORKBENCH */}
      <div className="flex-1 overflow-auto bg-gray-800 relative flex items-start justify-center p-10 cursor-move-bg">
        <div 
            style={{ 
                transform: `scale(${zoomLevel})`, 
                transformOrigin: "top center",
                transition: "transform 0.1s linear" 
            }}
            className="shadow-[20px_20px_0px_0px_rgba(0,0,0,0.5)] border-4 border-black bg-white"
        >
            <canvas ref={canvasEl} />
        </div>
      </div>
    </div>
  );
};