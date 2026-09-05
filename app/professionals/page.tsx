"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { ShieldCheck, Search, Star, MapPin, Award, ArrowRight } from "lucide-react";
import { Professional } from "../../lib/mockData";
import { DataService } from "../../lib/db";
import { getDefaultAvatar } from "../../lib/avatar";

export default function ProfessionalsPage() {
  const [professionals, setProfessionals] = useState<Professional[]>(() => DataService.getProfessionals());
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    DataService.syncFromSupabase().then(() => {
      setProfessionals(DataService.getProfessionals());
    });
  }, []);

  const filtered = professionals.filter(
    (p) =>
      p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.role.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.specialization.some((s) => s.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  return (
    <div className="space-y-8">
      
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-stone-200 pb-6">
        <div>
          <h1 className="text-3xl font-extrabold text-stone-900 tracking-tight">
            Verified Lawyers & Financial Advisors
          </h1>
          <p className="text-stone-600 text-sm mt-1">
            Browse verified Advocates, Barristers, and Chartered Accountants providing public advice and private consultations.
          </p>
        </div>

        <div className="flex items-center gap-2 bg-emerald-50 text-emerald-800 border border-emerald-200 px-4 py-2 rounded-xl text-xs font-bold">
          <ShieldCheck className="w-4 h-4 text-emerald-600" />
          <span>Bar Council & ICAB Verified Profiles</span>
        </div>
      </div>

      {/* Search Input */}
      <div className="max-w-xl relative">
        <Search className="w-5 h-5 absolute left-3.5 top-1/2 -translate-y-1/2 text-stone-400" />
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Search by legal specialty, name, or city..."
          className="w-full bg-white border border-stone-300 rounded-xl pl-11 pr-4 py-3 text-sm text-stone-900 focus:outline-none focus:border-brand-coral focus:ring-2 focus:ring-brand-coral/20 shadow-sm"
        />
      </div>

      {/* Directory Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {filtered.map((prof) => (
          <div
            key={prof.id}
            className="bg-white border border-stone-200 rounded-3xl p-6 space-y-4 shadow-sm hover:shadow-coral transition-all card-hover-effect flex flex-col justify-between"
          >
            <div className="space-y-4">
              <div className="flex items-center gap-4">
                <img
                  src={prof.avatar || getDefaultAvatar(prof.name)}
                  alt={prof.name}
                  className="w-16 h-16 rounded-full object-cover border-2 border-brand-coral shrink-0 bg-white"
                />
                <div>
                  <div className="flex items-center gap-1.5 font-bold text-stone-900 text-base">
                    <span>{prof.name}</span>
                    <ShieldCheck className="w-4 h-4 text-emerald-600 fill-emerald-100" />
                  </div>
                  <div className="text-xs text-brand-coral font-semibold">{prof.role}</div>
                  <div className="text-xs text-stone-500 flex items-center gap-1 mt-0.5">
                    <MapPin className="w-3 h-3 text-stone-400" />
                    <span>{prof.location}</span>
                  </div>
                </div>
              </div>

              <p className="text-xs text-stone-600 leading-relaxed line-clamp-3">
                {prof.bio}
              </p>

              {/* Specializations */}
              <div className="flex flex-wrap gap-1.5 pt-1">
                {prof.specialization.map((spec, i) => (
                  <span
                    key={i}
                    className="bg-stone-100 text-stone-700 text-[11px] font-semibold px-2.5 py-1 rounded-md"
                  >
                    {spec}
                  </span>
                ))}
              </div>
            </div>

            {/* Footer & Fee */}
            <div className="pt-4 border-t border-stone-100 flex items-center justify-between mt-4 text-xs font-semibold">
              <div>
                <span className="text-amber-600 flex items-center gap-1 font-bold">
                  <Star className="w-3.5 h-3.5 fill-amber-500" /> {prof.rating} ({prof.reviewCount})
                </span>
                <span className="text-[11px] text-stone-500">{prof.answersCount} Queries Answered</span>
              </div>

              <Link
                href={`/professionals/${prof.id}`}
                className="bg-brand-coral hover:bg-brand-hover text-white px-4 py-2 rounded-xl text-xs font-bold shadow-coral transition-colors flex items-center gap-1"
              >
                <span>View & Book</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
