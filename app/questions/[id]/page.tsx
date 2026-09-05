"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { ArrowLeft, ShieldCheck, ThumbsUp, CheckCircle2, Send, Clock, MapPin, Key, UserX, UserCheck, MessageSquare, AlertCircle } from "lucide-react";
import { Question, Answer, Professional } from "../../../lib/mockData";
import { DataService } from "../../../lib/db";
import { createClient } from "../../../lib/supabase/client";
import { getDefaultAvatar } from "../../../lib/avatar";

export default function QuestionDetailPage({ params }: { params: { id: string } }) {
  const initialQ = DataService.getQuestionByIdOrCode(params.id) || null;
  const [question, setQuestion] = useState<Question | null>(initialQ);
  const [answers, setAnswers] = useState<Answer[]>(initialQ ? DataService.getAnswersForQuestion(initialQ.id) : []);
  const [professionals, setProfessionals] = useState<Professional[]>([]);
  const [selectedProfId, setSelectedProfId] = useState<string>("");
  const [newAdviceText, setNewAdviceText] = useState("");
  const [isLawyerSubmitting, setIsLawyerSubmitting] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [adviceSuccess, setAdviceSuccess] = useState(false);
  const [currentLawyer, setCurrentLawyer] = useState<{ id: string; name: string; license: string; role: string; avatar?: string } | null>(null);

  useEffect(() => {
    if (typeof window !== "undefined" && window.location.hash === "#advice") {
      setIsLawyerSubmitting(true);
    }

    const loadData = () => {
      const q = DataService.getQuestionByIdOrCode(params.id);
      if (q) {
        setQuestion(q);
        const cached = DataService.getAnswersForQuestion(q.id);
        setAnswers(cached);
        DataService.getAnswersForQuestionAsync(q.id).then((live) => {
          if (live && live.length > 0) {
            setAnswers(live);
          }
        });
      } else {
        DataService.getQuestionByIdOrCodeAsync(params.id).then((fetchedQ) => {
          if (fetchedQ) {
            setQuestion(fetchedQ);
            const cached = DataService.getAnswersForQuestion(fetchedQ.id);
            setAnswers(cached);
            DataService.getAnswersForQuestionAsync(fetchedQ.id).then((live) => {
              if (live && live.length > 0) {
                setAnswers(live);
              }
            });
          }
        });
      }
      const profs = DataService.getProfessionals();
      setProfessionals(profs);
      if (profs.length > 0 && !selectedProfId) {
        setSelectedProfId(profs[0].id);
      }
    };

    loadData();
    DataService.syncFromSupabase().then(() => {
      loadData();
    });

    // Check if a verified professional is logged in
    const supabase = createClient();
    if (supabase) {
      supabase.auth.getUser().then(async ({ data: { user } }) => {
        if (user) {
          const { data: prof } = await supabase
            .from("profiles")
            .select("*")
            .eq("user_id", user.id)
            .single();

          if (prof) {
            setCurrentLawyer({
              id: prof.id,
              name: prof.full_name,
              license: prof.bar_license_no || "VERIFIED-BAR",
              role: prof.role === "professional" ? "Verified Advocate" : "Legal Advisor",
              avatar: prof.avatar_url || getDefaultAvatar(prof.full_name),
            });
            setSelectedProfId(prof.id);
          }
        }
      });
    }
  }, [params.id]);

  if (!question) {
    return (
      <div className="text-center py-12 space-y-4">
        <h2 className="text-xl font-bold text-stone-800">Question Not Found</h2>
        <Link href="/questions" className="text-brand-coral font-bold text-sm underline">
          Back to All Queries
        </Link>
      </div>
    );
  }

  const handleAddAdvice = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newAdviceText.trim() || submitting || !currentLawyer) return;

    setSubmitting(true);

    DataService.addAnswer({
      questionId: question.id,
      professionalId: currentLawyer.id,
      professionalName: currentLawyer.name,
      professionalRole: currentLawyer.role,
      professionalAvatar: currentLawyer.avatar || getDefaultAvatar(currentLawyer.name),
      barLicenseNo: currentLawyer.license,
      content: newAdviceText,
    });

    setAnswers(DataService.getAnswersForQuestion(question.id));
    const refreshedQ = DataService.getQuestionByIdOrCode(question.id);
    if (refreshedQ) setQuestion(refreshedQ);

    setNewAdviceText("");
    setIsLawyerSubmitting(false);
    setSubmitting(false);
    setAdviceSuccess(true);
    setTimeout(() => setAdviceSuccess(false), 5000);
  };

  const handleMarkAccepted = (answerId: string) => {
    DataService.acceptSolution(answerId, question.id);
    setAnswers(DataService.getAnswersForQuestion(question.id));
    const refreshedQ = DataService.getQuestionByIdOrCode(question.id);
    if (refreshedQ) setQuestion(refreshedQ);
  };

  const handleUpvoteAnswer = (answerId: string) => {
    DataService.upvoteAnswer(answerId, 1);
    setAnswers(DataService.getAnswersForQuestion(question.id));
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8 pt-2">
      
      {/* Back Button */}
      <Link href="/questions" className="inline-flex items-center gap-1.5 text-sm font-semibold text-stone-600 hover:text-brand-coral transition-colors">
        <ArrowLeft className="w-4 h-4" /> Back to All Queries
      </Link>

      {/* Main Question Card */}
      <div className="bg-white border border-stone-200 rounded-3xl p-6 sm:p-8 shadow-sm space-y-6">
        
        {/* Category & Urgency Header */}
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <span className="bg-brand-light text-brand-coral border border-brand-border text-xs font-bold px-3 py-1 rounded-full uppercase">
              {question.categoryName}
            </span>
            <span className="bg-red-100 text-red-700 border border-red-200 text-xs font-semibold px-3 py-1 rounded-full uppercase">
              Urgency: {question.urgency}
            </span>
          </div>

          <div className="flex items-center gap-2 font-mono text-xs text-stone-500 bg-stone-100 px-3 py-1 rounded-lg">
            <Key className="w-3.5 h-3.5 text-stone-400" />
            <span>Code: {question.trackingCode}</span>
          </div>
        </div>

        {/* Issue Title */}
        <h1 className="text-2xl sm:text-3xl font-extrabold text-stone-900 leading-snug">
          {question.title}
        </h1>

        {/* Author Metadata */}
        <div className="flex flex-wrap items-center gap-4 text-xs text-stone-500 pt-2 border-t border-stone-100">
          <div className="flex items-center gap-1 font-semibold text-stone-700">
            {question.isAnonymous ? (
              <span className="inline-flex items-center gap-1 bg-stone-100 text-stone-700 px-2.5 py-1 rounded">
                <UserX className="w-3.5 h-3.5 text-stone-500" /> Anonymous Citizen
              </span>
            ) : (
              <span className="inline-flex items-center gap-1 bg-brand-light text-brand-coral px-2.5 py-1 rounded border border-brand-border">
                <UserCheck className="w-3.5 h-3.5" /> Posted by {question.authorName}
              </span>
            )}
          </div>
          <div className="flex items-center gap-1">
            <Clock className="w-3.5 h-3.5" />
            <span>{question.createdAt}</span>
          </div>
          <div className="flex items-center gap-1">
            <MapPin className="w-3.5 h-3.5" />
            <span>{question.location}</span>
          </div>
        </div>

        {/* Detailed Story */}
        <div className="prose prose-stone max-w-none text-stone-800 leading-relaxed bg-stone-50 p-5 rounded-2xl border border-stone-200">
          <p className="whitespace-pre-line text-sm sm:text-base">{question.description}</p>
        </div>
      </div>

      {/* Verified Lawyer Advice Section */}
      <div id="advice" className="space-y-6 scroll-mt-24">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-extrabold text-stone-900 tracking-tight flex items-center gap-2">
            <MessageSquare className="w-6 h-6 text-brand-coral" />
            <span>Verified Expert Advice ({answers.length})</span>
          </h2>

          <button
            onClick={() => setIsLawyerSubmitting(!isLawyerSubmitting)}
            className="text-xs font-bold bg-brand-light text-brand-coral hover:bg-brand-coral hover:text-white px-3.5 py-2 rounded-xl border border-brand-border transition-colors shadow-2xs"
          >
            {isLawyerSubmitting ? "Close Form" : "+ Provide Lawyer Advice"}
          </button>
        </div>

        {adviceSuccess && (
          <div className="bg-emerald-50 border border-emerald-200 text-emerald-800 p-4 rounded-2xl flex items-center gap-2 text-sm font-semibold animate-in fade-in">
            <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
            <span>Your verified legal advice has been submitted and published live to Supabase!</span>
          </div>
        )}

        {/* Form for Lawyers to answer */}
        {isLawyerSubmitting && (
          currentLawyer ? (
            <form onSubmit={handleAddAdvice} className="bg-white border border-stone-200 rounded-3xl p-6 sm:p-8 space-y-4 shadow-sm animate-in fade-in">
              <div className="flex flex-wrap items-center justify-between gap-3 border-b border-stone-100 pb-3">
                <div className="flex items-center gap-2 text-sm font-bold text-stone-900">
                  <ShieldCheck className="w-5 h-5 text-emerald-600" />
                  <span>Provide Legal Advice as Verified Advocate / Consultant</span>
                </div>
                
                <div className="flex items-center gap-2">
                  <img
                    src={currentLawyer.avatar || getDefaultAvatar(currentLawyer.name)}
                    alt={currentLawyer.name}
                    className="w-6 h-6 rounded-full object-cover border border-emerald-400"
                  />
                  <span className="text-xs bg-emerald-50 text-emerald-800 border border-emerald-200 font-bold px-3 py-1 rounded-full">
                    Logged in as {currentLawyer.name} {currentLawyer.license ? `(${currentLawyer.license})` : ""}
                  </span>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-stone-700 mb-1.5">
                  Official Legal Advice & Statutory References
                </label>
                <textarea
                  rows={5}
                  value={newAdviceText}
                  onChange={(e) => setNewAdviceText(e.target.value)}
                  placeholder="Cite relevant sections of Penal Code, Labour Law 2006, Anti-Corruption Act, or Income Tax Act and explain actionable next steps..."
                  className="w-full bg-stone-50 border border-stone-300 rounded-2xl p-4 text-sm text-stone-900 focus:outline-none focus:border-brand-coral leading-relaxed"
                  required
                />
              </div>

              <div className="flex items-center justify-between pt-2">
                <span className="text-[11px] text-stone-500 flex items-center gap-1">
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                  Your advice will be displayed with your verified Bar Council license badge.
                </span>
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => setIsLawyerSubmitting(false)}
                    className="px-4 py-2 rounded-xl text-xs font-semibold text-stone-600 hover:bg-stone-100 cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={submitting}
                    className="bg-brand-coral hover:bg-brand-hover text-white text-xs font-bold px-5 py-2.5 rounded-xl shadow-coral flex items-center gap-1.5 transition-colors disabled:opacity-50 cursor-pointer"
                  >
                    <Send className="w-3.5 h-3.5" />
                    {submitting ? "Publishing..." : "Submit Legal Advice"}
                  </button>
                </div>
              </div>
            </form>
          ) : (
            <div className="bg-white border border-stone-200 rounded-3xl p-8 text-center space-y-3 shadow-xs animate-in fade-in">
              <ShieldCheck className="w-10 h-10 text-brand-coral mx-auto" />
              <h3 className="text-base font-bold text-stone-900">Verified Advocate Login Required</h3>
              <p className="text-xs text-stone-600 max-w-md mx-auto">
                Only authenticated legal practitioners and verified Bar Council advocates can provide official legal advice. Please sign in to your advocate account.
              </p>
              <div className="flex items-center justify-center gap-3 pt-2">
                <Link
                  href="/login/lawyer"
                  className="bg-brand-coral hover:bg-brand-hover text-white text-xs font-bold px-5 py-2.5 rounded-xl shadow-coral transition-colors"
                >
                  Sign In as Lawyer
                </Link>
                <Link
                  href="/signup/lawyer"
                  className="bg-stone-50 border border-stone-300 hover:bg-stone-100 text-stone-700 text-xs font-semibold px-5 py-2.5 rounded-xl transition-colors"
                >
                  Register as Advocate
                </Link>
              </div>
            </div>
          )
        )}

        {/* Answers List */}
        {answers.length === 0 ? (
          <div className="bg-white border border-stone-200 rounded-3xl p-8 text-center text-stone-500 space-y-3 shadow-xs">
            <div className="w-12 h-12 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center mx-auto border border-amber-200">
              <MessageSquare className="w-6 h-6" />
            </div>
            <p className="text-base font-bold text-stone-800">No expert advice submitted yet for this query.</p>
            <p className="text-xs text-stone-500 max-w-md mx-auto">
              Verified advocates receive public queries here. If you are an advocate or tax consultant, you can provide official advice.
            </p>
            <button
              onClick={() => setIsLawyerSubmitting(true)}
              className="inline-flex items-center gap-1 text-xs font-bold bg-brand-coral text-white px-4 py-2 rounded-xl shadow-coral hover:bg-brand-hover transition-colors"
            >
              + Write Verified Advice Now
            </button>
          </div>
        ) : (
          answers.map((answer) => (
            <div
              key={answer.id}
              className={`bg-white border rounded-3xl p-6 sm:p-8 space-y-4 shadow-sm transition-all ${
                answer.isAccepted ? "border-emerald-400 ring-2 ring-emerald-500/20" : "border-stone-200"
              }`}
            >
              {/* Lawyer Header */}
              <div className="flex items-start justify-between gap-4">
                <div className="flex items-center gap-3">
                  <img src={answer.professionalAvatar || getDefaultAvatar(answer.professionalName)} alt={answer.professionalName} className="w-12 h-12 rounded-full object-cover border-2 border-brand-coral" />
                  <div>
                    <div className="flex items-center gap-1.5 font-bold text-stone-900 text-base">
                      <span>{answer.professionalName}</span>
                      <ShieldCheck className="w-4 h-4 text-emerald-600 fill-emerald-100" />
                    </div>
                    <div className="text-xs text-brand-coral font-semibold">{answer.professionalRole}</div>
                    <div className="text-[11px] text-stone-500">License: {answer.barLicenseNo}</div>
                  </div>
                </div>

                {answer.isAccepted && (
                  <span className="inline-flex items-center gap-1 bg-emerald-100 text-emerald-800 text-xs font-bold px-3 py-1 rounded-full border border-emerald-200">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" /> Accepted Solution
                  </span>
                )}
              </div>

              {/* Answer Content */}
              <div className="text-sm text-stone-800 leading-relaxed whitespace-pre-line bg-stone-50 p-5 rounded-2xl border border-stone-200">
                {answer.content}
              </div>

              {/* Action Bar */}
              <div className="flex items-center justify-between pt-2 border-t border-stone-100 text-xs">
                <button
                  onClick={() => handleMarkAccepted(answer.id)}
                  className={`font-bold px-3 py-1.5 rounded-xl transition-colors ${
                    answer.isAccepted
                      ? "bg-emerald-600 text-white"
                      : "bg-stone-100 text-stone-700 hover:bg-stone-200"
                  }`}
                >
                  {answer.isAccepted ? "✓ Accepted Solution" : "Mark as Accepted Solution"}
                </button>

                <button
                  type="button"
                  onClick={() => handleUpvoteAnswer(answer.id)}
                  className="flex items-center gap-1.5 bg-stone-50 hover:bg-stone-100 border border-stone-200 text-stone-700 font-semibold px-3 py-1.5 rounded-xl transition-colors"
                >
                  <ThumbsUp className="w-3.5 h-3.5 text-brand-coral" />
                  <span>{answer.upvotes} Helpful Votes</span>
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
