import Link from "next/link";
import { Scale, PhoneCall, AlertTriangle, ShieldCheck } from "lucide-react";

export default function Footer() {
  return (
    <footer className="bg-stone-900 text-stone-300 border-t border-stone-800 pt-12 pb-8 mt-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-10">
          
          {/* Brand & Purpose */}
          <div className="space-y-4 md:col-span-1">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-lg bg-brand-coral flex items-center justify-center text-white font-bold">
                <Scale className="w-5 h-5" />
              </div>
              <span className="font-extrabold text-xl text-white tracking-tight">UKIL</span>
            </div>
            <p className="text-sm text-stone-400 leading-relaxed">
              Empowering citizens with barrier-free legal advice, anti-corruption guidance, and financial solutions connecting regular people with verified professionals.
            </p>
          </div>

          {/* Core Categories */}
          <div>
            <h3 className="text-white font-semibold text-sm mb-4 tracking-wider uppercase">Categories</h3>
            <ul className="space-y-2.5 text-sm text-stone-400">
              <li><Link href="/questions?category=bribes" className="hover:text-brand-coral transition-colors">Anti-Corruption & Bribes</Link></li>
              <li><Link href="/questions?category=property" className="hover:text-brand-coral transition-colors">Property & Land Law</Link></li>
              <li><Link href="/questions?category=tax" className="hover:text-brand-coral transition-colors">Tax & NBR Appeals</Link></li>
              <li><Link href="/questions?category=employment" className="hover:text-brand-coral transition-colors">Labour & Employment</Link></li>
              <li><Link href="/questions?category=family" className="hover:text-brand-coral transition-colors">Family & Inheritance</Link></li>
            </ul>
          </div>

          {/* Quick Actions */}
          <div>
            <h3 className="text-white font-semibold text-sm mb-4 tracking-wider uppercase">Platform Links</h3>
            <ul className="space-y-2.5 text-sm text-stone-400">
              <li><Link href="/ask" className="hover:text-brand-coral transition-colors">Submit Issue (No Signup)</Link></li>
              <li><Link href="/track" className="hover:text-brand-coral transition-colors">Track Submission Status</Link></li>
              <li><Link href="/professionals" className="hover:text-brand-coral transition-colors">Directory of Lawyers</Link></li>
              <li><Link href="/dashboard" className="hover:text-brand-coral transition-colors">Lawyer Portal Login</Link></li>
            </ul>
          </div>

          {/* Government Helplines */}
          <div className="bg-stone-800/60 p-4 rounded-xl border border-stone-700/60 space-y-3">
            <div className="flex items-center gap-2 text-brand-coral font-bold text-sm">
              <PhoneCall className="w-4 h-4" />
              <span>Emergency Helplines</span>
            </div>
            <div className="text-xs text-stone-300 space-y-1.5">
              <p><strong className="text-white">ACC Hotline:</strong> 106 (Anti-Corruption)</p>
              <p><strong className="text-white">Legal Aid:</strong> 16430 (National Legal Services)</p>
              <p><strong className="text-white">National Helpline:</strong> 999 (Emergency)</p>
              <p><strong className="text-white">Consumer Protection:</strong> 16121 (DNCRP)</p>
            </div>
          </div>
        </div>

        {/* Disclaimer & Copyright */}
        <div className="border-t border-stone-800 pt-6 flex flex-col md:flex-row justify-between items-center gap-4 text-xs text-stone-500">
          <div className="flex items-center gap-2 text-center md:text-left">
            <AlertTriangle className="w-4 h-4 text-amber-500 shrink-0" />
            <span>
              Disclaimer: Public Q&A provides general legal literacy. Formal court representation requires direct engagement with a licensed advocate.
            </span>
          </div>
          <p>© {new Date().getFullYear()} Ukil Platform. All Rights Reserved.</p>
        </div>
      </div>
    </footer>
  );
}
