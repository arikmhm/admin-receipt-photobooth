import {
  createBrowserRouter,
  RouterProvider,
  Navigate,
} from "react-router-dom";
import { DashboardPage } from "./components/pages/Dashboard/DashboardPage";
import { KioskManager } from "./components/pages/Kiosk/KioskManager";
import { AuthPage } from "./components/pages/Auth/AuthPage";
import { ProtectedRoute } from "./components/UI/ProtectedRoute";
import { MainLayout } from "./components/UI/MainLayout";
import { TemplatePage } from "./components/pages/Template/Template";
import { FabricCanvas } from "./components/pages/Template/Editor/FabricCanvas";
import { BoothRunner } from "./components/pages/Template/Runner/BoothRunner";
import { ResultPage } from "./components/pages/Template/Runner/ResultPage";

const router = createBrowserRouter([
  // Public route
  {
    path: "/auth",
    element: <AuthPage />,
  },

  // Protected routes
  {
    path: "/",
    element: <ProtectedRoute />,
    children: [
      // Index redirect
      {
        index: true,
        element: <Navigate to="/dashboard" replace />,
      },

      // Routes with NavBar
      {
        element: <MainLayout />,
        children: [
          { path: "dashboard", element: <DashboardPage /> },
          { path: "templates", element: <TemplatePage /> },
          { path: "kiosks", element: <KioskManager /> },
        ],
      },

      // Full-screen routes (no NavBar)
      { path: "editor/:templateId", element: <FabricCanvas /> },
      { path: "runner/:templateId", element: <BoothRunner /> },
      { path: "result/:templateId", element: <ResultPage /> },
    ],
  },

  // Catch-all
  {
    path: "*",
    element: <Navigate to="/" replace />,
  },
]);

function App() {
  return <RouterProvider router={router} />;
}

export default App;
