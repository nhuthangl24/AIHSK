import Link from "next/link";
import { Mic, BarChart3, Users, BookOpen, Volume2, ShieldCheck, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

export default function FeaturesPage() {
  return (
    <div className="py-16 md:py-24">
      <div className="container mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 space-y-20">
        {/* Header */}
        <div className="text-center max-w-3xl mx-auto space-y-4">
          <Badge variant="cinnabar">Platform Capabilities</Badge>
          <h1 className="text-4xl sm:text-5xl font-extrabold tracking-tight text-slate-900 dark:text-white">
            Designed for Rigorous Oral Chinese Assessment
          </h1>
          <p className="text-lg text-slate-600 dark:text-slate-400">
            A comprehensive suite of voice AI, applied linguistics, psychometrics, and educational cohort tools.
          </p>
        </div>

        {/* Feature Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <Card className="border-slate-200 dark:border-slate-800">
            <CardContent className="p-8 space-y-4">
              <div className="h-12 w-12 rounded-xl bg-rose-50 text-rose-600 dark:bg-rose-950/50 flex items-center justify-center">
                <Mic className="h-6 w-6" />
              </div>
              <h3 className="text-xl font-bold text-slate-900 dark:text-white">
                5-Stage Adaptive AI Examiner
              </h3>
              <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
                The AI Examiner conducts a full-length, structured oral exam with authentic Mandarin pronunciation, dynamic difficulty scaling, and probing follow-ups that elicit true candidate competence.
              </p>
            </CardContent>
          </Card>

          <Card className="border-slate-200 dark:border-slate-800">
            <CardContent className="p-8 space-y-4">
              <div className="h-12 w-12 rounded-xl bg-blue-50 text-blue-600 dark:bg-blue-950/50 flex items-center justify-center">
                <BarChart3 className="h-6 w-6" />
              </div>
              <h3 className="text-xl font-bold text-slate-900 dark:text-white">
                Full-Dialogue Psychometric Scoring
              </h3>
              <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
                Scores are never based on isolated fragments. Our deterministic engine aggregates all conversational turns across 7 dimensions: Pronunciation, Fluency, Vocabulary, Grammar, Coherence, Comprehension, and Interaction.
              </p>
            </CardContent>
          </Card>

          <Card className="border-slate-200 dark:border-slate-800">
            <CardContent className="p-8 space-y-4">
              <div className="h-12 w-12 rounded-xl bg-emerald-50 text-emerald-600 dark:bg-emerald-950/50 flex items-center justify-center">
                <Volume2 className="h-6 w-6" />
              </div>
              <h3 className="text-xl font-bold text-slate-900 dark:text-white">
                Tone Sandhi & Acoustic Diagnostics
              </h3>
              <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
                Detects critical third-tone sandhi (三声变调), retroflex articulation (zh, ch, sh), and pause durations at syntactic boundaries to provide genuine actionable pronunciation coaching.
              </p>
            </CardContent>
          </Card>

          <Card className="border-slate-200 dark:border-slate-800">
            <CardContent className="p-8 space-y-4">
              <div className="h-12 w-12 rounded-xl bg-purple-50 text-purple-600 dark:bg-purple-950/50 flex items-center justify-center">
                <BookOpen className="h-6 w-6" />
              </div>
              <h3 className="text-xl font-bold text-slate-900 dark:text-white">
                Evidence-Grounded Corrections
              </h3>
              <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
                Every claim in your report is substantiated by verbatim quotes from your exam. Grammar tables compare your original sentence against elevated, natural phrasing with applied grammatical rules.
              </p>
            </CardContent>
          </Card>

          <Card className="border-slate-200 dark:border-slate-800">
            <CardContent className="p-8 space-y-4">
              <div className="h-12 w-12 rounded-xl bg-amber-50 text-amber-600 dark:bg-amber-950/50 flex items-center justify-center">
                <Users className="h-6 w-6" />
              </div>
              <h3 className="text-xl font-bold text-slate-900 dark:text-white">
                Teacher Classrooms & Assignments
              </h3>
              <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
                Educators can create class cohorts, dispatch oral assignments with deadlines, review full student audio transcripts, compare cohort score distributions, and export gradebooks to CSV.
              </p>
            </CardContent>
          </Card>

          <Card className="border-slate-200 dark:border-slate-800">
            <CardContent className="p-8 space-y-4">
              <div className="h-12 w-12 rounded-xl bg-teal-50 text-teal-600 dark:bg-teal-950/50 flex items-center justify-center">
                <ShieldCheck className="h-6 w-6" />
              </div>
              <h3 className="text-xl font-bold text-slate-900 dark:text-white">
                Multi-Tenant Enterprise Isolation
              </h3>
              <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
                Universities and language institutes enjoy strict server-enforced tenant isolation, seat allocation controls, audit logging, and full compliance with audio privacy standards.
              </p>
            </CardContent>
          </Card>
        </div>

        {/* CTA */}
        <div className="rounded-3xl bg-slate-900 text-white p-10 md:p-14 text-center space-y-6">
          <h2 className="text-3xl font-extrabold">Ready to evaluate your spoken Chinese?</h2>
          <p className="text-slate-400 max-w-xl mx-auto text-sm sm:text-base">
            Join hundreds of candidates benchmarking their oral Mandarin with HuáVocal AI.
          </p>
          <Link href="/register">
            <Button size="lg" className="bg-rose-600 hover:bg-rose-700 text-white font-semibold">
              Get Started Free &rarr;
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
