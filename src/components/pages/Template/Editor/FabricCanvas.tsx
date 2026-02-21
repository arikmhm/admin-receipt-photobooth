/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/ban-ts-comment */
import React, { useEffect, useRef, useState } from "react";
import { useNavigate, useLocation, Navigate } from "react-router-dom";
import { fabric } from "fabric";
import { PlusSquare, Save, Trash2, Undo } from "lucide-react";
import { v4 as uuidv4 } from "uuid";
import type { PhotoSlot, Template } from "../../../../types";
import { templateService } from "../../../../services/templateService";
import { Button } from "../../../UI/Button";
import { useToast } from "../../../../contexts/ToastContext";

// OVERRIDE DEFAULT STYLE FABRIC
fabric.Object.prototype.set({
  transparentCorners: false,
  cornerColor: "#1A73E8",
  cornerStrokeColor: "#1A73E8",
  borderColor: "#1A73E8",
  cornerSize: 8,
  padding: 8,
  borderDashArray: [4, 4],
  strokeWidth: 1,
});

export const FabricCanvas: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { addToast } = useToast();

  // Hooks must be called first!
  const canvasEl = useRef<HTMLCanvasElement>(null);
  const canvasInstance = useRef<fabric.Canvas | null>(null);
  const [templateName, setTemplateName] = useState("Untitled Template");
  const [zoomLevel, setZoomLevel] = useState(1);
  const [isSaving, setIsSaving] = useState(false);

  // Get template from router state (passed by Dashboard)
  const existingTemplate = (location.state?.template as Template) ?? null;

  // Update state after template is confirmed
  const backgroundBase64 = existingTemplate?.backgroundData;

  // Update templateName if template exists
  useEffect(() => {
    if (
      existingTemplate &&
      templateName === "Untitled Template" &&
      existingTemplate.name
    ) {
      setTemplateName(existingTemplate.name);
    }
  }, [existingTemplate, templateName]);

  // INIT CANVAS
  useEffect(() => {
    if (!canvasEl.current || !existingTemplate) return;

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
      const canvasHeight = img.height || existingTemplate.height || 800;
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
            fill: "rgba(26, 115, 232, 0.08)",
            stroke: "#1A73E8",
            strokeWidth: 1,
            strokeDashArray: [6, 4],

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
      const objCenterX = obj.left! + obj.getScaledWidth() / 2;

      // Jika mendekati tengah (toleransi 10px)
      if (Math.abs(objCenterX - centerX) < 10) {
        // Snap ke tengah
        obj.set({ left: centerX - obj.getScaledWidth() / 2 });

        // Visual feedback (Garis bantu merah sementara)
        // Opsional, bisa ditambah nanti
      }
    });

    canvasInstance.current = canvas;

    return () => {
      canvas.dispose();
    };
  }, [backgroundBase64, existingTemplate]);

  // Guard: no template in state → back to dashboard
  if (!existingTemplate) {
    return <Navigate to="/dashboard" replace />;
  }

  // ACTION: ADD SLOT (Baru)
  const addSlot = () => {
    if (!canvasInstance.current) return;

    const rect = new fabric.Rect({
      left: 100,
      top: 100,
      width: 200,
      height: 150,
      fill: "rgba(26, 115, 232, 0.08)",
      stroke: "#1A73E8",
      strokeWidth: 1,
      strokeDashArray: [6, 4],

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
  const handleSave = async () => {
    if (!canvasInstance.current) return;

    // VALIDASI: Cek apakah user sudah menambahkan slot?
    const objects = canvasInstance.current.getObjects();
    // @ts-ignore
    const hasSlots = objects.some((obj) => obj.isSlot);

    if (!hasSlots) {
      addToast("Please add at least 1 Photo Slot!", "error"); // <--- VALIDASI TOAST
      return;
    }

    const slots: PhotoSlot[] = [];
    // const objects = canvasInstance.current.getObjects();

    setIsSaving(true);
    // Sort visual order berdasarkan posisi Y (Atas ke Bawah)
    // Supaya urutan foto (1, 2, 3) logis dari atas ke bawah
    const sortedObjects = objects
      .filter((o: any) => o.isSlot)
      .sort((a, b) => {
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

    const templateData: Template = {
      id: existingTemplate.id ?? "",
      name: templateName,
      createdAt: existingTemplate.createdAt ?? Date.now(),
      width: 576,
      height: canvasInstance.current.getHeight(),
      backgroundData: backgroundBase64,
      slots: slots,
    };

    try {
      await templateService.save(templateData);
      addToast("Template saved successfully", "success");
      navigate("/dashboard");
    } catch (e) {
      addToast("Failed to save template. Check connection.", "error");
      setIsSaving(false);
    }
  };

  return (
    <div className="flex flex-col h-screen overflow-hidden font-sans bg-void">
      {/* 1. TOOLBAR HEADER */}
      <div className="bg-surface border-b border-dim px-5 py-2.5 flex justify-between items-center z-10 shrink-0">
        <div className="flex items-center gap-3">
          <Button
            variant="outline"
            size="sm"
            onClick={() => navigate("/templates")}
          >
            <Undo className="w-3.5 h-3.5" strokeWidth={1.5} />
          </Button>
          <div className="w-px h-5 bg-dim" />
          <input
            value={templateName}
            onChange={(e) => setTemplateName(e.target.value)}
            className="w-48 px-2 py-1 font-mono text-sm transition-colors bg-transparent border border-transparent rounded-md outline-none text-hi focus:border-accent focus:bg-surface-raised md:w-64"
            placeholder="Template Name"
          />
        </div>
        <div className="flex items-center gap-2">
          <div className="items-center hidden gap-2 pr-3 border-r md:flex border-dim">
            <span className="font-mono text-[10px] text-lo">Zoom</span>
            <input
              type="range"
              min="0.5"
              max="2"
              step="0.1"
              value={zoomLevel}
              onChange={(e) => setZoomLevel(parseFloat(e.target.value))}
              className="w-24 accent-accent"
            />
            <span className="font-mono text-[10px] text-lo w-8">
              {Math.round(zoomLevel * 100)}%
            </span>
          </div>
          <Button
            size="sm"
            variant="outline"
            onClick={addSlot}
            className="flex items-center gap-1.5"
          >
            <PlusSquare className="w-3.5 h-3.5" strokeWidth={1.5} />
            <span className="hidden sm:inline">Add Slot</span>
          </Button>
          <Button size="sm" variant="destructive" onClick={deleteSelected}>
            <Trash2 className="w-3.5 h-3.5" strokeWidth={1.5} />
          </Button>
          <Button
            size="sm"
            variant="primary"
            onClick={handleSave}
            disabled={isSaving}
            className="flex items-center gap-1.5"
          >
            <Save className="w-3.5 h-3.5" strokeWidth={1.5} />
            <span className="hidden sm:inline">
              {isSaving ? "Saving…" : "Save"}
            </span>
          </Button>
        </div>
      </div>

      {/* 2. CANVAS WORKBENCH */}
      <div className="flex-1 overflow-auto bg-[#1a1a1a] relative flex items-start justify-center p-10">
        <div
          style={{
            transform: `scale(${zoomLevel})`,
            transformOrigin: "top center",
            transition: "transform 0.1s linear",
          }}
          className="shadow-2xl ring-1 ring-white/10"
        >
          <canvas ref={canvasEl} />
        </div>
      </div>
    </div>
  );
};
