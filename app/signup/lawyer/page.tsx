"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Scale, ShieldCheck, Mail, Lock, User, Award, CheckCircle2, AlertCircle } from "lucide-react";
import { MOCK_CATEGORIES } from "../../../lib/mockData";
import { createClient } from "../../../lib/supabase/client";
import { getDefaultAvatar } from "../../../lib/avatar";

export default function LawyerSignupPage() {
  const router = useRouter();
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [barLicenseNo, setBarLicenseNo] = useState("");
  const [selectedSpecs, setSelectedSpecs] = useState<string[]>([
    "Anti-Corruption & Bribes",
    "Property & Land Law",
  ]);

  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState(false);

  const toggleSpec = (specName: string) => {
    if (selectedSpecs.includes(specName)) {
      setSelectedSpecs(selectedSpecs.filter((s) => s !== specName));
    } else {
      setSelectedSpecs([...selectedSpecs, specName]);
    }
  };

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg(null);

    const fullName = `${firstName.trim()} ${lastName.trim()}`.trim();
    if (!fullName) {
      setErrorMsg("Please enter both first and last name.");
      setLoading(false);
      return;
    }

    if (!barLicenseNo.trim()) {
      setErrorMsg("Please enter your Bar Council License or Registration Number.");
      setLoading(false);
      return;
    }

    const supabase = createClient();

    if (supabase) {
      // 1. Live Supabase Auth SignUp
      const { data, error } = await supabase.auth.signUp({
        email: email.trim(),
        password,
        options: {
          data: {
            full_name: fullName,
            role: "professional",
            bar_license_no: barLicenseNo.trim(),
          },
        },
      });

      if (error) {
        setErrorMsg(error.message);
        setLoading(false);
        return;
      }

      // 2. Insert Profile with only registered fields
      if (data.user) {
        const defaultAvatar = getDefaultAvatar(fullName);

        await supabase.from("profiles").insert({
          user_id: data.user.id,
          role: "professional",
          full_name: fullName,
          email: email.trim(),
          bar_license_no: barLicenseNo.trim(),
          specializations: selectedSpecs,
          phone: "",
          location: "",
          hourly_fee: "",
          bio: "",
          avatar_url: defaultAvatar,
          is_verified: true,
        });
      }
    }

    setLoading(false);
    setSuccessMsg(true);
    setTimeout(() => {
      router.push("/dashboard");
    }, 2000);
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6 pt-4 pb-12">
      
      {/* Header */}
      <div className="text-center space-y-3">
        <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-brand-coral to-red-600 flex items-center justify-center text-white mx-auto shadow-coral">
          <Scale className="w-7 h-7" />
        </div>
        <h1 className="text-3xl font-extrabold text-stone-900 tracking-tight">
          Register as Verified Lawyer / Advisor
        </h1>
        <p className="text-stone-600 text-sm max-w-md mx-auto">
          Create your professional advocate account. You can complete your chamber location, contact details, and photo inside your dashboard after registering.
        </p>
      </div>

      {/* Form Card */}
      <div className="bg-white border border-stone-200 rounded-3xl p-6 sm:p-10 shadow-sm space-y-6">
        
        {successMsg && (
          <div className="bg-emerald-50 border border-emerald-200 text-emerald-800 p-5 rounded-2xl space-y-2 text-center animate-in fade-in">
            <CheckCircle2 className="w-8 h-8 text-emerald-600 mx-auto" />
            <h3 className="font-bold text-lg">Account Created Successfully!</h3>
            <p className="text-xs text-emerald-700">
              Welcome Advocate {firstName} {lastName}! Redirecting to your Lawyer Portal Dashboard...
            </p>
          </div>
        )}

        {errorMsg && (
          <div className="bg-red-50 border border-red-200 text-red-700 p-4 rounded-xl flex items-center gap-2 text-sm animate-in fade-in">
            <AlertCircle className="w-5 h-5 shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}

        <form onSubmit={handleSignup} className="space-y-5">
          
          {/* First Name & Last Name */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-bold text-stone-800 uppercase tracking-wider block mb-1">
                First Name
              </label>
              <div className="relative">
                <User className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-stone-400" />
                <input
                  type="text"
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                  placeholder="e.g. Mahmud"
                  className="w-full bg-stone-50 border border-stone-300 rounded-xl pl-10 pr-3 py-2.5 text-sm font-medium focus:outline-none focus:border-brand-coral"
                  required
                />
              </div>
            </div>

            <div>
              <label className="text-xs font-bold text-stone-800 uppercase tracking-wider block mb-1">
                Last Name
              </label>
              <div className="relative">
                <User className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-stone-400" />
                <input
                  type="text"
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                  placeholder="e.g. Hasan"
                  className="w-full bg-stone-50 border border-stone-300 rounded-xl pl-10 pr-3 py-2.5 text-sm font-medium focus:outline-none focus:border-brand-coral"
                  required
                />
              </div>
            </div>
          </div>

          {/* Email Address */}
          <div>
            <label className="text-xs font-bold text-stone-800 uppercase tracking-wider block mb-1">
              Email Address
            </label>
            <div className="relative">
              <Mail className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-stone-400" />
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="lawyer@chamber.com"
                className="w-full bg-stone-50 border border-stone-300 rounded-xl pl-10 pr-3 py-2.5 text-sm font-medium focus:outline-none focus:border-brand-coral"
                required
              />
            </div>
          </div>

          {/* Password */}
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
                placeholder="•••••••• (Min. 6 characters)"
                className="w-full bg-stone-50 border border-stone-300 rounded-xl pl-10 pr-3 py-2.5 text-sm font-medium focus:outline-none focus:border-brand-coral"
                minLength={6}
                required
              />
            </div>
          </div>

          {/* Bar License / Registration No. */}
          <div>
            <label className="text-xs font-bold text-stone-800 uppercase tracking-wider block mb-1">
              Bar License / Registration No.
            </label>
            <div className="relative">
              <Award className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-stone-400" />
              <input
                type="text"
                value={barLicenseNo}
                onChange={(e) => setBarLicenseNo(e.target.value)}
                placeholder="e.g. DBA-9812-SC or Bar Roll No."
                className="w-full bg-stone-50 border border-stone-300 rounded-xl pl-10 pr-3 py-2.5 text-sm font-mono font-bold focus:outline-none focus:border-brand-coral"
                required
              />
            </div>
            <p className="text-[11px] text-stone-500 mt-1">
              Used to display your verified Bar Council enrollment seal under citizen advice.
            </p>
          </div>

          {/* Practice Specializations (Click to select/unselect) */}
          <div className="space-y-2 pt-2 border-t border-stone-100">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold text-stone-800 uppercase tracking-wider block">
                Practice Specializations (Click to select/unselect):
              </label>
              <span className="text-[11px] text-stone-500">
                {selectedSpecs.length} selected
              </span>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {MOCK_CATEGORIES.map((cat) => {
                const isSelected = selectedSpecs.includes(cat.name);
                return (
                  <button
                    type="button"
                    key={cat.id}
                    onClick={() => toggleSpec(cat.name)}
                    className={`px-3 py-2 rounded-xl text-xs font-semibold text-left border transition-all flex items-center justify-between cursor-pointer ${
                      isSelected
                        ? "bg-brand-light text-brand-coral border-brand-coral font-bold shadow-2xs"
                        : "bg-stone-50 text-stone-700 border-stone-200 hover:bg-stone-100"
                    }`}
                  >
                    <span>{cat.icon} {cat.name}</span>
                    {isSelected && <span className="text-brand-coral font-bold">✓</span>}
                  </button>
                );
              })}
            </div>
          </div>

          <p className="text-xs text-stone-500 bg-stone-50 p-3 rounded-xl border border-stone-200">
            💡 <strong>Next Step:</strong> After completing signup, you can configure your chamber address, consultation rates, contact number, and custom portrait in your dashboard.
          </p>

          {/* Submit */}
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-brand-coral hover:bg-brand-hover text-white font-bold py-3.5 rounded-xl shadow-coral flex items-center justify-center gap-2 text-base transition-all transform active:scale-95 disabled:opacity-50 cursor-pointer"
          >
            <ShieldCheck className="w-5 h-5" />
            <span>{loading ? "Registering Advocate Account..." : "Complete Lawyer Registration"}</span>
          </button>
        </form>

        <div className="text-center text-xs text-stone-500 pt-2">
          Already registered as a lawyer?{" "}
          <Link href="/login/lawyer" className="text-brand-coral font-bold hover:underline">
            Log in to Lawyer Portal
          </Link>
        </div>
      </div>
    </div>
  );
}
