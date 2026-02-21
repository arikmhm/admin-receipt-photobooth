import type { Kiosk, CreateKioskPayload, UpdateKioskPayload } from "../types";

// Ganti URL sesuai environment
// const API_URL = import.meta.env.VITE_API_URL || "http://localhost:3000/api/v1/kiosks";
const API_URL = import.meta.env.VITE_API_URL;

// Helper Auth Header (Pola sama seperti templateService)
const getHeaders = () => {
  // Mengambil token dari localStorage (sesuai login nanti)
  // Atau Anda bisa hardcode sementara seperti di templateService jika belum ada login
  const token = localStorage.getItem("token") || "";

  return {
    "Content-Type": "application/json",
    Authorization: `Bearer ${token}`,
  };
};

export const kioskService = {
  // 1. GET ALL
  getAll: async (): Promise<Kiosk[]> => {
    try {
      const res = await fetch(`${API_URL}/kiosks`, {
        method: "GET",
        headers: getHeaders(),
      });

      const json = await res.json();

      if (!json.success) throw new Error(json.message);

      // Backend mengembalikan array di json.data
      return json.data;
    } catch (error) {
      console.error("Fetch Kiosks Error:", error);
      return []; // Return array kosong agar UI tidak crash
    }
  },

  // 2. CREATE
  create: async (data: CreateKioskPayload): Promise<Kiosk> => {
    try {
      const res = await fetch(`${API_URL}/kiosks`, {
        method: "POST",
        headers: getHeaders(),
        body: JSON.stringify(data),
      });

      const json = await res.json();
      if (!json.success) throw new Error(json.message || "Gagal membuat kiosk");

      return json.data;
    } catch (error) {
      console.error("Create Kiosk Error:", error);
      throw error; // Lempar error agar UI bisa menampilkan alert
    }
  },

  // 3. UPDATE
  update: async (id: string, data: UpdateKioskPayload): Promise<Kiosk> => {
    try {
      const res = await fetch(`${API_URL}/kiosks/${id}`, {
        method: "PUT",
        headers: getHeaders(),
        body: JSON.stringify(data),
      });

      const json = await res.json();
      if (!json.success) throw new Error(json.message || "Gagal update kiosk");

      return json.data;
    } catch (error) {
      console.error("Update Kiosk Error:", error);
      throw error;
    }
  },

  // 4. DELETE
  delete: async (id: string): Promise<void> => {
    try {
      const res = await fetch(`${API_URL}/kiosks/${id}`, {
        method: "DELETE",
        headers: getHeaders(),
      });

      const json = await res.json();
      if (!json.success)
        throw new Error(json.message || "Gagal menghapus kiosk");
    } catch (error) {
      console.error("Delete Kiosk Error:", error);
      throw error;
    }
  },

  // 5. UNPAIR (Custom Action)
  unpair: async (id: string): Promise<{ newPairingCode: string }> => {
    try {
      const res = await fetch(`${API_URL}/kiosks/${id}/unpair`, {
        method: "POST",
        headers: getHeaders(),
      });

      const json = await res.json();
      if (!json.success) throw new Error(json.message || "Gagal unpair device");

      return json.data;
    } catch (error) {
      console.error("Unpair Kiosk Error:", error);
      throw error;
    }
  },
};
