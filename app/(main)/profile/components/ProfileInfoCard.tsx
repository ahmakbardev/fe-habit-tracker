"use client";

import { useRef, useState } from "react";
import {
  Pencil, Share2, Camera, KeyRound, Mail, Briefcase, Building2, Phone,
  MapPin, Globe, Cake, FileText, Tag as TagIcon, Loader2,
} from "lucide-react";
import { format, isValid, parseISO } from "date-fns";
import { ProfileData, resolveAvatarUrl } from "@/lib/profile-service";

type Props = {
  profile: ProfileData;
  onEditClick: () => void;
  onChangePasswordClick: () => void;
  onUploadAvatar: (file: File) => Promise<void>;
  onShare: () => void;
  shareCopied: boolean;
};

function formatDate(iso?: string | null, pattern = "d MMM yyyy"): string {
  if (!iso) return "—";
  const date = parseISO(iso);
  if (!isValid(date)) return "—";
  return format(date, pattern);
}

function FieldRow({ icon: Icon, label, children }: { icon: typeof Mail; label: string; children: React.ReactNode }) {
  return (
    <div className="flex items-start justify-between gap-4 py-3.5 border-b border-slate-50 last:border-0">
      <div className="flex items-center gap-3 text-slate-400 shrink-0">
        <Icon className="w-4 h-4" />
        <span className="text-xs font-medium">{label}</span>
      </div>
      <div className="text-sm font-semibold text-slate-700 text-right">{children}</div>
    </div>
  );
}

function Placeholder() {
  return <span className="text-slate-300 font-normal italic">—</span>;
}

