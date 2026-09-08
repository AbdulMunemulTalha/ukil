"use client";

import { useRouter } from "next/navigation";
import { ShieldAlert, CheckCircle2, ArrowRight, X, AlertTriangle } from "lucide-react";

interface KycRequiredModalProps {
  isOpen: boolean;
  onClose: () => void;
  onProceedToKyc?: () => void;
}

export default function KycRequiredModal({
  isOpen,
  onClose,
  onProceedToKyc,
}: KycRequiredModalProps) {
  const router = useRouter();

  if (!isOpen) return null;

  const handleGoToKyc = () => {
    onClose();
    if (onProceedToKyc) {
      onProceedToKyc();
    } else {
      router.push("/dashboard?tab=kyc");
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-stone-900/60 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-200">
      <div className="bg-white border border-stone-200 rounded-3xl max-w-lg w-full p-6 sm:p-8 shadow-2xl relative animate-in zoom-in-95 duration-200 space-y-6">
        
        {/* Close Button */}
        <button
          type="button"
          onClick={onClose}
          className="absolute right-5 top-5 text-stone-400 hover:text-stone-700 p-1.5 rounded-full hover:bg-stone-100 transition-colors cursor-pointer"
          aria-label="Close"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Header Icon */}
        <div className="text-center space-y-3 pt-2">
          <div className="w-16 h-16 rounded-2xl bg-amber-50 border border-amber-200 text-amber-600 flex items-center justify-center mx-auto shadow-sm">
            <ShieldAlert className="w-9 h-9 text-amber-600" />
          </div>

          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-100/70 border border-amber-200 text-[11px] font-extrabold uppercase tracking-wider text-amber-900">
            <AlertTriangle className="w-3.5 h-3.5 text-amber-700" />
            <span>KYC Verification Required</span>
          </div>

          <h3 className="text-2xl font-extrabold text-stone-900 tracking-tight leading-snug">
            Verify Your Advocate Credentials
          </h3>
        </div>

        {/* Core Notice Message */}
        <div className="bg-amber-50/80 border border-amber-200/90 rounded-2xl p-4 text-center space-y-1.5">
          <p className="text-sm font-bold text-amber-950">
            To give advice, you need to complete KYC verification to become a verified lawyer.
          </p>
          <p className="text-xs text-amber-800 leading-relaxed">
            You signed up as a legal practitioner on Ukil, but your Bar Council enrollment and National ID credentials haven&apos;t been verified yet.
          </p>
        </div>

        {/* Why KYC is required */}
        <div className="space-y-2 text-xs text-stone-600 bg-stone-50 p-4 rounded-2xl border border-stone-200">
          <p className="font-bold text-stone-900 uppercase tracking-wider text-[11px]">
            Why is KYC mandatory before giving advice?
          </p>
          <ul className="space-y-1.5 pt-1">
            <li className="flex items-start gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
              <span>Protects citizens from unverified or unauthorized legal counsel.</span>
            </li>
            <li className="flex items-start gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
              <span>Verifies your Bangladesh Bar Council roll and court jurisdiction.</span>
            </li>
            <li className="flex items-start gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
              <span>Awards the official <strong>&ldquo;Verified Advocate&rdquo;</strong> seal to all your legal opinions.</span>
            </li>
          </ul>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row items-center gap-3 pt-1">
          <button
            type="button"
            onClick={handleGoToKyc}
            className="w-full sm:flex-1 bg-brand-coral hover:bg-brand-hover text-white font-bold py-3.5 px-5 rounded-2xl shadow-coral flex items-center justify-center gap-2 text-sm transition-all transform active:scale-95 cursor-pointer"
          >
            <span>Complete KYC Verification Now</span>
            <ArrowRight className="w-4 h-4" />
          </button>

          <button
            type="button"
            onClick={onClose}
            className="w-full sm:w-auto px-5 py-3.5 rounded-2xl border border-stone-200 hover:bg-stone-100 text-stone-700 text-xs font-bold transition-colors cursor-pointer"
          >
            Maybe Later
          </button>
        </div>

      </div>
    </div>
  );
}
