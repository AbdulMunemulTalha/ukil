"use client";

import { useState } from "react";
import { X, Send, ShieldAlert, Sparkles, Key, CheckCircle2 } from "lucide-react";
import { MOCK_CATEGORIES } from "../lib/mockData";
import { DataService } from "../lib/db";

interface SubmitModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: (newQuestion: any) => void;
}

export default function SubmitModal({ isOpen, onClose, onSuccess }: SubmitModalProps) {
  const [identity, setIdentity] = useState<"anonymous" | "public">("anonymous");
  const [authorName, setAuthorName] = useState("");
  const [categorySlug, setCategorySlug] = useState("bribes");
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [urgency, setUrgency] = useState<"low" | "medium" | "high" | "critical">("medium");
  const [contactEmail, setContactEmail] = useState("");
  const [submittedCode, setSubmittedCode] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const selectedCategory = MOCK_CATEGORIES.find((c) => c.slug === categorySlug);

    const created = DataService.addQuestion({
      title,
      description,
      categorySlug,
      categoryName: selectedCategory ? selectedCategory.name : "General Legal",
      urgency,
      isAnonymous: identity === "anonymous",
      authorName: identity === "anonymous" ? "Anonymous Citizen" : authorName || "Citizen",
      location: "Dhaka",
      contactEmail,
    });

    setSubmittedCode(created.trackingCode);

    if (onSuccess) {
      onSuccess(created);
    }

    setTimeout(() => {
      setSubmittedCode(null);
      setTitle("");
      setDescription("");
      onClose();
    }, 4500);
  };

  return (
    <div className="fixed inset-0 z-50 bg-stone-900/60 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-white border border-stone-200 rounded-3xl max-w-xl w-full max-h-[90vh] overflow-y-auto p-6 sm:p-8 shadow-2xl relative animate-in fade-in zoom-in-95 duration-200">
        
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-5 right-5 w-8 h-8 rounded-full bg-stone-100 text-stone-500 hover:bg-stone-200 flex items-center justify-center transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Title */}
        <div className="mb-6">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-brand-light text-brand-coral border border-brand-border text-xs font-semibold mb-2">
            <Sparkles className="w-3.5 h-3.5" /> No Account Needed • Free Public Q&A
          </div>
          <h2 className="text-2xl font-extrabold text-stone-900 tracking-tight">
            Submit Issue / Ask Query
          </h2>
          <p className="text-stone-600 text-sm mt-1">
            Describe your problem freely. Verified lawyers and CPAs answer for public interest.
          </p>
        </div>

        {/* Success Banner */}
        {submittedCode && (
          <div className="bg-emerald-50 border border-emerald-200 text-emerald-800 p-4 rounded-2xl mb-6 space-y-2">
            <div className="flex items-center gap-2 font-bold text-base">
              <CheckCircle2 className="w-5 h-5 text-emerald-600" />
              <span>Published Successfully!</span>
            </div>
            <p className="text-xs text-emerald-700">
              Your Secret Tracking Code is:
            </p>
            <div className="inline-flex items-center gap-2 bg-white px-3 py-1.5 rounded-lg border border-emerald-300 font-mono font-bold text-sm text-stone-900">
              <Key className="w-4 h-4 text-emerald-600" />
              <span>{submittedCode}</span>
            </div>
            <p className="text-[11px] text-emerald-600">
              Save this tracking code to check lawyer advice at <code>/track</code> anytime.
            </p>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          
          {/* Identity Choice */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-stone-800 uppercase tracking-wider">
              Publish Identity Preference
            </label>
            <div className="grid grid-cols-2 gap-3">
              <label className={`p-3 rounded-xl border cursor-pointer text-center transition-all ${identity === 'anonymous' ? 'border-brand-coral bg-brand-light text-brand-coral font-bold shadow-sm' : 'border-stone-200 bg-stone-50 text-stone-600'}`}>
                <input
                  type="radio"
                  name="identity"
                  value="anonymous"
                  checked={identity === "anonymous"}
                  onChange={() => setIdentity("anonymous")}
                  className="hidden"
                />
                <div className="text-sm">👤 Anonymous</div>
                <div className="text-[11px] font-normal opacity-80">Hide name completely</div>
              </label>

              <label className={`p-3 rounded-xl border cursor-pointer text-center transition-all ${identity === 'public' ? 'border-brand-coral bg-brand-light text-brand-coral font-bold shadow-sm' : 'border-stone-200 bg-stone-50 text-stone-600'}`}>
                <input
                  type="radio"
                  name="identity"
                  value="public"
                  checked={identity === "public"}
                  onChange={() => setIdentity("public")}
                  className="hidden"
                />
                <div className="text-sm">✍️ Public Name</div>
                <div className="text-[11px] font-normal opacity-80">Show your name / alias</div>
              </label>
            </div>
          </div>

          {identity === "public" && (
            <div>
              <label className="text-xs font-bold text-stone-800 uppercase tracking-wider block mb-1">
                Your Name or Alias
              </label>
              <input
                type="text"
                value={authorName}
                onChange={(e) => setAuthorName(e.target.value)}
                placeholder="e.g. Rahim Khan or Concerned Business Owner"
                className="w-full bg-stone-50 border border-stone-300 rounded-xl px-4 py-2.5 text-sm text-stone-900 focus:outline-none focus:border-brand-coral focus:ring-2 focus:ring-brand-coral/20"
                required
              />
            </div>
          )}

          {/* Category */}
          <div>
            <label className="text-xs font-bold text-stone-800 uppercase tracking-wider block mb-1">
              Issue Category
            </label>
            <select
              value={categorySlug}
              onChange={(e) => setCategorySlug(e.target.value)}
              className="w-full bg-stone-50 border border-stone-300 rounded-xl px-4 py-2.5 text-sm text-stone-900 focus:outline-none focus:border-brand-coral focus:ring-2 focus:ring-brand-coral/20"
            >
              {MOCK_CATEGORIES.map((cat) => (
                <option key={cat.slug} value={cat.slug}>
                  {cat.icon} {cat.name}
                </option>
              ))}
            </select>
          </div>

          {/* Title */}
          <div>
            <label className="text-xs font-bold text-stone-800 uppercase tracking-wider block mb-1">
              Issue Title
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Summarize your issue in one clear sentence..."
              className="w-full bg-stone-50 border border-stone-300 rounded-xl px-4 py-2.5 text-sm text-stone-900 focus:outline-none focus:border-brand-coral focus:ring-2 focus:ring-brand-coral/20"
              required
            />
          </div>

          {/* Description */}
          <div>
            <label className="text-xs font-bold text-stone-800 uppercase tracking-wider block mb-1">
              Detailed Story & Background
            </label>
            <textarea
              rows={4}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Explain what happened, government office/authority involved, location, dates, and what legal/financial advice you need..."
              className="w-full bg-stone-50 border border-stone-300 rounded-xl px-4 py-2.5 text-sm text-stone-900 focus:outline-none focus:border-brand-coral focus:ring-2 focus:ring-brand-coral/20"
              required
            />
          </div>

          {/* Urgency */}
          <div>
            <label className="text-xs font-bold text-stone-800 uppercase tracking-wider block mb-1">
              Urgency Level
            </label>
            <select
              value={urgency}
              onChange={(e: any) => setUrgency(e.target.value)}
              className="w-full bg-stone-50 border border-stone-300 rounded-xl px-4 py-2.5 text-sm text-stone-900 focus:outline-none focus:border-brand-coral focus:ring-2 focus:ring-brand-coral/20"
            >
              <option value="low">Low (General Inquiry)</option>
              <option value="medium">Medium (Action Needed Soon)</option>
              <option value="high">High (Legal Deadline Approaching)</option>
              <option value="critical">Critical (Immediate Threat / Active Bribe Demand)</option>
            </select>
          </div>

          {/* Optional Contact */}
          <div>
            <label className="text-xs font-bold text-stone-800 uppercase tracking-wider block mb-1">
              Notification Email (Optional)
            </label>
            <input
              type="email"
              value={contactEmail}
              onChange={(e) => setContactEmail(e.target.value)}
              placeholder="Optional: Receive real-time alerts when a lawyer answers"
              className="w-full bg-stone-50 border border-stone-300 rounded-xl px-4 py-2.5 text-sm text-stone-900 focus:outline-none focus:border-brand-coral focus:ring-2 focus:ring-brand-coral/20"
            />
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            className="w-full bg-brand-coral hover:bg-brand-hover text-white font-bold py-3.5 rounded-xl shadow-coral flex items-center justify-center gap-2 text-base transition-all transform active:scale-95 mt-4"
          >
            <Send className="w-5 h-5" />
            <span>Publish Issue & Get Legal Advice</span>
          </button>
        </form>
      </div>
    </div>
  );
}
