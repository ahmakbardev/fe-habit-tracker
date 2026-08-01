"use client";

import { useEffect, useMemo, useState } from "react";
import { X, AlertCircle, Plus } from "lucide-react";
import clsx from "clsx";
import { ProfileData, ProfileUpdatePayload } from "@/lib/profile-service";
import CustomSelect from "../../tasks/components/ui/CustomSelect";
import CustomDateInput from "../../tasks/components/ui/CustomDateInput";

type Props = {
  isOpen: boolean;
  onClose: () => void;
  profile: ProfileData;
  onSave: (data: ProfileUpdatePayload) => Promise<void>;
};

function extractErrorMessage(err: unknown): string {
  if (err && typeof err === "object" && "response" in err) {
    const response = (err as { response?: { data?: { message?: string; errors?: Record<string, string[]> } } }).response;
    const firstFieldError = response?.data?.errors ? Object.values(response.data.errors)[0]?.[0] : undefined;
    if (firstFieldError) return firstFieldError;
    if (response?.data?.message) return response.data.message;
  }
  if (err instanceof Error && err.message) return err.message;
  return "Something went wrong. Please try again.";
}

function useTimezoneOptions() {
  return useMemo(() => {
    try {
      const zones: string[] = (Intl as unknown as { supportedValuesOf: (key: string) => string[] }).supportedValuesOf("timeZone");
      return zones.map((z) => ({ id: z, label: z.replace(/_/g, " ") }));
    } catch {
      return [
        "UTC", "Asia/Jakarta", "Asia/Singapore", "Asia/Tokyo", "Asia/Kolkata",
        "Europe/London", "Europe/Berlin", "America/New_York", "America/Los_Angeles",
        "Australia/Sydney",
      ].map((z) => ({ id: z, label: z.replace(/_/g, " ") }));
    }
  }, []);
}

