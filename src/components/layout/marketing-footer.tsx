import Link from "next/link";
import { Mic, ShieldCheck, Heart } from "lucide-react";

export function MarketingFooter() {
  return (
    <footer className="border-t border-slate-200 bg-slate-50/50 py-12 dark:border-slate-800 dark:bg-slate-950/50 transition-colors">
      <div className="container mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-5 gap-8 mb-12">
          {/* Brand Info */}
          <div className="md:col-span-2 space-y-4">
            <Link href="/" className="flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-rose-600 text-white">
                <Mic className="h-4 w-4" />
              </div>
              <span className="text-lg font-bold tracking-tight text-slate-900 dark:text-white">
                HuáVocal <span className="text-rose-600">AI</span>
              </span>
            </Link>
            <p className="text-sm text-slate-600 dark:text-slate-400 max-w-sm leading-relaxed">
              Standardized AI-powered oral Chinese language proficiency assessment. Conduct authentic full-length spoken Mandarin conversations and receive psychometrically grounded diagnostics.
            </p>
            <div className="flex items-center gap-2 text-xs text-slate-500">
              <ShieldCheck className="h-4 w-4 text-emerald-600" />
              <span>Full Conversation Linguistic Analysis &bull; Evidence-based Scoring</span>
            </div>
          </div>

          {/* Product */}
          <div>
            <h4 className="text-sm font-semibold text-slate-900 dark:text-white mb-3">Product</h4>
            <ul className="space-y-2 text-sm text-slate-600 dark:text-slate-400">
              <li>
                <Link href="/features" className="hover:text-rose-600 dark:hover:text-rose-400 transition-colors">
                  AI Examiner
                </Link>
              </li>
              <li>
                <Link href="/features#scoring" className="hover:text-rose-600 dark:hover:text-rose-400 transition-colors">
                  7-Dimension Scoring
                </Link>
              </li>
              <li>
                <Link href="/pricing" className="hover:text-rose-600 dark:hover:text-rose-400 transition-colors">
                  Subscription Plans
                </Link>
              </li>
              <li>
                <Link href="/login" className="hover:text-rose-600 dark:hover:text-rose-400 transition-colors">
                  Institutional Portal
                </Link>
              </li>
            </ul>
          </div>

          {/* Educational */}
          <div>
            <h4 className="text-sm font-semibold text-slate-900 dark:text-white mb-3">Education</h4>
            <ul className="space-y-2 text-sm text-slate-600 dark:text-slate-400">
              <li>
                <Link href="/about" className="hover:text-rose-600 dark:hover:text-rose-400 transition-colors">
                  Oral Assessment Standards
                </Link>
              </li>
              <li>
                <Link href="/about#cefr-hsk" className="hover:text-rose-600 dark:hover:text-rose-400 transition-colors">
                  CEFR & HSK Benchmarks
                </Link>
              </li>
              <li>
                <Link href="/faq" className="hover:text-rose-600 dark:hover:text-rose-400 transition-colors">
                  Pronunciation Diagnostics
                </Link>
              </li>
              <li>
                <Link href="/faq" className="hover:text-rose-600 dark:hover:text-rose-400 transition-colors">
                  Assessment FAQ
                </Link>
              </li>
            </ul>
          </div>

          {/* Legal */}
          <div>
            <h4 className="text-sm font-semibold text-slate-900 dark:text-white mb-3">Legal & Trust</h4>
            <ul className="space-y-2 text-sm text-slate-600 dark:text-slate-400">
              <li>
                <Link href="/privacy" className="hover:text-rose-600 dark:hover:text-rose-400 transition-colors">
                  Privacy Policy
                </Link>
              </li>
              <li>
                <Link href="/terms" className="hover:text-rose-600 dark:hover:text-rose-400 transition-colors">
                  Terms of Service
                </Link>
              </li>
              <li>
                <Link href="/privacy#voice-data" className="hover:text-rose-600 dark:hover:text-rose-400 transition-colors">
                  Audio Data Retention
                </Link>
              </li>
              <li>
                <Link href="/about#disclaimer" className="hover:text-rose-600 dark:hover:text-rose-400 transition-colors">
                  Certification Disclaimer
                </Link>
              </li>
            </ul>
          </div>
        </div>

        {/* Disclaimer & Bottom Bar */}
        <div className="pt-8 border-t border-slate-200 dark:border-slate-800 text-xs text-slate-500 flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="max-w-2xl leading-relaxed text-center md:text-left">
            <span className="font-semibold text-slate-600 dark:text-slate-400">Notice:</span> HuáVocal AI provides unofficial educational diagnostic estimates aligned with CEFR and HSK proficiency rubrics. HuáVocal AI is not affiliated with or endorsed by Chinese Testing International (CTI) or the Ministry of Education of China.
          </p>
          <div className="flex items-center gap-1 text-slate-500">
            <span>&copy; {new Date().getFullYear()} HuáVocal AI. All rights reserved.</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
