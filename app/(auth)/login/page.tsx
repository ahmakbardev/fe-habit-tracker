"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { AuthService } from "@/lib/auth-service";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (AuthService.isAuthenticated()) {
      router.replace("/dashboard");
    }
  }, [router]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      await AuthService.login(email, password);
      router.replace("/dashboard");
    } catch (err: unknown) {
      const axiosError = err as { response?: { data?: { message?: string } } };
      setError(axiosError.response?.data?.message || "Login gagal. Coba lagi.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="w-full max-w-sm">
      {/* Logo */}
      <div className="flex flex-col items-center mb-8">
        <div className="w-16 h-16 bg-white rounded-2xl flex items-center justify-center shadow-lg shadow-blue-500/20 mb-4">
          <img src="/icons/favicon.svg" alt="Logo" className="w-8 h-8" />
        </div>
        <h1 className="text-2xl font-bold text-white tracking-tight">HabitFlow</h1>
        <p className="text-slate-400 text-sm mt-1">Masuk ke akunmu</p>
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit} className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-4">
        {error && (
          <div className="bg-red-500/10 border border-red-500/20 text-red-400 text-sm px-4 py-3 rounded-lg">
            {error}
          </div>
        )}

        <div className="space-y-1">
          <label className="text-slate-300 text-sm font-medium">Email</label>
          <input
            type="email"
            value={email}
            onChange={e => setEmail(e.target.value)}
            required
            autoComplete="email"
            placeholder="email@contoh.com"
            className="w-full bg-slate-800 border border-slate-700 text-white placeholder-slate-500 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
          />
        </div>

        <div className="space-y-1">
          <label className="text-slate-300 text-sm font-medium">Password</label>
          <input
            type="password"
            value={password}
            onChange={e => setPassword(e.target.value)}
            required
            autoComplete="current-password"
            placeholder="••••••••"
            className="w-full bg-slate-800 border border-slate-700 text-white placeholder-slate-500 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-blue-600 hover:bg-blue-500 disabled:opacity-50 disabled:cursor-not-allowed text-white font-medium py-2.5 rounded-lg text-sm transition"
        >
          {loading ? "Masuk..." : "Masuk"}
        </button>
      </form>
    </div>
  );
}
