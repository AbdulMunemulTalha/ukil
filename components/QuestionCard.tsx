"use client";

import Link from "next/link";
import { useState, useEffect } from "react";
import {
  ThumbsUp,
  MessageSquare,
  CheckCircle2,
  AlertCircle,
  Clock,
  MapPin,
  UserX,
  UserCheck,
  ShieldCheck,
  ChevronDown,
  ChevronUp,
  ArrowRight,
  Send,
  Loader2,
  CalendarCheck,
  Award
} from "lucide-react";
import { Question, Answer, Professional } from "../lib/mockData";
import { DataService } from "../lib/db";
import { createClient } from "../lib/supabase/client";
import { getDefaultAvatar } from "../lib/avatar";

interface QuestionCardProps {
  question: Question;
}

export default function QuestionCard({ question }: QuestionCardProps) {
  const [upvotes, setUpvotes] = useState(question.upvotes);
  const [hasVoted, setHasVoted] = useState(false);
  const [showAdvice, setShowAdvice] = useState(false);
  const [cardAnswers, setCardAnswers] = useState<Answer[]>([]);
  const [isLoadingAnswers, setIsLoadingAnswers] = useState(false);
  
  // Inline lawyer advice form state
  const [isWritingAdvice, setIsWritingAdvice] = useState(false);
  const [adviceText, setAdviceText] = useState("");
  const [isSubmittingAdvice, setIsSubmittingAdvice] = useState(false);
  const [adviceSuccess, setAdviceSuccess] = useState(false);
  const [professionals, setProfessionals] = useState<Professional[]>([]);
  const [selectedProfId, setSelectedProfId] = useState<string>("");
  const [currentLawyer, setCurrentLawyer] = useState<{ id: string; name: string; license: string; role: string; avatar?: string } | null>(null);
  const [votedAnswerIds, setVotedAnswerIds] = useState<Record<string, boolean>>({});

  useEffect(() => {
    // Check if user is logged in as a verified professional
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

    const profs = DataService.getProfessionals();
    setProfessionals(profs);
    if (profs.length > 0 && !selectedProfId) {
      setSelectedProfId(profs[0].id);
    }
  }, []);

  const handleUpvote = (e: React.MouseEvent) => {
    e.preventDefault();
    if (hasVoted) {
      const newCount = DataService.upvoteQuestion(question.id, -1);
      setUpvotes(newCount);
      setHasVoted(false);
    } else {
      const newCount = DataService.upvoteQuestion(question.id, 1);
      setUpvotes(newCount);
      setHasVoted(true);
    }
  };

  const toggleAdvice = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    if (!showAdvice) {
      // 1. Instantly read local cache / mock answers
      const loaded = DataService.getAnswersForQuestion(question.id);
      setCardAnswers(loaded);
      setIsLoadingAnswers(loaded.length === 0);

      // 2. Concurrently fetch fresh live answers directly from Supabase
      DataService.getAnswersForQuestionAsync(question.id).then((live) => {
        if (live && live.length > 0) {
          setCardAnswers(live);
        }
        setIsLoadingAnswers(false);
      });
    }

    setShowAdvice(!showAdvice);
  };

  const handleAnswerUpvote = (e: React.MouseEvent, answerId: string) => {
    e.preventDefault();
    e.stopPropagation();
    if (votedAnswerIds[answerId]) return;

    const newCount = DataService.upvoteAnswer(answerId, 1);
    setCardAnswers((prev) =>
      prev.map((a) => (a.id === answerId ? { ...a, upvotes: newCount } : a))
    );
    setVotedAnswerIds((prev) => ({ ...prev, [answerId]: true }));
  };

  const handleInlineSubmitAdvice = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!adviceText.trim() || isSubmittingAdvice || !currentLawyer) return;

    setIsSubmittingAdvice(true);

    const created = DataService.addAnswer({
      questionId: question.id,
      professionalId: currentLawyer.id,
      professionalName: currentLawyer.name,
      professionalRole: currentLawyer.role,
      professionalAvatar: currentLawyer.avatar || getDefaultAvatar(currentLawyer.name),
      barLicenseNo: currentLawyer.license,
      content: adviceText,
    });

    setCardAnswers((prev) => [created, ...prev]);
    setAdviceText("");
    setIsWritingAdvice(false);
    setIsSubmittingAdvice(false);
    setAdviceSuccess(true);
    setTimeout(() => setAdviceSuccess(false), 5000);
  };

  const getUrgencyBadge = (urgency: string) => {
    switch (urgency) {
      case "critical":
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded text-xs font-semibold bg-red-100 text-red-700 border border-red-200">
            <AlertCircle className="w-3 h-3 text-red-600" /> Critical Urgency
          </span>
        );
      case "high":
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded text-xs font-semibold bg-amber-100 text-amber-800 border border-amber-200">
            ⚠️ High Urgency
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded text-xs font-medium bg-stone-100 text-stone-700 border border-stone-200">
            Standard Query
          </span>
        );
    }
  };

  const getCategoryBadge = (slug: string, name: string) => {
    if (slug === "bribes") {
      return <span className="bg-rose-100 text-rose-700 border border-rose-200 text-[11px] font-bold px-2.5 py-0.5 rounded uppercase">🚨 {name}</span>;
    }
    if (slug === "property") {
      return <span className="bg-amber-100 text-amber-800 border border-amber-200 text-[11px] font-bold px-2.5 py-0.5 rounded uppercase">🏠 {name}</span>;
    }
    if (slug === "tax") {
      return <span className="bg-sky-100 text-sky-800 border border-sky-200 text-[11px] font-bold px-2.5 py-0.5 rounded uppercase">💰 {name}</span>;
    }
    return <span className="bg-stone-100 text-stone-700 border border-stone-200 text-[11px] font-bold px-2.5 py-0.5 rounded uppercase">{name}</span>;
  };

  const effectiveAnswersCount = cardAnswers.length > 0 ? cardAnswers.length : question.answersCount;

  return (
    <article className={`bg-white border border-stone-200 rounded-2xl p-6 shadow-sm hover:shadow-coral transition-all card-hover-effect ${question.urgency === 'critical' ? 'border-l-4 border-l-brand-coral' : ''}`}>
      {/* Header Metadata */}
      <div className="flex flex-wrap items-center justify-between gap-2 mb-3">
        <div className="flex items-center gap-2">
          {getCategoryBadge(question.categorySlug, question.categoryName)}
          {getUrgencyBadge(question.urgency)}
        </div>
        <div className="flex items-center gap-1.5 text-xs text-stone-500 font-medium">
          <Clock className="w-3.5 h-3.5" />
          <span>{question.createdAt}</span>
          <span>•</span>
          <MapPin className="w-3.5 h-3.5" />
          <span>{question.location}</span>
        </div>
      </div>

      {/* Title */}
      <h2 className="text-xl font-bold text-stone-900 mb-2 leading-snug hover:text-brand-coral transition-colors">
        <Link href={`/questions/${question.id}`}>
          {question.title}
        </Link>
      </h2>

      {/* Excerpt */}
      <p className="text-stone-600 text-sm mb-4 line-clamp-2 leading-relaxed">
        {question.description}
      </p>

      {/* Footer Info & Actions */}
      <div className="flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-stone-100">
        
        {/* Author Badge */}
        <div className="flex items-center gap-1.5 text-xs text-stone-600 font-medium">
          {question.isAnonymous ? (
            <span className="inline-flex items-center gap-1 bg-stone-100 text-stone-700 px-2.5 py-1 rounded-md font-semibold">
              <UserX className="w-3.5 h-3.5 text-stone-500" /> Anonymous Citizen
            </span>
          ) : (
            <span className="inline-flex items-center gap-1 bg-brand-light text-brand-coral px-2.5 py-1 rounded-md font-semibold border border-brand-border">
              <UserCheck className="w-3.5 h-3.5" /> Posted by {question.authorName}
            </span>
          )}
        </div>

        {/* Advice Status & Interactive Options */}
        <div className="flex items-center gap-2">
          {/* Verified Expert Advice Button */}
          <button
            type="button"
            onClick={toggleAdvice}
            title="Click to view verified expert advice"
            className={`inline-flex items-center gap-1.5 text-xs font-bold px-3 py-1.5 rounded-xl border transition-all cursor-pointer ${
              showAdvice
                ? "bg-brand-coral text-white border-brand-coral shadow-sm ring-2 ring-brand-coral/20"
                : question.status === "resolved"
                ? "bg-emerald-50 text-emerald-800 border-emerald-300 hover:bg-emerald-100"
                : effectiveAnswersCount > 0
                ? "bg-brand-light text-brand-coral border-brand-border hover:bg-brand-coral hover:text-white"
                : "bg-stone-50 text-stone-700 border-stone-200 hover:bg-stone-100"
            }`}
          >
            {question.status === "resolved" ? (
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
            ) : (
              <ShieldCheck className={`w-3.5 h-3.5 ${showAdvice ? "text-white" : "text-brand-coral"}`} />
            )}
            <span>
              {question.status === "resolved"
                ? "Verified Solution Accepted"
                : effectiveAnswersCount > 0
                ? `Verified Expert Advice (${effectiveAnswersCount})`
                : "Verified Expert Advice (0)"}
            </span>
            {showAdvice ? (
              <ChevronUp className="w-3.5 h-3.5 ml-0.5" />
            ) : (
              <ChevronDown className="w-3.5 h-3.5 ml-0.5" />
            )}
          </button>

          {/* Upvote Button */}
          <button
            onClick={handleUpvote}
            className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold border transition-all ${
              hasVoted
                ? "bg-brand-light text-brand-coral border-brand-border"
                : "bg-stone-50 text-stone-600 border-stone-200 hover:bg-stone-100"
            }`}
          >
            <ThumbsUp className={`w-3.5 h-3.5 ${hasVoted ? "fill-brand-coral" : ""}`} />
            <span>{upvotes}</span>
          </button>
        </div>
      </div>

      {/* Expandable Verified Expert Advice Panel */}
      {showAdvice && (
        <div className="mt-4 pt-4 border-t border-brand-border/60 bg-stone-50/90 -mx-6 -mb-6 p-6 rounded-b-2xl space-y-4 animate-in fade-in duration-200">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <h3 className="text-sm font-bold text-stone-900 flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4 text-brand-coral" />
              <span>Verified Legal & Financial Advice</span>
              <span className="text-xs text-stone-500 font-normal">
                ({cardAnswers.length} official {cardAnswers.length === 1 ? "citation" : "citations"})
              </span>
            </h3>

            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => setIsWritingAdvice(!isWritingAdvice)}
                className="text-xs font-bold bg-brand-coral text-white hover:bg-brand-hover px-3 py-1.5 rounded-lg shadow-sm transition-colors flex items-center gap-1 cursor-pointer"
              >
                {isWritingAdvice ? "Close Editor" : "+ Provide Advice as Lawyer"}
              </button>
              
              <Link
                href={`/questions/${question.id}`}
                className="text-xs font-bold text-brand-coral hover:underline inline-flex items-center gap-1"
              >
                Full Discussion <ArrowRight className="w-3 h-3" />
              </Link>
            </div>
          </div>

          {/* Success Notification */}
          {adviceSuccess && (
            <div className="bg-emerald-50 border border-emerald-200 text-emerald-800 p-3.5 rounded-xl text-xs font-semibold flex items-center gap-2 animate-in fade-in">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>Your verified legal advice has been submitted and published live to Supabase!</span>
            </div>
          )}

          {/* Inline Advice Submission Form for Advocates */}
          {isWritingAdvice && (
            currentLawyer ? (
              <form onSubmit={handleInlineSubmitAdvice} className="bg-white border border-brand-coral/40 rounded-xl p-4 sm:p-5 space-y-3 shadow-sm animate-in fade-in">
                <div className="flex flex-wrap items-center justify-between gap-2 border-b border-stone-100 pb-2.5">
                  <div className="flex items-center gap-1.5 text-xs font-bold text-stone-900">
                    <ShieldCheck className="w-4 h-4 text-emerald-600" />
                    <span>Provide Official Legal Advice for this Citizen</span>
                  </div>

                  <div className="flex items-center gap-2">
                    <img
                      src={currentLawyer.avatar || getDefaultAvatar(currentLawyer.name)}
                      alt={currentLawyer.name}
                      className="w-5 h-5 rounded-full object-cover border border-emerald-400"
                    />
                    <span className="text-[11px] bg-emerald-50 text-emerald-800 border border-emerald-200 font-bold px-2.5 py-0.5 rounded-full">
                      Logged in: {currentLawyer.name} {currentLawyer.license ? `(${currentLawyer.license})` : ""}
                    </span>
                  </div>
                </div>

                <div>
                  <label className="block text-[11px] font-bold uppercase tracking-wider text-stone-700 mb-1">
                    Statutory Advice & Remedial Actions:
                  </label>
                  <textarea
                    rows={4}
                    value={adviceText}
                    onChange={(e) => setAdviceText(e.target.value)}
                    placeholder="Cite statutory provisions (e.g. Penal Code §161, ACC Act 2004, Labour Act 2006) and concrete steps for the citizen..."
                    className="w-full bg-stone-50 border border-stone-300 rounded-xl p-3 text-xs text-stone-900 focus:outline-none focus:border-brand-coral focus:bg-white leading-relaxed"
                    required
                  />
                </div>

                <div className="flex items-center justify-between pt-1">
                  <span className="text-[10px] text-stone-500">
                    Displayed publicly under your verified Bar license seal.
                  </span>
                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={() => setIsWritingAdvice(false)}
                      className="px-3 py-1.5 rounded-lg text-xs font-semibold text-stone-600 hover:bg-stone-100 cursor-pointer"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={isSubmittingAdvice}
                      className="bg-brand-coral hover:bg-brand-hover text-white text-xs font-bold px-4 py-1.5 rounded-lg shadow-sm flex items-center gap-1.5 transition-colors disabled:opacity-50 cursor-pointer"
                    >
                      {isSubmittingAdvice ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Send className="w-3.5 h-3.5" />}
                      <span>{isSubmittingAdvice ? "Publishing..." : "Publish Advice"}</span>
                    </button>
                  </div>
                </div>
              </form>
            ) : (
              <div className="bg-white border border-stone-200 rounded-xl p-5 text-center space-y-2 shadow-xs animate-in fade-in">
                <ShieldCheck className="w-8 h-8 text-brand-coral mx-auto" />
                <h4 className="text-sm font-bold text-stone-900">Advocate Authentication Required</h4>
                <p className="text-xs text-stone-600 max-w-sm mx-auto">
                  Only registered, verified lawyers and legal advisors can submit official advice on Ukil. Please log in with your lawyer account to publish advice.
                </p>
                <div className="flex items-center justify-center gap-2 pt-2">
                  <Link
                    href="/login/lawyer"
                    className="bg-brand-coral hover:bg-brand-hover text-white text-xs font-bold px-4 py-2 rounded-xl shadow-coral transition-colors"
                  >
                    Lawyer Sign In
                  </Link>
                  <Link
                    href="/signup/lawyer"
                    className="bg-stone-50 border border-stone-300 hover:bg-stone-100 text-stone-700 text-xs font-semibold px-4 py-2 rounded-xl transition-colors"
                  >
                    Register as Advocate
                  </Link>
                </div>
              </div>
            )
          )}

          {/* Loading Indicator */}
          {isLoadingAnswers && cardAnswers.length === 0 && (
            <div className="bg-white border border-stone-200 rounded-xl p-6 text-center space-y-2">
              <Loader2 className="w-5 h-5 text-brand-coral animate-spin mx-auto" />
              <p className="text-xs text-stone-500">Loading verified advice from Supabase...</p>
            </div>
          )}

          {/* Answers List or Empty State */}
          {!isLoadingAnswers && cardAnswers.length === 0 ? (
            <div className="bg-white border border-stone-200 rounded-xl p-6 text-center space-y-3">
              <div className="w-10 h-10 rounded-full bg-amber-50 text-amber-600 flex items-center justify-center mx-auto border border-amber-200">
                <ShieldCheck className="w-5 h-5 text-brand-coral" />
              </div>
              <div className="space-y-1">
                <p className="text-xs font-bold text-stone-800">
                  No expert advice has been published yet for this query.
                </p>
                <p className="text-[11px] text-stone-500 max-w-sm mx-auto">
                  Are you an enrolled Advocate or Chartered Accountant? Provide pro bono statutory guidance to assist this citizen.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setIsWritingAdvice(true)}
                className="inline-flex items-center gap-1.5 text-xs font-bold bg-brand-coral text-white px-4 py-2 rounded-xl shadow-coral hover:bg-brand-hover transition-transform active:scale-95 cursor-pointer"
              >
                + Provide Legal Advice as a Lawyer
              </button>
            </div>
          ) : (
            <div className="space-y-3">
              {cardAnswers.map((ans) => (
                <div key={ans.id} className="bg-white border border-stone-200 rounded-xl p-4 space-y-3 shadow-2xs">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <div className="flex items-center gap-2.5">
                      <img
                        src={ans.professionalAvatar || getDefaultAvatar(ans.professionalName)}
                        alt={ans.professionalName}
                        className="w-9 h-9 rounded-full object-cover border border-brand-coral shadow-2xs"
                      />
                      <div>
                        <div className="text-xs font-bold text-stone-900 flex items-center gap-1">
                          <span>{ans.professionalName}</span>
                          <ShieldCheck className="w-3.5 h-3.5 text-emerald-600 fill-emerald-100" />
                        </div>
                        <div className="text-[10px] text-stone-500">
                          {ans.professionalRole} • License: <span className="font-semibold text-stone-700">{ans.barLicenseNo}</span>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      {ans.isAccepted && (
                        <span className="bg-emerald-100 text-emerald-800 text-[10px] font-bold px-2 py-0.5 rounded-full border border-emerald-200 flex items-center gap-1">
                          <CheckCircle2 className="w-3 h-3 text-emerald-600" /> Accepted Solution
                        </span>
                      )}
                      <Link
                        href={`/professionals`}
                        className="text-[11px] font-semibold text-brand-coral hover:underline inline-flex items-center gap-1 bg-brand-light px-2.5 py-1 rounded-lg border border-brand-border"
                      >
                        <CalendarCheck className="w-3 h-3" /> Book Consultation
                      </Link>
                    </div>
                  </div>

                  <p className="text-xs text-stone-800 whitespace-pre-line leading-relaxed pl-3 sm:pl-4 border-l-2 border-brand-coral/40 bg-stone-50/50 py-1 rounded-r-lg">
                    {ans.content}
                  </p>

                  <div className="flex items-center justify-between text-[11px] text-stone-500 pt-1">
                    <span>Published {ans.createdAt}</span>
                    <button
                      type="button"
                      onClick={(e) => handleAnswerUpvote(e, ans.id)}
                      className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-lg font-semibold border transition-all cursor-pointer ${
                        votedAnswerIds[ans.id]
                          ? "bg-brand-light text-brand-coral border-brand-border"
                          : "bg-stone-50 text-stone-600 border-stone-200 hover:bg-stone-100"
                      }`}
                    >
                      <ThumbsUp className={`w-3 h-3 ${votedAnswerIds[ans.id] ? "fill-brand-coral text-brand-coral" : ""}`} />
                      <span>{ans.upvotes} Helpful Votes</span>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </article>
  );
}
