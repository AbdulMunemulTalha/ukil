"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Search, Filter, PlusCircle, Scale, MessageSquareCheck } from "lucide-react";
import { MOCK_CATEGORIES, MOCK_QUESTIONS, Question } from "../../lib/mockData";
import { DataService } from "../../lib/db";
import QuestionCard from "../../components/QuestionCard";

export default function QuestionsPage() {
  const [questions, setQuestions] = useState<Question[]>(MOCK_QUESTIONS);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [selectedStatus, setSelectedStatus] = useState("all");
  const [selectedUrgency, setSelectedUrgency] = useState("all");
  const [sortBy, setSortBy] = useState<"recent" | "upvotes">("recent");

  useEffect(() => {
    setQuestions(DataService.getQuestions());
    DataService.syncFromSupabase().then(() => {
      setQuestions(DataService.getQuestions());
    });
  }, []);

  // Filtering
  let filtered = questions.filter((q) => {
    const matchesSearch =
      q.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      q.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      q.categoryName.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === "all" || q.categorySlug === selectedCategory;
    const matchesStatus = selectedStatus === "all" || q.status === selectedStatus;
    const matchesUrgency = selectedUrgency === "all" || q.urgency === selectedUrgency;

    return matchesSearch && matchesCategory && matchesStatus && matchesUrgency;
  });

  // Sorting
  if (sortBy === "upvotes") {
    filtered = [...filtered].sort((a, b) => b.upvotes - a.upvotes);
  }

  return (
    <div className="space-y-8">
      
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-stone-200 pb-6">
        <div>
          <h1 className="text-3xl font-extrabold text-stone-900 tracking-tight">
            Browse All Public Queries & Issues
          </h1>
          <p className="text-stone-600 text-sm mt-1">
            Search precedent legal advice, report administrative corruption, or browse community issues.
          </p>
        </div>

        <Link
          href="/ask"
          className="bg-brand-coral hover:bg-brand-hover text-white font-bold px-5 py-2.5 rounded-xl shadow-coral inline-flex items-center justify-center gap-2 text-sm transition-transform active:scale-95 shrink-0"
        >
          <PlusCircle className="w-4 h-4" /> Ask Query / Report Issue
        </Link>
      </div>

      {/* Filter Bar */}
      <div className="bg-white border border-stone-200 rounded-2xl p-4 shadow-sm space-y-4">
        {/* Search Input */}
        <div className="relative">
          <Search className="w-5 h-5 absolute left-3.5 top-1/2 -translate-y-1/2 text-stone-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by keywords, law section, or location..."
            className="w-full bg-stone-50 border border-stone-200 rounded-xl pl-11 pr-4 py-2.5 text-sm text-stone-900 focus:outline-none focus:border-brand-coral focus:ring-2 focus:ring-brand-coral/20"
          />
        </div>

        {/* Dropdown Selectors */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          
          {/* Category */}
          <div>
            <label className="text-[11px] font-bold text-stone-500 uppercase tracking-wider block mb-1">Category</label>
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="w-full bg-stone-50 border border-stone-200 rounded-lg px-3 py-2 text-xs font-semibold text-stone-800"
            >
              <option value="all">All Categories</option>
              {MOCK_CATEGORIES.map((cat) => (
                <option key={cat.slug} value={cat.slug}>
                  {cat.name}
                </option>
              ))}
            </select>
          </div>

          {/* Status */}
          <div>
            <label className="text-[11px] font-bold text-stone-500 uppercase tracking-wider block mb-1">Status</label>
            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              className="w-full bg-stone-50 border border-stone-200 rounded-lg px-3 py-2 text-xs font-semibold text-stone-800"
            >
              <option value="all">All Statuses</option>
              <option value="awaiting_advice">Awaiting Lawyer Advice</option>
              <option value="advice_given">Lawyer Advice Given</option>
              <option value="resolved">Solution Accepted</option>
            </select>
          </div>

          {/* Urgency */}
          <div>
            <label className="text-[11px] font-bold text-stone-500 uppercase tracking-wider block mb-1">Urgency</label>
            <select
              value={selectedUrgency}
              onChange={(e) => setSelectedUrgency(e.target.value)}
              className="w-full bg-stone-50 border border-stone-200 rounded-lg px-3 py-2 text-xs font-semibold text-stone-800"
            >
              <option value="all">All Urgency Levels</option>
              <option value="critical">Critical Urgency</option>
              <option value="high">High Urgency</option>
              <option value="medium">Medium Urgency</option>
              <option value="low">Standard Inquiry</option>
            </select>
          </div>

          {/* Sort */}
          <div>
            <label className="text-[11px] font-bold text-stone-500 uppercase tracking-wider block mb-1">Sort By</label>
            <select
              value={sortBy}
              onChange={(e: any) => setSortBy(e.target.value)}
              className="w-full bg-stone-50 border border-stone-200 rounded-lg px-3 py-2 text-xs font-semibold text-stone-800"
            >
              <option value="recent">Most Recent</option>
              <option value="upvotes">Most Upvoted</option>
            </select>
          </div>
        </div>
      </div>

      {/* Feed List */}
      <div className="space-y-4">
        {filtered.length === 0 ? (
          <div className="bg-white border border-stone-200 rounded-2xl p-12 text-center text-stone-500 space-y-3">
            <MessageSquareCheck className="w-12 h-12 text-stone-300 mx-auto" />
            <h3 className="text-lg font-bold text-stone-800">No issues found matching your filters</h3>
            <p className="text-sm text-stone-500">Try clearing filters or search query.</p>
          </div>
        ) : (
          filtered.map((question) => (
            <QuestionCard key={question.id} question={question} />
          ))
        )}
      </div>
    </div>
  );
}
