"use client";

import { useState } from "react";
import {
  X,
  ChevronRight,
  ChevronLeft,
  CheckCircle2,
  Scale,
  Award,
  ShieldCheck,
  Building,
  User,
  Phone,
  Mail,
  MapPin,
  DollarSign,
  FileText,
  Camera,
  Eye,
  EyeOff,
  Sparkles,
  Loader2,
  Upload,
} from "lucide-react";
import { MOCK_CATEGORIES } from "../lib/mockData";
import { getDefaultAvatar, uploadAvatarToSupabase, fileToDataUrl } from "../lib/avatar";

export interface SetupTourData {
  name: string;
  barLicenseNo: string;
  hideBarLicense: boolean;
  phone: string;
  email?: string;
  location: string;
  hourlyFee: string;
  bio: string;
  avatar: string;
  specialization: string[];
  lawyerId?: string;
  verified?: boolean;
}

interface LawyerSetupTourProps {
  isOpen: boolean;
  onClose: () => void;
  initialData: SetupTourData;
  onSaveProfile?: (data: SetupTourData) => Promise<boolean>;
  onCompleteKyc?: (kycData: any) => Promise<void>;
  onComplete?: (updatedData: any) => void;
  isVerified?: boolean;
}

export default function LawyerSetupTour({
  isOpen,
  onClose,
  initialData,
  onSaveProfile,
  onCompleteKyc,
  onComplete,
  isVerified = false,
}: LawyerSetupTourProps) {
  const [step, setStep] = useState(1);
  const totalSteps = 5;

  const [formData, setFormData] = useState<SetupTourData>({
    name: initialData.name || "",
    barLicenseNo: initialData.barLicenseNo || "",
    hideBarLicense: initialData.hideBarLicense ?? false,
    phone: initialData.phone || "",
    email: initialData.email || "",
    location: initialData.location || "",
    hourlyFee: initialData.hourlyFee || "",
    bio: initialData.bio || "",
    avatar: initialData.avatar || "",
    specialization: initialData.specialization || ["Anti-Corruption & Bribes", "Property & Land Disputes"],
  });

  const [kycForm, setKycForm] = useState({
    barAssociation: "Supreme Court Bar Association, Dhaka",
    enrollmentYear: "2018",
    nidNumber: "",
    documentName: "Bangladesh Bar Council Certificate",
  });

  const [isSaving, setIsSaving] = useState(false);
  const [kycSubmitted, setKycSubmitted] = useState(isVerified);

  if (!isOpen) return null;

  const toggleSpecialization = (catName: string) => {
    setFormData((prev) => {
      const exists = prev.specialization.includes(catName);
      if (exists) {
        return { ...prev, specialization: prev.specialization.filter((s) => s !== catName) };
      }
      return { ...prev, specialization: [...prev.specialization, catName] };
    });
  };

  const handleNext = async () => {
    setIsSaving(true);
    // Persist progress at each step
    if (onSaveProfile) {
      await onSaveProfile(formData);
    }
    setIsSaving(false);
    if (step < totalSteps) {
      setStep(step + 1);
    }
  };

  const handleBack = () => {
    if (step > 1) {
      setStep(step - 1);
    }
  };

  const handleKycSubmit = async (instantVerify: boolean = true) => {
    setIsSaving(true);
    if (onSaveProfile) {
      await onSaveProfile(formData);
    }
    if (onCompleteKyc) {
      await onCompleteKyc({
        ...kycForm,
        barRollNo: formData.barLicenseNo || "BAR-PENDING",
        instantVerify,
      });
    }
    if (onComplete) {
      onComplete({ ...formData, verified: instantVerify });
    }
    setKycSubmitted(true);
    setIsSaving(false);
  };

  const handleFinish = async () => {
    setIsSaving(true);
    if (onSaveProfile) {
      await onSaveProfile(formData);
    }
    if (onComplete) {
      onComplete(formData);
    }
    setIsSaving(false);
    onClose();
  };

  const stepTitles = [
    "Chamber & Contact Info",
    "Bar License & Privacy",
    "Practice Areas",
    "Bio & Chamber Portrait",
    "KYC Verification",
  ];

  return (
    <div className="fixed inset-0 z-50 bg-stone-900/70 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
      <div className="bg-white border border-stone-200 rounded-3xl max-w-2xl w-full my-auto shadow-2xl overflow-hidden flex flex-col max-h-[92vh] animate-in fade-in zoom-in-95 duration-200">
        
        {/* Top Header & Step Tracker */}
        <div className="bg-stone-900 text-white p-6 sm:p-7 relative shrink-0">
          <button
            type="button"
            onClick={onClose}
            className="absolute right-5 top-5 text-stone-400 hover:text-white p-1 rounded-full hover:bg-stone-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="flex items-center gap-2 mb-2">
            <span className="bg-brand-coral text-white text-[10px] font-extrabold px-2.5 py-0.5 rounded-full uppercase tracking-wider flex items-center gap-1">
              <Sparkles className="w-3 h-3" /> Lawyer Setup Tour
            </span>
            <span className="text-stone-400 text-xs font-semibold">
              Step {step} of {totalSteps}
            </span>
          </div>

          <h2 className="text-xl sm:text-2xl font-black tracking-tight text-white">
            {stepTitles[step - 1]}
          </h2>
          <p className="text-stone-400 text-xs mt-1">
            Complete your advocate profile to establish trust with citizens and activate full portal capabilities.
          </p>

          {/* Progress Bar */}
          <div className="mt-4 w-full bg-stone-800 h-2 rounded-full overflow-hidden">
            <div
              className="bg-brand-coral h-full rounded-full transition-all duration-300 ease-out"
              style={{ width: `${(step / totalSteps) * 100}%` }}
            />
          </div>
        </div>

        {/* Step Content Body */}
        <div className="p-6 sm:p-8 overflow-y-auto space-y-5 flex-1">
          
          {/* STEP 1: CHAMBER & CONTACT INFO */}
          {step === 1 && (
            <div className="space-y-4 animate-in fade-in">
              <div className="bg-brand-light/50 border border-brand-border/60 p-4 rounded-2xl text-xs text-stone-700 flex items-start gap-3">
                <Building className="w-5 h-5 text-brand-coral shrink-0 mt-0.5" />
                <div>
                  <span className="font-bold text-stone-900 block mb-0.5">Let citizens know how to reach your chamber:</span>
                  Please verify your legal name, direct phone number, and physical office location for private client consultations.
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-stone-700 mb-1">
                    Full Legal Name *
                  </label>
                  <div className="relative">
                    <User className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-stone-400" />
                    <input
                      type="text"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      placeholder="Advocate Full Name"
                      className="w-full bg-stone-50 border border-stone-300 rounded-xl pl-10 pr-3 py-2.5 text-sm font-medium focus:outline-none focus:border-brand-coral"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-stone-700 mb-1">
                    Chamber Phone Number *
                  </label>
                  <div className="relative">
                    <Phone className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-stone-400" />
                    <input
                      type="tel"
                      value={formData.phone}
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                      placeholder="+880 1711-XXXXXX"
                      className="w-full bg-stone-50 border border-stone-300 rounded-xl pl-10 pr-3 py-2.5 text-sm font-medium focus:outline-none focus:border-brand-coral"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-stone-700 mb-1">
                    Official Email
                  </label>
                  <div className="relative">
                    <Mail className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-stone-400" />
                    <input
                      type="email"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      placeholder="lawyer@chamber.com"
                      className="w-full bg-stone-50 border border-stone-300 rounded-xl pl-10 pr-3 py-2.5 text-sm font-medium focus:outline-none focus:border-brand-coral"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-stone-700 mb-1">
                    Consultation Fee / Session
                  </label>
                  <div className="relative">
                    <DollarSign className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-stone-400" />
                    <input
                      type="text"
                      value={formData.hourlyFee}
                      onChange={(e) => setFormData({ ...formData, hourlyFee: e.target.value })}
                      placeholder="e.g. ৳2,500 / Session or Pro Bono"
                      className="w-full bg-stone-50 border border-stone-300 rounded-xl pl-10 pr-3 py-2.5 text-sm font-medium focus:outline-none focus:border-brand-coral"
                    />
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-stone-700 mb-1">
                  Chamber / Office Location
                </label>
                <div className="relative">
                  <MapPin className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-stone-400" />
                  <input
                    type="text"
                    value={formData.location}
                    onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                    placeholder="e.g. Room 304, Supreme Court Bar Annex, Dhaka"
                    className="w-full bg-stone-50 border border-stone-300 rounded-xl pl-10 pr-3 py-2.5 text-sm font-medium focus:outline-none focus:border-brand-coral"
                  />
                </div>
              </div>
            </div>
          )}

          {/* STEP 2: BAR LICENSE & PRIVACY TOGGLE */}
          {step === 2 && (
            <div className="space-y-5 animate-in fade-in">
              <div className="bg-stone-50 border border-stone-200 p-4 rounded-2xl text-xs text-stone-600 flex items-start gap-3">
                <Award className="w-5 h-5 text-brand-coral shrink-0 mt-0.5" />
                <div>
                  <span className="font-bold text-stone-900 block mb-0.5">Bar License & Privacy Controls:</span>
                  Enter your Bar Council License or Roll Number. You can choose whether you want this number visible to the public or hidden.
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-stone-800 mb-1.5">
                  Bar License / Registration No.
                </label>
                <div className="relative">
                  <Award className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-stone-400" />
                  <input
                    type="text"
                    value={formData.barLicenseNo}
                    onChange={(e) => setFormData({ ...formData, barLicenseNo: e.target.value })}
                    placeholder="e.g. DBA-9812-SC or Bar Roll No."
                    className="w-full bg-stone-50 border border-stone-300 rounded-xl pl-10 pr-3 py-2.5 text-sm font-mono font-bold focus:outline-none focus:border-brand-coral"
                  />
                </div>
                <p className="text-[11px] text-stone-500 mt-1">
                  Enrolled under Bangladesh Bar Council or relevant professional body.
                </p>
              </div>

              {/* BAR LICENSE VISIBILITY CHECKBOX */}
              <div className="bg-amber-50/70 border border-amber-200/90 rounded-2xl p-4 sm:p-5 space-y-3">
                <label className="flex items-start gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    id="tour-hide-bar-license"
                    checked={formData.hideBarLicense}
                    onChange={(e) => setFormData({ ...formData, hideBarLicense: e.target.checked })}
                    className="mt-1 w-5 h-5 rounded text-brand-coral focus:ring-brand-coral accent-brand-coral cursor-pointer"
                  />
                  <div className="space-y-1">
                    <span className="text-sm font-extrabold text-stone-900 block">
                      Hide Bar License / Registration No. from public profile
                    </span>
                    <p className="text-xs text-stone-600 leading-relaxed">
                      If you <strong>check this box</strong>, your license number will be <strong>invisible / hidden</strong> from the public. If you <strong>leave it unchecked</strong>, it will remain <strong>visible</strong> to the public directory.
                    </p>
                  </div>
                </label>

                {/* Live Public Display Badge Preview */}
                <div className="mt-3 pt-3 border-t border-amber-200/60 flex items-center justify-between text-xs">
                  <span className="text-stone-500 font-medium">Public Status Preview:</span>
                  {formData.hideBarLicense ? (
                    <span className="inline-flex items-center gap-1.5 font-bold text-stone-700 bg-white border border-stone-300 px-3 py-1 rounded-full shadow-2xs">
                      <EyeOff className="w-3.5 h-3.5 text-amber-600" />
                      <span>Bar License Hidden (Private on file)</span>
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1.5 font-bold text-emerald-800 bg-emerald-50 border border-emerald-300 px-3 py-1 rounded-full shadow-2xs">
                      <Eye className="w-3.5 h-3.5 text-emerald-600" />
                      <span>Bar License: {formData.barLicenseNo || "License visible"}</span>
                    </span>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* STEP 3: PRACTICE SPECIALIZATIONS */}
          {step === 3 && (
            <div className="space-y-4 animate-in fade-in">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-bold text-stone-900">Choose Practice Areas</h3>
                  <p className="text-xs text-stone-500">Click to select the legal subjects you specialize in:</p>
                </div>
                <span className="text-xs font-bold text-brand-coral bg-brand-light px-2.5 py-1 rounded-lg border border-brand-border">
                  {formData.specialization.length} Selected
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 max-h-[42vh] overflow-y-auto pr-1">
                {MOCK_CATEGORIES.map((cat) => {
                  const isSelected = formData.specialization.includes(cat.name);
                  return (
                    <button
                      type="button"
                      key={cat.id}
                      onClick={() => toggleSpecialization(cat.name)}
                      className={`p-3 rounded-xl text-left border transition-all flex items-center justify-between cursor-pointer ${
                        isSelected
                          ? "bg-brand-light text-brand-coral border-brand-coral font-bold shadow-xs"
                          : "bg-stone-50 text-stone-700 border-stone-200 hover:bg-stone-100"
                      }`}
                    >
                      <div className="flex items-center gap-2">
                        <span className="text-lg">{cat.icon}</span>
                        <div>
                          <div className="text-xs font-bold">{cat.name}</div>
                          <div className="text-[10px] text-stone-500 line-clamp-1">{cat.description}</div>
                        </div>
                      </div>
                      {isSelected && <span className="text-brand-coral font-black text-sm ml-2">✓</span>}
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* STEP 4: BIO & PORTRAIT PHOTO */}
          {step === 4 && (
            <div className="space-y-4 animate-in fade-in">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-stone-700 mb-1.5">
                  Advocate Chamber Bio & Credentials
                </label>
                <textarea
                  rows={4}
                  value={formData.bio}
                  onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                  placeholder="Describe your practice experience, courts of appearance (High Court Division / District Judge Court), landmark cases, and consultation guidelines..."
                  className="w-full bg-stone-50 border border-stone-300 rounded-xl p-3.5 text-xs text-stone-900 focus:outline-none focus:border-brand-coral leading-relaxed"
                />
              </div>

              {/* Photo Upload Section */}
              <div className="bg-stone-50 border border-stone-200 rounded-2xl p-4 space-y-3">
                <label className="block text-xs font-bold uppercase tracking-wider text-stone-900">
                  Profile Photo / Chamber Portrait
                </label>
                <div className="flex items-center gap-4">
                  <img
                    src={formData.avatar || getDefaultAvatar(formData.name || "Advocate")}
                    alt={formData.name || "Preview"}
                    className="w-16 h-16 rounded-2xl object-cover border-2 border-brand-coral shadow-sm bg-white"
                  />
                  <div className="flex-1 space-y-1.5">
                    <input
                      type="url"
                      value={formData.avatar}
                      onChange={(e) => setFormData({ ...formData, avatar: e.target.value })}
                      placeholder="Paste portrait image URL (or leave blank for initials avatar)"
                      className="w-full bg-white border border-stone-300 rounded-xl px-3 py-2 text-xs text-stone-900 focus:outline-none focus:border-brand-coral"
                    />
                    <p className="text-[11px] text-stone-500">
                      You can also upload directly from your device inside your Dashboard later.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* STEP 5: KYC VERIFICATION */}
          {step === 5 && (
            <div className="space-y-5 animate-in fade-in">
              <div className="bg-emerald-50 border border-emerald-200 p-4 rounded-2xl text-xs text-emerald-900 flex items-start gap-3">
                <ShieldCheck className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
                <div>
                  <span className="font-bold text-emerald-950 block mb-0.5">Final Step: KYC Verification</span>
                  To publish advice on citizen inquiries and receive the official <strong>Verified Advocate</strong> badge, legal practitioners complete KYC verification.
                </div>
              </div>

              {kycSubmitted || isVerified ? (
                <div className="bg-emerald-100/60 border border-emerald-300 text-emerald-900 p-6 rounded-2xl text-center space-y-2">
                  <CheckCircle2 className="w-10 h-10 text-emerald-600 mx-auto" />
                  <h4 className="text-base font-bold">KYC Verification Active!</h4>
                  <p className="text-xs text-emerald-800 max-w-md mx-auto">
                    Your account is authorized as a verified advocate. You can now publish advice across all citizen legal queries!
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                    <div>
                      <label className="block text-xs font-bold uppercase tracking-wider text-stone-700 mb-1">
                        Bar Association
                      </label>
                      <input
                        type="text"
                        value={kycForm.barAssociation}
                        onChange={(e) => setKycForm({ ...kycForm, barAssociation: e.target.value })}
                        placeholder="e.g. Supreme Court Bar Association"
                        className="w-full bg-stone-50 border border-stone-300 rounded-xl px-3.5 py-2.5 text-xs font-medium focus:outline-none focus:border-brand-coral"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold uppercase tracking-wider text-stone-700 mb-1">
                        Year of Enrollment
                      </label>
                      <input
                        type="text"
                        value={kycForm.enrollmentYear}
                        onChange={(e) => setKycForm({ ...kycForm, enrollmentYear: e.target.value })}
                        placeholder="e.g. 2018"
                        className="w-full bg-stone-50 border border-stone-300 rounded-xl px-3.5 py-2.5 text-xs font-medium focus:outline-none focus:border-brand-coral"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-stone-700 mb-1">
                      National ID (NID) / Passport No.
                    </label>
                    <input
                      type="text"
                      value={kycForm.nidNumber}
                      onChange={(e) => setKycForm({ ...kycForm, nidNumber: e.target.value })}
                      placeholder="e.g. 19902692500000000"
                      className="w-full bg-stone-50 border border-stone-300 rounded-xl px-3.5 py-2.5 text-xs font-mono focus:outline-none focus:border-brand-coral"
                    />
                  </div>

                  <div className="p-3.5 bg-amber-50/70 border border-amber-200 rounded-xl text-xs text-amber-900 flex items-center justify-between">
                    <span>💡 Tip: If you skip KYC now, you can complete it anytime in your dashboard before providing legal advice.</span>
                  </div>

                  <div className="flex flex-col sm:flex-row items-center gap-2.5 pt-1">
                    <button
                      type="button"
                      onClick={() => handleKycSubmit(true)}
                      disabled={isSaving}
                      className="w-full sm:flex-1 bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-3 px-4 rounded-xl text-xs flex items-center justify-center gap-2 shadow-sm transition-all cursor-pointer"
                    >
                      <ShieldCheck className="w-4 h-4" />
                      <span>{isSaving ? "Verifying..." : "Submit & Verify KYC (Instant Demo)"}</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => handleKycSubmit(false)}
                      disabled={isSaving}
                      className="w-full sm:w-auto bg-stone-100 hover:bg-stone-200 text-stone-700 font-semibold py-3 px-4 rounded-xl text-xs transition-colors cursor-pointer"
                    >
                      Submit for Manual Review
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}

        </div>

        {/* Bottom Navigation Controls */}
        <div className="bg-stone-50 border-t border-stone-200 px-6 py-4 flex items-center justify-between shrink-0">
          <button
            type="button"
            onClick={step === 1 ? onClose : handleBack}
            className="px-4 py-2 text-xs font-bold text-stone-600 hover:text-stone-900 flex items-center gap-1 cursor-pointer"
          >
            {step > 1 && <ChevronLeft className="w-4 h-4" />}
            <span>{step === 1 ? "Exit Tour" : "Back"}</span>
          </button>

          <div className="flex items-center gap-2">
            {step < totalSteps ? (
              <button
                type="button"
                onClick={handleNext}
                disabled={isSaving}
                className="bg-brand-coral hover:bg-brand-hover text-white text-xs font-bold px-5 py-2.5 rounded-xl shadow-coral flex items-center gap-1.5 transition-all transform active:scale-95 disabled:opacity-50 cursor-pointer"
              >
                <span>{isSaving ? "Saving..." : "Save & Continue"}</span>
                <ChevronRight className="w-4 h-4" />
              </button>
            ) : (
              <button
                type="button"
                onClick={handleFinish}
                disabled={isSaving}
                className="bg-stone-900 hover:bg-stone-800 text-white text-xs font-bold px-6 py-2.5 rounded-xl shadow-sm flex items-center gap-2 transition-all cursor-pointer"
              >
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                <span>Finish & Go to Workspace</span>
              </button>
            )}
          </div>
        </div>

      </div>
    </div>
  );
}
