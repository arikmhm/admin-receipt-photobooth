/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useState } from "react";
import { Button } from "../UI/Button";
import { Input } from "../UI/Input";
import { authService } from "../../services/authService";
import { Receipt, ArrowRight, Lock } from "lucide-react";
import { useToast } from "../../contexts/ToastContext";

interface AuthPageProps {
  onLoginSuccess: () => void;
}

export const AuthPage: React.FC<AuthPageProps> = ({ onLoginSuccess }) => {
  const { addToast } = useToast();
  const [isLoginMode, setIsLoginMode] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Form State
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState(""); // Hanya untuk register

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);

    try {
      if (isLoginMode) {
        // LOGIN FLOW
        await authService.login(email, password);
        addToast("Welcome back, Owner!", "success");
        onLoginSuccess();
      } else {
        // REGISTER FLOW
        await authService.register(email, password, name);
        addToast("Account created! Please Login.", "success");
        setIsLoginMode(true); // Pindah ke login setelah register
        setError(null);
      }
    } catch (err: any) {
        addToast(err.message || "Authentication Failed", "error");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex font-sans">
      
      {/* 1. LEFT SIDE: BRANDING (Hidden on Mobile) */}
      <div className="hidden lg:flex w-1/2 bg-black text-white flex-col justify-between p-12 relative overflow-hidden">
        {/* Background Pattern */}
        <div className="absolute inset-0 opacity-20" 
             style={{ backgroundImage: 'radial-gradient(#ffffff 1px, transparent 1px)', backgroundSize: '20px 20px' }}>
        </div>
        
        <div className="z-10">
          <div className="border-2 border-white inline-flex p-2 mb-6">
            <Receipt className="w-10 h-10" />
          </div>
          <h1 className="text-6xl font-black leading-tight mb-4">
            THE DIGITAL <br/>
            <span className="text-blue-500">CASH REGISTER.</span>
          </h1>
          <p className="font-mono text-gray-400 max-w-md">
            Advanced receipt photobooth management system. 
            Control templates, devices, and pricing in one utilitarian dashboard.
          </p>
        </div>

        <div className="z-10 font-mono text-sm text-gray-500">
          © 2025 STUDIO SYSTEM v1.0
        </div>
      </div>

      {/* 2. RIGHT SIDE: FORM */}
      <div className="w-full lg:w-1/2 bg-gray-100 flex items-center justify-center p-8 bg-dot-pattern">
        
        <div className="max-w-md w-full">
          <div className="bg-white border-4 border-black shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] p-8">
            
            {/* Form Header */}
            <div className="mb-8 text-center">
              <h2 className="text-3xl font-black uppercase">
                {isLoginMode ? "Admin Access" : "Join System"}
              </h2>
              <p className="font-mono text-sm text-gray-500 mt-2">
                {isLoginMode ? "Enter credentials to unlock dashboard" : "Create new studio owner account"}
              </p>
            </div>

            {/* Error Message */}
            {error && (
              <div className="bg-red-100 border-2 border-red-500 text-red-700 p-3 mb-6 font-mono text-sm font-bold flex items-center gap-2">
                 <Lock className="w-4 h-4" /> {error.toUpperCase()}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              
              {!isLoginMode && (
                <div>
                    <label className="block text-xs font-bold mb-1 uppercase">Studio Name</label>
                    <Input 
                        placeholder="Ex: Mono Studio" 
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        required
                    />
                </div>
              )}

              <div>
                <label className="block text-xs font-bold mb-1 uppercase">Email Address</label>
                <Input 
                    type="email" 
                    placeholder="admin@studio.com" 
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                />
              </div>

              <div>
                <label className="block text-xs font-bold mb-1 uppercase">Password</label>
                <Input 
                    type="password" 
                    placeholder="••••••••" 
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                />
              </div>

              <Button 
                type="submit" 
                className="w-full mt-6 flex justify-center items-center gap-2"
                disabled={isLoading}
              >
                {isLoading ? "PROCESSING..." : (
                    <>
                        {isLoginMode ? "ENTER DASHBOARD" : "CREATE ACCOUNT"} 
                        <ArrowRight className="w-4 h-4" />
                    </>
                )}
              </Button>
            </form>

            {/* Footer Toggle */}
            <div className="mt-6 pt-6 border-t-2 border-dashed border-gray-300 text-center font-mono text-sm">
                {isLoginMode ? (
                    <p>
                        New device owner?{" "}
                        <button onClick={() => setIsLoginMode(false)} className="font-bold underline text-blue-600 hover:text-black">
                            Register Here
                        </button>
                    </p>
                ) : (
                    <p>
                        Already have access?{" "}
                        <button onClick={() => setIsLoginMode(true)} className="font-bold underline text-blue-600 hover:text-black">
                            Back to Login
                        </button>
                    </p>
                )}
            </div>

          </div>
        </div>

      </div>
    </div>
  );
};