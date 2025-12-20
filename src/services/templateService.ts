// src/services/templateService.ts
import type { Template } from "../types";
import { base64ToBlob } from "../utils/imageProcessing";



// const API_URL = import.meta.env.VITE_API_URL || "https://receipt-photobooth-api.vercel.app/api/v1";
const API_URL = import.meta.env.VITE_API_URL ;

// Helper Auth Header
const getHeaders = (isMultipart = false) => {
  const token = localStorage.getItem("token") || ""; 
  const headers: HeadersInit = {
    'Authorization': `Bearer ${token}`
  };
  
  if (!isMultipart) {
    headers['Content-Type'] = 'application/json';
  }
  return headers;
};

export const templateService = {
  // 1. UPLOAD IMAGE
  uploadImage: async (base64Data: string): Promise<string> => {
    const blob = base64ToBlob(base64Data);
    const formData = new FormData();
    formData.append('file', blob, 'template-bg.jpg');

    const res = await fetch(`${API_URL}/templates/upload`, {
      method: 'POST',
      headers: getHeaders(true), // Multipart
      body: formData
    });

    const json = await res.json();
    if (!json.success) throw new Error(json.message || "Gagal upload gambar");
    
    return json.data.url; 
  },

  // 2. GET ALL
  getAll: async (): Promise<Template[]> => {
    try {
      const res = await fetch(`${API_URL}/templates`, {
        headers: getHeaders()
      });
      const json = await res.json();
      
      if (!json.success) throw new Error(json.message);

      // Mapping Backend -> Frontend
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      return json.data.map((item: any) => ({
        id: item.id,
        name: item.name,
        createdAt: new Date(item.created_at).getTime(),
        width: item.width,
        height: item.height,
        backgroundData: item.backgroundUrl, // URL dari backend
        slots: item.slots
      }));
    } catch (error) {
      console.error("Fetch Error:", error);
      return [];
    }
  },

  // 3. SAVE (Create / Update)
  save: async (template: Template): Promise<void> => {
    try {
      let finalBackgroundUrl = template.backgroundData;

      // Cek apakah user mengganti background (Base64)
      if (template.backgroundData.startsWith("data:image")) {
        console.log("Uploading new background...");
        finalBackgroundUrl = await templateService.uploadImage(template.backgroundData);
      }

      const payload = {
        name: template.name,
        width: 576,
        height: Math.round(template.height),
        backgroundUrl: finalBackgroundUrl,
        slots: template.slots.map(s => ({
          sequence: s.sequence,
          x: Math.round(s.x),
          y: Math.round(s.y),
          width: Math.round(s.width),
          height: Math.round(s.height),
          rotation: Math.round(s.rotation || 0)
        }))
      };

      const isEdit = template.id && template.id.trim() !== "";
      const url = isEdit ? `${API_URL}/templates/${template.id}` : `${API_URL}/templates`;
      const method = isEdit ? 'PUT' : 'POST';

      const res = await fetch(url, {
        method,
        headers: getHeaders(),
        body: JSON.stringify(payload)
      });

      const json = await res.json();
      if (!json.success) throw new Error(json.message || "Gagal menyimpan template");

    } catch (error) {
      console.error("Save Failed:", error);
      throw error;
    }
  },
  
  // 4. DELETE
  delete: async (id: string): Promise<void> => {
      const res = await fetch(`${API_URL}/templates/${id}`, {
        method: 'DELETE',
        headers: getHeaders()
      });
      const json = await res.json();
      if (!json.success) throw new Error(json.message);
  }
};