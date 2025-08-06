import { useState } from "react";
import API from "../lib/axios";
import { Input } from "../components/ui/input";
import { Button } from "../components/ui/button";
import { EyeIcon, EyeOffIcon } from "lucide-react";

const WALLPAPER_URL =
  "https://firebasestorage.googleapis.com/v0/b/school-attendance-d8444.firebasestorage.app/o/2150911431.jpg?alt=media&token=f49fbbf6-dfbe-46e8-a91f-e012bcf12202";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [showPassword, setShowPassword] = useState(false);

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
    }
  };
  
  return (
    <div className="w-screen h-screen flex overflow-hidden">
      {/* Left Panel - Form */}
      <div className="flex items-center justify-center w-full md:w-1/2 lg:w-1/3 p-2 sm:p-4 bg-gradient-to-br from-blue-50 via-white to-blue-100">
        <div className="w-full max-w-md space-y-8 rounded-2xl border border-border bg-white/90 px-4 py-8 sm:px-8 shadow-2xl backdrop-blur-md min-h-[70vh] flex flex-col justify-center">
          <div className="flex flex-col items-center space-y-2">
            <img src="/vite.svg" alt="Logo" className="h-10 w-10 sm:h-12 sm:w-12 mb-1" />
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-blue-900">School Attendance</h1>
            <p className="text-muted-foreground text-sm sm:text-base">Sign in to your account</p>
          </div>

          <form onSubmit={handleLogin} className="space-y-5 sm:space-y-6">
            <div className="space-y-3">
              <label htmlFor="email" className="block text-xs sm:text-sm font-medium text-blue-900">Email</label>
              <Input
                id="email"
                type="email"
                placeholder="name@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="focus-visible:ring-2 focus-visible:ring-blue-400 text-sm sm:text-base"
              />
            </div>

            <div className="space-y-3">
              <label htmlFor="password" className="block text-xs sm:text-sm font-medium text-blue-900">Password</label>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="pr-10 focus-visible:ring-2 focus-visible:ring-blue-400 text-sm sm:text-base"
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="absolute right-0 top-0 h-full w-9 px-0 text-blue-700 hover:bg-blue-100"
                  onClick={() => setShowPassword(!showPassword)}
                  aria-label={showPassword ? "Hide password" : "Show password"}
                >
                  {showPassword ? <EyeOffIcon className="size-4" /> : <EyeIcon className="size-4" />}
                </Button>
              </div>
              <div className="flex justify-end">
                <a href="#" className="text-xs text-blue-600 hover:underline hover:text-blue-800 transition-colors">Forgot password?</a>
              </div>
            </div>

            <Button type="submit" className="w-full bg-blue-700 hover:bg-blue-800 text-white font-semibold shadow-md transition-colors text-base sm:text-lg py-2.5">
              Sign In
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

      {/* Right Panel - Wallpaper */}
      <div
        className="hidden md:block md:w-1/2 lg:w-2/3 h-full relative"
        style={{
          backgroundImage: `url(${WALLPAPER_URL})`,
          backgroundSize: "cover",
          backgroundPosition: "center",
          backgroundRepeat: "no-repeat",
        }}
        aria-label="Wallpaper"
      >
        <div className="absolute inset-0 bg-blue-900/30" />
        <div className="absolute inset-0 flex items-center justify-center z-10">
          <div className="bg-white/60 rounded-xl px-8 py-6 shadow-lg max-w-xl text-center">
            <h2 className="text-2xl lg:text-4xl font-bold text-blue-900 drop-shadow-md">
              បង្កើតដំណោះស្រាយសម្រាប់សាលា<br className="hidden md:inline" /> ដោយការចុះបញ្ជីវត្តមានយ៉ាងឆ្លាតវៃ
            </h2>
            <p className="mt-3 text-blue-800 text-base lg:text-lg font-medium drop-shadow-sm">
              ការគ្រប់គ្រងវត្តមានយ៉ាងងាយស្រួល មានសុវត្ថិភាព និងឆ្លាតវៃ សម្រាប់សហគមន៍សាលាទាំងអស់។
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}