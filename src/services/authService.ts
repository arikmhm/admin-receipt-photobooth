// src/services/authService.ts

const API_URL = import.meta.env.VITE_API_URL || "https://receipt-photobooth-api.vercel.app/api/v1";
console.log("URL API ADALAH:", API_URL);

export interface AuthResponse {
  token: string;
  user: {
    id: string;
    email: string;
    name: string;
    role: string;
  };
}

export const authService = {
  
  // 1. LOGIN
  login: async (email: string, password: string): Promise<AuthResponse> => {
    try {
      const res = await fetch(`${API_URL}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      });

      const json = await res.json();
      if (!json.success) throw new Error(json.message || "Login Failed");

      // Simpan ke Storage
      localStorage.setItem("token", json.data.token);
      localStorage.setItem("user", JSON.stringify(json.data.user));

      return json.data;
    } catch (error) {
      console.error("Login Error:", error);
      throw error;
    }
  },

  // 2. REGISTER
  register: async (email: string, password: string, name: string): Promise<void> => {
    try {
      const res = await fetch(`${API_URL}/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password, name, role: 'studio_owner' })
      });

      const json = await res.json();
      if (!json.success) throw new Error(json.message || "Register Failed");
      
    } catch (error) {
      console.error("Register Error:", error);
      throw error;
    }
  },

  // 3. LOGOUT
  logout: () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    window.location.reload(); // Hard reload untuk membersihkan state
  },

  // 4. CHECK AUTH
  isAuthenticated: (): boolean => {
    return !!localStorage.getItem("token");
  },

  // 5. GET USER
  getUser: () => {
    const userStr = localStorage.getItem("user");
    return userStr ? JSON.parse(userStr) : null;
  }
};