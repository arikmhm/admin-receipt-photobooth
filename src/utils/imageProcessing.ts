// src/utils/imageProcessing.ts

export const THERMAL_WIDTH = 576;

/**
 * 1. Resize & Convert to Base64 (Untuk Preview di Editor)
 */
export const processImageForThermal = (imageFileOrBlob: Blob): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(imageFileOrBlob);
    
    reader.onload = (event) => {
      const img = new Image();
      img.src = event.target?.result as string;
      
      img.onload = () => {
        // Resize Paksa ke lebar 576px
        const scaleFactor = THERMAL_WIDTH / img.width;
        const newHeight = img.height * scaleFactor;

        const canvas = document.createElement("canvas");
        canvas.width = THERMAL_WIDTH;
        canvas.height = newHeight;
        
        const ctx = canvas.getContext("2d");
        if (!ctx) { reject("Canvas error"); return; }

        ctx.imageSmoothingEnabled = true;
        ctx.imageSmoothingQuality = "high";
        ctx.drawImage(img, 0, 0, THERMAL_WIDTH, newHeight);

        // Output JPEG quality 0.9
        resolve(canvas.toDataURL("image/jpeg", 0.9));
      };
      img.onerror = reject;
    };
    reader.onerror = reject;
  });
};

/**
 * 2. Helper Convert Base64 -> Blob (Untuk Upload ke Backend)
 * WAJIB ADA untuk service upload.
 */
export const base64ToBlob = (base64: string, mimeType: string = 'image/jpeg'): Blob => {
  // Split data:image/jpeg;base64,....
  const arr = base64.split(',');
  // Decode base64 string
  const byteString = atob(arr[1]);
  const ab = new ArrayBuffer(byteString.length);
  const ia = new Uint8Array(ab);

  for (let i = 0; i < byteString.length; i++) {
    ia[i] = byteString.charCodeAt(i);
  }

  return new Blob([ab], { type: mimeType });
};