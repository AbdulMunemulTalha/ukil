"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Scale, Mail, Lock, ShieldCheck, ArrowRight, AlertCircle } from "lucide-react";
import { createClient } from "../../../lib/supabase/client";

export default function LawyerLoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg(null);

    const supabase = createClient();

    if (supabase) {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        setErrorMsg(error.message);
        setLoading(false);
        return;
      }
    }

    setLoading(false);
    window.location.href = "/dashboard";
  };

  return (
    <div className="max-w-md mx-auto space-y-6 pt-8 pb-12">
      
      <div className="text-center space-y-3">
        <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-brand-coral to-red-600 flex items-center justify-center text-white mx-auto shadow-coral">
          <Scale className="w-7 h-7" />
        </div>
        <h1 className="text-2xl font-extrabold text-stone-900 tracking-tight">
          Lawyer Portal Login
        </h1>
        <p className="text-xs text-stone-600">
          Access your advocate dashboard to answer client queries and manage consultations.
        </p>
      </div>

      <div className="bg-white border border-stone-200 rounded-3xl p-6 sm:p-8 shadow-sm space-y-5">
        
        {errorMsg && (
          <div className="bg-red-50 border border-red-200 text-red-700 p-3.5 rounded-xl flex items-center gap-2 text-xs">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}

        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <label className="text-xs font-bold text-stone-800 uppercase tracking-wider block mb-1">
              Lawyer Email Address
            </label>
            <div className="relative">
              <Mail className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-stone-400" />
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="advocate@chamber.com"
                className="w-full bg-stone-50 border border-stone-300 rounded-xl pl-10 pr-3 py-2.5 text-sm font-medium"
                required
              />
            </div>
          </div>

          <div>
            <label className="text-xs font-bold text-stone-800 uppercase tracking-wider block mb-1">
              Password
            </label>
            <div className="relative">
              <Lock className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-stone-400" />
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full bg-stone-50 border border-stone-300 rounded-xl pl-10 pr-3 py-2.5 text-sm font-medium"
                required
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-brand-coral hover:bg-brand-hover text-white font-bold py-3.5 rounded-xl shadow-coral flex items-center justify-center gap-2 text-sm transition-all transform active:scale-95 disabled:opacity-50 mt-2"
          >
            <ShieldCheck className="w-4 h-4" />
            <span>{loading ? "Authenticating..." : "Log In to Lawyer Portal"}</span>
          </button>
        </form>

        <div className="text-center text-xs text-stone-500 pt-2 border-t border-stone-100">
          Don&apos;t have a professional account?{" "}
          <Link href="/signup/lawyer" className="text-brand-coral font-bold hover:underline">
            Register as a Lawyer
          </Link>
        </div>
      </div>
    </div>
  );
}