export default function ProfileInfoCard({
  profile,
  onEditClick,
  onChangePasswordClick,
  onUploadAvatar,
  onShare,
  shareCopied,
}: Props) {
  const [uploadingAvatar, setUploadingAvatar] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  const avatarSrc = resolveAvatarUrl(profile.avatar_url);
  const initials = profile.name.split(" ").map((w) => w[0]).join("").slice(0, 2).toUpperCase();

  const completenessFields = [
    profile.avatar_url, profile.bio, profile.job_title, profile.company,
    profile.phone_mobile, profile.mailing_address, profile.timezone,
    profile.birthday, profile.username, (profile.tags && profile.tags.length > 0) ? "y" : null,
  ];
  const completeness = Math.round((completenessFields.filter(Boolean).length / completenessFields.length) * 100);

  const ringSize = 84;
  const strokeWidth = 4;
  const radius = (ringSize - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (completeness / 100) * circumference;

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploadingAvatar(true);
    try {
      await onUploadAvatar(file);
    } finally {
      setUploadingAvatar(false);
      if (fileRef.current) fileRef.current.value = "";
    }
  };

  const subtitle = profile.job_title && profile.company
    ? `${profile.job_title} · ${profile.company}`
    : profile.job_title || profile.company || `@${profile.username}`;

  return (
    <div className="bg-white border border-slate-100 rounded-2xl p-6">
      <div className="flex items-start justify-between mb-5">
        <div className="flex items-center gap-4">
          <div className="relative shrink-0" style={{ width: ringSize, height: ringSize }}>
            <svg width={ringSize} height={ringSize} className="-rotate-90 absolute inset-0">
              <circle cx={ringSize / 2} cy={ringSize / 2} r={radius} fill="none" stroke="#e2e8f0" strokeWidth={strokeWidth} />
              <circle
                cx={ringSize / 2} cy={ringSize / 2} r={radius} fill="none"
                stroke="#3b82f6" strokeWidth={strokeWidth} strokeLinecap="round"
                strokeDasharray={circumference} strokeDashoffset={offset}
              />
            </svg>
            <button
              onClick={() => fileRef.current?.click()}
              disabled={uploadingAvatar}
              title="Upload avatar"
              className="group absolute inset-1.5 rounded-full overflow-hidden bg-slate-100 flex items-center justify-center"
            >
              {avatarSrc ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={avatarSrc} alt={profile.name} className="w-full h-full object-cover" />
              ) : (
                <span className="text-lg font-bold text-slate-400">{initials}</span>
              )}
              <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                {uploadingAvatar ? <Loader2 className="w-4 h-4 text-white animate-spin" /> : <Camera className="w-4 h-4 text-white" />}
              </div>
            </button>
            <input ref={fileRef} type="file" accept="image/jpg,image/jpeg,image/png,image/webp" className="hidden" onChange={handleFileChange} />
            <div className="absolute -bottom-1 -right-1 w-7 h-7 rounded-full bg-white border-2 border-white shadow-sm flex items-center justify-center">
              <span className="text-[10px] font-black text-blue-600">{completeness}</span>
            </div>
          </div>

          <div className="min-w-0">
            <p className="text-lg font-bold text-slate-900 truncate">{profile.name}</p>
            <p className="text-sm text-slate-400 truncate">{subtitle}</p>
          </div>
        </div>

        <div className="flex items-center gap-1 shrink-0">
          <button onClick={onEditClick} title="Edit profile" className="p-2 hover:bg-slate-100 rounded-lg transition text-slate-500">
            <Pencil className="w-4 h-4" />
          </button>
          <button onClick={onShare} title="Copy profile link" className="p-2 hover:bg-slate-100 rounded-lg transition text-slate-500 relative">
            <Share2 className="w-4 h-4" />
            {shareCopied && (
              <span className="absolute -bottom-7 right-0 text-[10px] font-bold bg-slate-800 text-white px-2 py-1 rounded-md whitespace-nowrap">Copied!</span>
            )}
          </button>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4 mb-5 pb-5 border-b border-slate-50">
        <div>
          <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-0.5">Registered</p>
          <p className="text-xs font-bold text-slate-600">{formatDate(profile.member_since)}</p>
        </div>
        <div>
          <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-0.5">Last Edited</p>
          <p className="text-xs font-bold text-slate-600">{formatDate(profile.last_edited)}</p>
        </div>
      </div>

      <div className="flex items-center gap-2 mb-5">
        <button
          onClick={onEditClick}
          className="flex-1 px-3 py-2 border border-slate-200 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-50 transition flex items-center justify-center gap-1.5"
        >
          <Pencil size={12} /> Edit Profile
        </button>
        <button
          onClick={onChangePasswordClick}
          className="flex-1 px-3 py-2 border border-slate-200 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-50 transition flex items-center justify-center gap-1.5"
        >
          <KeyRound size={12} /> Change Password
        </button>
        <button
          onClick={() => fileRef.current?.click()}
          className="flex-1 px-3 py-2 border border-slate-200 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-50 transition flex items-center justify-center gap-1.5"
        >
          <Camera size={12} /> Upload Avatar
        </button>
      </div>

      <div>
        <FieldRow icon={Mail} label="Email">{profile.email}</FieldRow>
        <FieldRow icon={Briefcase} label="Job Title">{profile.job_title || <Placeholder />}</FieldRow>
        <FieldRow icon={Building2} label="Company">{profile.company || <Placeholder />}</FieldRow>
        <FieldRow icon={Phone} label="Phone">
          {profile.phone_mobile || profile.phone_work ? (
            <div className="space-y-0.5">
              {profile.phone_mobile && <p>Mobile: {profile.phone_mobile}</p>}
              {profile.phone_work && <p>Work: {profile.phone_work}</p>}
            </div>
          ) : <Placeholder />}
        </FieldRow>
        <FieldRow icon={MapPin} label="Mailing Address">
          {profile.mailing_address ? (
            <span className="whitespace-pre-line">{profile.mailing_address}</span>
          ) : <Placeholder />}
        </FieldRow>
        <FieldRow icon={Globe} label="Timezone">{profile.timezone || <Placeholder />}</FieldRow>
        <FieldRow icon={Cake} label="Birthday">{profile.birthday ? formatDate(profile.birthday) : <Placeholder />}</FieldRow>
        <FieldRow icon={FileText} label="Bio">
          {profile.bio ? <span className="whitespace-pre-line font-normal text-slate-600">{profile.bio}</span> : <Placeholder />}
        </FieldRow>
        <div className="flex items-start justify-between gap-4 py-3.5">
          <div className="flex items-center gap-3 text-slate-400 shrink-0">
            <TagIcon className="w-4 h-4" />
            <span className="text-xs font-medium">Tags</span>
          </div>
          <div className="flex flex-wrap justify-end gap-1.5">
            {profile.tags && profile.tags.length > 0 ? (
              profile.tags.map((tag) => (
                <span key={tag} className="px-2.5 py-1 bg-blue-50 text-blue-600 rounded-full text-[10px] font-bold">
                  {tag}
                </span>
              ))
            ) : <Placeholder />}
          </div>
        </div>
      </div>
    </div>
  );
}
