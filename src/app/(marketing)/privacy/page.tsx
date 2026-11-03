import { Badge } from "@/components/ui/badge";

export default function PrivacyPage() {
  return (
    <div className="py-16 md:py-24">
      <div className="container mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 space-y-8 text-slate-700 dark:text-slate-300 text-sm leading-relaxed">
        <div className="space-y-3">
          <Badge variant="cinnabar">Privacy & Trust</Badge>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 dark:text-white">
            Privacy Policy & Voice Data Governance
          </h1>
          <p className="text-xs text-slate-500">Last updated: November 2026</p>
        </div>

        <section className="space-y-3 pt-4 border-t border-slate-200 dark:border-slate-800">
          <h2 className="text-lg font-bold text-slate-900 dark:text-white">1. Audio Recordings & Voice Privacy</h2>
          <p>
            When you complete an assessment on HuáVocal AI, your device captures audio of your spoken responses. This audio is processed solely for acoustic analysis, speech-to-text transcription, tone contour extraction, and diagnostic report generation.
          </p>
          <p>
            We do NOT sell, license, or publish your audio recordings. We do NOT use learner voice data for external general AI model pre-training without explicit opt-in consent.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="text-lg font-bold text-slate-900 dark:text-white">2. Access Controls & Tenant Isolation</h2>
          <p>
            Your audio recordings and conversation transcripts are accessible only to you, authorized instructors managing your enrolled classes, and administrators within your verified educational organization. Strict server-side authorization middleware prevents unauthorized cross-tenant access.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="text-lg font-bold text-slate-900 dark:text-white">3. Data Retention and Deletion</h2>
          <p>
            Users have the full right to delete individual assessment audio recordings or request complete account deletion at any time from their profile settings. Audio files stored in our S3-compatible storage tier are purged immediately upon deletion request.
          </p>
        </section>
      </div>
    </div>
  );
}
