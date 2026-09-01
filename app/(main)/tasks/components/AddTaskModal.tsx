"use client";

import { useState, useEffect } from "react";
import { X, AlertCircle } from "lucide-react";
import { format } from "date-fns";
import { TaskItem, TaskStatus, KanbanColumn } from "./task-types";
import clsx from "clsx";
import CustomSelect from "./ui/CustomSelect";
import CustomDateInput from "./ui/CustomDateInput";

type AddTaskModalProps = {
  isOpen: boolean;
  onClose: () => void;
  onAdd: (task: Omit<TaskItem, "id">) => Promise<void>;
  columns: KanbanColumn[];
  defaultStatus?: string;
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

export default function AddTaskModal({
  isOpen,
  onClose,
  onAdd,
  columns,
  defaultStatus,
}: AddTaskModalProps) {
  const [hasMounted, setHasMounted] = useState(false);
  useEffect(() => {
    setHasMounted(true);
  }, []);

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [status, setStatus] = useState<TaskStatus>(defaultStatus || columns[0]?.id || "");
  const [priority, setPriority] = useState<TaskItem["priority"]>("medium");
  const [startDate, setStartDate] = useState("");
  const [dueDate, setDueDate] = useState("");
  const [titleError, setTitleError] = useState<string | null>(null);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setStatus(defaultStatus || columns[0]?.id || "");
      setTitleError(null);
      setSubmitError(null);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen, defaultStatus]);

  if (!isOpen || !hasMounted) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitError(null);

    if (!title.trim()) {
      setTitleError("Title is required.");
      return;
    }
    if (!status) {
      setSubmitError("This project has no columns to place the task in.");
      return;
    }

    const nowDate = new Date();
    const now = nowDate.toISOString();
    setIsSubmitting(true);
    try {
      await onAdd({
        title: title.trim(),
        description,
        status,
        priority,
        // Kalau start date tidak diatur, task langsung mulai saat dibuat.
        // Due date sengaja tidak diberi default — biarkan kosong kalau memang tidak diisi.
        startDate: startDate ? startDate.replace("T", " ") : format(nowDate, "yyyy-MM-dd HH:mm"),
        dueDate: dueDate ? dueDate.replace("T", " ") : undefined,
        tags: [],
        createdAt: now,
        progress: 0,
        assignees: [],
        attachments: [],
        subtasks: [],
        comments: [],
        activities: [{ id: `activity-${Date.now()}`, message: "Task created", createdAt: now }],
      });

      // Reset
      setTitle("");
      setDescription("");
      setStartDate("");
      setDueDate("");
      onClose();
    } catch (err) {
      setSubmitError(extractErrorMessage(err));
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div 
      className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm animate-in fade-in duration-200"
      onClick={onClose}
    >
      <div 
        className="bg-white w-full max-w-md rounded-2xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
          <h3 className="font-bold text-slate-800 text-lg">Create New Task</h3>
          <button onClick={onClose} className="p-2 hover:bg-slate-200 rounded-full transition">
            <X className="w-5 h-5 text-slate-500" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">
              Title <span className="text-red-500">*</span>
            </label>
            <input
              autoFocus
              type="text"
              placeholder="What needs to be done?"
              className={clsx(
                "w-full px-4 py-2.5 bg-slate-50 border rounded-xl focus:ring-2 transition-all outline-none text-slate-800 font-medium",
                titleError ? "border-red-300 focus:ring-red-500/20 focus:border-red-500" : "border-slate-200 focus:ring-blue-500/20 focus:border-blue-500"
              )}
              value={title}
              onChange={(e) => {
                setTitle(e.target.value);
                if (titleError) setTitleError(null);
              }}
            />
            {titleError && (
              <p className="flex items-center gap-1.5 text-xs font-medium text-red-600">
                <AlertCircle size={12} /> {titleError}
              </p>
            )}
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">Description</label>
            <textarea
              placeholder="Add some details..."
              rows={3}
              className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all outline-none text-slate-600 text-sm resize-none"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">Status</label>
              <CustomSelect
                label="Status"
                value={status}
                options={columns.map((col) => ({ id: col.id, label: col.title }))}
                onChange={(val) => setStatus(val)}
                triggerClassName="py-2"
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">Priority</label>
              <div className="flex bg-slate-100 p-1 rounded-xl">
                {(["low", "medium", "high"] as const).map((p) => (
                  <button
                    key={p}
                    type="button"
                    onClick={() => setPriority(p)}
                    className={clsx(
                      "flex-1 py-1.5 text-[10px] font-bold uppercase rounded-lg transition-all",
                      priority === p 
                        ? p === "high" ? "bg-red-500 text-white shadow-sm" : 
                          p === "medium" ? "bg-orange-500 text-white shadow-sm" : 
                          "bg-blue-500 text-white shadow-sm"
                        : "text-slate-500 hover:text-slate-700"
                    )}
                  >
                    {p}
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">Start Date</label>
              <CustomDateInput
                mode="datetime"
                value={startDate}
                onChange={setStartDate}
                placeholder="Set start"
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">Due Date</label>
              <CustomDateInput
                mode="datetime"
                value={dueDate}
                onChange={setDueDate}
                placeholder="Set due date"
              />
            </div>
          </div>

          {submitError && (
            <div className="flex items-start gap-2 px-3.5 py-2.5 bg-red-50 border border-red-100 rounded-xl text-xs font-medium text-red-600">
              <AlertCircle size={14} className="shrink-0 mt-0.5" />
              <span>{submitError}</span>
            </div>
          )}

          <div className="pt-4 flex gap-3">
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
              className="flex-1 px-4 py-2.5 bg-blue-600 text-white rounded-xl font-semibold text-sm hover:bg-blue-700 shadow-lg shadow-blue-200 transition active:scale-95 disabled:opacity-60 disabled:active:scale-100"
            >
              {isSubmitting ? "Creating..." : "Create Task"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
