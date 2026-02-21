import { useNavigate, Navigate } from "react-router-dom";
import { Button } from "../../UI/Button";
import { Input } from "../../UI/Input";
import { authService } from "../../../services/authService";
import { ArrowRight, Lock } from "lucide-react";
import { useToast } from "../../../contexts/ToastContext";
import { useState } from "react";

export const AuthPage: React.FC = () => {
  const navigate = useNavigate();
  const { addToast } = useToast();
  const [isLoginMode, setIsLoginMode] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");

  if (authService.isAuthenticated()) {
    return <Navigate to="/dashboard" replace />;
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);

    try {
      if (isLoginMode) {
        await authService.login(email, password);
        addToast("Welcome back, Owner!", "success");
        navigate("/dashboard", { replace: true });
      } else {
        await authService.register(email, password, name);
        addToast("Account created! Please Login.", "success");
        setIsLoginMode(true);
        setError(null);
      }
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "Authentication Failed";
      addToast(errorMessage, "error");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen font-sans bg-void">
      {/* LEFT SIDE: BRANDING */}
      <div className="flex-col justify-between hidden w-1/2 p-12 border-r lg:flex bg-surface border-dim">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-2 mb-10 ">
            <span className="text-xl font-bold tracking-widest text-hi">
              MEMOIR.
            </span>
          </div>
          <h1 className="mb-5 text-5xl font-semibold leading-tight text-hi">
            The digital
            <br />
            <span className="text-accent">cash register.</span>
          </h1>
          <p className="max-w-md font-mono text-sm leading-relaxed text-lo">
            Advanced receipt photobooth management system. Control templates,
            devices, and pricing in one utilitarian dashboard.
          </p>
        </div>
        <div className="font-mono text-xs text-lo/50">
          © 2025 MEMOIR STUDIO SYSTEM v1.0
        </div>
      </div>

      {/* RIGHT SIDE: FORM */}
      <div className="flex items-center justify-center w-full p-8 lg:w-1/2">
        <div className="w-full max-w-sm">
          <div className="p-8 border bg-surface border-dim rounded-xl">
            {/* Form Header */}
            <div className="mb-7">
              <h2 className="text-xl font-semibold text-hi">
                {isLoginMode ? "Sign in" : "Create account"}
              </h2>
              <p className="mt-1 font-mono text-xs text-lo">
                {isLoginMode
                  ? "Enter your credentials to access the dashboard"
                  : "Create a new studio owner account"}
              </p>
            </div>

            {error && (
              <div className="flex items-center gap-2 p-3 mb-5 font-mono text-xs border rounded-md bg-err/10 border-err/30 text-err">
                <Lock className="w-3.5 h-3.5 shrink-0" strokeWidth={1.5} />
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              {!isLoginMode && (
                <div>
                  <label className="block text-xs font-medium mb-1.5 text-lo">
                    Studio Name
                  </label>
                  <Input
                    placeholder="e.g. Mono Studio"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    required
                  />
                </div>
              )}

              <div>
                <label className="block text-xs font-medium mb-1.5 text-lo">
                  Email Address
                </label>
                <Input
                  type="email"
                  placeholder="admin@studio.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-medium mb-1.5 text-lo">
                  Password
                </label>
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
                className="w-full mt-2"
                disabled={isLoading}
              >
                {isLoading
                  ? "Processing…"
                  : isLoginMode
                    ? "Sign In"
                    : "Create Account"}
                {!isLoading && (
                  <ArrowRight className="w-3.5 h-3.5" strokeWidth={1.5} />
                )}
              </Button>
            </form>

            <div className="pt-5 mt-6 font-mono text-xs text-center border-t border-dim text-lo">
              {isLoginMode ? (
                <p>
                  New here?{" "}
                  <button
                    onClick={() => setIsLoginMode(false)}
                    className="text-accent hover:text-[#1557B0] transition-colors"
                  >
                    Create account
                  </button>
                </p>
              ) : (
                <p>
                  Already have access?{" "}
                  <button
                    onClick={() => setIsLoginMode(true)}
                    className="text-accent hover:text-[#1557B0] transition-colors"
                  >
                    Sign in
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
