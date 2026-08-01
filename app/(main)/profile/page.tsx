"use client";

import { useEffect, useState } from "react";
import { Loader2, NotebookPen, CheckCircle2, ClipboardCheck } from "lucide-react";
import { ProfileService, ProfileData, ProfileUpdatePayload } from "@/lib/profile-service";
import ProfileInfoCard from "./components/ProfileInfoCard";
import ProfileActivityPanel from "./components/ProfileActivityPanel";
import EditProfileModal from "./components/EditProfileModal";
import ChangePasswordModal from "./components/ChangePasswordModal";

export default function ProfilePage() {
  const [profile, setProfile] = useState<ProfileData | null>(null);
  const [loading, setLoading] = useState(true);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isPasswordOpen, setIsPasswordOpen] = useState(false);
  const [shareCopied, setShareCopied] = useState(false);

  useEffect(() => {
    ProfileService.get()
      .then(setProfile)
      .finally(() => setLoading(false));
  }, []);

  const handleSaveProfile = async (data: ProfileUpdatePayload) => {
    const updated = await ProfileService.update(data);
    setProfile((prev) => (prev ? { ...prev, ...updated } : prev));
  };

  const handleUploadAvatar = async (file: File) => {
    const url = await ProfileService.uploadAvatar(file);
    setProfile((prev) => (prev ? { ...prev, avatar_url: url } : prev));
  };

  const handleShare = async () => {
    try {
      await navigator.clipboard.writeText(window.location.href);
      setShareCopied(true);
      setTimeout(() => setShareCopied(false), 1500);
    } catch {
      // clipboard unavailable, silently ignore
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

  return (
    <div className="flex-1 overflow-y-auto bg-slate-50/50">
      <div className="w-full px-6 py-8">
        {/* Top bar */}
        <div className="flex items-end justify-between mb-6">
          <div>
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em] mb-1">Profile</p>
            <h1 className="text-3xl font-black text-slate-900 tracking-tight">{profile.name}</h1>
            <p className="text-sm text-slate-500 mt-1">
              {profile.stats.notes} notes &middot; {profile.stats.habits} habits &middot; {profile.stats.tasks} tasks
            </p>
          </div>
          <button
            onClick={handleShare}
            className="relative px-4 py-2 bg-blue-600 text-white rounded-xl text-sm font-bold hover:bg-blue-700 transition shadow-lg shadow-blue-100"
          >
            Share Profile
            {shareCopied && (
              <span className="absolute -bottom-8 right-0 text-[10px] font-bold bg-slate-800 text-white px-2 py-1 rounded-md whitespace-nowrap">Link copied!</span>
            )}
          </button>
        </div>

        {/* Stat cards */}
        <div className="grid grid-cols-3 gap-4 mb-6">
          {[
            { icon: NotebookPen, label: "Notes", value: profile.stats.notes, color: "text-blue-500 bg-blue-50" },
            { icon: CheckCircle2, label: "Habits", value: profile.stats.habits, color: "text-emerald-500 bg-emerald-50" },
            { icon: ClipboardCheck, label: "Tasks", value: profile.stats.tasks, color: "text-purple-500 bg-purple-50" },
          ].map((s) => (
            <div key={s.label} className="bg-white rounded-2xl p-5 border border-slate-100 flex items-center gap-4">
              <div className={`w-11 h-11 rounded-xl flex items-center justify-center shrink-0 ${s.color}`}>
                <s.icon className="w-5 h-5" />
              </div>
              <div>
                <p className="text-2xl font-black text-slate-900">{s.value}</p>
                <p className="text-xs text-slate-400 font-medium">{s.label}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Two-column layout: profile card + activity tabs */}
        <div className="grid grid-cols-1 lg:grid-cols-[560px_1fr] gap-5 items-start">
          <ProfileInfoCard
            profile={profile}
            onEditClick={() => setIsEditOpen(true)}
            onChangePasswordClick={() => setIsPasswordOpen(true)}
            onUploadAvatar={handleUploadAvatar}
            onShare={handleShare}
            shareCopied={shareCopied}
          />
          <div className="h-[720px]">
            <ProfileActivityPanel profile={profile} />
          </div>
        </div>
      </div>

      <EditProfileModal
        isOpen={isEditOpen}
        onClose={() => setIsEditOpen(false)}
        profile={profile}
        onSave={handleSaveProfile}
      />
      <ChangePasswordModal isOpen={isPasswordOpen} onClose={() => setIsPasswordOpen(false)} />
    </div>
  );
}
