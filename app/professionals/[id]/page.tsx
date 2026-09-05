"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { ShieldCheck, Star, MapPin, Calendar, Clock, CheckCircle2, MessageSquare, ArrowLeft, Send, X, Loader2 } from "lucide-react";
import { MOCK_QUESTIONS, Professional } from "../../../lib/mockData";
import { DataService } from "../../../lib/db";
import { createClient } from "../../../lib/supabase/client";
import { getDefaultAvatar } from "../../../lib/avatar";
import QuestionCard from "../../../components/QuestionCard";

export default function ProfessionalDetailPage({ params }: { params: { id: string } }) {
  const [prof, setProf] = useState<Professional | null>(() => {
    const list = DataService.getProfessionals();
    return list.find((p) => p.id === params.id) || null;
  });
  const [isLoading, setIsLoading] = useState(!prof);

  useEffect(() => {
    DataService.syncFromSupabase().then(async () => {
      const list = DataService.getProfessionals();
      const found = list.find((p) => p.id === params.id);
      if (found) {
        setProf(found);
        setIsLoading(false);
      } else {
        const supabase = createClient();
        if (supabase) {
          const { data: dbP } = await supabase
            .from("profiles")
            .select("*")
            .eq("id", params.id)
            .single();

          if (dbP) {
            setProf({
              id: dbP.id,
              name: dbP.full_name || "Advocate",
              role: "Verified Legal Advocate",
              specialization: Array.isArray(dbP.specializations) ? dbP.specializations : [],
              location: dbP.location || "",
              rating: dbP.rating ? Number(dbP.rating) : 5.0,
              reviewCount: dbP.review_count || 0,
              barLicenseNo: dbP.bar_license_no || "",
              hourlyFee: dbP.hourly_fee || "",
              avatar: dbP.avatar_url || getDefaultAvatar(dbP.full_name || "Advocate"),
              bio: dbP.bio || "",
              answersCount: 0,
              verified: dbP.is_verified ?? true,
            });
          }
        }
        setIsLoading(false);
      }
    });
  }, [params.id]);

  const [isBookingOpen, setIsBookingOpen] = useState(false);
  const [bookingSuccess, setBookingSuccess] = useState(false);
  const [clientName, setClientName] = useState("");
  const [clientPhone, setClientPhone] = useState("");
  const [preferredDate, setPreferredDate] = useState("");
  const [notes, setNotes] = useState("");

  const handleBooking = (e: React.FormEvent) => {
    e.preventDefault();
    if (!prof) return;
    DataService.addConsultation({
      professionalId: prof.id,
      professionalName: prof.name,
      clientName,
      clientPhone,
      preferredDate,
      notes,
    });
    setBookingSuccess(true);
    setTimeout(() => {
      setBookingSuccess(false);
      setIsBookingOpen(false);
    }, 3500);
  };

  if (isLoading) {
    return (
      <div className="max-w-4xl mx-auto py-16 text-center space-y-3">
        <Loader2 className="w-8 h-8 text-brand-coral animate-spin mx-auto" />
        <p className="text-sm text-stone-500">Loading advocate profile...</p>
      </div>
    );
  }

  if (!prof) {
    return (
      <div className="max-w-4xl mx-auto py-16 text-center space-y-4">
        <h2 className="text-2xl font-bold text-stone-800">Advocate Profile Not Found</h2>
        <p className="text-sm text-stone-600">The requested legal practitioner profile is not available or has been removed.</p>
        <Link href="/professionals" className="inline-flex items-center gap-1.5 text-brand-coral font-bold hover:underline text-sm">
          <ArrowLeft className="w-4 h-4" /> Back to Verified Directory
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-8 pt-2">
      
      {/* Back Button */}
      <Link href="/professionals" className="inline-flex items-center gap-1.5 text-sm font-semibold text-stone-600 hover:text-brand-coral transition-colors">
        <ArrowLeft className="w-4 h-4" /> Back to Directory
      </Link>

      {/* Main Profile Header */}
      <div className="bg-white border border-stone-200 rounded-3xl p-6 sm:p-8 shadow-sm space-y-6">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
          <div className="flex items-center gap-5">
            <img src={prof.avatar || getDefaultAvatar(prof.name)} alt={prof.name} className="w-20 h-20 rounded-full object-cover border-4 border-brand-coral shrink-0 shadow-md bg-white" />
            <div>
              <div className="flex items-center gap-2 font-extrabold text-stone-900 text-2xl">
                <span>{prof.name}</span>
                <ShieldCheck className="w-6 h-6 text-emerald-600 fill-emerald-100" />
              </div>
              <div className="text-sm text-brand-coral font-bold mt-0.5">{prof.role}</div>
              <div className="text-xs text-stone-500 flex items-center gap-3 mt-1.5">
                <span className="flex items-center gap-1"><MapPin className="w-3.5 h-3.5" /> {prof.location}</span>
                <span>•</span>
                <span className="font-mono font-semibold">License: {prof.barLicenseNo}</span>
              </div>
            </div>
          </div>

          <button
            onClick={() => setIsBookingOpen(true)}
            className="bg-brand-coral hover:bg-brand-hover text-white font-bold px-6 py-3 rounded-2xl shadow-coral transition-transform active:scale-95 text-sm shrink-0 flex items-center gap-2"
          >
            <Calendar className="w-4 h-4" /> Request 1-on-1 Consultation
          </button>
        </div>

        {/* Bio */}
        <p className="text-stone-700 text-sm leading-relaxed border-t border-stone-100 pt-4">
          {prof.bio}
        </p>

        {/* Stats & Specializations */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 pt-4 border-t border-stone-100">
          <div className="bg-stone-50 p-3 rounded-xl text-center border border-stone-200">
            <div className="text-amber-600 font-extrabold text-lg flex items-center justify-center gap-1">
              <Star className="w-4 h-4 fill-amber-500" /> {prof.rating}
            </div>
            <div className="text-[11px] font-semibold text-stone-500 uppercase">Rating ({prof.reviewCount} Reviews)</div>
          </div>
          <div className="bg-stone-50 p-3 rounded-xl text-center border border-stone-200">
            <div className="text-brand-coral font-extrabold text-lg">{prof.answersCount}</div>
            <div className="text-[11px] font-semibold text-stone-500 uppercase">Queries Answered</div>
          </div>
          <div className="bg-stone-50 p-3 rounded-xl text-center border border-stone-200">
            <div className="text-stone-900 font-extrabold text-lg">{prof.hourlyFee}</div>
            <div className="text-[11px] font-semibold text-stone-500 uppercase">Consultation Fee</div>
          </div>
          <div className="bg-stone-50 p-3 rounded-xl text-center border border-stone-200">
            <div className="text-emerald-600 font-extrabold text-lg">Verified</div>
            <div className="text-[11px] font-semibold text-stone-500 uppercase">Bar Council Checked</div>
          </div>
        </div>
      </div>

      {/* Answered Issues History */}
      <div className="space-y-4">
        <h2 className="text-xl font-extrabold text-stone-900 tracking-tight flex items-center gap-2">
          <MessageSquare className="w-5 h-5 text-brand-coral" />
          <span>Public Advice Contributed by {prof.name}</span>
        </h2>

        <div className="space-y-4">
          {MOCK_QUESTIONS.slice(0, 2).map((question) => (
            <QuestionCard key={question.id} question={question} />
          ))}
        </div>
      </div>

      {/* Booking Modal */}
      {isBookingOpen && (
        <div className="fixed inset-0 z-50 bg-stone-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white border border-stone-200 rounded-3xl max-w-lg w-full p-6 sm:p-8 shadow-2xl relative">
            <button
              onClick={() => setIsBookingOpen(false)}
              className="absolute top-5 right-5 w-8 h-8 rounded-full bg-stone-100 text-stone-500 hover:bg-stone-200 flex items-center justify-center"
            >
              <X className="w-5 h-5" />
            </button>

            <h3 className="text-xl font-extrabold text-stone-900 mb-1">
              Book Consultation with {prof.name}
            </h3>
            <p className="text-xs text-stone-500 mb-6">
              Select your preferred date & time. The lawyer will review your request and confirm details.
            </p>

            {bookingSuccess ? (
              <div className="bg-emerald-50 border border-emerald-200 text-emerald-800 p-5 rounded-2xl space-y-2 text-center">
                <CheckCircle2 className="w-8 h-8 text-emerald-600 mx-auto" />
                <h4 className="font-bold text-base">Consultation Request Sent!</h4>
                <p className="text-xs text-emerald-700">
                  {prof.name}&apos;s chamber assistant will reach out via phone/email to finalize session details.
                </p>
              </div>
            ) : (
              <form onSubmit={handleBooking} className="space-y-4">
                <div>
                  <label className="text-xs font-bold text-stone-800 uppercase tracking-wider block mb-1">Your Full Name</label>
                  <input
                    type="text"
                    value={clientName}
                    onChange={(e) => setClientName(e.target.value)}
                    placeholder="e.g. Tanvir Ahmed"
                    className="w-full bg-stone-50 border border-stone-300 rounded-xl px-4 py-2.5 text-sm"
                    required
                  />
                </div>

                <div>
                  <label className="text-xs font-bold text-stone-800 uppercase tracking-wider block mb-1">Phone Number</label>
                  <input
                    type="tel"
                    value={clientPhone}
                    onChange={(e) => setClientPhone(e.target.value)}
                    placeholder="01712-XXXXXX"
                    className="w-full bg-stone-50 border border-stone-300 rounded-xl px-4 py-2.5 text-sm"
                    required
                  />
                </div>

                <div>
                  <label className="text-xs font-bold text-stone-800 uppercase tracking-wider block mb-1">Preferred Consultation Date</label>
                  <input
                    type="date"
                    value={preferredDate}
                    onChange={(e) => setPreferredDate(e.target.value)}
                    className="w-full bg-stone-50 border border-stone-300 rounded-xl px-4 py-2.5 text-sm"
                    required
                  />
                </div>

                <div>
                  <label className="text-xs font-bold text-stone-800 uppercase tracking-wider block mb-1">Summary of Your Legal Issue</label>
                  <textarea
                    rows={3}
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    placeholder="Briefly describe what you need advice on..."
                    className="w-full bg-stone-50 border border-stone-300 rounded-xl px-4 py-2.5 text-sm"
                    required
                  />
                </div>

                <button
                  type="submit"
                  className="w-full bg-brand-coral hover:bg-brand-hover text-white font-bold py-3.5 rounded-xl shadow-coral flex items-center justify-center gap-2 text-sm mt-2"
                >
                  <Send className="w-4 h-4" /> Submit Booking Request
                </button>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
