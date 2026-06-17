"use client";

import { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, Loader2, CheckCircle2, AlertCircle, Mail, KeyRound, Eye, EyeOff } from "lucide-react";
import Link from "next/link";
import api from "@/lib/axios";

type Step = "email" | "otp" | "password";

const STEPS: Step[] = ["email", "otp", "password"];

function VerifyingPopup() {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl px-8 py-6 flex flex-col items-center gap-3 shadow-2xl">
        <Loader2 className="w-7 h-7 text-blue-400 animate-spin" />
        <p className="text-white text-sm font-medium">Memverifikasi kode...</p>
      </div>
    </div>
  );
}

function SuccessPopup({ onLogin }: { onLogin: () => void }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl px-8 py-8 flex flex-col items-center gap-4 shadow-2xl w-72 text-center">
        <div className="w-14 h-14 rounded-full bg-emerald-500/15 flex items-center justify-center">
          <CheckCircle2 className="w-7 h-7 text-emerald-400" />
        </div>
        <div>
          <p className="text-white font-semibold">Password berhasil direset!</p>
          <p className="text-slate-400 text-xs mt-1">Mengalihkan ke halaman login...</p>
        </div>
        <button
          onClick={onLogin}
          className="w-full bg-blue-600 hover:bg-blue-500 text-white text-sm font-medium py-2 rounded-lg transition"
        >
          Login sekarang
        </button>
      </div>
    </div>
  );
}

