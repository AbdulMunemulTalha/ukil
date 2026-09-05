"use client";

import Link from "next/link";
import { useState, useEffect } from "react";
import { Scale, PlusCircle, ShieldCheck, UserCheck, Menu, X, LogOut, LayoutDashboard } from "lucide-react";
import { createClient } from "../../lib/supabase/client";

interface NavbarProps {
  onOpenSubmitModal?: () => void;
}

export default function Navbar({ onOpenSubmitModal }: NavbarProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [lawyerProfile, setLawyerProfile] = useState<{
    id: string;
    fullName: string;
    avatarUrl?: string;
    licenseNo?: string;
  } | null>(null);

  useEffect(() => {
    const supabase = createClient();
    if (!supabase) return;

    const fetchProfile = async (userId: string) => {
      try {
        const { data } = await supabase
          .from("profiles")
          .select("id, full_name, avatar_url, bar_license_no")
          .eq("user_id", userId)
          .single();

        if (data) {
          setLawyerProfile({
            id: data.id,
            fullName: data.full_name,
            avatarUrl: data.avatar_url || undefined,
            licenseNo: data.bar_license_no || undefined,
          });
        } else {
          setLawyerProfile({
            id: userId,
            fullName: "Advocate",
          });
        }
      } catch (e) {
        setLawyerProfile({
          id: userId,
          fullName: "Advocate",
        });
      }
    };

    supabase.auth.getUser().then(({ data: { user } }) => {
      if (user) {
        fetchProfile(user.id);
      } else {
        setLawyerProfile(null);
      }
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session?.user) {
        fetchProfile(session.user.id);
      } else {
        setLawyerProfile(null);
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const handleLogout = async () => {
    const supabase = createClient();
    if (supabase) {
      await supabase.auth.signOut();
      setLawyerProfile(null);
      window.location.href = "/";
    }
  };

  return (
    <header className="sticky top-0 z-50 bg-white/90 backdrop-blur-md border-b border-surface-border shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          
          {/* Brand Logo */}
          <Link href="/" className="flex items-center gap-3 group">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-brand-coral to-red-600 flex items-center justify-center text-white shadow-coral font-extrabold text-xl group-hover:scale-105 transition-transform">
              <Scale className="w-6 h-6" />
            </div>
            <div>
              <span className="font-extrabold text-xl tracking-tight text-stone-900 block leading-none">
                UKIL
              </span>
              <span className="text-[10px] font-semibold tracking-wider text-brand-coral uppercase">
                NO-SIGNUP Q&A
              </span>
            </div>
          </Link>

          {/* Desktop Nav Links */}
          <nav className="hidden md:flex items-center gap-6 text-sm font-medium text-stone-600">
            <Link href="/" className="hover:text-brand-coral transition-colors">
              Public Feed
            </Link>
            <Link href="/questions" className="hover:text-brand-coral transition-colors">
              All Queries
            </Link>
            <Link href="/professionals" className="hover:text-brand-coral transition-colors flex items-center gap-1">
              <ShieldCheck className="w-4 h-4 text-emerald-600" /> Verified Experts
            </Link>
            <Link href="/track" className="hover:text-brand-coral transition-colors">
              Track Issue
            </Link>
          </nav>

          {/* Action Area */}
          <div className="hidden md:flex items-center gap-3">
            {/* Dynamic Lawyer Button: Dashboard if logged in, otherwise Lawyer Login */}
            {lawyerProfile ? (
              <div className="flex items-center gap-2">
                <Link
                  href="/dashboard"
                  className="text-xs font-bold px-3.5 py-2 rounded-xl border border-brand-border bg-brand-light hover:bg-brand-coral hover:text-white transition-all flex items-center gap-2 text-brand-coral shadow-2xs group"
                >
                  {lawyerProfile.avatarUrl ? (
                    <img
                      src={lawyerProfile.avatarUrl}
                      alt={lawyerProfile.fullName || "Lawyer"}
                      className="w-5 h-5 rounded-full object-cover border border-brand-coral shrink-0"
                    />
                  ) : (
                    <div className="w-5 h-5 rounded-full bg-brand-coral text-white flex items-center justify-center text-[10px] font-extrabold group-hover:bg-white group-hover:text-brand-coral shrink-0">
                      {lawyerProfile.fullName ? lawyerProfile.fullName.charAt(0) : "A"}
                    </div>
                  )}
                  <LayoutDashboard className="w-3.5 h-3.5" />
                  <span>Dashboard</span>
                  <span className="hidden lg:inline text-[10px] bg-white/80 group-hover:bg-white/20 px-1.5 py-0.5 rounded text-stone-600 group-hover:text-white font-medium max-w-[100px] truncate">
                    {lawyerProfile.fullName.split(" ")[0]}
                  </span>
                </Link>

                <button
                  type="button"
                  onClick={handleLogout}
                  title="Sign out of Lawyer Portal"
                  className="text-stone-400 hover:text-stone-700 p-2 rounded-xl hover:bg-stone-100 transition-colors"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <Link
                href="/login/lawyer"
                className="text-xs font-bold px-3 py-2 rounded-xl border border-stone-200 bg-stone-50 hover:bg-stone-100 transition-colors flex items-center gap-1.5 text-stone-700"
              >
                <UserCheck className="w-3.5 h-3.5 text-brand-coral" />
                <span>Lawyer Login</span>
              </Link>
            )}

            {/* Main Ask CTA */}
            {onOpenSubmitModal ? (
              <button
                onClick={onOpenSubmitModal}
                className="bg-brand-coral hover:bg-brand-hover text-white text-xs sm:text-sm font-semibold px-4 py-2 rounded-xl shadow-coral flex items-center gap-2 transition-all transform active:scale-95"
              >
                <PlusCircle className="w-4 h-4" />
                <span>Ask Query / Report Issue</span>
              </button>
            ) : (
              <Link
                href="/ask"
                className="bg-brand-coral hover:bg-brand-hover text-white text-xs sm:text-sm font-semibold px-4 py-2 rounded-xl shadow-coral flex items-center gap-2 transition-all transform active:scale-95"
              >
                <PlusCircle className="w-4 h-4" />
                <span>Ask Query / Report Issue</span>
              </Link>
            )}
          </div>

          {/* Mobile Menu Toggle */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden p-2 rounded-lg text-stone-600 hover:bg-stone-100"
          >
            {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-stone-200 bg-white px-4 pt-3 pb-6 space-y-3">
          <Link
            href="/"
            onClick={() => setMobileMenuOpen(false)}
            className="block px-3 py-2 rounded-lg text-base font-medium text-stone-700 hover:bg-brand-light hover:text-brand-coral"
          >
            Public Feed
          </Link>
          <Link
            href="/questions"
            onClick={() => setMobileMenuOpen(false)}
            className="block px-3 py-2 rounded-lg text-base font-medium text-stone-700 hover:bg-brand-light hover:text-brand-coral"
          >
            All Queries
          </Link>
          <Link
            href="/professionals"
            onClick={() => setMobileMenuOpen(false)}
            className="block px-3 py-2 rounded-lg text-base font-medium text-stone-700 hover:bg-brand-light hover:text-brand-coral"
          >
            Verified Experts
          </Link>
          <Link
            href="/track"
            onClick={() => setMobileMenuOpen(false)}
            className="block px-3 py-2 rounded-lg text-base font-medium text-stone-700 hover:bg-brand-light hover:text-brand-coral"
          >
            Track My Issue
          </Link>

          {/* Mobile Lawyer Auth Section */}
          {lawyerProfile ? (
            <div className="pt-2 border-t border-stone-100 space-y-2">
              <Link
                href="/dashboard"
                onClick={() => setMobileMenuOpen(false)}
                className="flex items-center justify-between px-3 py-2.5 rounded-xl text-base font-bold text-brand-coral bg-brand-light border border-brand-border"
              >
                <span className="flex items-center gap-2">
                  {lawyerProfile.avatarUrl ? (
                    <img
                      src={lawyerProfile.avatarUrl}
                      alt={lawyerProfile.fullName || "Lawyer"}
                      className="w-5 h-5 rounded-full object-cover border border-brand-coral shrink-0"
                    />
                  ) : (
                    <LayoutDashboard className="w-5 h-5 text-brand-coral" />
                  )}
                  <span>Lawyer Dashboard ({lawyerProfile.fullName})</span>
                </span>
                <span className="text-[10px] bg-brand-coral text-white px-2 py-0.5 rounded-full uppercase tracking-wider">Active</span>
              </Link>
              <button
                type="button"
                onClick={() => {
                  handleLogout();
                  setMobileMenuOpen(false);
                }}
                className="w-full text-left px-3 py-2 text-sm text-stone-600 hover:text-red-600 flex items-center gap-2"
              >
                <LogOut className="w-4 h-4 text-stone-400" /> Sign Out
              </button>
            </div>
          ) : (
            <Link
              href="/login/lawyer"
              onClick={() => setMobileMenuOpen(false)}
              className="flex items-center gap-2 px-3 py-2 rounded-lg text-base font-medium text-stone-700 hover:bg-brand-light hover:text-brand-coral"
            >
              <UserCheck className="w-4 h-4 text-brand-coral" />
              <span>Lawyer Login</span>
            </Link>
          )}

          <div className="pt-2">
            <Link
              href="/ask"
              onClick={() => setMobileMenuOpen(false)}
              className="w-full bg-brand-coral text-white py-2.5 rounded-xl font-semibold flex items-center justify-center gap-2 shadow-coral"
            >
              <PlusCircle className="w-5 h-5" />
              Ask Query / Report Issue
            </Link>
          </div>
        </div>
      )}
    </header>
  );
}
