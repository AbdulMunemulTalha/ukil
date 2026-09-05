"use client";

import { useState } from "react";
import Link from "next/link";
import { Key, Search, ShieldCheck, Clock, CheckCircle2, ArrowRight } from "lucide-react";
import { Question } from "../../lib/mockData";
import { DataService } from "../../lib/db";
import QuestionCard from "../../components/QuestionCard";

export default function TrackPage() {
  const [codeQuery, setCodeQuery] = useState("");
  const [foundQuestion, setFoundQuestion] = useState<Question | null>(null);
  const [searched, setSearched] = useState(false);

  const handleTrack = (e: React.FormEvent) => {
    e.preventDefault();
    setSearched(true);
    const match = DataService.getQuestionByIdOrCode(codeQuery);
    setFoundQuestion(match || null);
  };

  return (
    <div className="max-w-2xl mx-auto space-y-8 pt-4">
      
      {/* Header */}
      <div className="text-center space-y-3">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-brand-light text-brand-coral border border-brand-border text-xs font-bold">
          <Key className="w-3.5 h-3.5" /> No Login Required
        </div>
        <h1 className="text-3xl font-extrabold text-stone-900 tracking-tight">
          Track Your Submitted Issue
        </h1>
        <p className="text-stone-600 text-sm max-w-md mx-auto">
          Enter your 9-character secret tracking code (e.g. <code>UKIL-8942-X</code>) to view lawyer advice and update your case status.
        </p>
      </div>

      {/* Track Input Box */}
      <form onSubmit={handleTrack} className="bg-white border border-stone-200 p-6 rounded-3xl shadow-sm space-y-4">
        <div>
          <label className="text-xs font-bold text-stone-800 uppercase tracking-wider block mb-1.5">
            Secret Tracking Code or Email
          </label>
          <div className="relative">
            <Key className="w-5 h-5 absolute left-4 top-1/2 -translate-y-1/2 text-stone-400" />
            <input
              type="text"
              value={codeQuery}
              onChange={(e) => setCodeQuery(e.target.value)}
              placeholder="e.g. UKIL-8942-X"
              className="w-full bg-stone-50 border border-stone-300 rounded-xl pl-12 pr-4 py-3.5 font-mono text-base font-bold text-stone-900 uppercase focus:outline-none focus:border-brand-coral focus:ring-2 focus:ring-brand-coral/20"
              required
            />
          </div>
        </div>

        <button
          type="submit"
          className="w-full bg-brand-coral hover:bg-brand-hover text-white font-bold py-3.5 rounded-xl shadow-coral flex items-center justify-center gap-2 text-base transition-all transform active:scale-95"
        >
          <Search className="w-5 h-5" />
          <span>Lookup Submission Status</span>
        </button>
      </form>

      {/* Result Section */}
      {searched && foundQuestion && (
        <div className="space-y-4 animate-in fade-in duration-300">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-bold text-stone-900">
              Tracking Match Found
            </h2>
            <Link
              href={`/questions/${foundQuestion.id}`}
              className="text-brand-coral text-xs font-bold hover:underline flex items-center gap-1"
            >
              View Full Story & Advice <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <QuestionCard question={foundQuestion} />
        </div>
      )}
    </div>
  );
}
