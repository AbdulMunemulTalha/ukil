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
  Plus,
  Lock,
  Edit3,
  UserPlus,
  ShieldAlert
} from "lucide-react";
import { DataService, ConsultationRequest, AdminUser, AdminPermissions, AdminRole } from "../../lib/db";
import { Professional, Question, Answer, Category } from "../../lib/mockData";
import { createClient } from "../../lib/supabase/client";

export default function AdminDashboardPage() {
  const [adminUser, setAdminUser] = useState<AdminUser | null>(null);
  const [activeTab, setActiveTab] = useState<"kyc" | "questions" | "answers" | "consultations" | "categories" | "analytics" | "admins">("kyc");

  // Data states
  const [professionals, setProfessionals] = useState<Professional[]>([]);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [answers, setAnswers] = useState<Answer[]>([]);
  const [consultations, setConsultations] = useState<ConsultationRequest[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [adminUsers, setAdminUsers] = useState<AdminUser[]>([]);
  const [stats, setStats] = useState<any>({});
  const [isLoading, setIsLoading] = useState(true);

  // Admin Team Management State
  const [adminSearchQuery, setAdminSearchQuery] = useState("");
  const [adminRoleFilter, setAdminRoleFilter] = useState<"all" | "super_admin" | "admin" | "moderator" | "support">("all");
  const [showAddAdminModal, setShowAddAdminModal] = useState(false);
  const [editingAdminUser, setEditingAdminUser] = useState<AdminUser | null>(null);
  const [adminForm, setAdminForm] = useState({
    name: "",
    email: "",
    department: "Judicial Administration",
    role: "admin" as AdminRole,
    isSuperAdmin: false,
    permissions: {
      manage_kyc: true,
      manage_questions: true,
      manage_answers: true,
      manage_consultations: true,
      manage_categories: true,
      view_analytics: true,
      manage_admins: true,
    } as AdminPermissions,
  });

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
    setAdminUsers(DataService.getAdminUsers());
  };

  useEffect(() => {
    const initializeAdmin = async () => {
      let currentEmail = "";
      let sessionData: any = null;

      // 1. Check local admin session
      const localSessionStr = localStorage.getItem("ukil_admin_session");
      if (localSessionStr) {
        try {
          sessionData = JSON.parse(localSessionStr);
          currentEmail = sessionData.email || "";
        } catch (e) {}
      }

      // 2. Check Supabase auth if no local session email
      if (!currentEmail) {
        const supabase = createClient();
        if (supabase) {
          const { data: { user } } = await supabase.auth.getUser();
          if (user?.email) {
            currentEmail = user.email;
            sessionData = { email: user.email, name: user.user_metadata?.full_name || "Platform Admin" };
          }
        }
      }

      if (!currentEmail) {
        window.location.href = "/admin/login";
        return;
      }

      // Sync data & admins
      loadPlatformData();
      await DataService.syncFromSupabase();
      const freshAdmins = await DataService.syncAdminUsersFromSupabase();
      setAdminUsers(freshAdmins);

      // Match current admin user
      const cleanEmail = currentEmail.toLowerCase();
      const matched = freshAdmins.find((u) => u.email.toLowerCase() === cleanEmail) ||
        DataService.getAdminUserByEmail(cleanEmail);

      if (matched) {
        setAdminUser(matched);
      } else if (sessionData) {
        const isSuper = cleanEmail.includes("super") || cleanEmail === "md72905talha@gmail.com";
        setAdminUser({
          id: "admin-sess",
          email: currentEmail,
          name: sessionData.name || (isSuper ? "Super Admin" : "Platform Admin"),
          role: isSuper ? "super_admin" : (sessionData.role || "admin"),
          isSuperAdmin: isSuper || Boolean(sessionData.isSuperAdmin),
          permissions: sessionData.permissions || {
            manage_kyc: true,
            manage_questions: true,
            manage_answers: true,
            manage_consultations: true,
            manage_categories: true,
            view_analytics: true,
            manage_admins: isSuper || sessionData.role === "admin",
          },
          status: "active",
          createdAt: "Today",
        });
      }

      loadPlatformData();
      setIsLoading(false);
    };

    initializeAdmin();
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("ukil_admin_session");
    const supabase = createClient();
    if (supabase) {
      supabase.auth.signOut();
    }
    window.location.href = "/admin/login";
  };

  // Admin Management Handlers
  const handleOpenAddAdmin = () => {
    setEditingAdminUser(null);
    setAdminForm({
      name: "",
      email: "",
      department: "Platform Operations & Moderation",
      role: "admin",
      isSuperAdmin: false,
      permissions: {
        manage_kyc: true,
        manage_questions: true,
        manage_answers: true,
        manage_consultations: true,
        manage_categories: true,
        view_analytics: true,
        manage_admins: true,
      },
    });
    setShowAddAdminModal(true);
  };

  const handleOpenEditAdmin = (target: AdminUser) => {
    if (target.isSuperAdmin && !adminUser?.isSuperAdmin) {
      alert("Access Denied: Super Admin is protected by root authority. Only a Super Admin can modify a Super Admin profile.");
      return;
    }
    setEditingAdminUser(target);
    setAdminForm({
      name: target.name,
      email: target.email,
      department: target.department || "Judicial Administration",
      role: target.role,
      isSuperAdmin: target.isSuperAdmin,
      permissions: { ...target.permissions },
    });
    setShowAddAdminModal(true);
  };

  const handleSaveAdminUser = (e: React.FormEvent) => {
    e.preventDefault();
    if (!adminUser) return;

    if (editingAdminUser) {
      const res = DataService.updateAdminUser(
        editingAdminUser.id,
        {
          name: adminForm.name,
          department: adminForm.department,
          role: adminForm.role,
          isSuperAdmin: adminForm.isSuperAdmin,
          permissions: adminForm.permissions,
        },
        adminUser.email
      );

      if (!res.success) {
        alert(res.error || "Failed to update administrator.");
        return;
      }
      notifyAction(`Administrator ${adminForm.name} updated successfully.`);
    } else {
      const res = DataService.addAdminUser(
        {
          name: adminForm.name,
          email: adminForm.email,
          department: adminForm.department,
          role: adminForm.role,
          isSuperAdmin: adminForm.isSuperAdmin,
          permissions: adminForm.permissions,
          status: "active",
        },
        adminUser.email
      );

      if (!res.success) {
        alert(res.error || "Failed to add administrator.");
        return;
      }
      notifyAction(`New administrator ${adminForm.name} added to admin team.`);
    }

    setShowAddAdminModal(false);
    loadPlatformData();
  };

  const handleDeleteAdminUser = (target: AdminUser) => {
    if (!adminUser) return;

    // CRITICAL SECURITY INVARIANT: NO OTHER ADMIN CAN REMOVE SUPER ADMIN!
    if (target.isSuperAdmin && !adminUser.isSuperAdmin) {
      alert("Access Denied: Super Admin is protected by root authority. No other administrator (even with full access) can remove the Super Admin.");
      return;
    }

    if (
      window.confirm(
        `Are you sure you want to permanently revoke administrative access for ${target.name} (${target.email})?`
      )
    ) {
      const res = DataService.deleteAdminUser(target.id, adminUser.email);
      if (!res.success) {
        alert(res.error || "Failed to remove administrator.");
        return;
      }
      notifyAction(`Administrator ${target.name} removed from admin dashboard.`);
      loadPlatformData();
    }
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

  // Permission flags based on logged-in administrator
  const canManageKyc = Boolean(adminUser?.isSuperAdmin || adminUser?.permissions?.manage_kyc);
  const canManageQuestions = Boolean(adminUser?.isSuperAdmin || adminUser?.permissions?.manage_questions);
  const canManageAnswers = Boolean(adminUser?.isSuperAdmin || adminUser?.permissions?.manage_answers);
  const canManageConsultations = Boolean(adminUser?.isSuperAdmin || adminUser?.permissions?.manage_consultations);
  const canManageCategories = Boolean(adminUser?.isSuperAdmin || adminUser?.permissions?.manage_categories);
  const canViewAnalytics = Boolean(adminUser?.isSuperAdmin || adminUser?.permissions?.view_analytics);
  const canManageAdmins = Boolean(adminUser?.isSuperAdmin || adminUser?.permissions?.manage_admins);

  const filteredAdminUsers = adminUsers.filter((u) => {
    // 1. Role filter separation
    if (adminRoleFilter === "super_admin" && !u.isSuperAdmin && u.role !== "super_admin") {
      return false;
    }
    if (adminRoleFilter === "admin" && (u.isSuperAdmin || !u.permissions?.manage_admins || u.role === "moderator" || u.role === "support")) {
      return false;
    }
    if (adminRoleFilter === "moderator" && (u.isSuperAdmin || u.permissions?.manage_admins || u.role === "support")) {
      return false;
    }
    if (adminRoleFilter === "support" && u.role !== "support") {
      return false;
    }

    // 2. Search query filter
    if (!adminSearchQuery.trim()) return true;
    const q = adminSearchQuery.toLowerCase();
    return (
      u.name.toLowerCase().includes(q) ||
      u.email.toLowerCase().includes(q) ||
      (u.department && u.department.toLowerCase().includes(q)) ||
      u.role.toLowerCase().includes(q)
    );
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
              <div className="flex flex-wrap items-center gap-2">
                <h1 className="text-xl sm:text-2xl font-black tracking-tight">
                  Ukil Judicial & Platform Administration
                </h1>
                <span className="bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 text-[10px] font-bold px-2 py-0.5 rounded-full flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" /> Live Ops
                </span>
                {adminUser?.isSuperAdmin ? (
                  <span className="bg-amber-500/20 text-amber-300 border border-amber-500/40 text-[10px] font-bold px-2.5 py-0.5 rounded-full flex items-center gap-1">
                    👑 Super Admin (Root Authority)
                  </span>
                ) : canManageAdmins ? (
                  <span className="bg-blue-500/20 text-blue-300 border border-blue-500/40 text-[10px] font-bold px-2.5 py-0.5 rounded-full flex items-center gap-1">
                    ⚡ Full Access Admin
                  </span>
                ) : (
                  <span className="bg-stone-700 text-stone-300 text-[10px] font-bold px-2.5 py-0.5 rounded-full">
                    🛡️ Scoped Moderator
                  </span>
                )}
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
        {canManageKyc && (
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
        )}

        {canManageQuestions && (
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
        )}

        {canManageAnswers && (
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
        )}

        {canManageConsultations && (
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
        )}

        {canManageCategories && (
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
        )}

        {canViewAnalytics && (
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
        )}

        {/* Tab 7: Admin Team & Role-Based Access Control (Only for Super Admin or Full Access Admins) */}
        {canManageAdmins && (
          <button
            type="button"
            onClick={() => setActiveTab("admins")}
            className={`px-4 py-2.5 rounded-2xl text-xs font-bold flex items-center gap-2 transition-all cursor-pointer ${
              activeTab === "admins"
                ? "bg-stone-900 text-white shadow-sm"
                : "bg-white text-stone-600 hover:bg-stone-100 border border-stone-200"
            }`}
          >
            <Users className="w-4 h-4 text-brand-coral" />
            <span>Admin Team & Role Access</span>
            <span className="text-[10px] bg-brand-coral/10 text-brand-coral font-bold px-2 py-0.5 rounded-full">
              {adminUsers.length}
            </span>
          </button>
        )}
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
      {/* TAB 7: ADMIN TEAM & ROLE-BASED ACCESS CONTROL (RBAC) */}
      {/* ========================================================================= */}
      {activeTab === "admins" && canManageAdmins && (
        <div className="space-y-6 animate-in fade-in">
          
          {/* Header & Controls Bar */}
          <div className="bg-white border border-stone-200 rounded-3xl p-6 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <h2 className="text-xl font-black text-stone-900 tracking-tight">
                  Admin Team & Role-Based Access Control
                </h2>
                {adminUser?.isSuperAdmin ? (
                  <span className="bg-amber-100 text-amber-900 border border-amber-300 text-[10px] font-black px-2.5 py-0.5 rounded-full flex items-center gap-1">
                    👑 Super Admin Root Authority
                  </span>
                ) : (
                  <span className="bg-blue-100 text-blue-900 border border-blue-300 text-[10px] font-black px-2.5 py-0.5 rounded-full flex items-center gap-1">
                    ⚡ Full Access Administrator
                  </span>
                )}
              </div>
              <p className="text-xs text-stone-500 mt-1">
                {adminUser?.isSuperAdmin
                  ? "As Super Admin, you have root authority over all administrators, moderators, and granular permissions."
                  : "You have full administrative privileges to add and manage team members and moderators. Root Super Admins are protected and cannot be removed or demoted."}
              </p>
            </div>

            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={handleOpenAddAdmin}
                className="bg-brand-coral hover:bg-brand-hover text-white text-xs font-bold px-4 py-2.5 rounded-xl shadow-coral flex items-center gap-1.5 transition-transform active:scale-95 cursor-pointer"
              >
                <UserPlus className="w-4 h-4" />
                <span>+ Add New Administrator</span>
              </button>
            </div>
          </div>

          {/* Metric Summary Cards (Interactive Role Filters) */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <button
              type="button"
              onClick={() => setAdminRoleFilter("all")}
              className={`text-left bg-white border rounded-2xl p-4 shadow-xs transition-all cursor-pointer ${
                adminRoleFilter === "all"
                  ? "border-stone-900 ring-2 ring-stone-900/10 bg-stone-50/50"
                  : "border-stone-200 hover:border-stone-300"
              }`}
            >
              <div className="text-[10px] font-bold text-stone-400 uppercase">All Administrators</div>
              <div className="text-2xl font-black text-stone-900">{adminUsers.length}</div>
              <div className="text-[10px] text-stone-500 mt-0.5">Click to view all personnel</div>
            </button>

            <button
              type="button"
              onClick={() => setAdminRoleFilter("super_admin")}
              className={`text-left bg-white border rounded-2xl p-4 shadow-xs transition-all cursor-pointer ${
                adminRoleFilter === "super_admin"
                  ? "border-amber-500 ring-2 ring-amber-500/20 bg-amber-50/30"
                  : "border-stone-200 hover:border-stone-300"
              }`}
            >
              <div className="text-[10px] font-bold text-amber-700 uppercase flex items-center gap-1">
                <Shield className="w-3 h-3 text-amber-500" /> Super Admins
              </div>
              <div className="text-2xl font-black text-amber-600">
                {adminUsers.filter((u) => u.isSuperAdmin || u.role === "super_admin").length}
              </div>
              <div className="text-[10px] text-amber-700 mt-0.5">Root system authority</div>
            </button>

            <button
              type="button"
              onClick={() => setAdminRoleFilter("admin")}
              className={`text-left bg-white border rounded-2xl p-4 shadow-xs transition-all cursor-pointer ${
                adminRoleFilter === "admin"
                  ? "border-blue-500 ring-2 ring-blue-500/20 bg-blue-50/30"
                  : "border-stone-200 hover:border-stone-300"
              }`}
            >
              <div className="text-[10px] font-bold text-blue-700 uppercase flex items-center gap-1">
                <CheckCircle2 className="w-3 h-3 text-blue-500" /> Full Access Admins
              </div>
              <div className="text-2xl font-black text-blue-600">
                {adminUsers.filter((u) => !u.isSuperAdmin && u.permissions.manage_admins).length}
              </div>
              <div className="text-[10px] text-blue-700 mt-0.5">Can add & manage staff</div>
            </button>

            <button
              type="button"
              onClick={() => setAdminRoleFilter("moderator")}
              className={`text-left bg-white border rounded-2xl p-4 shadow-xs transition-all cursor-pointer ${
                adminRoleFilter === "moderator"
                  ? "border-stone-600 ring-2 ring-stone-600/20 bg-stone-50/50"
                  : "border-stone-200 hover:border-stone-300"
              }`}
            >
              <div className="text-[10px] font-bold text-stone-500 uppercase flex items-center gap-1">
                <Users className="w-3 h-3 text-stone-400" /> Scoped Moderators
              </div>
              <div className="text-2xl font-black text-stone-700">
                {adminUsers.filter((u) => !u.isSuperAdmin && !u.permissions.manage_admins).length}
              </div>
              <div className="text-[10px] text-stone-500 mt-0.5">Specific control scopes</div>
            </button>
          </div>

          {/* Filter Segmented Bar & Search Row */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
            <div className="flex items-center gap-1.5 p-1 bg-stone-100 rounded-2xl border border-stone-200 overflow-x-auto">
              <button
                type="button"
                onClick={() => setAdminRoleFilter("all")}
                className={`text-xs font-bold px-3 py-1.5 rounded-xl transition-all whitespace-nowrap cursor-pointer ${
                  adminRoleFilter === "all"
                    ? "bg-white text-stone-900 shadow-xs"
                    : "text-stone-600 hover:text-stone-900"
                }`}
              >
                All Personnel ({adminUsers.length})
              </button>
              <button
                type="button"
                onClick={() => setAdminRoleFilter("super_admin")}
                className={`text-xs font-bold px-3 py-1.5 rounded-xl transition-all whitespace-nowrap flex items-center gap-1 cursor-pointer ${
                  adminRoleFilter === "super_admin"
                    ? "bg-amber-500 text-stone-950 shadow-xs"
                    : "text-amber-800 hover:text-amber-950"
                }`}
              >
                <span>⚡ Super Admins ({adminUsers.filter((u) => u.isSuperAdmin || u.role === "super_admin").length})</span>
              </button>
              <button
                type="button"
                onClick={() => setAdminRoleFilter("admin")}
                className={`text-xs font-bold px-3 py-1.5 rounded-xl transition-all whitespace-nowrap flex items-center gap-1 cursor-pointer ${
                  adminRoleFilter === "admin"
                    ? "bg-blue-600 text-white shadow-xs"
                    : "text-blue-800 hover:text-blue-950"
                }`}
              >
                <span>🛡️ Full Access ({adminUsers.filter((u) => !u.isSuperAdmin && u.permissions.manage_admins).length})</span>
              </button>
              <button
                type="button"
                onClick={() => setAdminRoleFilter("moderator")}
                className={`text-xs font-bold px-3 py-1.5 rounded-xl transition-all whitespace-nowrap flex items-center gap-1 cursor-pointer ${
                  adminRoleFilter === "moderator"
                    ? "bg-stone-800 text-white shadow-xs"
                    : "text-stone-600 hover:text-stone-900"
                }`}
              >
                <span>⚖️ Moderators ({adminUsers.filter((u) => !u.isSuperAdmin && !u.permissions.manage_admins).length})</span>
              </button>
            </div>

            <div className="relative max-w-xs sm:w-72">
              <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-stone-400" />
              <input
                type="text"
                value={adminSearchQuery}
                onChange={(e) => setAdminSearchQuery(e.target.value)}
                placeholder="Search by name, email, department..."
                className="w-full bg-white border border-stone-200 rounded-xl pl-10 pr-4 py-2 text-xs text-stone-900 focus:outline-none focus:border-stone-900 shadow-xs"
              />
            </div>
          </div>

          {/* Administrators Table */}
          <div className="bg-white border border-stone-200 rounded-3xl overflow-hidden shadow-xs">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-stone-50 border-b border-stone-200 text-[11px] font-bold uppercase tracking-wider text-stone-500">
                  <tr>
                    <th className="px-6 py-4">Administrator</th>
                    <th className="px-6 py-4">Authority & Role</th>
                    <th className="px-6 py-4">Department</th>
                    <th className="px-6 py-4">Access Controls & Permissions</th>
                    <th className="px-6 py-4">Added By</th>
                    <th className="px-6 py-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-stone-100">
                  {filteredAdminUsers.map((admin) => {
                    const isTargetSuperAdmin = Boolean(admin.isSuperAdmin || admin.role === "super_admin");

                    return (
                      <tr key={admin.id} className="hover:bg-stone-50/70 transition-colors">
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-3">
                            <div className={`w-10 h-10 rounded-xl flex items-center justify-center font-black text-sm shrink-0 shadow-xs ${
                              isTargetSuperAdmin
                                ? "bg-gradient-to-br from-amber-400 to-amber-500 text-stone-950 font-black border border-amber-300"
                                : admin.permissions.manage_admins
                                ? "bg-blue-100 text-blue-900 border border-blue-200"
                                : "bg-stone-100 text-stone-700 border border-stone-200"
                            }`}>
                              {admin.name.charAt(0).toUpperCase()}
                            </div>
                            <div>
                              <div className="font-bold text-stone-900 flex items-center gap-1.5">
                                <span>{admin.name}</span>
                                {admin.email === adminUser?.email && (
                                  <span className="bg-emerald-100 text-emerald-800 border border-emerald-200 text-[9px] font-black px-1.5 py-0.2 rounded">
                                    Current Session
                                  </span>
                                )}
                              </div>
                              <div className="text-[11px] text-stone-500 font-mono">{admin.email}</div>
                            </div>
                          </div>
                        </td>

                        <td className="px-6 py-4">
                          {isTargetSuperAdmin ? (
                            <div className="space-y-0.5">
                              <span className="inline-flex items-center gap-1 bg-amber-100 text-amber-950 border border-amber-300 font-black text-[11px] px-2.5 py-1 rounded-lg shadow-2xs">
                                <Shield className="w-3.5 h-3.5 text-amber-700 fill-amber-700" />
                                <span>Super Admin</span>
                              </span>
                              <div className="text-[10px] text-amber-800 font-semibold pl-0.5">
                                👑 Root Authority • Non-Removable
                              </div>
                            </div>
                          ) : admin.permissions.manage_admins ? (
                            <div className="space-y-0.5">
                              <span className="inline-flex items-center gap-1 bg-blue-50 text-blue-800 border border-blue-200 font-bold text-[11px] px-2.5 py-1 rounded-lg">
                                <CheckCircle2 className="w-3.5 h-3.5 text-blue-600" />
                                <span>Full Access Admin</span>
                              </span>
                              <div className="text-[10px] text-blue-700 pl-0.5">
                                Can Provision & Manage Staff
                              </div>
                            </div>
                          ) : (
                            <div className="space-y-0.5">
                              <span className="inline-flex items-center gap-1 bg-stone-100 text-stone-700 border border-stone-200 font-semibold text-[11px] px-2.5 py-1 rounded-lg">
                                <span>Scoped Moderator</span>
                              </span>
                              <div className="text-[10px] text-stone-400 pl-0.5">
                                Scoped Controls
                              </div>
                            </div>
                          )}
                        </td>

                        <td className="px-6 py-4 text-stone-700 font-medium">
                          {admin.department || "Platform Administration"}
                        </td>

                        <td className="px-6 py-4">
                          {isTargetSuperAdmin ? (
                            <div className="space-y-1 max-w-sm">
                              <div className="inline-flex items-center gap-1 bg-amber-50 text-amber-900 border border-amber-200 text-[10px] font-black px-2 py-0.5 rounded-md">
                                <span>⚡ Unrestricted: All 7 Operational Modules Active</span>
                              </div>
                              <div className="flex flex-wrap gap-1 text-[10px]">
                                <span className="bg-emerald-50 text-emerald-800 border border-emerald-200 font-bold px-1.5 py-0.5 rounded">✓ KYC & NID</span>
                                <span className="bg-indigo-50 text-indigo-800 border border-indigo-200 font-bold px-1.5 py-0.5 rounded">✓ Admin Provisioning</span>
                                <span className="bg-stone-100 text-stone-700 px-1.5 py-0.5 rounded font-medium">✓ Questions</span>
                                <span className="bg-stone-100 text-stone-700 px-1.5 py-0.5 rounded font-medium">✓ Legal Advice</span>
                                <span className="bg-stone-100 text-stone-700 px-1.5 py-0.5 rounded font-medium">✓ Consultations</span>
                                <span className="bg-stone-100 text-stone-700 px-1.5 py-0.5 rounded font-medium">✓ Categories</span>
                                <span className="bg-stone-100 text-stone-700 px-1.5 py-0.5 rounded font-medium">✓ Analytics</span>
                              </div>
                            </div>
                          ) : (
                            <div className="flex flex-wrap gap-1 max-w-sm text-[10px]">
                              {admin.permissions.manage_kyc ? (
                                <span className="bg-emerald-50 text-emerald-800 border border-emerald-200 font-bold px-1.5 py-0.5 rounded">
                                  ✓ KYC & NID
                                </span>
                              ) : (
                                <span className="opacity-35 line-through bg-stone-100 text-stone-400 px-1.5 py-0.5 rounded">
                                  ✕ KYC
                                </span>
                              )}

                              {admin.permissions.manage_admins ? (
                                <span className="bg-indigo-50 text-indigo-800 border border-indigo-200 font-bold px-1.5 py-0.5 rounded">
                                  ✓ Admin Provisioning
                                </span>
                              ) : (
                                <span className="opacity-35 line-through bg-stone-100 text-stone-400 px-1.5 py-0.5 rounded">
                                  ✕ Admin Provisioning
                                </span>
                              )}

                              {admin.permissions.manage_questions ? (
                                <span className="bg-stone-100 text-stone-800 border border-stone-200 font-medium px-1.5 py-0.5 rounded">
                                  ✓ Questions
                                </span>
                              ) : (
                                <span className="opacity-35 line-through bg-stone-100 text-stone-400 px-1.5 py-0.5 rounded">
                                  ✕ Questions
                                </span>
                              )}

                              {admin.permissions.manage_answers ? (
                                <span className="bg-stone-100 text-stone-800 border border-stone-200 font-medium px-1.5 py-0.5 rounded">
                                  ✓ Advice
                                </span>
                              ) : (
                                <span className="opacity-35 line-through bg-stone-100 text-stone-400 px-1.5 py-0.5 rounded">
                                  ✕ Advice
                                </span>
                              )}

                              {admin.permissions.manage_consultations ? (
                                <span className="bg-stone-100 text-stone-800 border border-stone-200 font-medium px-1.5 py-0.5 rounded">
                                  ✓ Consults
                                </span>
                              ) : (
                                <span className="opacity-35 line-through bg-stone-100 text-stone-400 px-1.5 py-0.5 rounded">
                                  ✕ Consults
                                </span>
                              )}

                              {admin.permissions.manage_categories ? (
                                <span className="bg-stone-100 text-stone-800 border border-stone-200 font-medium px-1.5 py-0.5 rounded">
                                  ✓ Topics
                                </span>
                              ) : (
                                <span className="opacity-35 line-through bg-stone-100 text-stone-400 px-1.5 py-0.5 rounded">
                                  ✕ Topics
                                </span>
                              )}

                              {admin.permissions.view_analytics ? (
                                <span className="bg-stone-100 text-stone-800 border border-stone-200 font-medium px-1.5 py-0.5 rounded">
                                  ✓ Analytics
                                </span>
                              ) : (
                                <span className="opacity-35 line-through bg-stone-100 text-stone-400 px-1.5 py-0.5 rounded">
                                  ✕ Analytics
                                </span>
                              )}
                            </div>
                          )}
                        </td>

                        <td className="px-6 py-4 text-stone-500 text-[11px]">
                          <div>{admin.addedBy || "Root"}</div>
                          <div className="text-[10px] text-stone-400">{admin.createdAt}</div>
                        </td>

                        <td className="px-6 py-4 text-right">
                          <div className="flex items-center justify-end gap-2">
                            {/* Edit Controls */}
                            {(!isTargetSuperAdmin || adminUser?.isSuperAdmin) && (
                              <button
                                type="button"
                                onClick={() => handleOpenEditAdmin(admin)}
                                title="Edit Role & Permissions"
                                className="p-1.5 text-stone-500 hover:text-stone-900 hover:bg-stone-100 rounded-lg transition-colors cursor-pointer"
                              >
                                <Edit3 className="w-4 h-4" />
                              </button>
                            )}

                            {/* Delete / Protected Invariant */}
                            {isTargetSuperAdmin && !adminUser?.isSuperAdmin ? (
                              <div
                                title="Protected by Root Authority: No other administrator can remove the Super Admin."
                                className="inline-flex items-center gap-1.5 bg-amber-50 text-amber-800 border border-amber-200 text-[11px] font-bold px-2.5 py-1 rounded-lg shadow-2xs select-none"
                              >
                                <Lock className="w-3.5 h-3.5 text-amber-600" />
                                <span>Super Admin Protected</span>
                              </div>
                            ) : (
                              <button
                                type="button"
                                onClick={() => handleDeleteAdminUser(admin)}
                                title={isTargetSuperAdmin ? "Remove Super Admin (Root)" : "Remove Administrator"}
                                className="p-1.5 text-red-500 hover:text-red-700 hover:bg-red-50 rounded-lg transition-colors cursor-pointer"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
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

      {/* Add / Edit Administrator Modal */}
      {showAddAdminModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-900/70 backdrop-blur-xs animate-in fade-in">
          <div className="bg-white border border-stone-200 rounded-3xl max-w-2xl w-full p-6 sm:p-8 shadow-2xl space-y-6 max-h-[92vh] overflow-y-auto">
            {/* Modal Header */}
            <div className="flex items-start justify-between gap-4 pb-4 border-b border-stone-100">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-2xl bg-amber-50 border border-amber-200 flex items-center justify-center text-amber-700">
                  <ShieldAlert className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="text-lg font-black text-stone-900">
                    {editingAdminUser ? "Edit Administrator Permissions" : "Provision New Administrator"}
                  </h3>
                  <p className="text-xs text-stone-500 mt-0.5">
                    Configure role-based access control and management authority for platform oversight.
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setShowAddAdminModal(false)}
                className="text-stone-400 hover:text-stone-700 p-2 rounded-xl hover:bg-stone-100 transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Invariant Alert Callout */}
            <div className="p-3.5 bg-amber-50/80 border border-amber-200 rounded-2xl flex items-start gap-3">
              <Lock className="w-5 h-5 text-amber-800 shrink-0 mt-0.5" />
              <div className="text-xs text-amber-950 space-y-1">
                <span className="font-bold block">Super Admin Invariant Active</span>
                <span>
                  No administrator added or configured here can ever revoke, delete, or demote a Super Admin.
                  Only root Super Admins have permission to manage Super Admin accounts.
                </span>
              </div>
            </div>

            {/* Form */}
            <form onSubmit={handleSaveAdminUser} className="space-y-5">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-stone-700 mb-1.5 uppercase tracking-wide">
                    Full Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={adminForm.name}
                    onChange={(e) => setAdminForm({ ...adminForm, name: e.target.value })}
                    placeholder="e.g. Barrister Tanvir Ahmed"
                    className="w-full bg-stone-50 border border-stone-200 rounded-xl px-4 py-2.5 text-sm text-stone-800 focus:outline-hidden focus:border-stone-900 transition-colors"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-stone-700 mb-1.5 uppercase tracking-wide">
                    Email Address *
                  </label>
                  <input
                    type="email"
                    required
                    disabled={!!editingAdminUser}
                    value={adminForm.email}
                    onChange={(e) => setAdminForm({ ...adminForm, email: e.target.value })}
                    placeholder="admin@ukil.com"
                    className="w-full bg-stone-50 border border-stone-200 rounded-xl px-4 py-2.5 text-sm text-stone-800 focus:outline-hidden focus:border-stone-900 transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
                  />
                  {editingAdminUser && (
                    <span className="text-[10px] text-stone-400 mt-1 block">Email address cannot be modified after registration.</span>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-stone-700 mb-1.5 uppercase tracking-wide">
                    Department / Division
                  </label>
                  <input
                    type="text"
                    value={adminForm.department}
                    onChange={(e) => setAdminForm({ ...adminForm, department: e.target.value })}
                    placeholder="e.g. Legal Operations & Verification"
                    className="w-full bg-stone-50 border border-stone-200 rounded-xl px-4 py-2.5 text-sm text-stone-800 focus:outline-hidden focus:border-stone-900 transition-colors"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-stone-700 mb-1.5 uppercase tracking-wide">
                    Administrative Role *
                  </label>
                  <select
                    value={adminForm.role}
                    onChange={(e) => {
                      const newRole = e.target.value as AdminRole;
                      const isSuper = newRole === "super_admin";
                      setAdminForm({
                        ...adminForm,
                        role: newRole,
                        isSuperAdmin: isSuper,
                        permissions: isSuper || newRole === "admin"
                          ? {
                              manage_kyc: true,
                              manage_questions: true,
                              manage_answers: true,
                              manage_consultations: true,
                              manage_categories: true,
                              view_analytics: true,
                              manage_admins: true,
                            }
                          : {
                              manage_kyc: true,
                              manage_questions: true,
                              manage_answers: false,
                              manage_consultations: false,
                              manage_categories: false,
                              view_analytics: false,
                              manage_admins: false,
                            },
                      });
                    }}
                    className="w-full bg-stone-50 border border-stone-200 rounded-xl px-4 py-2.5 text-sm text-stone-800 focus:outline-hidden focus:border-stone-900 transition-colors"
                  >
                    {adminUser?.isSuperAdmin && (
                      <option value="super_admin">⚡ Super Admin (Root System Authority)</option>
                    )}
                    <option value="admin">🛡️ Administrator (Full Operations & User Provisioning)</option>
                    <option value="moderator">⚖️ Moderator (Scoped Verification & Moderation)</option>
                    <option value="support">💬 Support Officer (Inquiries & Consultations)</option>
                  </select>
                </div>
              </div>

              {/* Granular Permissions Section */}
              <div className="space-y-3 pt-2">
                <div className="flex items-center justify-between">
                  <label className="block text-xs font-black text-stone-900 uppercase tracking-wide">
                    Scoped Permissions Matrix
                  </label>
                  <span className="text-[11px] text-stone-500">
                    {adminForm.role === "super_admin"
                      ? "Super Admin holds unrestricted access to all modules."
                      : "Customize fine-grained access rights."}
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 bg-stone-50 p-4 rounded-2xl border border-stone-200">
                  <label className="flex items-start gap-3 p-2 bg-white rounded-xl border border-stone-100 cursor-pointer hover:border-stone-300 transition-colors">
                    <input
                      type="checkbox"
                      checked={adminForm.permissions.manage_kyc}
                      disabled={adminForm.role === "super_admin"}
                      onChange={(e) =>
                        setAdminForm({
                          ...adminForm,
                          permissions: { ...adminForm.permissions, manage_kyc: e.target.checked },
                        })
                      }
                      className="mt-0.5 rounded text-stone-900 focus:ring-stone-900"
                    />
                    <div>
                      <span className="text-xs font-bold text-stone-900 block">Lawyer KYC & NID</span>
                      <span className="text-[10px] text-stone-500">Review, verify, or reject lawyer credentials</span>
                    </div>
                  </label>

                  <label className="flex items-start gap-3 p-2 bg-white rounded-xl border border-stone-100 cursor-pointer hover:border-stone-300 transition-colors">
                    <input
                      type="checkbox"
                      checked={adminForm.permissions.manage_questions}
                      disabled={adminForm.role === "super_admin"}
                      onChange={(e) =>
                        setAdminForm({
                          ...adminForm,
                          permissions: { ...adminForm.permissions, manage_questions: e.target.checked },
                        })
                      }
                      className="mt-0.5 rounded text-stone-900 focus:ring-stone-900"
                    />
                    <div>
                      <span className="text-xs font-bold text-stone-900 block">Client Questions</span>
                      <span className="text-[10px] text-stone-500">Triage, close, or delete legal queries</span>
                    </div>
                  </label>

                  <label className="flex items-start gap-3 p-2 bg-white rounded-xl border border-stone-100 cursor-pointer hover:border-stone-300 transition-colors">
                    <input
                      type="checkbox"
                      checked={adminForm.permissions.manage_answers}
                      disabled={adminForm.role === "super_admin"}
                      onChange={(e) =>
                        setAdminForm({
                          ...adminForm,
                          permissions: { ...adminForm.permissions, manage_answers: e.target.checked },
                        })
                      }
                      className="mt-0.5 rounded text-stone-900 focus:ring-stone-900"
                    />
                    <div>
                      <span className="text-xs font-bold text-stone-900 block">Advocate Answers</span>
                      <span className="text-[10px] text-stone-500">Verify, edit, or moderate legal answers</span>
                    </div>
                  </label>

                  <label className="flex items-start gap-3 p-2 bg-white rounded-xl border border-stone-100 cursor-pointer hover:border-stone-300 transition-colors">
                    <input
                      type="checkbox"
                      checked={adminForm.permissions.manage_consultations}
                      disabled={adminForm.role === "super_admin"}
                      onChange={(e) =>
                        setAdminForm({
                          ...adminForm,
                          permissions: { ...adminForm.permissions, manage_consultations: e.target.checked },
                        })
                      }
                      className="mt-0.5 rounded text-stone-900 focus:ring-stone-900"
                    />
                    <div>
                      <span className="text-xs font-bold text-stone-900 block">Consultation Oversight</span>
                      <span className="text-[10px] text-stone-500">Manage bookings, disputes & meetings</span>
                    </div>
                  </label>

                  <label className="flex items-start gap-3 p-2 bg-white rounded-xl border border-stone-100 cursor-pointer hover:border-stone-300 transition-colors">
                    <input
                      type="checkbox"
                      checked={adminForm.permissions.manage_categories}
                      disabled={adminForm.role === "super_admin"}
                      onChange={(e) =>
                        setAdminForm({
                          ...adminForm,
                          permissions: { ...adminForm.permissions, manage_categories: e.target.checked },
                        })
                      }
                      className="mt-0.5 rounded text-stone-900 focus:ring-stone-900"
                    />
                    <div>
                      <span className="text-xs font-bold text-stone-900 block">Practice Categories</span>
                      <span className="text-[10px] text-stone-500">Create & manage practice specializations</span>
                    </div>
                  </label>

                  <label className="flex items-start gap-3 p-2 bg-white rounded-xl border border-stone-100 cursor-pointer hover:border-stone-300 transition-colors">
                    <input
                      type="checkbox"
                      checked={adminForm.permissions.view_analytics}
                      disabled={adminForm.role === "super_admin"}
                      onChange={(e) =>
                        setAdminForm({
                          ...adminForm,
                          permissions: { ...adminForm.permissions, view_analytics: e.target.checked },
                        })
                      }
                      className="mt-0.5 rounded text-stone-900 focus:ring-stone-900"
                    />
                    <div>
                      <span className="text-xs font-bold text-stone-900 block">Analytics & Finance</span>
                      <span className="text-[10px] text-stone-500">View revenue, conversion & platform stats</span>
                    </div>
                  </label>

                  <label className="sm:col-span-2 flex items-start gap-3 p-3 bg-amber-50/60 rounded-xl border border-amber-200 cursor-pointer hover:border-amber-300 transition-colors">
                    <input
                      type="checkbox"
                      checked={adminForm.permissions.manage_admins}
                      disabled={adminForm.role === "super_admin" || !adminUser?.permissions.manage_admins}
                      onChange={(e) =>
                        setAdminForm({
                          ...adminForm,
                          permissions: { ...adminForm.permissions, manage_admins: e.target.checked },
                        })
                      }
                      className="mt-0.5 rounded text-amber-900 focus:ring-amber-900"
                    />
                    <div>
                      <span className="text-xs font-bold text-amber-950 flex items-center gap-1.5">
                        <Users className="w-3.5 h-3.5 text-amber-700" />
                        Admin Team & Role-Based Access Control (Full Access Admin)
                      </span>
                      <span className="text-[10px] text-amber-900/80 block mt-0.5">
                        Permits this administrator to view the admin team, provision new admins/moderators, and manage permissions.
                        Note: They will still NEVER have the power to remove or alter any Super Admin.
                      </span>
                    </div>
                  </label>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center justify-end gap-3 pt-4 border-t border-stone-100">
                <button
                  type="button"
                  onClick={() => setShowAddAdminModal(false)}
                  className="px-5 py-2.5 rounded-xl border border-stone-200 text-xs font-bold text-stone-600 hover:bg-stone-50 transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-6 py-2.5 rounded-xl bg-stone-900 hover:bg-stone-800 text-white text-xs font-bold flex items-center gap-2 shadow-sm transition-all cursor-pointer"
                >
                  <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                  <span>{editingAdminUser ? "Update Administrator" : "Confirm & Provision Administrator"}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
