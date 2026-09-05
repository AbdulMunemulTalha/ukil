"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Search, Sparkles, Scale, ShieldCheck, Clock, Users, ArrowRight, MessageSquareCheck, PlusCircle } from "lucide-react";
import { MOCK_QUESTIONS, MOCK_CATEGORIES, MOCK_PROFESSIONALS, Question } from "../lib/mockData";
import { DataService } from "../lib/db";
import QuestionCard from "../components/QuestionCard";
import SubmitModal from "../components/SubmitModal";

export default function HomePage() {
  const [questions, setQuestions] = useState<Question[]>(MOCK_QUESTIONS);
  const [activeCategory, setActiveCategory] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);

  useEffect(() => {
    setQuestions(DataService.getQuestions());
    DataService.syncFromSupabase().then(() => {
      setQuestions(DataService.getQuestions());
    });
  }, []);

  const handleNewQuestion = () => {
    setQuestions(DataService.getQuestions());
    DataService.syncFromSupabase().then(() => {
      setQuestions(DataService.getQuestions());
    });
  };

  // Filtering logic
  const filteredQuestions = questions.filter((q) => {
    const matchesCategory = activeCategory === "all" || q.categorySlug === activeCategory;
    const matchesSearch =
      q.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      q.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      q.categoryName.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  return (
    <div className="space-y-12">
      
      {/* 1. Hero Section */}
      <section className="text-center max-w-5xl mx-auto space-y-6 pt-4 pb-2">
        <div className="inline-flex items-center gap-2 bg-brand-light text-brand-coral border border-brand-border px-4 py-1.5 rounded-full text-xs font-semibold shadow-sm">
          <Sparkles className="w-4 h-4 text-brand-coral" />
          <span>⚡ No Account Required • Ask Anonymously or Publicly</span>
        </div>

        <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-stone-900 leading-[1.15]">
          Get Legal Advice & Financial <span className="text-brand-coral">Solutions Fast</span>
        </h1>

        <p className="text-lg text-stone-600 max-w-3xl mx-auto leading-relaxed">
          Facing bribery, land disputes, tax audits, or employment issues? Ask your query freely. Verified lawyers and CPAs answer for the public interest.
        </p>

        {/* Hero Instant Search */}
        <div className="max-w-4xl mx-auto relative pt-2">
          <div className="relative">
            <Search className="w-5 h-5 absolute left-4 top-1/2 -translate-y-1/2 text-stone-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search issues (e.g. Land mutation bribe, Tax audit notice, Landlord dispute)..."
              className="w-full bg-white border border-stone-300 rounded-2xl pl-12 pr-36 sm:pr-40 py-4 text-stone-900 placeholder:text-stone-400 text-sm sm:text-base shadow-sm focus:outline-none focus:border-brand-coral focus:ring-4 focus:ring-brand-coral/15 transition-all"
            />
            <button
              onClick={() => setIsModalOpen(true)}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 bg-brand-coral hover:bg-brand-hover text-white text-xs sm:text-sm font-bold px-4 sm:px-5 py-2.5 rounded-xl shadow-coral transition-transform active:scale-95 flex items-center gap-1.5 shrink-0 cursor-pointer"
            >
              <PlusCircle className="w-4 h-4" /> Ask Query
            </button>
          </div>
        </div>
      </section>

      {/* 2. Platform Impact Stats */}
      <section className="grid grid-cols-2 sm:grid-cols-4 gap-4 max-w-5xl mx-auto">
        <div className="bg-white border border-stone-200 p-5 rounded-2xl text-center shadow-sm">
          <div className="text-3xl sm:text-4xl font-extrabold text-brand-coral mb-1">1,482</div>
          <div className="text-xs font-semibold uppercase tracking-wider text-stone-500">Issues Resolved</div>
        </div>
        <div className="bg-white border border-stone-200 p-5 rounded-2xl text-center shadow-sm">
          <div className="text-3xl sm:text-4xl font-extrabold text-stone-900 mb-1">240+</div>
          <div className="text-xs font-semibold uppercase tracking-wider text-stone-500">Verified Lawyers</div>
        </div>
        <div className="bg-white border border-stone-200 p-5 rounded-2xl text-center shadow-sm">
          <div className="text-3xl sm:text-4xl font-extrabold text-emerald-600 mb-1">98%</div>
          <div className="text-xs font-semibold uppercase tracking-wider text-stone-500">Anonymous Friendly</div>
        </div>
        <div className="bg-white border border-stone-200 p-5 rounded-2xl text-center shadow-sm">
          <div className="text-3xl sm:text-4xl font-extrabold text-indigo-600 mb-1">&lt; 4 Hours</div>
          <div className="text-xs font-semibold uppercase tracking-wider text-stone-500">Avg Advice Time</div>
        </div>
      </section>

      {/* 3. Filter Chips */}
      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-extrabold text-stone-900 tracking-tight">
            Recent Public Queries & Reports
          </h2>
          <Link href="/questions" className="text-brand-coral hover:underline text-sm font-semibold flex items-center gap-1">
            View All Queries <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
          <button
            onClick={() => setActiveCategory("all")}
            className={`px-4 py-2 rounded-full text-xs font-semibold whitespace-nowrap transition-all border ${
              activeCategory === "all"
                ? "bg-brand-coral text-white border-brand-coral shadow-coral"
                : "bg-white text-stone-600 border-stone-200 hover:border-brand-border"
            }`}
          >
            All Submissions
          </button>
          {MOCK_CATEGORIES.map((cat) => (
            <button
              key={cat.slug}
              onClick={() => setActiveCategory(cat.slug)}
              className={`px-4 py-2 rounded-full text-xs font-semibold whitespace-nowrap transition-all border flex items-center gap-1.5 ${
                activeCategory === cat.slug
                  ? "bg-brand-coral text-white border-brand-coral shadow-coral"
                  : "bg-white text-stone-600 border-stone-200 hover:border-brand-border"
              }`}
            >
              <span>{cat.icon}</span>
              <span>{cat.name}</span>
            </button>
          ))}
        </div>
      </section>

      {/* 4. Live Issues Feed */}
      <section className="space-y-4">
        {filteredQuestions.length === 0 ? (
          <div className="bg-white border border-stone-200 rounded-2xl p-12 text-center text-stone-500 space-y-3">
            <MessageSquareCheck className="w-12 h-12 text-stone-300 mx-auto" />
            <h3 className="text-lg font-bold text-stone-800">No matching issues found</h3>
            <p className="text-sm text-stone-500 max-w-md mx-auto">
              Be the first to submit a query in this category! It takes less than 60 seconds without signing up.
            </p>
            <button
              onClick={() => setIsModalOpen(true)}
              className="bg-brand-coral text-white text-sm font-bold px-5 py-2.5 rounded-xl shadow-coral inline-flex items-center gap-2 mt-2"
            >
              <PlusCircle className="w-4 h-4" /> Submit Issue Now
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-4">
            {filteredQuestions.map((question) => (
              <QuestionCard key={question.id} question={question} />
            ))}
          </div>
        )}
      </section>

      {/* 5. Verified Lawyers Spotlight */}
      <section className="pt-8 border-t border-stone-200 space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <h2 className="text-2xl font-extrabold text-stone-900 tracking-tight">
              Featured Verified Lawyers & Consultants
            </h2>
            <p className="text-stone-600 text-sm">
              Top-rated Advocates & CPAs providing expert legal & financial solutions.
            </p>
          </div>
          <Link href="/professionals" className="text-brand-coral font-bold text-sm hover:underline flex items-center gap-1">
            Browse Directory <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
          {MOCK_PROFESSIONALS.map((prof) => (
            <div key={prof.id} className="bg-white border border-stone-200 rounded-2xl p-5 space-y-4 shadow-sm hover:shadow-coral transition-all">
              <div className="flex items-center gap-3">
                <img src={prof.avatar} alt={prof.name} className="w-14 h-14 rounded-full object-cover border-2 border-brand-coral" />
                <div>
                  <div className="flex items-center gap-1 font-bold text-stone-900 text-base">
                    <span>{prof.name}</span>
                    <ShieldCheck className="w-4 h-4 text-emerald-600 fill-emerald-100" />
                  </div>
                  <div className="text-xs text-brand-coral font-semibold">{prof.role}</div>
                  <div className="text-xs text-stone-500">{prof.location}</div>
                </div>
              </div>

              <div className="flex flex-wrap gap-1">
                {prof.specialization.map((spec, i) => (
                  <span key={i} className="bg-stone-100 text-stone-700 text-[11px] font-medium px-2 py-0.5 rounded">
                    {spec}
                  </span>
                ))}
              </div>

              <div className="flex items-center justify-between pt-3 border-t border-stone-100 text-xs font-semibold">
                <span className="text-amber-600">⭐ {prof.rating} ({prof.reviewCount} Reviews)</span>
                <Link
                  href={`/professionals/${prof.id}`}
                  className="bg-brand-light text-brand-coral hover:bg-brand-coral hover:text-white px-3 py-1.5 rounded-lg border border-brand-border transition-colors"
                >
                  View Profile
                </Link>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Embedded No-Signup Submit Modal */}
      <SubmitModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSuccess={handleNewQuestion}
      />
    </div>
  );
}
