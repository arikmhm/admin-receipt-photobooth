import React, { useEffect, useRef, useState, useCallback } from "react";
import {
  useNavigate,
  useParams,
  useLocation,
  Navigate,
} from "react-router-dom";
import Webcam from "react-webcam";
import type { Template } from "../../../../types";
import { cn } from "../../../../utils/cn";
import { Button } from "../../../UI/Button";

export const BoothRunner: React.FC = () => {
  const navigate = useNavigate();
  const { templateId } = useParams<{ templateId: string }>();
  const location = useLocation();

  const template = (location.state?.template as Template) ?? null;

  // --- STATE ---
  const [currentSlotIndex, setCurrentSlotIndex] = useState(0);
  const [photos, setPhotos] = useState<Record<string, string>>({});
  const [countdown, setCountdown] = useState<number | null>(null);
  const [isFlash, setIsFlash] = useState(false);
  const [scale, setScale] = useState(1);

  const webcamRef = useRef<Webcam>(null);
  const activeSlot = template?.slots[currentSlotIndex];

  // 1. Scale Logic (Booth Mode)
  useEffect(() => {
    if (!template) return;
    const handleResize = () => {
      const targetHeight = window.innerHeight * 0.95;
      const targetWidth = window.innerWidth * 0.95;
      const scaleH = targetHeight / template.height;
      const scaleW = targetWidth / template.width;
      setScale(Math.min(scaleH, scaleW));
    };
    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, [template]);

  // 2. Capture Logic
  const capture = useCallback(() => {
    if (!webcamRef.current || !activeSlot || !template) return;

    setIsFlash(true);
    setTimeout(() => setIsFlash(false), 200);

    const imageSrc = webcamRef.current.getScreenshot();
    if (imageSrc) {
      // Simpan foto sementara
      const newPhotos = { ...photos, [activeSlot.id]: imageSrc };
      setPhotos(newPhotos);

      if (currentSlotIndex < template.slots.length - 1) {
        // template is already guarded above
        // Next Slot
        setTimeout(() => {
          setCurrentSlotIndex((prev) => prev + 1);
          setCountdown(3);
        }, 800);
      } else {
        // Finish -> Navigate to result page
        setTimeout(() => {
          navigate(`/result/${templateId}`, {
            state: { template, photos: newPhotos },
          });
        }, 500);
      }
    }
  }, [activeSlot, currentSlotIndex, photos, navigate, templateId, template]);

  // 3. Timer Logic
  useEffect(() => {
    if (countdown === null) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setCountdown(3);
      return;
    }
    if (countdown > 0) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
      return () => clearTimeout(timer);
    } else if (countdown === 0) {
      capture();
      setCountdown(null);
    }
  }, [countdown, capture]);

  // Guard: no template in state → back to dashboard
  if (!template) {
    return <Navigate to="/dashboard" replace />;
  }

  return (
    <div className="relative flex flex-col items-center justify-center h-screen overflow-hidden bg-black">
      {/* FLASH OVERLAY */}
      <div
        className={cn(
          "absolute inset-0 bg-white z-50 pointer-events-none transition-opacity duration-200",
          isFlash ? "opacity-100" : "opacity-0",
        )}
      />

      {/* HEADER CONTROLS */}
      <div className="absolute z-40 top-4 left-4">
        <Button
          variant="outline"
          size="sm"
          onClick={() => navigate("/dashboard")}
          className="font-mono text-xs opacity-50 hover:opacity-100"
        >
          ABORT SESSION
        </Button>
      </div>

      {/* MAIN STAGE */}
      <div
        className="relative bg-white transition-all duration-300 ease-out shadow-[0_0_100px_rgba(255,255,255,0.1)]"
        style={{
          width: template.width,
          height: template.height,
          transform: `scale(${scale})`,
        }}
      >
        {/* LAYER 1: BACKGROUND */}
        <img
          src={template.backgroundData}
          className="absolute inset-0 z-10 w-full h-full pointer-events-none opacity-90"
          alt="bg"
        />

        {/* LAYER 2: THE FLOATING EYE (PERSISTENT WEBCAM) */}
        {/* Kamera hanya ada SATU, posisinya yang kita geser-geser (Teleport) */}
        {activeSlot && (
          <div
            className="absolute z-10 bg-black"
            style={{
              left: activeSlot.x,
              top: activeSlot.y,
              width: activeSlot.width,
              height: activeSlot.height,
              // Tidak ada transition = Teleport Instan
            }}
          >
            <Webcam
              ref={webcamRef}
              audio={false}
              screenshotFormat="image/jpeg"
              mirrored={true}
              videoConstraints={{ facingMode: "user", width: 720, height: 720 }}
              style={{ width: "100%", height: "100%", objectFit: "cover" }}
            />
          </div>
        )}

        {/* LAYER 3: OVERLAYS (Results, Ghosts, UI Frame) */}
        {template.slots.map((slot, index) => {
          const isTaken = !!photos[slot.id];
          const isActive = index === currentSlotIndex;

          return (
            <div
              key={slot.id}
              className="absolute z-20 overflow-hidden"
              style={{
                left: slot.x,
                top: slot.y,
                width: slot.width,
                height: slot.height,
                transform: `rotate(${slot.rotation}deg)`,
              }}
            >
              {/* A. HASIL FOTO (Frozen) - Menutup Webcam */}
              {isTaken && (
                <img
                  src={photos[slot.id]}
                  className="object-cover w-full h-full border-2 border-black grayscale brightness-110 contrast-125"
                />
              )}

              {/* B. UI AKTIF (Border & Countdown) - Transparan tengahnya biar Webcam kelihatan */}
              {!isTaken && isActive && (
                <div className="box-border relative w-full h-full border-4 border-red-500">
                  {/* Countdown Big Number */}
                  {countdown !== null && countdown > 0 && (
                    <div className="absolute inset-0 flex items-center justify-center bg-black/20 backdrop-blur-[2px]">
                      <span className="text-white font-black text-[80px] drop-shadow-[0_4px_0_#000]">
                        {countdown}
                      </span>
                    </div>
                  )}
                </div>
              )}

              {/* C. GHOST SLOT (Belum Giliran) - Kotak Putus-putus */}
              {!isTaken && !isActive && (
                <div className="flex items-center justify-center w-full h-full border-2 border-dashed bg-black/40 border-white/50 backdrop-blur-sm">
                  <span className="font-mono text-xl font-bold text-white/80 drop-shadow-md">
                    {index + 1}
                  </span>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* INSTRUCTIONS */}
      <div className="absolute z-40 px-4 py-2 font-mono text-center text-white rounded bottom-8 opacity-80 bg-black/50">
        <p className="font-bold">
          FRAME {currentSlotIndex + 1} / {template.slots.length}
        </p>
      </div>
    </div>
  );
};
