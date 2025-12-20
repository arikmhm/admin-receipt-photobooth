/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable react-hooks/set-state-in-effect */
/* eslint-disable @typescript-eslint/no-explicit-any */
import { useState, useEffect } from "react";
import { Dashboard } from "./components/Dashboard/Dashboard";
import { KioskManager } from "./components/Dashboard/KioskManager";
import { CropperModal } from "./components/Creation/CropperModal";
import { FabricCanvas } from "./components/Editor/FabricCanvas";
import { BoothRunner } from "./components/Runner/BoothRunner";
import { ResultPage } from "./components/Runner/ResultPage";
import { AuthPage } from "./components/Auth/AuthPage"; // <--- Import Baru

import { templateService } from "./services/templateService";
import { authService } from "./services/authService"; // <--- Import Baru
import type { Template } from "./types";
import { LogOut, User } from "lucide-react"; // Icon baru
import { useToast } from "./contexts/ToastContext";

// Helper Input
const HiddenFileInput = ({ onChange }: { onChange: (e: React.ChangeEvent<HTMLInputElement>) => void }) => (
  <input
    id="hidden-upload"
    type="file"
    accept="image/*"
    className="hidden"
    onChange={onChange}
  />
);

function App() {

  const { addToast } = useToast();


  // --- AUTH STATE ---
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  
  // Cek login saat aplikasi mulai
  useEffect(() => {
    setIsAuthenticated(authService.isAuthenticated());
  }, []);

  // --- APP STATE ---
  const [view, setView] = useState<"DASHBOARD" | "EDITOR" | "RUNNER" | "RESULT" | "KIOSKS">("DASHBOARD");
  const [activeTemplate, setActiveTemplate] = useState<Template | null>(null);
  const [tempBgImage, setTempBgImage] = useState<string | null>(null);
  const [sessionPhotos, setSessionPhotos] = useState<Record<string, string>>({});

  // --- ACTIONS ---
  
  // 0. Login Handler
  if (!isAuthenticated) {
    return <AuthPage onLoginSuccess={() => setIsAuthenticated(true)} />;
  }

  // 0. Logout Handler
  const handleLogout = () => {
    authService.logout(); // Akan reload page otomatis
  };

  // 1. Create New
  const handleCreateNew = () => {
    document.getElementById("hidden-upload")?.click();
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = () => setTempBgImage(reader.result as string);
      reader.readAsDataURL(file);
    }
    e.target.value = "";
  };

  const handleCropComplete = (base64: string) => {
    const newTemplate: Template = {
        id: "",
        name: "Untitled Template",
        createdAt: Date.now(),
        width: 576,
        height: 0, 
        backgroundData: base64,
        slots: []
    };
    setActiveTemplate(newTemplate);
    setTempBgImage(null);
    setView("EDITOR");
  };

  const handleEdit = (template: Template) => {
    setActiveTemplate(template);
    setView("EDITOR");
  };

  const handleRun = (template: Template) => {
    setActiveTemplate(template);
    setView("RUNNER");
  };

  const handleSaveTemplate = async (updatedTemplate: Template) => {
    try {
        await templateService.save(updatedTemplate);
        addToast("Template saved successfully", "success");
        setActiveTemplate(null);
        setView("DASHBOARD"); 
    } catch (e) {
        addToast("Failed to save template. Check connection.", "error");
    }
  };

  // --- RENDER ---

  // 1. KIOSK MANAGER
  if (view === "KIOSKS") {
      return (
          <>
            <NavBar current="KIOSKS" onChange={setView} onLogout={handleLogout} />
            <KioskManager />
          </>
      )
  }

  // 2. DASHBOARD
  if (view === "DASHBOARD") {
    return (
      <>
        <NavBar current="DASHBOARD" onChange={setView} onLogout={handleLogout} />
        <Dashboard 
          onCreateNew={handleCreateNew}
          onEdit={handleEdit}
          onRun={handleRun}
        />
        <HiddenFileInput onChange={handleFileChange} />
        {tempBgImage && (
            <CropperModal 
              imageSrc={tempBgImage}
              onCancel={() => setTempBgImage(null)}
              onComplete={handleCropComplete}
            />
        )}
      </>
    );
  }

  // 3. EDITOR
  if (view === "EDITOR" && activeTemplate) {
    return (
      <FabricCanvas 
        backgroundBase64={activeTemplate.backgroundData}
        existingTemplate={activeTemplate} 
        onSave={handleSaveTemplate}
        onCancel={() => {
            setActiveTemplate(null);
            setView("DASHBOARD");
        }}
      />
    );
  }

  // 4. RUNNER
  if (view === "RUNNER" && activeTemplate) {
    return (
      <BoothRunner 
        template={activeTemplate} 
        onBack={() => setView("DASHBOARD")}
        onComplete={(photos) => {
            setSessionPhotos(photos);
            setView("RESULT");
        }}
      />
    );
  }

  // 5. RESULT
  if (view === "RESULT" && activeTemplate) {
    return (
      <ResultPage 
        template={activeTemplate}
        photos={sessionPhotos}
        onBack={() => setView("DASHBOARD")}
      />
    );
  }

  return <div>Error State</div>;
}

// UPDATE NAVBAR: Tambah Info User & Logout
const NavBar = ({ current, onChange, onLogout }: { current: string, onChange: (v: any) => void, onLogout: () => void }) => {
    const user = authService.getUser();

    return (
        <nav className="bg-black text-white px-8 py-4 flex flex-col md:flex-row justify-between items-center font-mono text-sm border-b-4 border-blue-600 sticky top-0 z-50">
            {/* LEFT: LINKS */}
            <div className="flex gap-8 mb-4 md:mb-0">
                <button 
                    onClick={() => onChange("DASHBOARD")}
                    className={`hover:text-blue-400 transition-colors ${current === "DASHBOARD" ? "text-blue-400 font-bold underline decoration-4 underline-offset-8" : "text-gray-400"}`}
                >
                    TEMPLATES
                </button>
                <button 
                    onClick={() => onChange("KIOSKS")}
                    className={`hover:text-blue-400 transition-colors ${current === "KIOSKS" ? "text-blue-400 font-bold underline decoration-4 underline-offset-8" : "text-gray-400"}`}
                >
                    DEVICE MANAGER
                </button>
            </div>

            {/* RIGHT: USER INFO */}
            <div className="flex items-center gap-6">
                <div className="flex items-center gap-2 text-gray-400 text-xs">
                    <div className="bg-gray-800 p-1 rounded">
                        <User className="w-3 h-3" />
                    </div>
                    <span>{user?.email || "OWNER"}</span>
                </div>
                <button 
                    onClick={onLogout}
                    className="flex items-center gap-2 bg-red-600 hover:bg-red-700 text-white px-3 py-1 font-bold border border-white transition-all text-xs"
                >
                    <LogOut className="w-3 h-3" /> LOGOUT
                </button>
            </div>
        </nav>
    );
};

export default App;