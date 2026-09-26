import React, { useState } from "react";
import API from "../lib/axios";
import { Input } from "../components/ui/input";
import { Button } from "../components/ui/button";
import { EyeIcon, EyeOffIcon, Loader2, GraduationCap, School, ShieldCheck, Sparkles, CheckCircle2, Clock, Users, ArrowRight } from "lucide-react";
import campusBg from "../assets/campus-bg.jpg";

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

      // Force reload to re-trigger UserProvider and routes
      window.location.href = getRedirectPath(user.role);
    } catch (err: any) {
      setError(
        err.response?.data?.error ||
          err.response?.data?.message ||
          "ការចូលប្រើប្រាស់មិនជោគជ័យ សូមពិនិត្យអ៊ីមែល ឬលេខសម្ងាត់ឡើងវិញ (Login failed. Please check your credentials.)"
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-full flex bg-background overflow-hidden selection:bg-primary selection:text-primary-foreground">
      {/* Left Panel - Login Form */}
      <div className="w-full lg:w-1/2 flex flex-col justify-between p-6 sm:p-10 lg:p-12 z-10">
        {/* Brand Header */}
        <div className="flex items-center gap-3">
          <div className="h-11 w-11 rounded-2xl bg-gradient-to-tr from-primary to-primary/80 flex items-center justify-center text-primary-foreground shadow-lg shadow-primary/25 ring-4 ring-primary/10">
            <GraduationCap className="h-6 w-6" />
          </div>
          <div>
            <span className="font-bold text-lg text-foreground tracking-tight flex items-center gap-1.5">
              ប្រព័ន្ធវត្តមានសាលារៀន
            </span>
            <span className="text-xs text-muted-foreground block -mt-0.5 font-medium">
              School Attendance System
            </span>
          </div>
        </div>

        {/* Center Login Card */}
        <div className="my-auto py-8 max-w-md w-full mx-auto">
          <div className="space-y-3 mb-8">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-primary/10 text-primary border border-primary/20">
              <Sparkles className="h-3.5 w-3.5" />
              <span>ស្វាគមន៍មកកាន់ប្រព័ន្ធ (Welcome Back)</span>
            </div>
            <h1 className="text-3xl font-extrabold tracking-tight text-foreground sm:text-4xl">
              ចូលប្រើប្រាស់ប្រព័ន្ធ
            </h1>
            <p className="text-sm text-muted-foreground leading-relaxed">
              សូមបញ្ចូលអ៊ីមែល និងលេខសម្ងាត់របស់អ្នកដើម្បីបន្តទៅកាន់ផ្ទាំងគ្រប់គ្រង។
            </p>
          </div>

          <form onSubmit={handleLogin} className="space-y-5">
            {/* Email Field */}
            <div className="space-y-2">
              <label
                htmlFor="email"
                className="text-xs sm:text-sm font-semibold text-foreground flex items-center justify-between"
              >
                <span>អាសយដ្ឋានអ៊ីមែល (Email Address)</span>
              </label>
              <Input
                id="email"
                type="email"
                placeholder="name@school.edu.kh"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                disabled={isLoading}
                className="h-12 text-sm bg-muted/30 border-muted-foreground/20 focus:border-primary focus:bg-background rounded-xl transition-all"
              />
            </div>

            {/* Password Field */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label
                  htmlFor="password"
                  className="text-xs sm:text-sm font-semibold text-foreground"
                >
                  ពាក្យសម្ងាត់ (Password)
                </label>
                <a
                  href="#"
                  className="text-xs font-medium text-primary hover:underline transition-colors"
                  onClick={(e) => {
                    e.preventDefault();
                    alert("សូមទាក់ទងអ្នកគ្រប់គ្រងប្រព័ន្ធ (Admin) ដើម្បីកំណត់ពាក្យសម្ងាត់ឡើងវិញ។");
                  }}
                >
                  ភ្លេចលេខសម្ងាត់?
                </a>
              </div>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="••••••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  disabled={isLoading}
                  className="h-12 text-sm pr-12 bg-muted/30 border-muted-foreground/20 focus:border-primary focus:bg-background rounded-xl transition-all font-mono"
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="absolute right-1 top-1/2 -translate-y-1/2 h-10 w-10 text-muted-foreground hover:text-foreground"
                  onClick={() => setShowPassword(!showPassword)}
                  aria-label={showPassword ? "Hide password" : "Show password"}
                >
                  {showPassword ? (
                    <EyeOffIcon className="h-4 w-4" />
                  ) : (
                    <EyeIcon className="h-4 w-4" />
                  )}
                </Button>
              </div>
            </div>

            {/* Error Message */}
            {error && (
              <div className="rounded-xl border border-destructive/30 bg-destructive/10 p-3.5 text-xs sm:text-sm text-destructive flex items-start gap-2.5 animate-in fade-in-50 duration-200">
                <div className="h-4 w-4 rounded-full bg-destructive text-destructive-foreground flex items-center justify-center text-[10px] font-bold shrink-0 mt-0.5">
                  !
                </div>
                <div className="leading-snug">{error}</div>
              </div>
            )}

            {/* Submit Button */}
            <Button
              type="submit"
              disabled={isLoading || !email.trim() || !password.trim()}
              className="w-full h-12 text-sm sm:text-base font-bold rounded-xl shadow-lg shadow-primary/20 hover:shadow-primary/30 transition-all flex items-center justify-center gap-2 group cursor-pointer"
            >
              {isLoading ? (
                <>
                  <Loader2 className="h-5 w-5 animate-spin" />
                  <span>កំពុងផ្ទៀងផ្ទាត់... (Signing in...)</span>
                </>
              ) : (
                <>
                  <span>ចូលប្រព័ន្ធ (Sign In)</span>
                  <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
                </>
              )}
            </Button>
          </form>
        </div>

        {/* Footer */}
        <div className="pt-4 border-t text-xs text-muted-foreground flex flex-col sm:flex-row items-center justify-between gap-2">
          <span>© {new Date().getFullYear()} School Attendance Management</span>
          <span className="flex items-center gap-1 text-primary">
            <ShieldCheck className="h-3.5 w-3.5" /> សុវត្ថិភាពខ្ពស់ & លឿនរហ័ស
          </span>
        </div>
      </div>

      {/* Right Panel - Campus Visual Showcase */}
      <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden bg-slate-900">
        {/* Background Image */}
        <img
          src={campusBg}
          alt="Modern School Campus"
          className="absolute inset-0 w-full h-full object-cover object-center transform scale-105 hover:scale-100 transition-transform duration-1000 ease-out"
        />

        {/* Ambient Overlay Gradients */}
        <div className="absolute inset-0 bg-gradient-to-t from-slate-950/90 via-slate-950/40 to-slate-900/20" />
        <div className="absolute inset-0 bg-primary/10 mix-blend-overlay" />

        {/* Floating Content Card */}
        <div className="relative z-10 mt-auto p-12 text-white w-full max-w-xl">
          <div className="backdrop-blur-md bg-black/35 border border-white/20 rounded-3xl p-8 shadow-2xl space-y-5">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold bg-white/20 border border-white/30 text-white backdrop-blur-sm">
              <School className="h-3.5 w-3.5 text-sky-300" />
              <span>បរិវេណសាលាទំនើប (Smart Modern Campus)</span>
            </div>

            <h2 className="text-2xl xl:text-3xl font-bold leading-snug tracking-tight text-white drop-shadow-sm">
              ការគ្រប់គ្រងវត្តមានឆ្លាតវៃ ដើម្បីការអប់រំប្រកបដោយគុណភាព
            </h2>

            <p className="text-white/80 text-xs sm:text-sm leading-relaxed">
              តាមដានវត្តមានសិស្ស គ្រប់គ្រងកាលវិភាគបង្រៀន និងផ្ញើដំណឹងជូនអាណាព្យាបាលបានភ្លាមៗតាមពេលវេលាជាក់ស្តែង។
            </p>

            <div className="grid grid-cols-2 gap-3.5 pt-2 border-t border-white/15">
              <div className="flex items-center gap-2 text-xs text-white/90">
                <CheckCircle2 className="h-4 w-4 text-emerald-400 shrink-0" />
                <span>វត្តមាន Real-time</span>
              </div>
              <div className="flex items-center gap-2 text-xs text-white/90">
                <CheckCircle2 className="h-4 w-4 text-emerald-400 shrink-0" />
                <span>បែងចែកតាម Role</span>
              </div>
              <div className="flex items-center gap-2 text-xs text-white/90">
                <CheckCircle2 className="h-4 w-4 text-emerald-400 shrink-0" />
                <span>របាយការណ៍លម្អិត</span>
              </div>
              <div className="flex items-center gap-2 text-xs text-white/90">
                <CheckCircle2 className="h-4 w-4 text-emerald-400 shrink-0" />
                <span>ជូនដំណឹងអាណាព្យាបាល</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}