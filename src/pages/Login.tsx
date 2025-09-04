import { useState } from "react";
import API from "../lib/axios";
import { Input } from "../components/ui/input";
import { Button } from "../components/ui/button";
import { EyeIcon, EyeOffIcon, Loader2 } from "lucide-react";



export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const getRedirectPath = (role: string) => {
    switch (role) {
      case "super_admin":
        return "/";
      case "admin":
        return "/school";
      case "teacher":
        return "/teacher";
      case "parent":
        return "/parent";
      default:
        return "/unauthorized";
    }
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);

    try {
      const res = await API.post("/login", { email, password });
      const { token, user } = res.data;
      
      if (!token || !user || !user.role) {
        throw new Error("Invalid response from server");
      }

      localStorage.setItem("token", token);
      localStorage.setItem("user", JSON.stringify(user));

      // ✅ Force reload after login to re-trigger UserProvider
      window.location.href = getRedirectPath(user.role);
    } catch (err: any) {
      setError(err.response?.data?.error || "Login failed. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };
  
  return (
    <div className="min-h-svh w-svw grid md:grid-cols-2 bg-gradient-to-b from-secondary/60 via-background to-background overflow-hidden">
      {/* Left Panel - Form */}
      <div className="flex items-center justify-center p-3 sm:p-6">
        <div className="relative w-full max-w-md">
          {/* Gradient border frame */}
          <div className="absolute -inset-0.5 rounded-3xl bg-gradient-to-tr from-sky-400 via-indigo-400 to-emerald-400 opacity-60 blur-lg" aria-hidden="true" />
          <div className="relative rounded-3xl border border-border/60 bg-card/80 backdrop-blur-xl shadow-2xl px-5 py-8 sm:px-8 md:py-10">
            <div className="flex flex-col items-center text-center space-y-2 mb-4">
              <div className="inline-flex items-center gap-2 rounded-full border border-border/60 bg-background/70 px-3 py-1 text-xs text-muted-foreground">
                <span className="size-2 rounded-full bg-primary/70" />
                Welcome back
              </div>
              <div className="flex items-center gap-3">
                <img src="/vite.svg" alt="Logo" className="h-10 w-10 sm:h-12 sm:w-12" />
                <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
                  School Attendance
                </h1>
              </div>
              <p className="text-muted-foreground text-sm sm:text-base">Sign in to continue</p>
            </div>

            <form onSubmit={handleLogin} className="space-y-5 sm:space-y-6">
              <div className="space-y-2">
                <label htmlFor="email" className="block text-xs sm:text-sm font-medium">Email</label>
                <Input
                  id="email"
                  type="email"
                  placeholder="name@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="text-sm sm:text-base"
                />
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <label htmlFor="password" className="block text-xs sm:text-sm font-medium">Password</label>
                  <a href="#" className="text-xs text-primary hover:underline">Forgot password?</a>
                </div>
                <div className="relative">
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    className="pr-10 text-sm sm:text-base"
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="absolute right-0 top-0 h-full w-9 px-0"
                    onClick={() => setShowPassword(!showPassword)}
                    aria-label={showPassword ? "Hide password" : "Show password"}
                  >
                    {showPassword ? <EyeOffIcon className="size-4" /> : <EyeIcon className="size-4" />}
                  </Button>
                </div>
              </div>

              <Button type="submit" disabled={isLoading} className="w-full h-11 text-base font-semibold shadow-md">
                {isLoading ? (
                  <>
                    <Loader2 className="size-4 animate-spin" />
                    Signing in...
                  </>
                ) : (
                  "Sign In"
                )}
              </Button>

              {error && (
                <div className="rounded-md border border-red-200 bg-red-50 p-3 text-sm text-red-700 flex items-center gap-2 animate-shake">
                  <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5 text-red-500" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                  </svg>
                  {error}
                </div>
              )}
            </form>
          </div>
        </div>
      </div>

      {/* Right Panel - Wallpaper */}
      <div className="relative hidden md:block">
        <div className="absolute inset-0 bg-gradient-to-br from-indigo-500 via-sky-400 to-emerald-400" />
        {/* Soft glass overlay */}
        <div className="absolute inset-0 bg-white/10 backdrop-blur-sm" />
        {/* Blurred color orbs */}
        <div className="absolute -top-16 -left-24 h-72 w-72 rounded-full bg-white/20 blur-3xl" />
        <div className="absolute top-24 -right-16 h-80 w-80 rounded-full bg-emerald-200/30 blur-3xl" />
        <div className="absolute bottom-10 left-12 h-64 w-64 rounded-full bg-indigo-200/30 blur-3xl" />
        {/* Content */}
        <div className="relative z-10 flex h-full w-full items-center justify-center p-8">
          <div className="max-w-lg text-white/95 drop-shadow-lg">
            <h2 className="text-3xl lg:text-4xl font-bold leading-tight">
              Smarter attendance. Happier classrooms.
            </h2>
            <p className="mt-3 text-white/90 text-sm lg:text-base">
              Track, analyze, and improve student attendance with an elegant, fast, and secure experience.
            </p>
            <div className="mt-6 grid grid-cols-2 gap-3 text-sm">
              <div className="flex items-center gap-2">
                <span className="size-1.5 rounded-full bg-white/80" /> Real‑time tracking
              </div>
              <div className="flex items-center gap-2">
                <span className="size-1.5 rounded-full bg-white/80" /> Role‑based access
              </div>
              <div className="flex items-center gap-2">
                <span className="size-1.5 rounded-full bg-white/80" /> Insightful reports
              </div>
              <div className="flex items-center gap-2">
                <span className="size-1.5 rounded-full bg-white/80" /> Secure by design
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}