export default function ForgotPasswordPage() {
  const router = useRouter();

  const [step, setStep] = useState<Step>("email");
  const [verifying, setVerifying] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);

  // Step 1 — email
  const [email, setEmail] = useState("");
  const [emailLoading, setEmailLoading] = useState(false);
  const [emailError, setEmailError] = useState("");
  const [cooldown, setCooldown] = useState(0);

  // Step 2 — OTP
  const [otp, setOtp] = useState(["", "", "", ""]);
  const [otpError, setOtpError] = useState("");

  // Step 3 — new password
  const [password, setPassword] = useState("");
  const [passwordConfirm, setPasswordConfirm] = useState("");
  const [showPwd, setShowPwd] = useState(false);
  const [showPwdConfirm, setShowPwdConfirm] = useState(false);
  const [pwdLoading, setPwdLoading] = useState(false);
  const [pwdError, setPwdError] = useState("");

  const otpRefs = [
    useRef<HTMLInputElement>(null),
    useRef<HTMLInputElement>(null),
    useRef<HTMLInputElement>(null),
    useRef<HTMLInputElement>(null),
  ];

  useEffect(() => {
    if (cooldown <= 0) return;
    const t = setTimeout(() => setCooldown((c) => c - 1), 1000);
    return () => clearTimeout(t);
  }, [cooldown]);

  // Auto-advance to next step when all 4 OTP digits filled
  useEffect(() => {
    if (step === "otp" && otp.every((d) => d !== "")) {
      const t = setTimeout(() => {
        setVerifying(true);
        setTimeout(() => {
          setVerifying(false);
          setStep("password");
        }, 700);
      }, 200);
      return () => clearTimeout(t);
    }
  }, [otp, step]);

  // ── Handlers ──

  const handleSendOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;
    setEmailLoading(true);
    setEmailError("");
    try {
      await api.post("/auth/forgot-password", { email });
      setStep("otp");
      setCooldown(60);
      setTimeout(() => otpRefs[0].current?.focus(), 50);
    } catch (err: unknown) {
      const e = err as { response?: { data?: { message?: string } } };
      setEmailError(e.response?.data?.message || "Gagal mengirim kode OTP.");
    } finally {
      setEmailLoading(false);
    }
  };

  const handleResend = async () => {
    if (cooldown > 0) return;
    setEmailLoading(true);
    setOtpError("");
    try {
      await api.post("/auth/forgot-password", { email });
      setCooldown(60);
      setOtp(["", "", "", ""]);
      setTimeout(() => otpRefs[0].current?.focus(), 50);
    } catch (err: unknown) {
      const e = err as { response?: { data?: { message?: string } } };
      setOtpError(e.response?.data?.message || "Gagal mengirim ulang kode.");
    } finally {
      setEmailLoading(false);
    }
  };

  const handleOtpChange = (index: number, value: string) => {
    const digit = value.replace(/\D/g, "").slice(-1);
    const next = [...otp];
    next[index] = digit;
    setOtp(next);
    if (digit && index < 3) otpRefs[index + 1].current?.focus();
  };

  const handleOtpKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Backspace" && !otp[index] && index > 0) {
      otpRefs[index - 1].current?.focus();
    }
  };

  const handleOtpPaste = (e: React.ClipboardEvent) => {
    const pasted = e.clipboardData.getData("text").replace(/\D/g, "").slice(0, 4);
    if (!pasted) return;
    e.preventDefault();
    const next = [...otp];
    pasted.split("").forEach((ch, i) => { if (i < 4) next[i] = ch; });
    setOtp(next);
    const lastIdx = Math.min(pasted.length, 3);
    otpRefs[lastIdx].current?.focus();
  };

  const handleOtpNext = (e: React.FormEvent) => {
    e.preventDefault();
    if (otp.join("").length < 4) {
      setOtpError("Masukkan 4 digit kode OTP.");
      return;
    }
    setOtpError("");
    setVerifying(true);
    setTimeout(() => {
      setVerifying(false);
      setStep("password");
    }, 700);
  };

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setPwdError("");
    if (password.length < 6) { setPwdError("Password minimal 6 karakter."); return; }
    if (password !== passwordConfirm) { setPwdError("Konfirmasi password tidak cocok."); return; }

    setPwdLoading(true);
    try {
      await api.post("/auth/reset-password", {
        email,
        otp: otp.join(""),
        password,
        password_confirmation: passwordConfirm,
      });
      setShowSuccess(true);
      setTimeout(() => router.push("/login"), 3000);
    } catch (err: unknown) {
      const e = err as { response?: { data?: { message?: string } } };
      const msg = e.response?.data?.message || "Gagal mereset password.";
      setPwdError(msg);
      // If OTP-related error, go back to OTP step
      if (msg.toLowerCase().includes("otp") || msg.toLowerCase().includes("kode")) {
        setOtp(["", "", "", ""]);
        setStep("otp");
        setOtpError(msg);
      }
    } finally {
      setPwdLoading(false);
    }
  };

  // ── Progress indicator ──
  const stepIndex = STEPS.indexOf(step);
  const visibleSteps = [
    { label: "Email" },
    { label: "Kode OTP" },
    { label: "Password Baru" },
  ];

  const inputCls =
    "w-full bg-slate-800 border border-slate-700 text-white placeholder-slate-500 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition";

  return (
    <div className="w-full max-w-sm">
      {verifying && <VerifyingPopup />}
      {showSuccess && <SuccessPopup onLogin={() => router.push("/login")} />}
      {/* Logo */}
      <div className="flex flex-col items-center mb-6">
        <div className="w-16 h-16 bg-white rounded-2xl flex items-center justify-center shadow-lg shadow-blue-500/20 mb-4">
          <img src="/icons/favicon.svg" alt="Logo" className="w-8 h-8" />
        </div>
        <h1 className="text-2xl font-bold text-white tracking-tight">HabitFlow</h1>
        <p className="text-slate-400 text-sm mt-1">Reset kata sandi</p>
      </div>

      {/* Step indicator */}
      <div className="flex items-center mb-6">
          {visibleSteps.map((s, i) => {
            const done = i < stepIndex;
            const active = i === stepIndex;
            return (
              <div key={s.label} className="flex items-center flex-1 last:flex-none">
                <div className="flex flex-col items-center gap-1">
                  <div
                    className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold transition-all ${
                      done
                        ? "bg-blue-600 text-white"
                        : active
                        ? "bg-blue-600 text-white ring-4 ring-blue-600/20"
                        : "bg-slate-800 text-slate-500"
                    }`}
                  >
                    {done ? <CheckCircle2 className="w-4 h-4" /> : i + 1}
                  </div>
                  <span className={`text-[10px] font-medium ${active ? "text-white" : "text-slate-500"}`}>
                    {s.label}
                  </span>
                </div>
                {i < visibleSteps.length - 1 && (
                  <div className={`flex-1 h-px mx-2 mb-4 transition-all ${i < stepIndex ? "bg-blue-600" : "bg-slate-700"}`} />
                )}
              </div>
            );
          })}
        </div>

      {/* ── Step 1: Email ── */}
      {step === "email" && (
        <form onSubmit={handleSendOtp} className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-4">
          <div className="flex items-center gap-2 text-slate-400 text-sm">
            <Mail className="w-4 h-4 shrink-0" />
            <span>Masukkan email yang terdaftar untuk menerima kode OTP.</span>
          </div>

          {emailError && (
            <div className="flex items-center gap-2 bg-red-500/10 border border-red-500/20 text-red-400 text-sm px-4 py-3 rounded-lg">
              <AlertCircle className="w-4 h-4 shrink-0" />
              {emailError}
            </div>
          )}

          <div className="space-y-1">
            <label className="text-slate-300 text-sm font-medium">Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              autoFocus
              placeholder="email@contoh.com"
              className={inputCls}
            />
          </div>

          <button
            type="submit"
            disabled={emailLoading || !email}
            className="w-full flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-500 disabled:opacity-50 disabled:cursor-not-allowed text-white font-medium py-2.5 rounded-lg text-sm transition"
          >
            {emailLoading && <Loader2 className="w-4 h-4 animate-spin" />}
            {emailLoading ? "Mengirim..." : "Kirim Kode OTP"}
          </button>

          <div className="text-center">
            <Link
              href="/login"
              className="text-slate-500 hover:text-slate-300 text-sm flex items-center justify-center gap-1 transition"
            >
              <ArrowLeft className="w-3 h-3" />
              Kembali ke login
            </Link>
          </div>
        </form>
      )}

      {/* ── Step 2: OTP ── */}
      {step === "otp" && (
        <form onSubmit={handleOtpNext} className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-5">
          <div className="bg-blue-500/10 border border-blue-500/20 text-blue-300 text-sm px-4 py-3 rounded-lg">
            Kode OTP dikirim ke{" "}
            <span className="font-medium text-blue-200">{email}</span>. Berlaku 10 menit.
          </div>

          {otpError && (
            <div className="flex items-center gap-2 bg-red-500/10 border border-red-500/20 text-red-400 text-sm px-4 py-3 rounded-lg">
              <AlertCircle className="w-4 h-4 shrink-0" />
              {otpError}
            </div>
          )}

          <div className="space-y-3">
            <label className="text-slate-300 text-sm font-medium block text-center">
              Masukkan 4 digit kode OTP
            </label>
            <div className="flex gap-3 justify-center" onPaste={handleOtpPaste}>
              {otp.map((digit, i) => (
                <input
                  key={i}
                  ref={otpRefs[i]}
                  type="text"
                  inputMode="numeric"
                  maxLength={1}
                  value={digit}
                  onChange={(e) => handleOtpChange(i, e.target.value)}
                  onKeyDown={(e) => handleOtpKeyDown(i, e)}
                  className="w-14 h-14 text-center text-2xl font-bold bg-slate-800 border border-slate-700 text-white rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition caret-transparent"
                />
              ))}
            </div>
          </div>

          <button
            type="submit"
            disabled={otp.join("").length < 4}
            className="w-full flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-500 disabled:opacity-50 disabled:cursor-not-allowed text-white font-medium py-2.5 rounded-lg text-sm transition"
          >
            Lanjut
          </button>

          <div className="flex items-center justify-between text-sm">
            <button
              type="button"
              onClick={handleResend}
              disabled={cooldown > 0 || emailLoading}
              className="text-slate-500 hover:text-slate-300 disabled:opacity-40 disabled:cursor-not-allowed transition"
            >
              {emailLoading
                ? "Mengirim..."
                : cooldown > 0
                ? `Kirim ulang (${cooldown}s)`
                : "Kirim ulang kode"}
            </button>
            <button
              type="button"
              onClick={() => { setStep("email"); setOtp(["", "", "", ""]); setOtpError(""); }}
              className="text-slate-500 hover:text-slate-300 flex items-center gap-1 transition"
            >
              <ArrowLeft className="w-3 h-3" />
              Ganti email
            </button>
          </div>
        </form>
      )}

      {/* ── Step 3: New Password ── */}
      {step === "password" && (
        <form onSubmit={handleResetPassword} className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-4">
          <div className="flex items-center gap-2 text-slate-400 text-sm">
            <KeyRound className="w-4 h-4 shrink-0" />
            <span>Buat password baru untuk akunmu.</span>
          </div>

          {pwdError && (
            <div className="flex items-center gap-2 bg-red-500/10 border border-red-500/20 text-red-400 text-sm px-4 py-3 rounded-lg">
              <AlertCircle className="w-4 h-4 shrink-0" />
              {pwdError}
            </div>
          )}

          <div className="space-y-1">
            <label className="text-slate-300 text-sm font-medium">Password Baru</label>
            <div className="relative">
              <input
                type={showPwd ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                autoFocus
                placeholder="Min. 6 karakter"
                className={`${inputCls} pr-10`}
              />
              <button
                type="button"
                onClick={() => setShowPwd((v) => !v)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300 transition"
              >
                {showPwd ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-slate-300 text-sm font-medium">Konfirmasi Password</label>
            <div className="relative">
              <input
                type={showPwdConfirm ? "text" : "password"}
                value={passwordConfirm}
                onChange={(e) => setPasswordConfirm(e.target.value)}
                required
                placeholder="Ulangi password baru"
                className={`${inputCls} pr-10`}
              />
              <button
                type="button"
                onClick={() => setShowPwdConfirm((v) => !v)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300 transition"
              >
                {showPwdConfirm ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={pwdLoading || !password || !passwordConfirm}
            className="w-full flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-500 disabled:opacity-50 disabled:cursor-not-allowed text-white font-medium py-2.5 rounded-lg text-sm transition"
          >
            {pwdLoading && <Loader2 className="w-4 h-4 animate-spin" />}
            {pwdLoading ? "Memproses..." : "Reset Password"}
          </button>

          <div className="text-center">
            <button
              type="button"
              onClick={() => { setStep("otp"); setPwdError(""); }}
              className="text-slate-500 hover:text-slate-300 text-sm flex items-center justify-center gap-1 transition"
            >
              <ArrowLeft className="w-3 h-3" />
              Kembali ke kode OTP
            </button>
          </div>
        </form>
      )}

    </div>
  );
}
