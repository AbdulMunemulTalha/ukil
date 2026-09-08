"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  UserCheck,
  ShieldCheck,
  MessageSquare,
  Calendar,
  Key,
  CheckCircle2,
  Clock,
  PlusCircle,
  Edit3,
  Save,
  Phone,
  Mail,
  MapPin,
  Award,
  Sparkles,
  LogOut,
  ExternalLink,
  AlertCircle,
  Loader2,
  X,
  FileText,
  DollarSign,
  Layers,
  ThumbsUp,
  Camera,
  Upload,
  Trash2,
  Eye,
  EyeOff,
  AlertTriangle,
} from "lucide-react";
import { Question, Answer, Professional, MOCK_CATEGORIES, MOCK_PROFESSIONALS } from "../../lib/mockData";
import { DataService, ConsultationRequest } from "../../lib/db";
import { createClient } from "../../lib/supabase/client";
import { getDefaultAvatar, uploadAvatarToSupabase, fileToDataUrl } from "../../lib/avatar";
import QuestionCard from "../../components/QuestionCard";
import LawyerSetupTour from "../../components/LawyerSetupTour";

export default function DashboardPage() {
  const router = useRouter();
  const [role, setRole] = useState<"client" | "professional">("professional");
  const [activeTab, setActiveTab] = useState<"profile" | "kyc" | "consultations" | "answers" | "inquiries">("profile");
  
  // Authenticated lawyer profile state
  const [currentUser, setCurrentUser] = useState<any | null>(null);
  const [lawyerProfile, setLawyerProfile] = useState<Professional | null>(null);
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [savingProfile, setSavingProfile] = useState(false);
  const [profileSuccessMsg, setProfileSuccessMsg] = useState<string | null>(null);

  // Setup Tour Modal State
  const [isTourOpen, setIsTourOpen] = useState(false);

  // KYC Submission State
  const [kycForm, setKycForm] = useState({
    barRollNo: "",
    barAssociation: "Supreme Court Bar Association, Dhaka",
    enrollmentYear: "2018",
    nidNumber: "",
    documentName: "Bangladesh Bar Council Certificate",
  });
  const [isSubmittingKyc, setIsSubmittingKyc] = useState(false);
  const [kycSuccessMsg, setKycSuccessMsg] = useState<string | null>(null);

  // Editable Profile Form State
  const [formData, setFormData] = useState({
    name: "",
    barLicenseNo: "",
    hideBarLicense: false,
    phone: "",
    email: "",
    location: "",
    hourlyFee: "",
    bio: "",
    avatar: "",
    specialization: [] as string[],
  });

  // Photo Upload & Preview State
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isUploadingPhoto, setIsUploadingPhoto] = useState(false);
  const [uploadPhotoError, setUploadPhotoError] = useState<string | null>(null);
  const [showUrlInput, setShowUrlInput] = useState(false);

  // Handle Photo Upload from Device to Supabase Storage
  const handlePhotoUpload = async (file: File) => {
    setUploadPhotoError(null);
    setIsUploadingPhoto(true);

    try {
      // 1. Instant zero-latency local preview
      const previewUrl = await fileToDataUrl(file);
      setFormData((prev) => ({ ...prev, avatar: previewUrl }));

      // 2. Upload to Supabase Storage 'avatars' bucket
      const res = await uploadAvatarToSupabase(file, currentUser?.id);
      if (res.error) {
        setUploadPhotoError(res.error);
      } else if (res.url) {
        const uploadedUrl = res.url;
        setFormData((prev) => ({ ...prev, avatar: uploadedUrl }));
      }
    } catch (err: any) {
      setUploadPhotoError(err.message || "Failed to process photo.");
    } finally {
      setIsUploadingPhoto(false);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      handlePhotoUpload(file);
    }
  };

  const handleRemovePhoto = () => {
    setFormData((prev) => ({ ...prev, avatar: "" }));
    setUploadPhotoError(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  // Lawyer data states
  const [myConsultations, setMyConsultations] = useState<ConsultationRequest[]>([]);
  const [myAnswers, setMyAnswers] = useState<any[]>([]);
  const [allQuestions, setAllQuestions] = useState<Question[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Load user session & profile
  useEffect(() => {
    // Check URL params for tab or tour triggers
    if (typeof window !== "undefined") {
      const searchParams = new URLSearchParams(window.location.search);
      const tabParam = searchParams.get("tab");
      if (tabParam === "kyc" || tabParam === "profile" || tabParam === "consultations" || tabParam === "answers" || tabParam === "inquiries") {
        setActiveTab(tabParam as any);
      }
      if (searchParams.get("tour") === "true") {
        setIsTourOpen(true);
      }
    }

    const supabase = createClient();

    const loadDashboard = async () => {
      setIsLoading(true);
      const allQ = DataService.getQuestions();
      setAllQuestions(allQ);

      if (supabase) {
        const { data: { user } } = await supabase.auth.getUser();
        if (user) {
          setCurrentUser(user);
          setRole("professional");

          // 1. Fetch live profile from Supabase
          const { data: dbProf, error: profErr } = await supabase
            .from("profiles")
            .select("*")
            .eq("user_id", user.id)
            .single();

          if (dbProf && !profErr) {
            const mappedProf: Professional = {
              id: dbProf.id,
              name: dbProf.full_name || "Advocate",
              role: "Verified Legal Advocate",
              specialization: Array.isArray(dbProf.specializations) ? dbProf.specializations : [],
              location: dbProf.location || "",
              rating: dbProf.rating ? Number(dbProf.rating) : 5.0,
              reviewCount: dbProf.review_count || 0,
              barLicenseNo: dbProf.bar_license_no || "",
              hideBarLicense: dbProf.hide_bar_license === true,
              hourlyFee: dbProf.hourly_fee || "",
              avatar: dbProf.avatar_url || getDefaultAvatar(dbProf.full_name || "Advocate"),
              bio: dbProf.bio || "",
              answersCount: 0,
              verified: dbProf.is_verified === true,
              kycStatus: (dbProf.kyc_status as "pending" | "in_review" | "verified") || (dbProf.is_verified ? "verified" : "pending"),
            };

            setLawyerProfile(mappedProf);
            setFormData({
              name: dbProf.full_name || "",
              barLicenseNo: dbProf.bar_license_no || "",
              hideBarLicense: dbProf.hide_bar_license === true,
              phone: dbProf.phone || "",
              email: dbProf.email || user.email || "",
              location: dbProf.location || "",
              hourlyFee: dbProf.hourly_fee || "",
              bio: dbProf.bio || "",
              avatar: dbProf.avatar_url || "",
              specialization: Array.isArray(dbProf.specializations) ? dbProf.specializations : [],
            });

            // 2. Fetch consultations for this lawyer
            const { data: dbConsults } = await supabase
              .from("consultation_requests")
              .select("*")
              .eq("professional_id", dbProf.id)
              .order("created_at", { ascending: false });

            if (dbConsults && dbConsults.length > 0) {
              const mappedConsults: ConsultationRequest[] = dbConsults.map((c: any) => ({
                id: c.id,
                professionalId: c.professional_id,
                professionalName: mappedProf.name,
                clientName: c.client_name,
                clientPhone: c.client_phone,
                preferredDate: c.preferred_date ? c.preferred_date.substring(0, 10) : "",
                notes: c.notes || "",
                status: c.status || "pending",
                createdAt: c.created_at ? new Date(c.created_at).toLocaleDateString() : "Recently",
              }));
              setMyConsultations(mappedConsults);
            } else {
              setMyConsultations([]);
            }

            // 3. Fetch answers published by this lawyer
            const { data: dbAns } = await supabase
              .from("answers")
              .select("*, questions(*)")
              .eq("professional_id", dbProf.id)
              .order("created_at", { ascending: false });

            if (dbAns && dbAns.length > 0) {
              setMyAnswers(dbAns);
            } else {
              setMyAnswers([]);
            }
          } else {
            // User authenticated without profile row yet - initialize clean empty profile
            const defaultProf: Professional = {
              id: user.id,
              name: user.user_metadata?.full_name || "Advocate",
              role: "Verified Legal Advocate",
              specialization: [],
              location: "",
              rating: 5.0,
              reviewCount: 0,
              barLicenseNo: user.user_metadata?.bar_license_no || "",
              hideBarLicense: false,
              hourlyFee: "",
              avatar: getDefaultAvatar(user.user_metadata?.full_name || "Advocate"),
              bio: "",
              answersCount: 0,
              verified: false,
              kycStatus: "pending",
            };
            setLawyerProfile(defaultProf);
            setFormData({
              name: defaultProf.name,
              barLicenseNo: defaultProf.barLicenseNo,
              hideBarLicense: false,
              phone: user.user_metadata?.phone || "",
              email: user.email || "",
              location: "",
              hourlyFee: "",
              bio: "",
              avatar: "",
              specialization: [],
            });
            setMyConsultations([]);
            setMyAnswers([]);
          }
        } else {
          // Unauthenticated user attempting to access lawyer dashboard - redirect to lawyer login
          router.push("/login/lawyer");
          return;
        }
      }

      setIsLoading(false);
    };

    loadDashboard();
  }, [router]);

  // Handle Profile Update to Supabase
  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setSavingProfile(true);
    setProfileSuccessMsg(null);

    const supabase = createClient();
    if (supabase && lawyerProfile) {
      let query = supabase
        .from("profiles")
        .update({
          full_name: formData.name,
          bar_license_no: formData.barLicenseNo,
          hide_bar_license: formData.hideBarLicense,
          phone: formData.phone,
          email: formData.email,
          location: formData.location,
          hourly_fee: formData.hourlyFee,
          bio: formData.bio,
          avatar_url: formData.avatar,
          specializations: formData.specialization,
        });

      if (currentUser?.id) {
        query = query.eq("user_id", currentUser.id);
      } else {
        query = query.eq("id", lawyerProfile.id);
      }

      const { error } = await query;

      if (!error) {
        setLawyerProfile((prev) =>
          prev
            ? {
                ...prev,
                name: formData.name,
                barLicenseNo: formData.barLicenseNo,
                hideBarLicense: formData.hideBarLicense,
                phone: formData.phone,
                location: formData.location,
                hourlyFee: formData.hourlyFee,
                bio: formData.bio,
                avatar: formData.avatar,
                specialization: formData.specialization,
              }
            : null
        );
        DataService.updateProfessionalProfile(lawyerProfile.id, {
          name: formData.name,
          barLicenseNo: formData.barLicenseNo,
          hideBarLicense: formData.hideBarLicense,
          phone: formData.phone,
          location: formData.location,
          hourlyFee: formData.hourlyFee,
          bio: formData.bio,
          avatar: formData.avatar,
          specialization: formData.specialization,
        });
        setIsEditingProfile(false);
        setProfileSuccessMsg("Your professional profile has been updated and saved live!");
        setTimeout(() => setProfileSuccessMsg(null), 5000);
      } else {
        console.error("Profile update error:", error);
      }
    } else {
      // Local preview update
      setLawyerProfile((prev) =>
        prev
          ? {
              ...prev,
              name: formData.name,
              barLicenseNo: formData.barLicenseNo,
              hideBarLicense: formData.hideBarLicense,
              phone: formData.phone,
              location: formData.location,
              hourlyFee: formData.hourlyFee,
              bio: formData.bio,
              avatar: formData.avatar,
              specialization: formData.specialization,
            }
          : null
      );
      if (lawyerProfile) {
        DataService.updateProfessionalProfile(lawyerProfile.id, {
          name: formData.name,
          barLicenseNo: formData.barLicenseNo,
          hideBarLicense: formData.hideBarLicense,
          phone: formData.phone,
          location: formData.location,
          hourlyFee: formData.hourlyFee,
          bio: formData.bio,
          avatar: formData.avatar,
          specialization: formData.specialization,
        });
      }
      setIsEditingProfile(false);
      setProfileSuccessMsg("Profile saved locally!");
      setTimeout(() => setProfileSuccessMsg(null), 4000);
    }

    setSavingProfile(false);
  };

  // Handle KYC Verification Submission
  const handleKycVerificationSubmit = async (autoApprove: boolean = true) => {
    setIsSubmittingKyc(true);
    setKycSuccessMsg(null);

    const kycPayload = {
      barRollNo: kycForm.barRollNo || formData.barLicenseNo || "BC-2024-DH",
      barAssociation: kycForm.barAssociation,
      enrollmentYear: kycForm.enrollmentYear,
      nidNumber: kycForm.nidNumber || "NID-1992-8829-10",
      documentUrl: "https://example.com/bar-council-certificate.pdf",
      submittedAt: new Date().toISOString(),
    };

    const profId = lawyerProfile?.id || currentUser?.id;
    if (profId) {
      DataService.submitKycVerification(profId, kycPayload, autoApprove);

      const supabase = createClient();
      if (supabase) {
        const updateData: any = {
          kyc_status: autoApprove ? "verified" : "in_review",
          is_verified: autoApprove,
          nid_number: kycForm.nidNumber || null,
          kyc_data: {
            ...kycPayload,
            submitted_at: new Date().toISOString(),
          },
        };
        if (kycForm.barRollNo) {
          updateData.bar_license_no = kycForm.barRollNo;
        }
        if (currentUser?.id) {
          await supabase.from("profiles").update(updateData).eq("user_id", currentUser.id);
        } else {
          await supabase.from("profiles").update(updateData).eq("id", profId);
        }
      }

      setLawyerProfile((prev) =>
        prev
          ? {
              ...prev,
              verified: autoApprove,
              kycStatus: autoApprove ? "verified" : "in_review",
              barLicenseNo: kycForm.barRollNo || prev.barLicenseNo,
            }
          : null
      );

      if (autoApprove) {
        setKycSuccessMsg("🎉 Congratulations! Your advocate credentials have been verified by the Bar Council! You can now publish legal advice.");
      } else {
        setKycSuccessMsg("Your verification documents have been submitted and are in review.");
      }
    }

    setIsSubmittingKyc(false);
  };

  // Handle Setup Tour Completion
  const handleTourComplete = (updatedData?: any) => {
    if (updatedData) {
      setFormData((prev) => ({
        ...prev,
        barLicenseNo: updatedData.barLicenseNo !== undefined ? updatedData.barLicenseNo : prev.barLicenseNo,
        hideBarLicense: updatedData.hideBarLicense !== undefined ? updatedData.hideBarLicense : prev.hideBarLicense,
        location: updatedData.location !== undefined ? updatedData.location : prev.location,
        hourlyFee: updatedData.hourlyFee !== undefined ? updatedData.hourlyFee : prev.hourlyFee,
        bio: updatedData.bio !== undefined ? updatedData.bio : prev.bio,
        avatar: updatedData.avatar !== undefined ? updatedData.avatar : prev.avatar,
        specialization: updatedData.specialization !== undefined ? updatedData.specialization : prev.specialization,
      }));

      setLawyerProfile((prev) =>
        prev
          ? {
              ...prev,
              barLicenseNo: updatedData.barLicenseNo !== undefined ? updatedData.barLicenseNo : prev.barLicenseNo,
              hideBarLicense: updatedData.hideBarLicense !== undefined ? updatedData.hideBarLicense : prev.hideBarLicense,
              location: updatedData.location !== undefined ? updatedData.location : prev.location,
              hourlyFee: updatedData.hourlyFee !== undefined ? updatedData.hourlyFee : prev.hourlyFee,
              bio: updatedData.bio !== undefined ? updatedData.bio : prev.bio,
              avatar: updatedData.avatar !== undefined ? updatedData.avatar : prev.avatar,
              specialization: updatedData.specialization !== undefined ? updatedData.specialization : prev.specialization,
              verified: updatedData.verified !== undefined ? updatedData.verified : prev.verified,
              kycStatus: updatedData.verified ? "verified" : prev.kycStatus,
            }
          : null
      );
    }
    setIsTourOpen(false);
  };

  const handleToggleSpecialization = (categoryName: string) => {
    setFormData((prev) => {
      const exists = prev.specialization.includes(categoryName);
      if (exists) {
        return { ...prev, specialization: prev.specialization.filter((s) => s !== categoryName) };
      } else {
        return { ...prev, specialization: [...prev.specialization, categoryName] };
      }
    });
  };

  const handleUpdateConsultationStatus = async (consultId: string, newStatus: "confirmed" | "completed") => {
    const supabase = createClient();
    if (supabase) {
      await supabase
        .from("consultation_requests")
        .update({ status: newStatus })
        .eq("id", consultId);
    }
    setMyConsultations((prev) =>
      prev.map((c) => (c.id === consultId ? { ...c, status: newStatus } : c))
    );
  };

  const handleLogout = async () => {
    const supabase = createClient();
    if (supabase) {
      await supabase.auth.signOut();
    }
    window.location.href = "/";
  };

  return (
    <div className="space-y-8 pt-2 pb-16 max-w-6xl mx-auto">
      
      {/* Top Header & Role Switcher */}
      <div className="bg-white border border-stone-200 rounded-3xl p-6 sm:p-8 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <div className="inline-flex items-center gap-2 bg-emerald-50 text-emerald-800 border border-emerald-200 px-3 py-1 rounded-full text-xs font-bold mb-2">
            <ShieldCheck className="w-4 h-4 text-emerald-600" />
            <span>{currentUser ? `Authenticated Bar Advocate: ${formData.name || "Advocate"}` : "Advocate Portal Active"}</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-stone-900 tracking-tight">
            {role === "professional" ? "Lawyer Workspace & Profile Dashboard" : "Citizen Query Tracking"}
          </h1>
          <p className="text-stone-600 text-sm mt-1">
            {role === "professional"
              ? "Manage your verified advocate profile, respond to citizen queries, and review chamber consultation requests."
              : "Track your submitted legal inquiries, secret tracking codes, and expert citations."}
          </p>
        </div>

        {/* Action Controls */}
        <div className="flex flex-wrap items-center gap-3 shrink-0">
          <div className="inline-flex p-1 bg-stone-100 rounded-2xl border border-stone-200">
            <button
              onClick={() => setRole("professional")}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                role === "professional"
                  ? "bg-brand-coral text-white shadow-coral"
                  : "text-stone-600 hover:text-stone-900"
              }`}
            >
              ⚖️ Lawyer Portal
            </button>
            <button
              onClick={() => setRole("client")}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                role === "client"
                  ? "bg-brand-coral text-white shadow-coral"
                  : "text-stone-600 hover:text-stone-900"
              }`}
            >
              👤 Citizen View
            </button>
          </div>

          {currentUser && (
            <button
              onClick={handleLogout}
              className="text-xs font-semibold px-3.5 py-2 rounded-xl border border-stone-200 bg-white hover:bg-stone-50 text-stone-600 hover:text-red-600 flex items-center gap-1.5 transition-colors"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>Sign Out</span>
            </button>
          )}
        </div>
      </div>

      {/* Success Notification */}
      {profileSuccessMsg && (
        <div className="bg-emerald-50 border border-emerald-200 text-emerald-800 p-4 rounded-2xl text-sm font-semibold flex items-center gap-2.5 shadow-sm animate-in fade-in">
          <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
          <span>{profileSuccessMsg}</span>
        </div>
      )}

      {/* LAWYER PORTAL CONTENT */}
      {role === "professional" ? (
        <div className="space-y-6">

          {/* Unverified KYC Notice Banner */}
          {!lawyerProfile?.verified && (
            <div className="bg-amber-50 border border-amber-200 rounded-3xl p-5 sm:p-6 shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-4 animate-in fade-in">
              <div className="flex items-start gap-3.5">
                <div className="p-2.5 bg-amber-100 rounded-2xl text-amber-700 shrink-0 mt-0.5">
                  <AlertTriangle className="w-5 h-5" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-sm sm:text-base font-bold text-amber-900">
                      KYC Verification Required to Provide Advice
                    </h3>
                    <span className="bg-amber-200 text-amber-900 text-[10px] font-extrabold px-2 py-0.5 rounded-full uppercase tracking-wider">
                      Action Needed
                    </span>
                  </div>
                  <p className="text-xs text-amber-800/90 mt-1 max-w-2xl leading-relaxed">
                    You have signed up as an advocate, but your profile has not completed KYC verification yet. 
                    To protect citizens, all lawyers must complete Bar Council verification before answering legal questions on Ukil.
                  </p>
                </div>
              </div>

              <div className="flex flex-wrap items-center gap-2.5 shrink-0 w-full md:w-auto">
                <button
                  type="button"
                  onClick={() => setActiveTab("kyc")}
                  className="bg-amber-800 hover:bg-amber-900 text-white text-xs font-bold px-4 py-2.5 rounded-xl shadow-sm transition-colors cursor-pointer flex-1 md:flex-initial text-center"
                >
                  Verify Bar License (KYC)
                </button>
                <button
                  type="button"
                  onClick={() => setIsTourOpen(true)}
                  className="bg-white hover:bg-amber-100/60 border border-amber-300 text-amber-900 text-xs font-bold px-3.5 py-2.5 rounded-xl transition-colors cursor-pointer flex items-center gap-1.5 justify-center flex-1 md:flex-initial"
                >
                  <Sparkles className="w-3.5 h-3.5 text-amber-600" /> Setup Tour
                </button>
              </div>
            </div>
          )}

          {/* Quick Setup Tour Callout Banner */}
          <div className="bg-gradient-to-r from-stone-900 via-stone-800 to-stone-900 text-white rounded-3xl p-5 sm:p-6 shadow-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-white/10 flex items-center justify-center text-xl shrink-0">
                ✨
              </div>
              <div>
                <h4 className="text-sm sm:text-base font-bold text-white flex items-center gap-2">
                  Profile Setup & Verification Tour
                </h4>
                <p className="text-xs text-stone-300 mt-0.5">
                  Walk through step-by-step to fill your chamber details, bar license privacy settings, and instant KYC verification.
                </p>
              </div>
            </div>
            <button
              type="button"
              onClick={() => setIsTourOpen(true)}
              className="bg-brand-coral hover:bg-brand-hover text-white text-xs font-bold px-4 py-2.5 rounded-xl shadow-coral flex items-center gap-2 transition-all shrink-0 cursor-pointer w-full sm:w-auto justify-center"
            >
              <Sparkles className="w-3.5 h-3.5" /> Start Setup Tour
            </button>
          </div>
          
          {/* Dashboard Navigation Tabs */}
          <div className="flex items-center gap-2 border-b border-stone-200 pb-2 overflow-x-auto">
            <button
              onClick={() => setActiveTab("profile")}
              className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all flex items-center gap-2 whitespace-nowrap ${
                activeTab === "profile"
                  ? "bg-stone-900 text-white shadow-sm"
                  : "bg-stone-100 text-stone-600 hover:bg-stone-200"
              }`}
            >
              <UserCheck className="w-4 h-4" />
              <span>Profile & Chamber Info</span>
            </button>

            <button
              onClick={() => setActiveTab("kyc")}
              className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all flex items-center gap-2 whitespace-nowrap ${
                activeTab === "kyc"
                  ? "bg-stone-900 text-white shadow-sm"
                  : "bg-stone-100 text-stone-600 hover:bg-stone-200"
              }`}
            >
              <ShieldCheck className="w-4 h-4" />
              <span>KYC Verification</span>
              {lawyerProfile?.verified ? (
                <span className="bg-emerald-500 text-white text-[10px] font-extrabold px-1.5 py-0.5 rounded-full">
                  Verified
                </span>
              ) : (
                <span className="bg-amber-500 text-white text-[10px] font-extrabold px-1.5 py-0.5 rounded-full">
                  Pending
                </span>
              )}
            </button>

            <button
              onClick={() => setActiveTab("consultations")}
              className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all flex items-center gap-2 whitespace-nowrap ${
                activeTab === "consultations"
                  ? "bg-stone-900 text-white shadow-sm"
                  : "bg-stone-100 text-stone-600 hover:bg-stone-200"
              }`}
            >
              <Calendar className="w-4 h-4" />
              <span>Consultation Requests ({myConsultations.length})</span>
            </button>

            <button
              onClick={() => setActiveTab("answers")}
              className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all flex items-center gap-2 whitespace-nowrap ${
                activeTab === "answers"
                  ? "bg-stone-900 text-white shadow-sm"
                  : "bg-stone-100 text-stone-600 hover:bg-stone-200"
              }`}
            >
              <MessageSquare className="w-4 h-4" />
              <span>My Published Advice ({myAnswers.length})</span>
            </button>

            <button
              onClick={() => setActiveTab("inquiries")}
              className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all flex items-center gap-2 whitespace-nowrap ${
                activeTab === "inquiries"
                  ? "bg-stone-900 text-white shadow-sm"
                  : "bg-stone-100 text-stone-600 hover:bg-stone-200"
              }`}
            >
              <Clock className="w-4 h-4" />
              <span>Citizen Queries Needing Advice</span>
            </button>
          </div>

          {/* TAB 1: PROFILE INTEGRATION */}
          {activeTab === "profile" && (
            <div className="space-y-6">
              
              {/* Profile Card Summary Banner */}
              <div className="bg-white border border-stone-200 rounded-3xl p-6 sm:p-8 shadow-sm">
                <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
                  <div className="flex items-center gap-4 sm:gap-6">
                    <div className="relative group shrink-0">
                      <img
                        src={formData.avatar || getDefaultAvatar(formData.name)}
                        alt={formData.name}
                        className="w-20 h-20 sm:w-24 sm:h-24 rounded-2xl object-cover border-2 border-brand-coral shadow-md bg-white"
                      />
                      <button
                        type="button"
                        onClick={() => {
                          setIsEditingProfile(true);
                          setTimeout(() => {
                            fileInputRef.current?.click();
                          }, 150);
                        }}
                        className="absolute -bottom-1 -right-1 bg-stone-900 hover:bg-brand-coral text-white p-2 rounded-xl shadow-md border-2 border-white transition-all transform hover:scale-110 cursor-pointer"
                        title="Upload/change your profile photo"
                      >
                        <Camera className="w-4 h-4" />
                      </button>
                    </div>
                    <div className="space-y-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <h2 className="text-xl sm:text-2xl font-extrabold text-stone-900">
                          {formData.name || "Advocate"}
                        </h2>
                        {lawyerProfile?.verified ? (
                          <span className="bg-emerald-100 text-emerald-800 border border-emerald-200 text-xs font-bold px-2.5 py-0.5 rounded-full flex items-center gap-1">
                            <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" /> Verified Advocate
                          </span>
                        ) : (
                          <span className="bg-amber-100 text-amber-800 border border-amber-200 text-xs font-bold px-2.5 py-0.5 rounded-full flex items-center gap-1">
                            <AlertTriangle className="w-3.5 h-3.5 text-amber-600" /> KYC Pending
                          </span>
                        )}
                      </div>

                      <div className="flex flex-wrap items-center gap-2 pt-0.5">
                        <div className="text-xs sm:text-sm text-brand-coral font-semibold flex items-center gap-1.5">
                          <Award className="w-4 h-4" />
                          <span>
                            Bar License:{" "}
                            {formData.hideBarLicense ? (
                              <span className="text-stone-700 font-mono">
                                {formData.barLicenseNo || "Verified on file"}{" "}
                                <span className="text-stone-500 font-normal">(Hidden from public)</span>
                              </span>
                            ) : (
                              formData.barLicenseNo || "Not provided"
                            )}
                          </span>
                        </div>
                        {formData.hideBarLicense ? (
                          <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-stone-600 bg-stone-100 border border-stone-200 px-2 py-0.5 rounded-md">
                            <EyeOff className="w-3 h-3 text-stone-500" /> Public: Hidden
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-md">
                            <Eye className="w-3 h-3 text-emerald-600" /> Public: Visible
                          </span>
                        )}
                      </div>

                      <div className="flex flex-wrap items-center gap-3 text-xs text-stone-500 pt-1">
                        <span className="flex items-center gap-1">
                          <MapPin className="w-3.5 h-3.5 text-stone-400" />
                          {formData.location ? formData.location : "Location not set"}
                        </span>
                        <span>•</span>
                        <span className="font-bold text-stone-800">
                          {formData.hourlyFee ? formData.hourlyFee : "Fee not set"}
                        </span>
                        <span>•</span>
                        <span className="text-amber-600 font-bold">
                          ⭐ 5.0 (Verified Directory)
                        </span>
                      </div>
                    </div>
                  </div>

                  <button
                    onClick={() => setIsEditingProfile(!isEditingProfile)}
                    className="bg-stone-900 hover:bg-stone-800 text-white text-xs font-bold px-4 py-2.5 rounded-xl shadow-sm flex items-center gap-2 transition-colors shrink-0 cursor-pointer"
                  >
                    <Edit3 className="w-4 h-4" />
                    <span>{isEditingProfile ? "Cancel Editing" : "Edit Profile Info"}</span>
                  </button>
                </div>

                {/* Bio & Specialties Display */}
                {!isEditingProfile && (
                  <div className="mt-6 pt-6 border-t border-stone-100 space-y-4">
                    <div>
                      <h4 className="text-xs font-bold text-stone-500 uppercase tracking-wider mb-1.5">
                        Chamber Practice & Bio
                      </h4>
                      {formData.bio ? (
                        <p className="text-sm text-stone-700 leading-relaxed bg-stone-50 p-4 rounded-xl border border-stone-200/80 whitespace-pre-line">
                          {formData.bio}
                        </p>
                      ) : (
                        <div className="bg-stone-50 p-4 rounded-xl border border-dashed border-stone-300 text-stone-500 text-xs flex items-center justify-between">
                          <span>No chamber bio added yet. Click &quot;Edit Profile Info&quot; to describe your practice and credentials.</span>
                          <button
                            type="button"
                            onClick={() => setIsEditingProfile(true)}
                            className="text-brand-coral font-bold hover:underline ml-2 shrink-0 cursor-pointer"
                          >
                            Add Bio
                          </button>
                        </div>
                      )}
                    </div>

                    <div>
                      <h4 className="text-xs font-bold text-stone-500 uppercase tracking-wider mb-2">
                        Practice Specializations
                      </h4>
                      {formData.specialization && formData.specialization.length > 0 ? (
                        <div className="flex flex-wrap gap-2">
                          {formData.specialization.map((spec) => (
                            <span
                              key={spec}
                              className="bg-brand-light text-brand-coral border border-brand-border text-xs font-bold px-3 py-1 rounded-lg"
                            >
                              ⚖️ {spec}
                            </span>
                          ))}
                        </div>
                      ) : (
                        <div className="bg-stone-50 p-4 rounded-xl border border-dashed border-stone-300 text-stone-500 text-xs flex items-center justify-between">
                          <span>No specializations selected yet. Click &quot;Edit Profile Info&quot; to choose your areas of law.</span>
                          <button
                            type="button"
                            onClick={() => setIsEditingProfile(true)}
                            className="text-brand-coral font-bold hover:underline ml-2 shrink-0 cursor-pointer"
                          >
                            Select Areas
                          </button>
                        </div>
                      )}
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2 text-xs">
                      <div className="bg-stone-50 p-3 rounded-xl border border-stone-200 flex items-center gap-2">
                        <Phone className="w-4 h-4 text-brand-coral" />
                        <span className="text-stone-500">Direct Contact:</span>
                        <span className="font-bold text-stone-800">{formData.phone || "Not provided"}</span>
                      </div>
                      <div className="bg-stone-50 p-3 rounded-xl border border-stone-200 flex items-center gap-2">
                        <Mail className="w-4 h-4 text-brand-coral" />
                        <span className="text-stone-500">Official Email:</span>
                        <span className="font-bold text-stone-800">{formData.email || "Not provided"}</span>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Profile Editor Form */}
              {isEditingProfile && (
                <form
                  onSubmit={handleSaveProfile}
                  className="bg-white border border-brand-coral/40 rounded-3xl p-6 sm:p-8 space-y-6 shadow-md animate-in fade-in"
                >
                  <div className="flex items-center justify-between border-b border-stone-100 pb-4">
                    <div>
                      <h3 className="text-lg font-bold text-stone-900 flex items-center gap-2">
                        <Edit3 className="w-5 h-5 text-brand-coral" />
                        <span>Update Verified Profile in Supabase</span>
                      </h3>
                      <p className="text-xs text-stone-500">
                        Changes will be immediately updated across the public Lawyer Directory and answer badges.
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={() => setIsEditingProfile(false)}
                      className="text-stone-400 hover:text-stone-600 p-1"
                    >
                      <X className="w-5 h-5" />
                    </button>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold uppercase tracking-wider text-stone-700 mb-1">
                        Full Legal Name
                      </label>
                      <input
                        type="text"
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        required
                        className="w-full bg-stone-50 border border-stone-300 rounded-xl px-3.5 py-2.5 text-sm text-stone-900 focus:outline-none focus:border-brand-coral"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold uppercase tracking-wider text-stone-700 mb-1">
                        Bar License / Registration No.
                      </label>
                      <input
                        type="text"
                        value={formData.barLicenseNo}
                        onChange={(e) => setFormData({ ...formData, barLicenseNo: e.target.value })}
                        placeholder="e.g. BC-2024-DH-4412"
                        className="w-full bg-stone-50 border border-stone-300 rounded-xl px-3.5 py-2.5 text-sm text-stone-900 focus:outline-none focus:border-brand-coral"
                      />
                    </div>

                    {/* Bar License Privacy Checkbox */}
                    <div className="col-span-1 sm:col-span-2 bg-stone-50 border border-stone-200 rounded-xl p-4">
                      <label className="flex items-start gap-3 cursor-pointer select-none">
                        <input
                          type="checkbox"
                          checked={formData.hideBarLicense}
                          onChange={(e) => setFormData({ ...formData, hideBarLicense: e.target.checked })}
                          className="mt-1 w-4 h-4 text-brand-coral rounded border-stone-300 focus:ring-brand-coral cursor-pointer"
                        />
                        <div>
                          <span className="text-sm font-bold text-stone-900 flex items-center gap-2">
                            {formData.hideBarLicense ? (
                              <>
                                <EyeOff className="w-4 h-4 text-stone-600" />
                                <span>Hide Bar License / Registration No. from public profile</span>
                              </>
                            ) : (
                              <>
                                <Eye className="w-4 h-4 text-emerald-600" />
                                <span>Hide Bar License / Registration No. from public profile (Currently Visible)</span>
                              </>
                            )}
                          </span>
                          <p className="text-xs text-stone-500 mt-0.5">
                            {formData.hideBarLicense
                              ? "Checked: Your license number is hidden from the public. Public cards and answers will show 'Verified on file'."
                              : "Unchecked: Your license number will be visible to the public on your profile and advice cards."}
                          </p>
                        </div>
                      </label>
                    </div>

                    <div>
                      <label className="block text-xs font-bold uppercase tracking-wider text-stone-700 mb-1">
                        Chamber Phone Number
                      </label>
                      <input
                        type="tel"
                        value={formData.phone}
                        onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                        placeholder="e.g. +880 1711-XXXXXX"
                        className="w-full bg-stone-50 border border-stone-300 rounded-xl px-3.5 py-2.5 text-sm text-stone-900 focus:outline-none focus:border-brand-coral"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold uppercase tracking-wider text-stone-700 mb-1">
                        Chamber Email Address
                      </label>
                      <input
                        type="email"
                        value={formData.email}
                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                        placeholder="e.g. lawyer@chamber.com"
                        className="w-full bg-stone-50 border border-stone-300 rounded-xl px-3.5 py-2.5 text-sm text-stone-900 focus:outline-none focus:border-brand-coral"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold uppercase tracking-wider text-stone-700 mb-1">
                        Chamber / Office Address
                      </label>
                      <input
                        type="text"
                        value={formData.location}
                        onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                        placeholder="e.g. Suite 402, Supreme Court Bar Association, Dhaka"
                        className="w-full bg-stone-50 border border-stone-300 rounded-xl px-3.5 py-2.5 text-sm text-stone-900 focus:outline-none focus:border-brand-coral"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold uppercase tracking-wider text-stone-700 mb-1">
                        Consultation Fee / Session
                      </label>
                      <input
                        type="text"
                        value={formData.hourlyFee}
                        onChange={(e) => setFormData({ ...formData, hourlyFee: e.target.value })}
                        placeholder="e.g. ৳2,500 / Session or Pro Bono"
                        className="w-full bg-stone-50 border border-stone-300 rounded-xl px-3.5 py-2.5 text-sm text-stone-900 focus:outline-none focus:border-brand-coral"
                      />
                    </div>
                  </div>

                  {/* Dedicated Lawyer Profile Photo Setup */}
                  <div className="bg-stone-50 border border-stone-200 rounded-2xl p-5 space-y-4">
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <div>
                        <label className="block text-xs font-bold uppercase tracking-wider text-stone-900">
                          Chamber & Advocate Profile Photo
                        </label>
                        <p className="text-[11px] text-stone-500">
                          Upload your real chamber portrait to establish verified trust with citizens.
                        </p>
                      </div>

                      {formData.avatar ? (
                        <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-700 bg-emerald-100 border border-emerald-200 px-2.5 py-0.5 rounded-full">
                          <CheckCircle2 className="w-3 h-3" /> Custom Photo Set
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 text-[11px] font-bold text-stone-600 bg-stone-200 px-2.5 py-0.5 rounded-full">
                          Using Initials Avatar
                        </span>
                      )}
                    </div>

                    {uploadPhotoError && (
                      <div className="bg-red-50 border border-red-200 text-red-700 p-3 rounded-xl text-xs flex items-center gap-2 animate-in fade-in">
                        <AlertCircle className="w-4 h-4 shrink-0" />
                        <span>{uploadPhotoError}</span>
                      </div>
                    )}

                    <div className="flex flex-col sm:flex-row items-center gap-5">
                      {/* Live Avatar Preview */}
                      <div className="relative shrink-0">
                        <img
                          src={formData.avatar || getDefaultAvatar(formData.name)}
                          alt={formData.name || "Preview"}
                          className="w-24 h-24 rounded-2xl object-cover border-2 border-brand-coral shadow-md bg-white"
                        />
                        {isUploadingPhoto && (
                          <div className="absolute inset-0 bg-stone-900/60 rounded-2xl flex flex-col items-center justify-center text-white text-[10px] font-bold backdrop-blur-xs">
                            <Loader2 className="w-6 h-6 animate-spin mb-1 text-brand-coral" />
                            <span>Uploading...</span>
                          </div>
                        )}
                      </div>

                      {/* Upload Controls */}
                      <div className="space-y-2.5 flex-1 w-full text-center sm:text-left">
                        <input
                          ref={fileInputRef}
                          type="file"
                          accept="image/jpeg,image/png,image/webp,image/gif"
                          onChange={handleFileChange}
                          className="hidden"
                          id="lawyer-avatar-upload"
                        />

                        <div className="flex flex-wrap items-center gap-2.5 justify-center sm:justify-start">
                          <button
                            type="button"
                            onClick={() => fileInputRef.current?.click()}
                            disabled={isUploadingPhoto}
                            className="bg-brand-coral hover:bg-brand-hover text-white text-xs font-bold px-4 py-2.5 rounded-xl shadow-coral flex items-center gap-2 transition-all cursor-pointer disabled:opacity-50"
                          >
                            <Upload className="w-4 h-4" />
                            <span>{isUploadingPhoto ? "Uploading to Cloud..." : "Upload Photo from Device"}</span>
                          </button>

                          {formData.avatar && (
                            <button
                              type="button"
                              onClick={handleRemovePhoto}
                              className="bg-white hover:bg-stone-100 text-stone-700 border border-stone-300 text-xs font-semibold px-3 py-2.5 rounded-xl flex items-center gap-1.5 transition-colors cursor-pointer"
                            >
                              <Trash2 className="w-3.5 h-3.5 text-stone-500 hover:text-red-600" />
                              <span>Reset to Initials</span>
                            </button>
                          )}
                        </div>

                        <div className="flex flex-wrap items-center gap-3 text-[11px] text-stone-500 justify-center sm:justify-start">
                          <span>PNG, JPG, WEBP or GIF (Max 5MB)</span>
                          <span>•</span>
                          <button
                            type="button"
                            onClick={() => setShowUrlInput(!showUrlInput)}
                            className="text-brand-coral hover:underline font-semibold cursor-pointer"
                          >
                            {showUrlInput ? "Hide Direct URL" : "Or enter hosted URL"}
                          </button>
                        </div>

                        {showUrlInput && (
                          <div className="pt-1 animate-in fade-in">
                            <input
                              type="url"
                              value={formData.avatar}
                              onChange={(e) => setFormData({ ...formData, avatar: e.target.value })}
                              placeholder="https://example.com/chamber-photo.jpg"
                              className="w-full bg-white border border-stone-300 rounded-xl px-3 py-2 text-xs text-stone-900 focus:outline-none focus:border-brand-coral font-mono"
                            />
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Specializations Selector */}
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-stone-700 mb-2">
                      Practice Specializations (Click to select/unselect):
                    </label>
                    <div className="flex flex-wrap gap-2">
                      {MOCK_CATEGORIES.map((cat) => {
                        const isSelected = formData.specialization.includes(cat.name);
                        return (
                          <button
                            type="button"
                            key={cat.id}
                            onClick={() => handleToggleSpecialization(cat.name)}
                            className={`px-3 py-1.5 rounded-xl text-xs font-bold border transition-all ${
                              isSelected
                                ? "bg-brand-coral text-white border-brand-coral shadow-sm"
                                : "bg-stone-50 text-stone-700 border-stone-300 hover:bg-stone-100"
                            }`}
                          >
                            {cat.icon} {cat.name}
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* Practice Bio */}
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-stone-700 mb-1">
                      Professional Practice Experience & Bio:
                    </label>
                    <textarea
                      rows={4}
                      value={formData.bio}
                      onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                      placeholder="Highlight your court litigation background, landmark cases, bar enrollment year, and pro bono commitment..."
                      className="w-full bg-stone-50 border border-stone-300 rounded-xl p-3.5 text-sm text-stone-900 focus:outline-none focus:border-brand-coral leading-relaxed"
                    />
                  </div>

                  <div className="flex items-center justify-end gap-3 pt-2">
                    <button
                      type="button"
                      onClick={() => setIsEditingProfile(false)}
                      className="px-5 py-2.5 rounded-xl text-xs font-semibold text-stone-600 hover:bg-stone-100"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={savingProfile}
                      className="bg-brand-coral hover:bg-brand-hover text-white text-xs font-bold px-6 py-2.5 rounded-xl shadow-coral flex items-center gap-2 transition-all disabled:opacity-50"
                    >
                      {savingProfile ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                      <span>{savingProfile ? "Saving to Supabase..." : "Save Profile Changes"}</span>
                    </button>
                  </div>
                </form>
              )}
            </div>
          )}

          {/* TAB: KYC VERIFICATION */}
          {activeTab === "kyc" && (
            <div className="space-y-6 animate-in fade-in">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <h3 className="text-lg font-bold text-stone-900 flex items-center gap-2">
                    <ShieldCheck className="w-5 h-5 text-brand-coral" />
                    <span>Bar Council Identity Verification (KYC)</span>
                  </h3>
                  <p className="text-xs text-stone-500 mt-0.5">
                    Bangladesh Bar Council accreditation is required to ensure authentic legal opinions for citizens.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setIsTourOpen(true)}
                  className="inline-flex items-center gap-1.5 text-xs font-bold text-brand-coral bg-brand-light border border-brand-border px-3.5 py-2 rounded-xl hover:bg-brand-coral hover:text-white transition-colors cursor-pointer"
                >
                  <Sparkles className="w-3.5 h-3.5" /> Launch Setup Tour
                </button>
              </div>

              {kycSuccessMsg && (
                <div className="bg-emerald-50 border border-emerald-200 text-emerald-900 p-4 rounded-2xl text-xs sm:text-sm font-semibold flex items-center gap-2.5 shadow-sm">
                  <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
                  <span>{kycSuccessMsg}</span>
                </div>
              )}

              {lawyerProfile?.verified ? (
                /* VERIFIED ADVOCATE BADGE & STATUS */
                <div className="bg-white border border-emerald-200 rounded-3xl p-6 sm:p-8 shadow-sm space-y-6">
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 rounded-2xl bg-emerald-100 flex items-center justify-center text-emerald-700 shrink-0">
                      <ShieldCheck className="w-7 h-7" />
                    </div>
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <h4 className="text-lg font-extrabold text-stone-900">
                          Verified Bar Council Advocate Status Active
                        </h4>
                        <span className="bg-emerald-100 text-emerald-800 border border-emerald-300 text-xs font-bold px-2.5 py-0.5 rounded-full flex items-center gap-1">
                          <CheckCircle2 className="w-3 h-3 text-emerald-600" /> Active
                        </span>
                      </div>
                      <p className="text-xs text-stone-600 leading-relaxed">
                        Your professional identity and Bar license have been validated. You can answer citizen queries and provide statutory advice across all legal topics.
                      </p>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2">
                    <div className="bg-stone-50 border border-stone-200 rounded-2xl p-4 space-y-1">
                      <div className="text-[11px] font-bold uppercase tracking-wider text-stone-500">
                        Bar Council License / Roll
                      </div>
                      <div className="text-sm font-mono font-bold text-stone-900">
                        {lawyerProfile.barLicenseNo || "BC-2024-DH-4412"}
                      </div>
                      <div className="text-[11px] text-stone-500">
                        {formData.hideBarLicense ? "Privacy: Hidden from public" : "Privacy: Visible to public"}
                      </div>
                    </div>

                    <div className="bg-stone-50 border border-stone-200 rounded-2xl p-4 space-y-1">
                      <div className="text-[11px] font-bold uppercase tracking-wider text-stone-500">
                        Bar Association
                      </div>
                      <div className="text-sm font-bold text-stone-900">
                        {kycForm.barAssociation || "Supreme Court Bar Association"}
                      </div>
                      <div className="text-[11px] text-stone-500">
                        Enrolled: {kycForm.enrollmentYear || "2018"}
                      </div>
                    </div>

                    <div className="bg-stone-50 border border-stone-200 rounded-2xl p-4 space-y-1">
                      <div className="text-[11px] font-bold uppercase tracking-wider text-stone-500">
                        Answering Privileges
                      </div>
                      <div className="text-sm font-bold text-emerald-700 flex items-center gap-1">
                        <CheckCircle2 className="w-4 h-4" /> Fully Unlocked
                      </div>
                      <div className="text-[11px] text-stone-500">
                        Answers get verified badge
                      </div>
                    </div>
                  </div>

                  <div className="pt-2 flex flex-wrap gap-3">
                    <button
                      type="button"
                      onClick={() => setActiveTab("inquiries")}
                      className="bg-brand-coral hover:bg-brand-hover text-white text-xs font-bold px-5 py-2.5 rounded-xl shadow-coral inline-flex items-center gap-2 cursor-pointer transition-all"
                    >
                      <PlusCircle className="w-4 h-4" /> Browse Citizen Queries Needing Advice
                    </button>
                    <button
                      type="button"
                      onClick={() => setActiveTab("profile")}
                      className="bg-white hover:bg-stone-100 border border-stone-300 text-stone-700 text-xs font-bold px-4 py-2.5 rounded-xl cursor-pointer transition-colors"
                    >
                      Edit Profile & Privacy
                    </button>
                  </div>
                </div>
              ) : (
                /* UNVERIFIED KYC SUBMISSION WORKFLOW */
                <div className="space-y-6">
                  <div className="bg-white border border-stone-200 rounded-3xl p-6 sm:p-8 shadow-sm space-y-6">
                    <div className="flex items-start gap-3.5 pb-4 border-b border-stone-100">
                      <div className="p-3 bg-brand-light rounded-2xl text-brand-coral shrink-0">
                        <ShieldCheck className="w-6 h-6" />
                      </div>
                      <div>
                        <h4 className="text-base font-bold text-stone-900">
                          Submit Advocate Credentials for Verification
                        </h4>
                        <p className="text-xs text-stone-600 mt-1 leading-relaxed">
                          Under Ukil&apos;s legal integrity charter, all legal answers must be given by verified advocates. 
                          Please provide your Bar Council registration details below to activate your advice privileges.
                        </p>
                      </div>
                    </div>

                    <form
                      onSubmit={(e) => {
                        e.preventDefault();
                        handleKycVerificationSubmit(false);
                      }}
                      className="space-y-5"
                    >
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-xs font-bold uppercase tracking-wider text-stone-700 mb-1">
                            Bar Council Registration / License No. <span className="text-red-500">*</span>
                          </label>
                          <input
                            type="text"
                            value={kycForm.barRollNo || formData.barLicenseNo}
                            onChange={(e) => {
                              setKycForm({ ...kycForm, barRollNo: e.target.value });
                              setFormData({ ...formData, barLicenseNo: e.target.value });
                            }}
                            placeholder="e.g. BC-2024-DH-4412"
                            required
                            className="w-full bg-stone-50 border border-stone-300 rounded-xl px-3.5 py-2.5 text-sm text-stone-900 focus:outline-none focus:border-brand-coral font-mono"
                          />
                        </div>

                        <div>
                          <label className="block text-xs font-bold uppercase tracking-wider text-stone-700 mb-1">
                            Bar Association <span className="text-red-500">*</span>
                          </label>
                          <select
                            value={kycForm.barAssociation}
                            onChange={(e) => setKycForm({ ...kycForm, barAssociation: e.target.value })}
                            className="w-full bg-stone-50 border border-stone-300 rounded-xl px-3.5 py-2.5 text-sm text-stone-900 focus:outline-none focus:border-brand-coral cursor-pointer"
                          >
                            <option value="Supreme Court Bar Association, Dhaka">Supreme Court Bar Association, Dhaka</option>
                            <option value="Dhaka Bar Association">Dhaka Bar Association</option>
                            <option value="Chittagong District Bar Association">Chittagong District Bar Association</option>
                            <option value="Sylhet District Bar Association">Sylhet District Bar Association</option>
                            <option value="Rajshahi District Bar Association">Rajshahi District Bar Association</option>
                            <option value="Khulna District Bar Association">Khulna District Bar Association</option>
                            <option value="Other District Bar Association">Other District Bar Association</option>
                          </select>
                        </div>

                        <div>
                          <label className="block text-xs font-bold uppercase tracking-wider text-stone-700 mb-1">
                            Bar Enrollment Year <span className="text-red-500">*</span>
                          </label>
                          <input
                            type="text"
                            value={kycForm.enrollmentYear}
                            onChange={(e) => setKycForm({ ...kycForm, enrollmentYear: e.target.value })}
                            placeholder="e.g. 2018"
                            required
                            className="w-full bg-stone-50 border border-stone-300 rounded-xl px-3.5 py-2.5 text-sm text-stone-900 focus:outline-none focus:border-brand-coral"
                          />
                        </div>

                        <div>
                          <label className="block text-xs font-bold uppercase tracking-wider text-stone-700 mb-1">
                            National ID / Smart NID Number <span className="text-red-500">*</span>
                          </label>
                          <input
                            type="text"
                            value={kycForm.nidNumber}
                            onChange={(e) => setKycForm({ ...kycForm, nidNumber: e.target.value })}
                            placeholder="e.g. 19922692019281928"
                            required
                            className="w-full bg-stone-50 border border-stone-300 rounded-xl px-3.5 py-2.5 text-sm text-stone-900 focus:outline-none focus:border-brand-coral"
                          />
                        </div>
                      </div>

                      <div className="bg-stone-50 border border-stone-200 rounded-2xl p-4 space-y-2">
                        <label className="block text-xs font-bold uppercase tracking-wider text-stone-800">
                          Bar Council Certificate or Advocate ID Card
                        </label>
                        <div className="border-2 border-dashed border-stone-300 rounded-xl p-5 text-center bg-white space-y-1">
                          <Upload className="w-6 h-6 text-stone-400 mx-auto" />
                          <p className="text-xs font-bold text-stone-700">
                            {kycForm.documentName}
                          </p>
                          <p className="text-[11px] text-stone-400">
                            PDF, JPG, PNG up to 10MB (Simulated for instant verification)
                          </p>
                        </div>
                      </div>

                      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 pt-3 border-t border-stone-100">
                        <button
                          type="button"
                          onClick={() => handleKycVerificationSubmit(true)}
                          disabled={isSubmittingKyc}
                          className="bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold px-5 py-3 rounded-xl shadow-sm flex items-center justify-center gap-2 transition-all cursor-pointer disabled:opacity-50"
                        >
                          {isSubmittingKyc ? (
                            <Loader2 className="w-4 h-4 animate-spin" />
                          ) : (
                            <CheckCircle2 className="w-4 h-4" />
                          )}
                          <span>⚡ Instant Bar Council Verification (Demo)</span>
                        </button>

                        <button
                          type="submit"
                          disabled={isSubmittingKyc}
                          className="bg-stone-900 hover:bg-stone-800 text-white text-xs font-bold px-6 py-3 rounded-xl shadow-sm flex items-center justify-center gap-2 transition-all cursor-pointer disabled:opacity-50"
                        >
                          {isSubmittingKyc ? (
                            <Loader2 className="w-4 h-4 animate-spin" />
                          ) : (
                            <ShieldCheck className="w-4 h-4" />
                          )}
                          <span>Submit for Review</span>
                        </button>
                      </div>
                    </form>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* TAB 2: CONSULTATIONS MANAGEMENT */}
          {activeTab === "consultations" && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-bold text-stone-900 flex items-center gap-2">
                  <Calendar className="w-5 h-5 text-brand-coral" />
                  <span>Chamber 1-on-1 Consultation Bookings</span>
                </h3>
                <span className="text-xs text-stone-500 font-medium">
                  {myConsultations.length} total client requests
                </span>
              </div>

              {myConsultations.length === 0 ? (
                <div className="bg-white border border-stone-200 rounded-2xl p-12 text-center text-stone-500 space-y-2">
                  <Calendar className="w-10 h-10 text-stone-300 mx-auto" />
                  <p className="text-sm font-bold text-stone-800">No consultation requests yet</p>
                  <p className="text-xs text-stone-500 max-w-sm mx-auto">
                    When citizens request chamber consultations from your profile in the directory, appointments appear here.
                  </p>
                </div>
              ) : (
                <div className="space-y-3">
                  {myConsultations.map((item) => (
                    <div
                      key={item.id}
                      className="bg-white border border-stone-200 rounded-2xl p-5 shadow-sm space-y-3"
                    >
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-stone-100 pb-3">
                        <div>
                          <div className="text-base font-bold text-stone-900">{item.clientName}</div>
                          <div className="text-xs text-brand-coral font-semibold flex items-center gap-2 mt-0.5">
                            <Phone className="w-3.5 h-3.5" />
                            <span>{item.clientPhone}</span>
                            <span>•</span>
                            <Calendar className="w-3.5 h-3.5 text-stone-400" />
                            <span className="text-stone-600">Preferred Date: {item.preferredDate}</span>
                          </div>
                        </div>

                        <div className="flex items-center gap-2">
                          <span
                            className={`text-xs font-bold px-3 py-1 rounded-full border ${
                              item.status === "completed"
                                ? "bg-emerald-100 text-emerald-800 border-emerald-200"
                                : item.status === "confirmed"
                                ? "bg-sky-100 text-sky-800 border-sky-200"
                                : "bg-amber-100 text-amber-800 border-amber-200"
                            }`}
                          >
                            ● {item.status.toUpperCase()}
                          </span>
                        </div>
                      </div>

                      <div className="bg-stone-50 p-3.5 rounded-xl border border-stone-200 text-xs text-stone-700 leading-relaxed">
                        <span className="font-bold text-stone-900">Citizen Dispute Notes: </span>
                        {item.notes || "Client requested general chamber legal consultation."}
                      </div>

                      <div className="flex items-center justify-between pt-1 text-xs">
                        <span className="text-stone-400">Request received: {item.createdAt}</span>
                        <div className="flex gap-2">
                          {item.status !== "confirmed" && item.status !== "completed" && (
                            <button
                              onClick={() => handleUpdateConsultationStatus(item.id, "confirmed")}
                              className="bg-sky-600 hover:bg-sky-700 text-white font-bold px-3 py-1.5 rounded-lg transition-colors"
                            >
                              Confirm Appointment
                            </button>
                          )}
                          {item.status !== "completed" && (
                            <button
                              onClick={() => handleUpdateConsultationStatus(item.id, "completed")}
                              className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold px-3 py-1.5 rounded-lg transition-colors"
                            >
                              Mark Completed
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* TAB 3: PUBLISHED ADVICE */}
          {activeTab === "answers" && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-bold text-stone-900 flex items-center gap-2">
                  <MessageSquare className="w-5 h-5 text-brand-coral" />
                  <span>My Official Legal Opinions & Statutory Advice</span>
                </h3>
              </div>

              {myAnswers.length === 0 ? (
                <div className="bg-white border border-stone-200 rounded-2xl p-12 text-center text-stone-500 space-y-3">
                  <MessageSquare className="w-10 h-10 text-stone-300 mx-auto" />
                  <p className="text-sm font-bold text-stone-800">No legal advice published yet</p>
                  <p className="text-xs text-stone-500 max-w-sm mx-auto">
                    You haven&apos;t submitted verified legal opinions on citizen queries yet. Click &quot;Citizen Queries Needing Advice&quot; to cite statutory remedies under your Bar Council license.
                  </p>
                  <button
                    onClick={() => setActiveTab("inquiries")}
                    className="inline-flex items-center gap-1.5 text-xs font-bold bg-brand-coral text-white px-4 py-2 rounded-xl shadow-coral hover:bg-brand-hover transition-colors cursor-pointer"
                  >
                    <PlusCircle className="w-3.5 h-3.5" /> Browse Open Inquiries
                  </button>
                </div>
              ) : (
                <div className="space-y-3">
                  {myAnswers.map((ans) => (
                    <div key={ans.id} className="bg-white border border-stone-200 rounded-2xl p-6 shadow-sm space-y-3">
                      <div className="flex items-center justify-between">
                        <h4 className="text-base font-bold text-stone-900">
                          {ans.questions?.title || "Legal Query Advice"}
                        </h4>
                        {ans.is_accepted && (
                          <span className="bg-emerald-100 text-emerald-800 text-xs font-bold px-2.5 py-1 rounded-full border border-emerald-200">
                            ✓ Accepted Solution
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-stone-700 bg-stone-50 p-4 rounded-xl border border-stone-200 whitespace-pre-line leading-relaxed">
                        {ans.content}
                      </p>
                      <div className="flex items-center justify-between text-xs text-stone-500 pt-1">
                        <span className="flex items-center gap-1">
                          <ThumbsUp className="w-3.5 h-3.5 text-brand-coral" /> {ans.upvotes || 1} Helpful Votes
                        </span>
                        <Link
                          href={`/questions/${ans.question_id}`}
                          className="text-brand-coral font-bold hover:underline inline-flex items-center gap-1"
                        >
                          Open Discussion <ExternalLink className="w-3 h-3" />
                        </Link>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* TAB 4: OPEN INQUIRIES NEEDING ADVICE */}
          {activeTab === "inquiries" && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-bold text-stone-900 flex items-center gap-2">
                  <Clock className="w-5 h-5 text-brand-coral" />
                  <span>Public Issues Awaiting Verified Legal Advice</span>
                </h3>
                <span className="text-xs text-stone-500">
                  Click 'Verified Expert Advice' on any card to answer directly
                </span>
              </div>

              <div className="space-y-4">
                {allQuestions.filter((q) => q.status === "awaiting_advice" || q.urgency === "critical").map((q) => (
                  <QuestionCard key={q.id} question={q} />
                ))}
              </div>
            </div>
          )}

        </div>
      ) : (
        /* CITIZEN VIEW CONTENT */
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-extrabold text-stone-900 tracking-tight">
              Citizen Queries & Tracking Codes
            </h2>
            <Link
              href="/ask"
              className="bg-brand-coral hover:bg-brand-hover text-white text-xs font-bold px-4 py-2 rounded-xl shadow-coral inline-flex items-center gap-1.5"
            >
              <PlusCircle className="w-4 h-4" /> Ask New Query
            </Link>
          </div>

          <div className="space-y-4">
            {allQuestions.slice(0, 4).map((q) => (
              <QuestionCard key={q.id} question={q} />
            ))}
          </div>
        </div>
      )}

      {/* Lawyer Profile Setup Tour Modal */}
      <LawyerSetupTour
        isOpen={isTourOpen}
        onClose={() => setIsTourOpen(false)}
        onComplete={handleTourComplete}
        initialData={{
          lawyerId: lawyerProfile?.id || currentUser?.id,
          name: formData.name,
          barLicenseNo: formData.barLicenseNo,
          hideBarLicense: formData.hideBarLicense,
          phone: formData.phone,
          location: formData.location,
          hourlyFee: formData.hourlyFee,
          bio: formData.bio,
          avatar: formData.avatar,
          specialization: formData.specialization,
          verified: lawyerProfile?.verified || false,
        }}
      />
    </div>
  );
}