export default function EditProfileModal({ isOpen, onClose, profile, onSave }: Props) {
  const [name, setName] = useState("");
  const [username, setUsername] = useState("");
  const [bio, setBio] = useState("");
  const [jobTitle, setJobTitle] = useState("");
  const [company, setCompany] = useState("");
  const [phoneMobile, setPhoneMobile] = useState("");
  const [phoneWork, setPhoneWork] = useState("");
  const [mailingAddress, setMailingAddress] = useState("");
  const [timezone, setTimezone] = useState("");
  const [birthday, setBirthday] = useState("");
  const [tags, setTags] = useState<string[]>([]);
  const [tagDraft, setTagDraft] = useState("");
  const [nameError, setNameError] = useState<string | null>(null);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const timezoneOptions = useTimezoneOptions();

  useEffect(() => {
    if (!isOpen) return;
    setName(profile.name);
    setUsername(profile.username);
    setBio(profile.bio || "");
    setJobTitle(profile.job_title || "");
    setCompany(profile.company || "");
    setPhoneMobile(profile.phone_mobile || "");
    setPhoneWork(profile.phone_work || "");
    setMailingAddress(profile.mailing_address || "");
    setTimezone(profile.timezone || "");
    setBirthday(profile.birthday || "");
    setTags(profile.tags || []);
    setTagDraft("");
    setNameError(null);
    setSubmitError(null);
  }, [isOpen, profile]);

  if (!isOpen) return null;

  const addTag = () => {
    const value = tagDraft.trim();
    if (!value || tags.includes(value)) {
      setTagDraft("");
      return;
    }
    setTags((prev) => [...prev, value]);
    setTagDraft("");
  };

  const removeTag = (tag: string) => setTags((prev) => prev.filter((t) => t !== tag));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitError(null);

    if (!name.trim()) {
      setNameError("Name is required.");
      return;
    }

    setIsSubmitting(true);
    try {
      await onSave({
        name: name.trim(),
        username: username.trim(),
        bio: bio || null,
        job_title: jobTitle || null,
        company: company || null,
        phone_mobile: phoneMobile || null,
        phone_work: phoneWork || null,
        mailing_address: mailingAddress || null,
        timezone: timezone || null,
        birthday: birthday || null,
        tags,
      });
      onClose();
    } catch (err) {
      setSubmitError(extractErrorMessage(err));
    } finally {
      setIsSubmitting(false);
    }
  };

  const inputClass = "w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all outline-none text-sm text-slate-800";
  const labelClass = "text-xs font-bold text-slate-400 uppercase tracking-wider mb-1.5 block";

  return (
    <div
      className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm animate-in fade-in duration-200"
      onClick={onClose}
    >
      <div
        className="bg-white w-full max-w-2xl max-h-[90vh] rounded-2xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200 flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/50 shrink-0">
          <h3 className="font-bold text-slate-800 text-lg">Edit Profile</h3>
          <button onClick={onClose} className="p-2 hover:bg-slate-200 rounded-full transition">
            <X className="w-5 h-5 text-slate-500" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-5 overflow-y-auto">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className={labelClass}>Name *</label>
              <input
                className={clsx(inputClass, nameError && "border-red-300 focus:ring-red-500/20 focus:border-red-500")}
                value={name}
                onChange={(e) => { setName(e.target.value); if (nameError) setNameError(null); }}
              />
              {nameError && (
                <p className="flex items-center gap-1.5 text-xs font-medium text-red-600 mt-1">
                  <AlertCircle size={12} /> {nameError}
                </p>
              )}
            </div>
            <div>
              <label className={labelClass}>Username</label>
              <input className={inputClass} value={username} onChange={(e) => setUsername(e.target.value)} />
            </div>
          </div>

          <div>
            <label className={labelClass}>Bio</label>
            <textarea
              className={clsx(inputClass, "resize-none")}
              rows={2}
              placeholder="Tell something about yourself..."
              value={bio}
              onChange={(e) => setBio(e.target.value)}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className={labelClass}>Job Title</label>
              <input className={inputClass} placeholder="e.g. Product Manager" value={jobTitle} onChange={(e) => setJobTitle(e.target.value)} />
            </div>
            <div>
              <label className={labelClass}>Company</label>
              <input className={inputClass} placeholder="e.g. Acme Inc." value={company} onChange={(e) => setCompany(e.target.value)} />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className={labelClass}>Mobile Phone</label>
              <input className={inputClass} placeholder="+1 555 000 0000" value={phoneMobile} onChange={(e) => setPhoneMobile(e.target.value)} />
            </div>
            <div>
              <label className={labelClass}>Work Phone</label>
              <input className={inputClass} placeholder="+1 555 000 0000" value={phoneWork} onChange={(e) => setPhoneWork(e.target.value)} />
            </div>
          </div>

          <div>
            <label className={labelClass}>Mailing Address</label>
            <textarea
              className={clsx(inputClass, "resize-none")}
              rows={2}
              placeholder="Street, city, state, postal code, country"
              value={mailingAddress}
              onChange={(e) => setMailingAddress(e.target.value)}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className={labelClass}>Timezone</label>
              <CustomSelect
                label="Timezone"
                value={timezone}
                options={timezoneOptions}
                onChange={setTimezone}
                placeholder="Select timezone"
              />
            </div>
            <div>
              <label className={labelClass}>Birthday</label>
              <CustomDateInput mode="date" value={birthday} onChange={setBirthday} placeholder="Set birthday" />
            </div>
          </div>

          <div>
            <label className={labelClass}>Tags</label>
            <div className="flex flex-wrap items-center gap-2 p-3 bg-slate-50 border border-slate-200 rounded-xl">
              {tags.map((tag) => (
                <span key={tag} className="flex items-center gap-1.5 pl-3 pr-2 py-1 bg-white border border-slate-200 rounded-full text-xs font-semibold text-slate-600">
                  {tag}
                  <button type="button" onClick={() => removeTag(tag)} className="text-slate-400 hover:text-red-500 transition">
                    <X size={12} />
                  </button>
                </span>
              ))}
              <div className="flex items-center gap-1">
                <input
                  value={tagDraft}
                  onChange={(e) => setTagDraft(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") { e.preventDefault(); addTag(); }
                  }}
                  placeholder="Add a tag..."
                  className="text-xs px-2 py-1 bg-transparent outline-none text-slate-700 w-24"
                />
                <button type="button" onClick={addTag} className="p-1 text-slate-400 hover:text-blue-600 transition">
                  <Plus size={14} />
                </button>
              </div>
            </div>
          </div>

          {submitError && (
            <div className="flex items-start gap-2 px-3.5 py-2.5 bg-red-50 border border-red-100 rounded-xl text-xs font-medium text-red-600">
              <AlertCircle size={14} className="shrink-0 mt-0.5" />
              <span>{submitError}</span>
            </div>
          )}

          <div className="pt-2 flex gap-3 sticky bottom-0 bg-white">
            <button
              type="button"
              onClick={onClose}
              disabled={isSubmitting}
              className="flex-1 px-4 py-2.5 border border-slate-200 text-slate-600 rounded-xl font-semibold text-sm hover:bg-slate-50 transition disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="flex-1 px-4 py-2.5 bg-blue-600 text-white rounded-xl font-semibold text-sm hover:bg-blue-700 shadow-lg shadow-blue-200 transition active:scale-95 disabled:opacity-60"
            >
              {isSubmitting ? "Saving..." : "Save Changes"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
