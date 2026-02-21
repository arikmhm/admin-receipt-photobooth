import { useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { authService } from "../services/authService";

export function useAuth() {
  const navigate = useNavigate();

  const logout = useCallback(() => {
    authService.logout();
    navigate("/auth", { replace: true });
  }, [navigate]);

  return {
    isAuthenticated: authService.isAuthenticated(),
    user: authService.getUser() as {
      id: string;
      email: string;
      name: string;
      role: string;
    } | null,
    logout,
  };
}
