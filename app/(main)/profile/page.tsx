"use client";

import { useState, useEffect, useRef } from "react";
import { Camera, Loader2, Check, X, NotebookPen, CheckCircle2, ClipboardCheck } from "lucide-react";
import { ProfileService, ProfileData, resolveAvatarUrl } from "@/lib/profile-service";

type SaveStatus = "idle" | "saving" | "saved" | "error";

function StatusIndicator({ status, error }: { status: SaveStatus; error?: string }) {
  if (status === "idle") return null;
  return (
    <span className={`text-xs flex items-center gap-1 ${status === "error" ? "text-red-500" : status === "saved" ? "text-green-500" : "text-slate-400"}`}>
      {status === "saving" && <Loader2 className="w-3 h-3 animate-spin" />}
      {status === "saved" && <Check className="w-3 h-3" />}
      {status === "error" && <X className="w-3 h-3" />}
      {status === "saving" ? "Saving..." : status === "saved" ? "Saved" : error || "Failed"}
    </span>
  );
}

export default function ProfilePage() {
  const [profile, setProfile] = useState<ProfileData | null>(null);
  const [loading, setLoading] = useState(true);

  // Edit profile state
  const [name, setName] = useState("");
  const [username, setUsername] = useState("");
  const [bio, setBio] = useState("");
  const [profileStatus, setProfileStatus] = useState<SaveStatus>("idle");
  const [profileError, setProfileError] = useState("");

  // Avatar state
  const [uploadingAvatar, setUploadingAvatar] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  // Password state
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [passwordStatus, setPasswordStatus] = useState<SaveStatus>("idle");
  const [passwordError, setPasswordError] = useState("");

  useEffect(() => {
    ProfileService.get()
      .then((data) => {
        setProfile(data);
        setName(data.name);
        setUsername(data.username);
        setBio(data.bio || "");
      })
      .finally(() => setLoading(false));
  }, []);

  const handleSaveProfile = async () => {
    setProfileStatus("saving");
    setProfileError("");
    try {
      const updated = await ProfileService.update({ name, username, bio: bio || undefined });
      setProfile((prev) => prev ? { ...prev, ...updated } : prev);
      setProfileStatus("saved");
      setTimeout(() => setProfileStatus("idle"), 2500);
    } catch (err: unknown) {
      const e = err as { response?: { data?: { errors?: Record<string, string[]>; message?: string } } };
      const errors = e.response?.data?.errors;
      const msg = errors ? Object.values(errors).flat()[0] : (e.response?.data?.message || "Failed to save");
      setProfileError(msg);
      setProfileStatus("error");
      setTimeout(() => setProfileStatus("idle"), 3000);
    }
  };

  const handleAvatarChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploadingAvatar(true);
    try {
      const url = await ProfileService.uploadAvatar(file);
      setProfile((prev) => prev ? { ...prev, avatar_url: url } : prev);
    } finally {
      setUploadingAvatar(false);
      if (fileRef.current) fileRef.current.value = "";
    }
  };

  const handleChangePassword = async () => {
    setPasswordStatus("saving");
    setPasswordError("");
    try {
      await ProfileService.changePassword({
        current_password: currentPassword,
        password: newPassword,
        password_confirmation: confirmPassword,
      });
      setPasswordStatus("saved");
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
      setTimeout(() => setPasswordStatus("idle"), 2500);
    } catch (err: unknown) {
      const e = err as { response?: { data?: { errors?: Record<string, string[]>; message?: string } } };
      const errors = e.response?.data?.errors;
      const msg = errors ? Object.values(errors).flat()[0] : (e.response?.data?.message || "Failed to change password");
      setPasswordError(msg);
      setPasswordStatus("error");
      setTimeout(() => setPasswordStatus("idle"), 3000);
    }
  };

  if (loading) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <Loader2 className="w-5 h-5 animate-spin text-slate-300" />
      </div>
    );
  }

  if (!profile) return null;

  const avatarSrc = resolveAvatarUrl(profile.avatar_url);
  const initials = profile.name.split(" ").map((w) => w[0]).join("").slice(0, 2).toUpperCase();
  const memberYear = new Date(profile.member_since).toLocaleDateString("en-US", { month: "long", year: "numeric" });

  return (
    <div className="flex-1 overflow-y-auto bg-slate-50">
      <div className="max-w-xl mx-auto px-4 py-8 space-y-4">

        {/* Avatar + Identity */}
        <div className="bg-white rounded-2xl p-6 flex items-center gap-5 border border-slate-100">
          <div className="relative shrink-0">
            <button
              onClick={() => fileRef.current?.click()}
              disabled={uploadingAvatar}
              className="group relative w-16 h-16 rounded-full overflow-hidden bg-slate-100 flex items-center justify-center ring-2 ring-white ring-offset-1 ring-offset-slate-100"
            >
              {avatarSrc ? (
                <img src={avatarSrc} alt={profile.name} className="w-full h-full object-cover" />
              ) : (
                <span className="text-xl font-bold text-slate-400">{initials}</span>
              )}
              <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                {uploadingAvatar
                  ? <Loader2 className="w-5 h-5 text-white animate-spin" />
                  : <Camera className="w-5 h-5 text-white" />
                }
              </div>
            </button>
            <input ref={fileRef} type="file" accept="image/jpg,image/jpeg,image/png,image/webp" className="hidden" onChange={handleAvatarChange} />
          </div>

          <div className="min-w-0">
            <p className="font-semibold text-slate-900 truncate">{profile.name}</p>
            <p className="text-sm text-slate-400 truncate">@{profile.username}</p>
            <p className="text-xs text-slate-400 mt-0.5">Member since {memberYear}</p>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-3">
          {[
            { icon: <NotebookPen className="w-4 h-4" />, label: "Notes", value: profile.stats.notes },
            { icon: <CheckCircle2 className="w-4 h-4" />, label: "Habits", value: profile.stats.habits },
            { icon: <ClipboardCheck className="w-4 h-4" />, label: "Tasks", value: profile.stats.tasks },
          ].map((s) => (
            <div key={s.label} className="bg-white rounded-xl p-4 border border-slate-100 text-center">
              <div className="flex justify-center text-slate-400 mb-1">{s.icon}</div>
              <p className="text-xl font-bold text-slate-900">{s.value}</p>
              <p className="text-xs text-slate-400">{s.label}</p>
            </div>
          ))}
        </div>

        {/* Edit Profile */}
        <div className="bg-white rounded-2xl p-6 border border-slate-100 space-y-4">
          <p className="text-sm font-semibold text-slate-700">Edit Profile</p>

          <div className="space-y-3">
            <div>
              <label className="text-xs font-medium text-slate-500 mb-1 block">Name</label>
              <input
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full text-sm bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
              />
            </div>
            <div>
              <label className="text-xs font-medium text-slate-500 mb-1 block">Username</label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-sm">@</span>
                <input
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="w-full text-sm bg-slate-50 border border-slate-200 rounded-lg pl-7 pr-3 py-2 outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
                />
              </div>
            </div>
            <div>
              <label className="text-xs font-medium text-slate-500 mb-1 block">Bio</label>
              <textarea
                value={bio}
                onChange={(e) => setBio(e.target.value)}
                rows={3}
                placeholder="Tell something about yourself..."
                className="w-full text-sm bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition resize-none"
              />
            </div>
          </div>

          <div className="flex items-center justify-between pt-1">
            <StatusIndicator status={profileStatus} error={profileError} />
            <button
              onClick={handleSaveProfile}
              disabled={profileStatus === "saving"}
              className="ml-auto text-sm font-medium bg-slate-900 hover:bg-slate-700 disabled:opacity-50 text-white px-4 py-1.5 rounded-lg transition"
            >
              Save
            </button>
          </div>
        </div>

        {/* Change Password */}
        <div className="bg-white rounded-2xl p-6 border border-slate-100 space-y-4">
          <p className="text-sm font-semibold text-slate-700">Change Password</p>

          <div className="space-y-3">
            <div>
              <label className="text-xs font-medium text-slate-500 mb-1 block">Current Password</label>
              <input
                type="password"
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full text-sm bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
              />
            </div>
            <div>
              <label className="text-xs font-medium text-slate-500 mb-1 block">New Password</label>
              <input
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full text-sm bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
              />
            </div>
            <div>
              <label className="text-xs font-medium text-slate-500 mb-1 block">Confirm New Password</label>
              <input
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full text-sm bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
              />
            </div>
          </div>

          <div className="flex items-center justify-between pt-1">
            <StatusIndicator status={passwordStatus} error={passwordError} />
            <button
              onClick={handleChangePassword}
              disabled={passwordStatus === "saving" || !currentPassword || !newPassword || !confirmPassword}
              className="ml-auto text-sm font-medium bg-slate-900 hover:bg-slate-700 disabled:opacity-50 text-white px-4 py-1.5 rounded-lg transition"
            >
              Change
            </button>
          </div>
        </div>

      </div>
    </div>
  );
}
