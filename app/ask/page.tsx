"use client";

import { useState } from "react";
import Link from "next/link";
import { Send, ShieldAlert, Sparkles, Key, CheckCircle2, ArrowLeft } from "lucide-react";
import { MOCK_CATEGORIES } from "../../lib/mockData";
import { DataService } from "../../lib/db";

export default function AskPage() {
  const [identity, setIdentity] = useState<"anonymous" | "public">("anonymous");
  const [authorName, setAuthorName] = useState("");
  const [categorySlug, setCategorySlug] = useState("bribes");
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [urgency, setUrgency] = useState<"low" | "medium" | "high" | "critical">("medium");
  const [contactEmail, setContactEmail] = useState("");
  const [submittedCode, setSubmittedCode] = useState<string | null>(null);

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
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6 pt-4">
      
      {/* Back Link */}
      <Link href="/" className="inline-flex items-center gap-1.5 text-sm font-semibold text-stone-600 hover:text-brand-coral transition-colors">
        <ArrowLeft className="w-4 h-4" /> Back to Public Feed
      </Link>

      <div className="bg-white border border-stone-200 rounded-3xl p-6 sm:p-10 shadow-sm space-y-6">
        
        {/* Header */}
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-brand-light text-brand-coral border border-brand-border text-xs font-semibold mb-3">
            <Sparkles className="w-4 h-4" /> 100% Free • No Account Needed
          </div>
          <h1 className="text-3xl font-extrabold text-stone-900 tracking-tight">
            Submit Issue or Legal Query
          </h1>
          <p className="text-stone-600 text-sm mt-1">
            Describe your problem freely. Verified lawyers and CPAs answer for public interest.
          </p>
        </div>

        {/* Success Alert Banner */}
        {submittedCode ? (
          <div className="bg-emerald-50 border border-emerald-200 text-emerald-800 p-6 rounded-2xl space-y-4">
            <div className="flex items-center gap-2 font-bold text-lg">
              <CheckCircle2 className="w-6 h-6 text-emerald-600" />
              <span>Published Successfully to Public Feed!</span>
            </div>
            <p className="text-sm text-emerald-700">
              Your Secret Issue Tracking Code is:
            </p>
            <div className="inline-flex items-center gap-2 bg-white px-4 py-2 rounded-xl border border-emerald-300 font-mono font-bold text-lg text-stone-900 shadow-sm">
              <Key className="w-5 h-5 text-emerald-600" />
              <span>{submittedCode}</span>
            </div>
            <p className="text-xs text-emerald-600 leading-relaxed">
              You do not need an account. Keep this tracking code to check lawyer responses or add follow-up details anytime at <code>/track</code>.
            </p>

            <div className="pt-2 flex flex-wrap gap-3">
              <Link
                href="/track"
                className="bg-emerald-600 text-white text-sm font-bold px-4 py-2 rounded-xl shadow-sm hover:bg-emerald-700 transition-colors"
              >
                Track My Submission Now
              </Link>
              <button
                onClick={() => {
                  setSubmittedCode(null);
                  setTitle("");
                  setDescription("");
                }}
                className="bg-white text-stone-700 border border-stone-300 text-sm font-semibold px-4 py-2 rounded-xl hover:bg-stone-50"
              >
                Submit Another Issue
              </button>
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-5">
            
            {/* 1. Identity Selection */}
            <div className="space-y-2">
              <label className="text-xs font-bold text-stone-800 uppercase tracking-wider block">
                How would you like to publish this?
              </label>
              <div className="grid grid-cols-2 gap-3">
                <label className={`p-4 rounded-2xl border cursor-pointer text-center transition-all ${identity === 'anonymous' ? 'border-brand-coral bg-brand-light text-brand-coral font-bold shadow-sm' : 'border-stone-200 bg-stone-50 text-stone-600'}`}>
                  <input
                    type="radio"
                    name="identity"
                    value="anonymous"
                    checked={identity === "anonymous"}
                    onChange={() => setIdentity("anonymous")}
                    className="hidden"
                  />
                  <div className="text-base font-bold">👤 Anonymous</div>
                  <div className="text-xs font-normal opacity-80 mt-0.5">Hide your name completely</div>
                </label>

                <label className={`p-4 rounded-2xl border cursor-pointer text-center transition-all ${identity === 'public' ? 'border-brand-coral bg-brand-light text-brand-coral font-bold shadow-sm' : 'border-stone-200 bg-stone-50 text-stone-600'}`}>
                  <input
                    type="radio"
                    name="identity"
                    value="public"
                    checked={identity === "public"}
                    onChange={() => setIdentity("public")}
                    className="hidden"
                  />
                  <div className="text-base font-bold">✍️ Public Name</div>
                  <div className="text-xs font-normal opacity-80 mt-0.5">Show your name / alias</div>
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
                  className="w-full bg-stone-50 border border-stone-300 rounded-xl px-4 py-3 text-sm text-stone-900 focus:outline-none focus:border-brand-coral focus:ring-2 focus:ring-brand-coral/20"
                  required
                />
              </div>
            )}

            {/* 2. Category */}
            <div>
              <label className="text-xs font-bold text-stone-800 uppercase tracking-wider block mb-1">
                Category
              </label>
              <select
                value={categorySlug}
                onChange={(e) => setCategorySlug(e.target.value)}
                className="w-full bg-stone-50 border border-stone-300 rounded-xl px-4 py-3 text-sm text-stone-900 focus:outline-none focus:border-brand-coral focus:ring-2 focus:ring-brand-coral/20 font-medium"
              >
                {MOCK_CATEGORIES.map((cat) => (
                  <option key={cat.slug} value={cat.slug}>
                    {cat.icon} {cat.name}
                  </option>
                ))}
              </select>
            </div>

            {/* 3. Title */}
            <div>
              <label className="text-xs font-bold text-stone-800 uppercase tracking-wider block mb-1">
                Issue Title
              </label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Summarize your problem in one clear sentence..."
                className="w-full bg-stone-50 border border-stone-300 rounded-xl px-4 py-3 text-sm text-stone-900 focus:outline-none focus:border-brand-coral focus:ring-2 focus:ring-brand-coral/20"
                required
              />
            </div>

            {/* 4. Description */}
            <div>
              <label className="text-xs font-bold text-stone-800 uppercase tracking-wider block mb-1">
                Detailed Story & Background
              </label>
              <textarea
                rows={5}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Explain what happened, government office/authority involved, location, dates, financial/legal impact, and what advice you need..."
                className="w-full bg-stone-50 border border-stone-300 rounded-xl px-4 py-3 text-sm text-stone-900 focus:outline-none focus:border-brand-coral focus:ring-2 focus:ring-brand-coral/20"
                required
              />
            </div>

            {/* 5. Urgency */}
            <div>
              <label className="text-xs font-bold text-stone-800 uppercase tracking-wider block mb-1">
                Urgency Level
              </label>
              <select
                value={urgency}
                onChange={(e: any) => setUrgency(e.target.value)}
                className="w-full bg-stone-50 border border-stone-300 rounded-xl px-4 py-3 text-sm text-stone-900 focus:outline-none focus:border-brand-coral focus:ring-2 focus:ring-brand-coral/20 font-medium"
              >
                <option value="low">Low (General Inquiry)</option>
                <option value="medium">Medium (Action Needed Soon)</option>
                <option value="high">High (Legal Deadline Approaching)</option>
                <option value="critical">Critical (Immediate Threat / Active Bribe Demand)</option>
              </select>
            </div>

            {/* 6. Optional Contact */}
            <div>
              <label className="text-xs font-bold text-stone-800 uppercase tracking-wider block mb-1">
                Notification Email (Optional)
              </label>
              <input
                type="email"
                value={contactEmail}
                onChange={(e) => setContactEmail(e.target.value)}
                placeholder="Optional: Receive real-time alerts when a lawyer responds"
                className="w-full bg-stone-50 border border-stone-300 rounded-xl px-4 py-3 text-sm text-stone-900 focus:outline-none focus:border-brand-coral focus:ring-2 focus:ring-brand-coral/20"
              />
            </div>

            {/* Submit CTA */}
            <button
              type="submit"
              className="w-full bg-brand-coral hover:bg-brand-hover text-white font-bold py-4 rounded-xl shadow-coral flex items-center justify-center gap-2 text-base transition-all transform active:scale-95 mt-4"
            >
              <Send className="w-5 h-5" />
              <span>Publish Issue & Get Legal Advice</span>
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
