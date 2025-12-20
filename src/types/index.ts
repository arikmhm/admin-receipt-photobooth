export interface PhotoSlot {
  id: string;
  sequence: number;
  x: number;
  y: number;
  width: number;
  height: number;
  rotation: number;
}

export interface Template {
  id: string;
  name: string;
  createdAt: number;
  width: 576; 
  height: number;
  backgroundData: string; 
  slots: PhotoSlot[];
}

// --- TAMBAHAN BARU: KIOSK TYPES ---
export interface Kiosk {
  id: string;
  ownerId: string;
  name: string;
  
  // Auth & Status
  pairingCode: string | null; 
  deviceToken: string | null;
  isActive: boolean;          
  
  // Pricing (Diterima sebagai number dari API hasil parsing)
  priceBase: number; 
  priceExtraPrint: number;
  priceDigitalCopy: number;
  
  createdAt?: string;
  updatedAt?: string;
}

// DTO (Data Transfer Object) untuk Input
export interface CreateKioskPayload {
  name: string;
  priceBase: number;
  priceExtraPrint: number;
  priceDigitalCopy: number;
}

export interface UpdateKioskPayload {
  name?: string;
  priceBase?: number;
  priceExtraPrint?: number;
  priceDigitalCopy?: number;
}