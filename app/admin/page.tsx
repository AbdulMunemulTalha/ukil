"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import {
  Shield,
  ShieldCheck,
  CheckCircle2,
  XCircle,
  AlertCircle,
  Clock,
  Search,
  Filter,
  Users,
  MessageSquare,
  Scale,
  Calendar,
  Layers,
  BarChart3,
  LogOut,
  ExternalLink,
  ChevronRight,
  Eye,
  Trash2,
  Check,
  X,
  FileText,
  Building,
  UserCheck,
  AlertTriangle,
  BadgeAlert,
  ArrowUpRight,
  Phone,
  Mail,
  MapPin,
  RefreshCw,
  Plus
} from "lucide-react";
import { DataService, ConsultationRequest } from "../../lib/db";
import { Professional, Question, Answer, Category } from "../../lib/mockData";
import { createClient } from "../../lib/supabase/client";

export default function AdminDashboardPage() {
  const [adminUser, setAdminUser] = useState<{ email: string; name: string } | null>(null);
  const [activeTab, setActiveTab] = useState<"kyc" | "questions" | "answers" | "consultations" | "categories" | "analytics">("kyc");

  // Data states
  const [professionals, setProfessionals] = useState<Professional[]>([]);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [answers, setAnswers] = useState<Answer[]>([]);
  const [consultations, setConsultations] = useState<ConsultationRequest[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [stats, setStats] = useState<any>({});
  const [isLoading, setIsLoading] = useState(true);

  // KYC Tab Filters & Search
  const [kycFilter, setKycFilter] = useState<"all" | "in_review" | "verified" | "pending">("in_review");
  const [kycSearch, setKycSearch] = useState("");
  const [selectedLawyerForModal, setSelectedLawyerForModal] = useState<Professional | null>(null);
  const [rejectionReasonInput, setRejectionReasonInput] = useState("");
  const [actionSuccessMsg, setActionSuccessMsg] = useState<string | null>(null);

  // Questions Tab Filters & Search
  const [questionSearch, setQuestionSearch] = useState("");
  const [questionFilterStatus, setQuestionFilterStatus] = useState<string>("all");
  const [questionFilterUrgency, setQuestionFilterUrgency] = useState<string>("all");

  // Category Add State
  const [newCatName, setNewCatName] = useState("");
  const [newCatSlug, setNewCatSlug] = useState("");
  const [newCatIcon, setNewCatIcon] = useState("⚖️");
  const [newCatDesc, setNewCatDesc] = useState("");
  const [showAddCat, setShowAddCat] = useState(false);

  // Load Admin Session & Platform Data
  const loadPlatformData = () => {
    const profsList = DataService.getAllProfessionalsAdmin();
    setProfessionals(profsList);
    setQuestions(DataService.getQuestions());
    setAnswers(DataService.getAnswers());
    setConsultations(DataService.getConsultations());
    setCategories(DataService.getCategories());
    setStats(DataService.adminGetMetrics());
  };

  useEffect(() => {
    // 1. Check local admin session
    const localSessionStr = localStorage.getItem("ukil_admin_session");
    if (localSessionStr) {
      try {
        const parsed = JSON.parse(localSessionStr);
        setAdminUser({ email: parsed.email, name: parsed.name });
      } catch (e) {
        // invalid
      }
    } else {
      // 2. Check supabase auth
      const supabase = createClient();
      if (supabase) {
        supabase.auth.getUser().then(async ({ data: { user } }) => {
          if (user) {
            const { data: prof } = await supabase
              .from("profiles")
              .select("role, full_name")
              .eq("user_id", user.id)
              .single();

            if (prof?.role === "admin" || user.email?.includes("admin")) {
              setAdminUser({
                email: user.email || "admin@ukil.com",
                name: prof?.full_name || "Platform Admin",
              });
            } else {
              window.location.href = "/admin/login";
              return;
            }
          } else {
            window.location.href = "/admin/login";
            return;
          }
        });
      } else {
        window.location.href = "/admin/login";
        return;
      }
    }

    loadPlatformData();
    DataService.syncFromSupabase().then(() => {
      loadPlatformData();
      setIsLoading(false);
    });
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("ukil_admin_session");
    const supabase = createClient();
    if (supabase) {
      supabase.auth.signOut();
    }
    window.location.href = "/admin/login";
  };

  const notifyAction = (msg: string) => {
    setActionSuccessMsg(msg);
    setTimeout(() => setActionSuccessMsg(null), 4000);
  };

  // KYC Management Handlers
  const handleApproveLawyer = (profId: string) => {
    const updated = DataService.adminUpdateKycStatus(profId, "verified", true);
    loadPlatformData();
    if (selectedLawyerForModal?.id === profId) {
      setSelectedLawyerForModal(updated);
    }
    notifyAction("Advocate credentials verified! Advice privileges are now fully unlocked.");
  };

  const handleRejectLawyer = (profId: string, reason?: string) => {
    const updated = DataService.adminUpdateKycStatus(profId, "pending", false, reason || "Documents need clarification");
    loadPlatformData();
    if (selectedLawyerForModal?.id === profId) {
      setSelectedLawyerForModal(updated);
    }
    notifyAction("Advocate verification rejected/revoked. Advice privileges are locked.");
  };

  // Questions Handlers
  const handleDeleteQuestion = (qId: string) => {
    if (window.confirm("Are you sure you want to permanently delete this citizen query?")) {
      DataService.adminDeleteQuestion(qId);
      loadPlatformData();
      notifyAction("Question deleted from platform.");
    }
  };

  const handleToggleQuestionStatus = (q: Question) => {
    const nextStatus = q.status === "resolved" ? "awaiting_advice" : "resolved";
    DataService.adminUpdateQuestion(q.id, { status: nextStatus });
    loadPlatformData();
    notifyAction(`Question status updated to ${nextStatus}.`);
  };

  // Answers Handlers
  const handleDeleteAnswer = (aId: string) => {
    if (window.confirm("Are you sure you want to delete this legal advice?")) {
      DataService.adminDeleteAnswer(aId);
      loadPlatformData();
      notifyAction("Legal advice removed.");
    }
  };

  const handleToggleAnswerAccepted = (aId: string) => {
    const isAccepted = DataService.adminToggleAnswerAccepted(aId);
    loadPlatformData();
    notifyAction(isAccepted ? "Marked as official Accepted Solution!" : "Unmarked as Accepted Solution.");
  };

  // Consultations Handlers
  const handleUpdateConsultStatus = (cId: string, status: ConsultationRequest["status"]) => {
    DataService.adminUpdateConsultationStatus(cId, status);
    loadPlatformData();
    notifyAction(`Consultation booking status changed to ${status}.`);
  };

  // Category Handlers
  const handleAddCategory = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCatName.trim() || !newCatSlug.trim()) return;
    DataService.adminAddCategory({
      id: `cat-${Date.now()}`,
      name: newCatName.trim(),
      slug: newCatSlug.trim().toLowerCase().replace(/\s+/g, "-"),
      icon: newCatIcon || "⚖️",
      description: newCatDesc.trim() || "Legal category description",
      color: "coral",
    });
    setNewCatName("");
    setNewCatSlug("");
    setNewCatDesc("");
    setShowAddCat(false);
    loadPlatformData();
    notifyAction("New legal category added to platform!");
  };

  const handleDeleteCategory = (slug: string) => {
    if (window.confirm(`Delete category "${slug}"?`)) {
      DataService.adminDeleteCategory(slug);
      loadPlatformData();
      notifyAction("Category removed.");
    }
  };

  // Filtered lists
  const filteredProfessionals = professionals.filter((p) => {
    const matchesFilter =
      kycFilter === "all"
        ? true
        : kycFilter === "verified"
        ? p.verified === true
        : kycFilter === "in_review"
        ? p.kycStatus === "in_review" || (!p.verified && p.kycData?.nidNumber)
        : p.kycStatus === "pending" || (!p.verified && !p.kycData?.nidNumber);

    const matchesSearch =
      kycSearch.trim() === ""
        ? true
        : p.name.toLowerCase().includes(kycSearch.toLowerCase()) ||
          p.barLicenseNo?.toLowerCase().includes(kycSearch.toLowerCase()) ||
          p.nidNumber?.toLowerCase().includes(kycSearch.toLowerCase()) ||
          p.kycData?.barAssociation?.toLowerCase().includes(kycSearch.toLowerCase()) ||
          p.email?.toLowerCase().includes(kycSearch.toLowerCase());

    return matchesFilter && matchesSearch;
  });

  const pendingKycCount = professionals.filter(
    (p) => p.kycStatus === "in_review" || (!p.verified && p.kycData?.nidNumber)
  ).length;

  const filteredQuestions = questions.filter((q) => {
    const matchesSearch =
      questionSearch.trim() === ""
        ? true
        : q.title.toLowerCase().includes(questionSearch.toLowerCase()) ||
          q.trackingCode.toLowerCase().includes(questionSearch.toLowerCase()) ||
          q.description.toLowerCase().includes(questionSearch.toLowerCase());

    const matchesStatus =
      questionFilterStatus === "all" ? true : q.status === questionFilterStatus;

    const matchesUrgency =
      questionFilterUrgency === "all" ? true : q.urgency === questionFilterUrgency;

    return matchesSearch && matchesStatus && matchesUrgency;
  });

  if (!adminUser && isLoading) {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center space-y-3">
        <div className="w-10 h-10 border-4 border-stone-800 border-t-brand-coral rounded-full animate-spin" />
        <p className="text-xs font-semibold text-stone-500">Authenticating Judicial Administration Session...</p>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      
      {/* Top Administrative Header */}
      <div className="bg-stone-900 text-white rounded-3xl p-6 sm:p-8 shadow-xl border border-stone-800 space-y-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-brand-coral to-red-600 flex items-center justify-center text-white shadow-coral shrink-0 font-black text-2xl">
              <Shield className="w-8 h-8" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-xl sm:text-2xl font-black tracking-tight">
                  Ukil Judicial & Platform Administration
                </h1>
                <span className="bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 text-[10px] font-bold px-2 py-0.5 rounded-full flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" /> Live Ops
                </span>
              </div>
              <p className="text-xs text-stone-400 mt-0.5">
                Logged in as <span className="text-stone-200 font-semibold">{adminUser?.name || "Chief Administrator"}</span> ({adminUser?.email})
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2.5">
            <button
              onClick={() => {
                loadPlatformData();
                DataService.syncFromSupabase().then(() => {
                  loadPlatformData();
                  notifyAction("Platform data synchronized with Supabase!");
                });
              }}
              title="Sync with database"
              className="bg-stone-800 hover:bg-stone-700 text-stone-200 text-xs font-semibold px-3 py-2 rounded-xl border border-stone-700 flex items-center gap-1.5 transition-colors cursor-pointer"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span>Sync DB</span>
            </button>

            <Link
              href="/"
              target="_blank"
              className="bg-stone-800 hover:bg-stone-700 text-stone-200 text-xs font-semibold px-3 py-2 rounded-xl border border-stone-700 flex items-center gap-1.5 transition-colors"
            >
              <ExternalLink className="w-3.5 h-3.5" />
              <span>Public Feed</span>
            </Link>

            <button
              onClick={handleLogout}
              className="bg-red-500/10 hover:bg-red-500/20 text-red-300 border border-red-500/30 text-xs font-bold px-3.5 py-2 rounded-xl flex items-center gap-1.5 transition-colors cursor-pointer"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>Sign Out</span>
            </button>
          </div>
        </div>

        {/* Global Impact Summary Bar */}
        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-6 gap-3 pt-4 border-t border-stone-800">
          <div className="bg-stone-800/60 p-3 rounded-2xl border border-stone-700/50">
            <div className="text-[10px] uppercase font-bold text-stone-400">Total Inquiries</div>
            <div className="text-lg font-black text-white">{stats.totalQuestions || 0}</div>
          </div>

          <div className="bg-stone-800/60 p-3 rounded-2xl border border-stone-700/50">
            <div className="text-[10px] uppercase font-bold text-stone-400">Resolved Queries</div>
            <div className="text-lg font-black text-emerald-400">{stats.resolvedQuestions || 0}</div>
          </div>

          <div className="bg-stone-800/60 p-3 rounded-2xl border border-stone-700/50">
            <div className="text-[10px] uppercase font-bold text-stone-400">Verified Advocates</div>
            <div className="text-lg font-black text-brand-coral">{stats.verifiedLawyers || 0}</div>
          </div>

          <div className="bg-stone-800/60 p-3 rounded-2xl border border-stone-700/50 relative overflow-hidden">
            {pendingKycCount > 0 && (
              <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-amber-400 rounded-full animate-ping" />
            )}
            <div className="text-[10px] uppercase font-bold text-amber-400">KYC Queue</div>
            <div className="text-lg font-black text-amber-300">{pendingKycCount} Pending</div>
          </div>

          <div className="bg-stone-800/60 p-3 rounded-2xl border border-stone-700/50">
            <div className="text-[10px] uppercase font-bold text-stone-400">Legal Answers</div>
            <div className="text-lg font-black text-white">{stats.totalAnswers || 0}</div>
          </div>

          <div className="bg-stone-800/60 p-3 rounded-2xl border border-stone-700/50">
            <div className="text-[10px] uppercase font-bold text-stone-400">Consultations</div>
            <div className="text-lg font-black text-purple-400">{stats.totalConsultations || 0}</div>
          </div>
        </div>
      </div>

      {/* Action Notification Banner */}
      {actionSuccessMsg && (
        <div className="bg-emerald-50 border border-emerald-200 text-emerald-900 p-4 rounded-2xl text-xs font-bold flex items-center justify-between shadow-xs animate-in fade-in">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
            <span>{actionSuccessMsg}</span>
          </div>
          <button
            type="button"
            onClick={() => setActionSuccessMsg(null)}
            className="text-emerald-700 hover:text-emerald-900 p-1 rounded-lg"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Navigation Tabs */}
      <div className="flex flex-wrap items-center gap-2 border-b border-stone-200 pb-3">
        <button
          type="button"
          onClick={() => setActiveTab("kyc")}
          className={`relative px-4 py-2.5 rounded-2xl text-xs font-bold flex items-center gap-2 transition-all cursor-pointer ${
            activeTab === "kyc"
              ? "bg-stone-900 text-white shadow-sm"
              : "bg-white text-stone-600 hover:bg-stone-100 border border-stone-200"
          }`}
        >
          <ShieldCheck className="w-4 h-4 text-brand-coral" />
          <span>Lawyer KYC Verification Hub</span>
          {pendingKycCount > 0 && (
            <span className="bg-amber-500 text-stone-900 text-[10px] font-black px-2 py-0.5 rounded-full ml-1 animate-pulse">
              {pendingKycCount} Action
            </span>
          )}
        </button>

        <button
          type="button"
          onClick={() => setActiveTab("questions")}
          className={`px-4 py-2.5 rounded-2xl text-xs font-bold flex items-center gap-2 transition-all cursor-pointer ${
            activeTab === "questions"
              ? "bg-stone-900 text-white shadow-sm"
              : "bg-white text-stone-600 hover:bg-stone-100 border border-stone-200"
          }`}
        >
          <MessageSquare className="w-4 h-4 text-emerald-600" />
          <span>Citizen Queries Moderation</span>
          <span className="text-[10px] text-stone-400">({questions.length})</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab("answers")}
          className={`px-4 py-2.5 rounded-2xl text-xs font-bold flex items-center gap-2 transition-all cursor-pointer ${
            activeTab === "answers"
              ? "bg-stone-900 text-white shadow-sm"
              : "bg-white text-stone-600 hover:bg-stone-100 border border-stone-200"
          }`}
        >
          <Scale className="w-4 h-4 text-blue-600" />
          <span>Legal Advice & Answers</span>
          <span className="text-[10px] text-stone-400">({answers.length})</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab("consultations")}
          className={`px-4 py-2.5 rounded-2xl text-xs font-bold flex items-center gap-2 transition-all cursor-pointer ${
            activeTab === "consultations"
              ? "bg-stone-900 text-white shadow-sm"
              : "bg-white text-stone-600 hover:bg-stone-100 border border-stone-200"
          }`}
        >
          <Calendar className="w-4 h-4 text-purple-600" />
          <span>Consultations Oversight</span>
          <span className="text-[10px] text-stone-400">({consultations.length})</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab("categories")}
          className={`px-4 py-2.5 rounded-2xl text-xs font-bold flex items-center gap-2 transition-all cursor-pointer ${
            activeTab === "categories"
              ? "bg-stone-900 text-white shadow-sm"
              : "bg-white text-stone-600 hover:bg-stone-100 border border-stone-200"
          }`}
        >
          <Layers className="w-4 h-4 text-amber-600" />
          <span>Categories</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab("analytics")}
          className={`px-4 py-2.5 rounded-2xl text-xs font-bold flex items-center gap-2 transition-all cursor-pointer ${
            activeTab === "analytics"
              ? "bg-stone-900 text-white shadow-sm"
              : "bg-white text-stone-600 hover:bg-stone-100 border border-stone-200"
          }`}
        >
          <BarChart3 className="w-4 h-4 text-teal-600" />
          <span>Platform Health</span>
        </button>
      </div>

      {/* ========================================================================= */}
      {/* TAB 1: LAWYER KYC VERIFICATION HUB (USER PRIORITY) */}
      {/* ========================================================================= */}
      {activeTab === "kyc" && (
        <div className="space-y-6 animate-in fade-in">
          
          {/* KYC Controls Bar */}
          <div className="bg-white border border-stone-200 rounded-3xl p-5 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
            
            {/* Status Filter Tabs */}
            <div className="flex flex-wrap items-center gap-1.5 bg-stone-100 p-1.5 rounded-2xl">
              <button
                type="button"
                onClick={() => setKycFilter("in_review")}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                  kycFilter === "in_review"
                    ? "bg-amber-500 text-stone-900 shadow-xs"
                    : "text-stone-600 hover:text-stone-900"
                }`}
              >
                <Clock className="w-3.5 h-3.5" />
                <span>Pending Review</span>
                {pendingKycCount > 0 && (
                  <span className="bg-stone-900 text-amber-300 text-[10px] px-1.5 py-0.2 rounded-full font-bold">
                    {pendingKycCount}
                  </span>
                )}
              </button>

              <button
                type="button"
                onClick={() => setKycFilter("verified")}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                  kycFilter === "verified"
                    ? "bg-emerald-600 text-white shadow-xs"
                    : "text-stone-600 hover:text-stone-900"
                }`}
              >
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>Verified Advocates ({professionals.filter((p) => p.verified).length})</span>
              </button>

              <button
                type="button"
                onClick={() => setKycFilter("pending")}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                  kycFilter === "pending"
                    ? "bg-stone-900 text-white shadow-xs"
                    : "text-stone-600 hover:text-stone-900"
                }`}
              >
                <span>Draft / Needs Info</span>
              </button>

              <button
                type="button"
                onClick={() => setKycFilter("all")}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                  kycFilter === "all"
                    ? "bg-stone-900 text-white shadow-xs"
                    : "text-stone-600 hover:text-stone-900"
                }`}
              >
                All Lawyers ({professionals.length})
              </button>
            </div>

            {/* Search Box */}
            <div className="relative flex-1 max-w-sm">
              <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-stone-400" />
              <input
                type="text"
                value={kycSearch}
                onChange={(e) => setKycSearch(e.target.value)}
                placeholder="Search advocate, Bar roll, NID or phone..."
                className="w-full bg-stone-50 border border-stone-200 rounded-xl pl-9 pr-3 py-2 text-xs text-stone-900 placeholder:text-stone-400 focus:outline-none focus:border-stone-900 font-medium"
              />
            </div>
          </div>

          {/* KYC Applicants Grid */}
          {filteredProfessionals.length === 0 ? (
            <div className="bg-white border border-stone-200 rounded-3xl p-12 text-center space-y-3">
              <ShieldCheck className="w-10 h-10 text-stone-300 mx-auto" />
              <p className="text-sm font-bold text-stone-700">No advocate applications matching this filter.</p>
              <p className="text-xs text-stone-400">All submissions are up to date.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
              {filteredProfessionals.map((lawyer) => {
                const isVerified = lawyer.verified === true;
                const hasNid = Boolean(lawyer.nidNumber || lawyer.kycData?.nidNumber);
                const isPendingReview = lawyer.kycStatus === "in_review" || (!isVerified && hasNid);

                return (
                  <div
                    key={lawyer.id}
                    className={`bg-white border rounded-3xl p-5 sm:p-6 shadow-xs space-y-4 transition-all relative ${
                      isPendingReview
                        ? "border-amber-300 ring-2 ring-amber-100"
                        : isVerified
                        ? "border-emerald-200"
                        : "border-stone-200"
                    }`}
                  >
                    {/* Header with Avatar and Badges */}
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-center gap-3.5">
                        <img
                          src={lawyer.avatar || "https://images.unsplash.com/photo-1560250097-0b93528c311a?w=150&auto=format&fit=crop&q=80"}
                          alt={lawyer.name}
                          className="w-12 h-12 rounded-2xl object-cover border-2 border-brand-coral shrink-0 shadow-xs"
                        />
                        <div>
                          <div className="flex items-center gap-1.5">
                            <h3 className="text-sm font-extrabold text-stone-900">
                              {lawyer.name}
                            </h3>
                            {isVerified && (
                              <ShieldCheck className="w-4 h-4 text-emerald-600 fill-emerald-100" />
                            )}
                          </div>
                          <div className="text-xs text-brand-coral font-bold">{lawyer.role}</div>
                          <div className="text-[11px] text-stone-500 flex items-center gap-1 mt-0.5">
                            <MapPin className="w-3 h-3 text-stone-400" /> {lawyer.location || "Bangladesh"}
                          </div>
                        </div>
                      </div>

                      {/* Status Pill */}
                      {isVerified ? (
                        <span className="bg-emerald-100 text-emerald-800 border border-emerald-300 text-[10px] font-bold px-2.5 py-1 rounded-full flex items-center gap-1">
                          <CheckCircle2 className="w-3 h-3 text-emerald-600" /> Verified Advocate
                        </span>
                      ) : isPendingReview ? (
                        <span className="bg-amber-100 text-amber-900 border border-amber-300 text-[10px] font-black px-2.5 py-1 rounded-full flex items-center gap-1 animate-pulse">
                          <Clock className="w-3 h-3 text-amber-700" /> Action Required
                        </span>
                      ) : (
                        <span className="bg-stone-100 text-stone-600 text-[10px] font-semibold px-2 py-0.5 rounded-full">
                          Pending Info
                        </span>
                      )}
                    </div>

                    {/* Bar & National ID Credentials Box */}
                    <div className="bg-stone-50 border border-stone-200 rounded-2xl p-3.5 space-y-2.5 text-xs">
                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <span className="text-[10px] uppercase font-bold tracking-wider text-stone-400 block">
                            Bar Council License
                          </span>
                          <span className="font-mono font-bold text-stone-800">
                            {lawyer.barLicenseNo || lawyer.kycData?.barRollNo || "Not provided"}
                          </span>
                          {lawyer.hideBarLicense && (
                            <span className="text-[9px] text-amber-700 font-semibold block">
                              (Marked Private on profile)
                            </span>
                          )}
                        </div>

                        <div>
                          <span className="text-[10px] uppercase font-bold tracking-wider text-stone-400 block">
                            National ID (NID)
                          </span>
                          <span className="font-mono font-bold text-stone-900 bg-amber-50/80 px-1.5 py-0.5 rounded border border-amber-200 inline-block">
                            {lawyer.nidNumber || lawyer.kycData?.nidNumber || "NID Pending"}
                          </span>
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-3 pt-1 border-t border-stone-200/60">
                        <div>
                          <span className="text-[10px] uppercase font-bold tracking-wider text-stone-400 block">
                            Bar Association
                          </span>
                          <span className="text-stone-700 font-medium truncate block">
                            {lawyer.kycData?.barAssociation || "Supreme Court Bar Association"}
                          </span>
                        </div>

                        <div>
                          <span className="text-[10px] uppercase font-bold tracking-wider text-stone-400 block">
                            Enrollment Year
                          </span>
                          <span className="text-stone-700 font-medium">
                            {lawyer.kycData?.enrollmentYear || "2019"}
                          </span>
                        </div>
                      </div>

                      {lawyer.phone && (
                        <div className="text-[11px] text-stone-500 pt-1 border-t border-stone-200/60 flex items-center justify-between">
                          <span className="flex items-center gap-1 font-mono">
                            <Phone className="w-3 h-3 text-stone-400" /> {lawyer.phone}
                          </span>
                          {lawyer.email && (
                            <span className="flex items-center gap-1 text-stone-500 truncate max-w-[180px]">
                              <Mail className="w-3 h-3 text-stone-400" /> {lawyer.email}
                            </span>
                          )}
                        </div>
                      )}
                    </div>

                    {/* Action Toolbar */}
                    <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-stone-100">
                      <button
                        type="button"
                        onClick={() => setSelectedLawyerForModal(lawyer)}
                        className="text-xs font-bold text-stone-700 hover:text-stone-900 bg-stone-100 hover:bg-stone-200 px-3 py-1.5 rounded-xl inline-flex items-center gap-1.5 transition-colors cursor-pointer"
                      >
                        <Eye className="w-3.5 h-3.5 text-stone-500" />
                        <span>Inspect Credentials & NID</span>
                      </button>

                      <div className="flex items-center gap-2">
                        {isVerified ? (
                          <button
                            type="button"
                            onClick={() => handleRejectLawyer(lawyer.id, "Administrative review revoked verification")}
                            className="text-xs font-bold text-red-600 hover:text-red-700 bg-red-50 hover:bg-red-100 border border-red-200 px-3 py-1.5 rounded-xl transition-colors cursor-pointer"
                          >
                            Revoke Verification
                          </button>
                        ) : (
                          <>
                            <button
                              type="button"
                              onClick={() => handleRejectLawyer(lawyer.id, "Document unclear")}
                              className="text-xs font-bold text-stone-600 hover:text-stone-900 bg-stone-100 hover:bg-stone-200 px-2.5 py-1.5 rounded-xl transition-colors cursor-pointer"
                            >
                              Reject
                            </button>
                            <button
                              type="button"
                              onClick={() => handleApproveLawyer(lawyer.id)}
                              className="text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 px-3.5 py-1.5 rounded-xl shadow-xs inline-flex items-center gap-1 transition-all cursor-pointer"
                            >
                              <CheckCircle2 className="w-3.5 h-3.5" />
                              <span>✓ Approve & Verify</span>
                            </button>
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 2: CITIZEN QUESTIONS MODERATION */}
      {/* ========================================================================= */}
      {activeTab === "questions" && (
        <div className="space-y-6 animate-in fade-in">
          
          {/* Filter Bar */}
          <div className="bg-white border border-stone-200 rounded-3xl p-5 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="flex flex-wrap items-center gap-3">
              <select
                value={questionFilterStatus}
                onChange={(e) => setQuestionFilterStatus(e.target.value)}
                className="bg-stone-50 border border-stone-300 rounded-xl px-3 py-2 text-xs font-bold text-stone-700 focus:outline-none"
              >
                <option value="all">All Statuses</option>
                <option value="awaiting_advice">Awaiting Advice</option>
                <option value="advice_given">Advice Given</option>
                <option value="resolved">Resolved</option>
              </select>

              <select
                value={questionFilterUrgency}
                onChange={(e) => setQuestionFilterUrgency(e.target.value)}
                className="bg-stone-50 border border-stone-300 rounded-xl px-3 py-2 text-xs font-bold text-stone-700 focus:outline-none"
              >
                <option value="all">All Urgencies</option>
                <option value="critical">Critical (Bribery/Police)</option>
                <option value="high">High</option>
                <option value="medium">Medium</option>
                <option value="low">Low</option>
              </select>
            </div>

            <div className="relative flex-1 max-w-sm">
              <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-stone-400" />
              <input
                type="text"
                value={questionSearch}
                onChange={(e) => setQuestionSearch(e.target.value)}
                placeholder="Search by title, tracking code, or keyword..."
                className="w-full bg-stone-50 border border-stone-200 rounded-xl pl-9 pr-3 py-2 text-xs text-stone-900 focus:outline-none"
              />
            </div>
          </div>

          {/* Questions Table */}
          <div className="bg-white border border-stone-200 rounded-3xl shadow-xs overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-stone-50 border-b border-stone-200 text-stone-500 font-bold uppercase tracking-wider">
                  <tr>
                    <th className="px-5 py-3.5">Tracking Code & Citizen</th>
                    <th className="px-5 py-3.5">Query Title & Category</th>
                    <th className="px-5 py-3.5">Urgency</th>
                    <th className="px-5 py-3.5">Answers</th>
                    <th className="px-5 py-3.5">Status</th>
                    <th className="px-5 py-3.5 text-right">Moderation Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-stone-100">
                  {filteredQuestions.map((q) => (
                    <tr key={q.id} className="hover:bg-stone-50/60 transition-colors">
                      <td className="px-5 py-4 whitespace-nowrap">
                        <span className="font-mono font-bold text-brand-coral bg-brand-light px-2 py-0.5 rounded border border-brand-border block w-fit">
                          {q.trackingCode}
                        </span>
                        <span className="text-[11px] text-stone-500 block mt-1">
                          {q.isAnonymous ? "Anonymous Citizen" : q.authorName} • {q.location}
                        </span>
                      </td>

                      <td className="px-5 py-4 max-w-md">
                        <Link
                          href={`/questions/${q.id}`}
                          target="_blank"
                          className="font-bold text-stone-900 hover:text-brand-coral transition-colors line-clamp-1 flex items-center gap-1"
                        >
                          <span>{q.title}</span>
                          <ExternalLink className="w-3 h-3 shrink-0 text-stone-400" />
                        </Link>
                        <span className="text-[11px] text-stone-500 bg-stone-100 px-2 py-0.5 rounded-full inline-block mt-1 font-medium">
                          {q.categoryName || q.categorySlug}
                        </span>
                      </td>

                      <td className="px-5 py-4 whitespace-nowrap">
                        <span
                          className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded-full ${
                            q.urgency === "critical"
                              ? "bg-rose-100 text-rose-800 border border-rose-300"
                              : q.urgency === "high"
                              ? "bg-amber-100 text-amber-800"
                              : "bg-stone-100 text-stone-700"
                          }`}
                        >
                          {q.urgency}
                        </span>
                      </td>

                      <td className="px-5 py-4 whitespace-nowrap font-bold text-stone-700">
                        {q.answersCount} Advice
                      </td>

                      <td className="px-5 py-4 whitespace-nowrap">
                        <span
                          className={`text-[10px] font-bold px-2.5 py-1 rounded-full ${
                            q.status === "resolved"
                              ? "bg-emerald-100 text-emerald-800 border border-emerald-300"
                              : q.status === "advice_given"
                              ? "bg-blue-100 text-blue-800"
                              : "bg-amber-50 text-amber-800 border border-amber-200"
                          }`}
                        >
                          {q.status === "resolved" ? "✓ Resolved" : q.status === "advice_given" ? "Advice Given" : "Awaiting Advice"}
                        </span>
                      </td>

                      <td className="px-5 py-4 whitespace-nowrap text-right space-x-2">
                        <button
                          type="button"
                          onClick={() => handleToggleQuestionStatus(q)}
                          title="Toggle Resolved Status"
                          className={`px-2.5 py-1.5 rounded-lg text-xs font-bold transition-colors cursor-pointer ${
                            q.status === "resolved"
                              ? "bg-stone-100 text-stone-700 hover:bg-stone-200"
                              : "bg-emerald-50 text-emerald-700 hover:bg-emerald-100 border border-emerald-200"
                          }`}
                        >
                          {q.status === "resolved" ? "Reopen" : "Mark Resolved"}
                        </button>

                        <button
                          type="button"
                          onClick={() => handleDeleteQuestion(q.id)}
                          title="Delete question (Spam)"
                          className="p-1.5 text-stone-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors cursor-pointer"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 3: LEGAL ANSWERS & ADVICE MODERATION */}
      {/* ========================================================================= */}
      {activeTab === "answers" && (
        <div className="space-y-6 animate-in fade-in">
          <div className="grid grid-cols-1 gap-4">
            {answers.map((ans) => (
              <div key={ans.id} className="bg-white border border-stone-200 rounded-3xl p-5 sm:p-6 shadow-xs space-y-3">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <img
                      src={ans.professionalAvatar}
                      alt={ans.professionalName}
                      className="w-10 h-10 rounded-full object-cover border border-brand-coral"
                    />
                    <div>
                      <div className="text-xs font-bold text-stone-900 flex items-center gap-1.5">
                        <span>{ans.professionalName}</span>
                        <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                        {ans.isAccepted && (
                          <span className="bg-emerald-100 text-emerald-800 text-[10px] font-bold px-2 py-0.5 rounded-full">
                            ✓ Accepted Solution
                          </span>
                        )}
                      </div>
                      <div className="text-[11px] text-stone-500">
                        {ans.professionalRole} • License: {ans.hideBarLicense ? "Verified on file" : ans.barLicenseNo}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => handleToggleAnswerAccepted(ans.id)}
                      className={`text-xs font-bold px-3 py-1.5 rounded-xl border transition-colors cursor-pointer ${
                        ans.isAccepted
                          ? "bg-emerald-600 text-white border-emerald-600"
                          : "bg-stone-50 text-stone-700 border-stone-200 hover:bg-stone-100"
                      }`}
                    >
                      {ans.isAccepted ? "Accepted Solution" : "Mark as Accepted"}
                    </button>

                    <Link
                      href={`/questions/${ans.questionId}`}
                      target="_blank"
                      className="text-xs font-bold text-stone-600 hover:text-stone-900 bg-stone-100 px-3 py-1.5 rounded-xl inline-flex items-center gap-1"
                    >
                      <span>View Thread</span>
                      <ArrowUpRight className="w-3.5 h-3.5" />
                    </Link>

                    <button
                      type="button"
                      onClick={() => handleDeleteAnswer(ans.id)}
                      className="text-xs font-bold text-red-600 hover:bg-red-50 p-2 rounded-xl transition-colors cursor-pointer"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                <p className="text-xs text-stone-800 whitespace-pre-line leading-relaxed bg-stone-50 p-3.5 rounded-2xl border border-stone-100">
                  {ans.content}
                </p>

                <div className="text-[11px] text-stone-400 flex items-center justify-between">
                  <span>Published {ans.createdAt}</span>
                  <span>{ans.upvotes} Helpful Votes</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 4: CONSULTATIONS OVERSIGHT */}
      {/* ========================================================================= */}
      {activeTab === "consultations" && (
        <div className="space-y-6 animate-in fade-in">
          <div className="bg-white border border-stone-200 rounded-3xl shadow-xs overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-stone-50 border-b border-stone-200 text-stone-500 font-bold uppercase tracking-wider">
                  <tr>
                    <th className="px-5 py-3.5">Client & Contact</th>
                    <th className="px-5 py-3.5">Requested Advocate</th>
                    <th className="px-5 py-3.5">Preferred Date</th>
                    <th className="px-5 py-3.5">Private Legal Notes</th>
                    <th className="px-5 py-3.5">Status</th>
                    <th className="px-5 py-3.5 text-right">Update Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-stone-100">
                  {consultations.map((c) => (
                    <tr key={c.id} className="hover:bg-stone-50/60 transition-colors">
                      <td className="px-5 py-4 whitespace-nowrap">
                        <div className="font-bold text-stone-900">{c.clientName}</div>
                        <div className="font-mono text-[11px] text-stone-500 flex items-center gap-1 mt-0.5">
                          <Phone className="w-3 h-3 text-stone-400" /> {c.clientPhone}
                        </div>
                      </td>

                      <td className="px-5 py-4 whitespace-nowrap font-bold text-stone-800">
                        {c.professionalName}
                      </td>

                      <td className="px-5 py-4 whitespace-nowrap text-stone-600 font-medium">
                        {c.preferredDate}
                      </td>

                      <td className="px-5 py-4 max-w-xs text-stone-600 line-clamp-2">
                        {c.notes || "No extra notes provided."}
                      </td>

                      <td className="px-5 py-4 whitespace-nowrap">
                        <span
                          className={`text-[10px] font-bold px-2.5 py-1 rounded-full uppercase ${
                            c.status === "confirmed"
                              ? "bg-emerald-100 text-emerald-800"
                              : c.status === "completed"
                              ? "bg-blue-100 text-blue-800"
                              : c.status === "cancelled"
                              ? "bg-red-100 text-red-800"
                              : "bg-amber-100 text-amber-800"
                          }`}
                        >
                          {c.status}
                        </span>
                      </td>

                      <td className="px-5 py-4 whitespace-nowrap text-right">
                        <select
                          value={c.status}
                          onChange={(e) => handleUpdateConsultStatus(c.id, e.target.value as any)}
                          className="bg-stone-50 border border-stone-300 rounded-xl px-2.5 py-1.5 text-xs font-bold text-stone-700 cursor-pointer"
                        >
                          <option value="pending">Pending</option>
                          <option value="confirmed">Confirmed</option>
                          <option value="completed">Completed</option>
                          <option value="cancelled">Cancelled</option>
                        </select>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 5: CATEGORIES DIRECTORY */}
      {/* ========================================================================= */}
      {activeTab === "categories" && (
        <div className="space-y-6 animate-in fade-in">
          <div className="flex items-center justify-between">
            <h3 className="text-base font-bold text-stone-900">
              Active Legal Practice Categories ({categories.length})
            </h3>
            <button
              type="button"
              onClick={() => setShowAddCat(!showAddCat)}
              className="bg-stone-900 hover:bg-black text-white text-xs font-bold px-4 py-2 rounded-xl flex items-center gap-1.5 transition-colors cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>{showAddCat ? "Close Form" : "Add New Category"}</span>
            </button>
          </div>

          {showAddCat && (
            <form onSubmit={handleAddCategory} className="bg-white border border-stone-200 rounded-3xl p-6 shadow-xs space-y-4">
              <h4 className="text-xs font-bold text-stone-900 uppercase tracking-wider">
                Create New Legal Domain
              </h4>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-[11px] font-bold text-stone-600 mb-1">Category Name</label>
                  <input
                    type="text"
                    value={newCatName}
                    onChange={(e) => setNewCatName(e.target.value)}
                    placeholder="e.g. Cyber Crime & Digital Security"
                    required
                    className="w-full bg-stone-50 border border-stone-300 rounded-xl px-3 py-2 text-xs font-medium"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-stone-600 mb-1">Slug URL</label>
                  <input
                    type="text"
                    value={newCatSlug}
                    onChange={(e) => setNewCatSlug(e.target.value)}
                    placeholder="e.g. cyber"
                    required
                    className="w-full bg-stone-50 border border-stone-300 rounded-xl px-3 py-2 text-xs font-mono font-medium"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-stone-600 mb-1">Emoji Icon</label>
                  <input
                    type="text"
                    value={newCatIcon}
                    onChange={(e) => setNewCatIcon(e.target.value)}
                    placeholder="💻"
                    className="w-full bg-stone-50 border border-stone-300 rounded-xl px-3 py-2 text-xs text-center font-medium"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-stone-600 mb-1">Description</label>
                <input
                  type="text"
                  value={newCatDesc}
                  onChange={(e) => setNewCatDesc(e.target.value)}
                  placeholder="Short scope description for citizens"
                  className="w-full bg-stone-50 border border-stone-300 rounded-xl px-3 py-2 text-xs font-medium"
                />
              </div>

              <button
                type="submit"
                className="bg-brand-coral hover:bg-brand-hover text-white text-xs font-bold px-5 py-2 rounded-xl shadow-coral transition-all cursor-pointer"
              >
                Save Category
              </button>
            </form>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {categories.map((cat) => (
              <div key={cat.id} className="bg-white border border-stone-200 rounded-2xl p-4 shadow-xs space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-2xl">{cat.icon}</span>
                  <button
                    type="button"
                    onClick={() => handleDeleteCategory(cat.slug)}
                    className="text-stone-400 hover:text-red-600 p-1"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
                <div className="font-bold text-xs text-stone-900">{cat.name}</div>
                <div className="text-[10px] font-mono text-stone-400">/{cat.slug}</div>
                <p className="text-[11px] text-stone-500 leading-relaxed">{cat.description}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 6: PLATFORM ANALYTICS & HEALTH */}
      {/* ========================================================================= */}
      {activeTab === "analytics" && (
        <div className="space-y-6 animate-in fade-in">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
            <div className="bg-white border border-stone-200 rounded-3xl p-6 shadow-xs space-y-2">
              <div className="text-xs font-bold uppercase text-stone-500">Citizen Query Resolution Rate</div>
              <div className="text-3xl font-black text-emerald-600">
                {stats.totalQuestions ? Math.round((stats.resolvedQuestions / stats.totalQuestions) * 100) : 0}%
              </div>
              <p className="text-xs text-stone-500">
                {stats.resolvedQuestions} out of {stats.totalQuestions} legal issues resolved with verified advice.
              </p>
            </div>

            <div className="bg-white border border-stone-200 rounded-3xl p-6 shadow-xs space-y-2">
              <div className="text-xs font-bold uppercase text-stone-500">Bar Council Verification Rate</div>
              <div className="text-3xl font-black text-brand-coral">
                {stats.totalLawyers ? Math.round((stats.verifiedLawyers / stats.totalLawyers) * 100) : 0}%
              </div>
              <p className="text-xs text-stone-500">
                {stats.verifiedLawyers} approved advocates active, {pendingKycCount} in verification review.
              </p>
            </div>

            <div className="bg-white border border-stone-200 rounded-3xl p-6 shadow-xs space-y-2">
              <div className="text-xs font-bold uppercase text-stone-500">Average Advice Response Time</div>
              <div className="text-3xl font-black text-stone-900">&lt; 4 Hours</div>
              <p className="text-xs text-stone-500">
                Rapid pro bono turnaround on urgent citizen harassment inquiries.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* DETAILED KYC INSPECTION DRAWER / MODAL */}
      {/* ========================================================================= */}
      {selectedLawyerForModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-900/70 backdrop-blur-xs animate-in fade-in">
          <div className="bg-white border border-stone-200 rounded-3xl max-w-2xl w-full p-6 sm:p-8 shadow-2xl space-y-6 max-h-[90vh] overflow-y-auto">
            
            {/* Modal Header */}
            <div className="flex items-start justify-between gap-4 pb-4 border-b border-stone-100">
              <div className="flex items-center gap-3.5">
                <img
                  src={selectedLawyerForModal.avatar || "https://images.unsplash.com/photo-1560250097-0b93528c311a?w=150&auto=format&fit=crop&q=80"}
                  alt={selectedLawyerForModal.name}
                  className="w-14 h-14 rounded-2xl object-cover border-2 border-brand-coral shadow-xs"
                />
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-lg font-black text-stone-900">
                      {selectedLawyerForModal.name}
                    </h3>
                    {selectedLawyerForModal.verified && (
                      <ShieldCheck className="w-5 h-5 text-emerald-600 fill-emerald-100" />
                    )}
                  </div>
                  <div className="text-xs text-brand-coral font-bold">{selectedLawyerForModal.role}</div>
                  <div className="text-xs text-stone-500 mt-0.5">{selectedLawyerForModal.location}</div>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setSelectedLawyerForModal(null)}
                className="text-stone-400 hover:text-stone-700 p-2 rounded-xl hover:bg-stone-100 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* National ID & Bar Council Highlight */}
            <div className="bg-amber-50/70 border border-amber-200 rounded-2xl p-4 space-y-3">
              <div className="flex items-center gap-2 text-xs font-bold text-amber-950 uppercase tracking-wider">
                <ShieldCheck className="w-4 h-4 text-brand-coral" />
                <span>Verified Identity & Bar Council Credentials</span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-1">
                <div className="bg-white border border-amber-200 rounded-xl p-3 space-y-1">
                  <div className="text-[10px] font-bold text-stone-400 uppercase">
                    National ID (NID / Smart Card)
                  </div>
                  <div className="text-sm font-mono font-black text-stone-900">
                    {selectedLawyerForModal.nidNumber || selectedLawyerForModal.kycData?.nidNumber || "Pending Submission"}
                  </div>
                  <div className="text-[10px] text-emerald-700 font-semibold flex items-center gap-1">
                    <CheckCircle2 className="w-3 h-3" /> NID Format Checked
                  </div>
                </div>

                <div className="bg-white border border-amber-200 rounded-xl p-3 space-y-1">
                  <div className="text-[10px] font-bold text-stone-400 uppercase">
                    Bar Council Registration / Roll No.
                  </div>
                  <div className="text-sm font-mono font-black text-stone-900">
                    {selectedLawyerForModal.barLicenseNo || selectedLawyerForModal.kycData?.barRollNo || "Pending"}
                  </div>
                  <div className="text-[10px] text-stone-500">
                    {selectedLawyerForModal.hideBarLicense ? "Privacy: Hidden from public" : "Privacy: Visible to public"}
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3 text-xs pt-2 border-t border-amber-200/60">
                <div>
                  <span className="text-[10px] text-stone-500 block uppercase font-bold">Bar Association</span>
                  <span className="font-semibold text-stone-800">
                    {selectedLawyerForModal.kycData?.barAssociation || "Supreme Court Bar Association, Dhaka"}
                  </span>
                </div>
                <div>
                  <span className="text-[10px] text-stone-500 block uppercase font-bold">Enrollment Year</span>
                  <span className="font-semibold text-stone-800">
                    {selectedLawyerForModal.kycData?.enrollmentYear || "2019"}
                  </span>
                </div>
              </div>
            </div>

            {/* Document Verification Preview */}
            <div className="bg-stone-50 border border-stone-200 rounded-2xl p-4 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold uppercase tracking-wider text-stone-700">
                  Uploaded Bar Council Certificate / ID Card
                </span>
                <span className="text-[11px] text-emerald-700 font-bold bg-emerald-100 px-2 py-0.5 rounded">
                  Document Attached
                </span>
              </div>
              <div className="border border-stone-200 rounded-xl p-4 bg-white flex items-center justify-between gap-3">
                <div className="flex items-center gap-2.5">
                  <FileText className="w-6 h-6 text-brand-coral shrink-0" />
                  <div>
                    <div className="text-xs font-bold text-stone-800">
                      {selectedLawyerForModal.kycData?.documentName || "Bar_Council_Certificate.pdf"}
                    </div>
                    <div className="text-[10px] text-stone-400">
                      Submitted: {selectedLawyerForModal.kycData?.submittedAt || "Recently"}
                    </div>
                  </div>
                </div>

                <a
                  href="#"
                  onClick={(e) => {
                    e.preventDefault();
                    alert("Simulated PDF preview: Advocate Bar Council Certificate validated with Bar Association ledger.");
                  }}
                  className="text-xs font-bold text-brand-coral hover:underline"
                >
                  Preview Document
                </a>
              </div>
            </div>

            {/* Bio & Contact */}
            <div className="space-y-2 text-xs">
              <span className="text-[10px] font-bold uppercase tracking-wider text-stone-400 block">
                Chamber Bio & Declaration
              </span>
              <p className="text-stone-700 leading-relaxed bg-stone-50 p-3 rounded-xl border border-stone-100">
                {selectedLawyerForModal.bio || "No bio submitted."}
              </p>
              <div className="flex items-center gap-4 text-stone-500 pt-1">
                <span>Phone: <b className="text-stone-800 font-mono">{selectedLawyerForModal.phone || "N/A"}</b></span>
                <span>Email: <b className="text-stone-800">{selectedLawyerForModal.email || "N/A"}</b></span>
                <span>Fee: <b className="text-stone-800">{selectedLawyerForModal.hourlyFee}</b></span>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row items-center justify-end gap-3 pt-4 border-t border-stone-100">
              <button
                type="button"
                onClick={() => setSelectedLawyerForModal(null)}
                className="w-full sm:w-auto px-4 py-2.5 rounded-xl border border-stone-300 text-stone-700 text-xs font-bold hover:bg-stone-50 transition-colors"
              >
                Close
              </button>

              {selectedLawyerForModal.verified ? (
                <button
                  type="button"
                  onClick={() => handleRejectLawyer(selectedLawyerForModal.id, "Verification revoked by administrator")}
                  className="w-full sm:w-auto bg-red-600 hover:bg-red-700 text-white text-xs font-bold px-5 py-2.5 rounded-xl shadow-xs transition-colors cursor-pointer"
                >
                  Revoke Verification
                </button>
              ) : (
                <>
                  <button
                    type="button"
                    onClick={() => handleRejectLawyer(selectedLawyerForModal.id, "Clarification required on credentials")}
                    className="w-full sm:w-auto bg-stone-100 hover:bg-stone-200 text-stone-700 text-xs font-bold px-4 py-2.5 rounded-xl transition-colors cursor-pointer"
                  >
                    Request Resubmission
                  </button>
                  <button
                    type="button"
                    onClick={() => handleApproveLawyer(selectedLawyerForModal.id)}
                    className="w-full sm:w-auto bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold px-6 py-2.5 rounded-xl shadow-sm flex items-center justify-center gap-1.5 transition-all cursor-pointer"
                  >
                    <CheckCircle2 className="w-4 h-4" />
                    <span>✓ Approve & Activate Advocate</span>
                  </button>
                </>
              )}
            </div>

          </div>
        </div>
      )}

    </div>
  );
}
