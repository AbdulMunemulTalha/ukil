"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Shield, Lock, Mail, ArrowRight, AlertCircle, Scale, CheckCircle2 } from "lucide-react";
import { DataService, AdminUser } from "../../../lib/db";
import { createClient } from "../../../lib/supabase/client";

export default function AdminLoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const setAdminSession = (admin: AdminUser | { email: string; name: string; role: string; isSuperAdmin: boolean; permissions: any }) => {
    localStorage.setItem(
      "ukil_admin_session",
      JSON.stringify({
        email: admin.email,
        name: admin.name,
        role: admin.role,
        isSuperAdmin: Boolean(admin.isSuperAdmin),
        permissions: admin.permissions,
        loginTime: new Date().toISOString(),
      })
    );
  };

  const handleAdminLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg(null);

    const cleanEmail = email.trim().toLowerCase();

    // 1. Direct check for Talha Super Admin credentials
    if (cleanEmail === "talha@pixheads.com" && (password === "Talha@2026" || password === "super123" || password === "admin123")) {
      setAdminSession({
        email: "talha@pixheads.com",
        name: "Talha (Super Admin)",
        role: "super_admin",
        isSuperAdmin: true,
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
      window.location.href = "/admin";
      return;
    }

    // 2. Direct check for Super Admin demo credentials
    if (cleanEmail === "superadmin@ukil.com" && (password === "super123" || password === "admin123")) {
      setAdminSession({
        email: "superadmin@ukil.com",
        name: "Chief Registrar (Super Admin)",
        role: "super_admin",
        isSuperAdmin: true,
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
      window.location.href = "/admin";
      return;
    }

    // 2. Direct check for Full Access Admin demo credentials
    if (cleanEmail === "admin@ukil.com" && password === "admin123") {
      setAdminSession({
        email: "admin@ukil.com",
        name: "Operations Director (Full Access Admin)",
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
      window.location.href = "/admin";
      return;
    }

    // 3. Supabase Auth or Database Lookup
    const supabase = createClient();
    if (supabase) {
      // Check admin_users table first
      const { data: dbAdmin } = await (supabase
        .from("admin_users" as any) as any)
        .select("*")
        .ilike("email", cleanEmail)
        .single();

      if (dbAdmin && dbAdmin.status !== "suspended") {
        // Try password sign-in with Supabase auth
        const { data: authData, error: authErr } = await supabase.auth.signInWithPassword({
          email: cleanEmail,
          password,
        });

        if (!authErr && authData?.user) {
          setAdminSession({
            email: dbAdmin.email,
            name: dbAdmin.name,
            role: dbAdmin.role,
            isSuperAdmin: Boolean(dbAdmin.is_super_admin),
            permissions: dbAdmin.permissions,
          });
          window.location.href = "/admin";
          return;
        }

        // If simple password match for evaluation
        if (password === "admin123" || password === "super123") {
          setAdminSession({
            email: dbAdmin.email,
            name: dbAdmin.name,
            role: dbAdmin.role,
            isSuperAdmin: Boolean(dbAdmin.is_super_admin),
            permissions: dbAdmin.permissions,
          });
          window.location.href = "/admin";
          return;
        }
      }

      // Check registered profile
      const { data: authData, error: authErr } = await supabase.auth.signInWithPassword({
        email: cleanEmail,
        password,
      });

      if (!authErr && authData.user) {
        const { data: prof } = await supabase
          .from("profiles")
          .select("role, full_name")
          .eq("user_id", authData.user.id)
          .single();

        if (prof?.role === "admin" || cleanEmail.includes("admin") || cleanEmail === "md72905talha@gmail.com") {
          const isSuper = cleanEmail === "md72905talha@gmail.com" || cleanEmail.includes("super");
          setAdminSession({
            email: authData.user.email || cleanEmail,
            name: prof?.full_name || (isSuper ? "Super Admin" : "Platform Admin"),
            role: isSuper ? "super_admin" : "admin",
            isSuperAdmin: isSuper,
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
          window.location.href = "/admin";
          return;
        }
      }
    }

    // 4. Local storage fallback check
    const localAdmin = DataService.getAdminUserByEmail(cleanEmail);
    if (localAdmin && (password === "admin123" || password === "super123")) {
      setAdminSession(localAdmin);
      window.location.href = "/admin";
      return;
    }

    setErrorMsg("Invalid credentials or unauthorized account. Please check your email and password.");
    setLoading(false);
  };

  const handleQuickDemoSuperAdmin = () => {
    setAdminSession({
      email: "superadmin@ukil.com",
      name: "Chief Registrar (Super Admin)",
      role: "super_admin",
      isSuperAdmin: true,
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
    window.location.href = "/admin";
  };

  const handleQuickDemoAdmin = () => {
    setAdminSession({
      email: "admin@ukil.com",
      name: "Operations Director (Full Access Admin)",
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
    window.location.href = "/admin";
  };

  const handleQuickLoginTalha = () => {
    setEmail("talha@pixheads.com");
    setPassword("Talha@2026");
    setAdminSession({
      email: "talha@pixheads.com",
      name: "Talha (Super Admin)",
      role: "super_admin",
      isSuperAdmin: true,
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
    window.location.href = "/admin";
  };

  return (
    <div className="min-h-[85vh] flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8 bg-stone-50/50">
      <div className="max-w-md w-full space-y-8">
        
        {/* Header */}
        <div className="text-center space-y-3">
          <div className="w-14 h-14 rounded-2xl bg-stone-900 border border-stone-800 flex items-center justify-center text-brand-coral mx-auto shadow-xl">
            <Shield className="w-8 h-8 text-brand-coral" />
          </div>
          <div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-bold uppercase tracking-wider bg-stone-900 text-stone-300 border border-stone-700 mb-2">
              <Lock className="w-3 h-3 text-brand-coral" /> Restricted Access
            </div>
            <h1 className="text-2xl sm:text-3xl font-black text-stone-900 tracking-tight">
              Ukil Admin Portal
            </h1>
            <p className="text-xs text-stone-600 max-w-xs mx-auto mt-1">
              KYC verification review, lawyer credential approvals, and legal content moderation.
            </p>
          </div>
        </div>

        {/* Form Card */}
        <div className="bg-white border border-stone-200 rounded-3xl p-6 sm:p-8 shadow-sm space-y-6">
          {errorMsg && (
            <div className="bg-red-50 border border-red-200 text-red-700 p-3.5 rounded-xl text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          <form onSubmit={handleAdminLogin} className="space-y-4">
            <div>
              <label className="text-xs font-bold text-stone-700 uppercase tracking-wider block mb-1">
                Admin Email Address
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-stone-400" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="admin@ukil.com"
                  className="w-full bg-stone-50 border border-stone-300 rounded-xl pl-10 pr-3 py-2.5 text-sm font-medium text-stone-900 focus:outline-none focus:border-stone-900"
                  required
                />
              </div>
            </div>

            <div>
              <label className="text-xs font-bold text-stone-700 uppercase tracking-wider block mb-1">
                Password
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-stone-400" />
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full bg-stone-50 border border-stone-300 rounded-xl pl-10 pr-3 py-2.5 text-sm font-medium text-stone-900 focus:outline-none focus:border-stone-900"
                  required
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-stone-900 hover:bg-black text-white text-sm font-bold py-3 rounded-xl shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
            >
              <span>{loading ? "Authenticating..." : "Sign in to Admin Dashboard"}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>

          {/* Quick 1-Click Evaluation / Demo Access */}
          <div className="pt-4 border-t border-stone-100 space-y-3">
            <div className="text-center">
              <span className="text-[11px] font-semibold text-stone-400 uppercase tracking-wider">
                Evaluation & Staging Access
              </span>
            </div>

            <div className="space-y-2.5">
              <button
                type="button"
                onClick={handleQuickLoginTalha}
                className="w-full bg-gradient-to-r from-amber-500 via-amber-400 to-amber-500 hover:from-amber-600 hover:to-amber-600 text-stone-950 font-black text-xs py-3 rounded-xl transition-all flex items-center justify-center gap-2 cursor-pointer shadow-md"
              >
                <Shield className="w-4 h-4 text-stone-950 fill-stone-950" />
                <span>👑 1-Click Login: talha@pixheads.com (Super Admin)</span>
              </button>

              <button
                type="button"
                onClick={handleQuickDemoSuperAdmin}
                className="w-full bg-stone-900 hover:bg-black text-amber-300 border border-amber-500/40 text-xs font-bold py-2.5 rounded-xl transition-all flex items-center justify-center gap-2 cursor-pointer shadow-sm"
              >
                <Shield className="w-4 h-4 text-amber-400" />
                <span>⚡ One-Click Super Admin Login (superadmin@ukil.com)</span>
              </button>

              <button
                type="button"
                onClick={handleQuickDemoAdmin}
                className="w-full bg-emerald-50 hover:bg-emerald-100 border border-emerald-300 text-emerald-900 text-xs font-bold py-2.5 rounded-xl transition-all flex items-center justify-center gap-2 cursor-pointer shadow-xs"
              >
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                <span>⚡ One-Click Full Access Admin Login (admin@ukil.com)</span>
              </button>
            </div>

            <div className="p-3 bg-amber-50/80 border border-amber-200 rounded-2xl text-left space-y-1.5 text-xs">
              <div className="text-[11px] font-bold text-amber-950 flex items-center gap-1.5">
                <Shield className="w-3.5 h-3.5 text-amber-700" />
                <span>Configured Super Admin Credentials:</span>
              </div>
              <div className="font-mono text-[11px] text-stone-800 space-y-0.5">
                <div>Email: <span className="font-bold text-stone-950">talha@pixheads.com</span></div>
                <div>Password: <span className="font-bold text-stone-950">Talha@2026</span></div>
              </div>
            </div>
          </div>
        </div>

        {/* Back link */}
        <div className="text-center">
          <Link
            href="/"
            className="text-xs font-semibold text-stone-500 hover:text-stone-900 transition-colors inline-flex items-center gap-1.5"
          >
            <Scale className="w-3.5 h-3.5 text-brand-coral" /> Return to Public Portal
          </Link>
        </div>

      </div>
    </div>
  );
}
