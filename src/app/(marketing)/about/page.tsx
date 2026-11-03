import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { ShieldCheck, BookOpen, Award, CheckCircle2 } from "lucide-react";

export default function AboutPage() {
  return (
    <div className="py-16 md:py-24">
      <div className="container mx-auto max-w-5xl px-4 sm:px-6 lg:px-8 space-y-16">
        <div className="text-center space-y-4">
          <Badge variant="cinnabar">Our Assessment Philosophy</Badge>
          <h1 className="text-4xl sm:text-5xl font-extrabold tracking-tight text-slate-900 dark:text-white">
            Educational Rigor in AI Oral Assessment
          </h1>
          <p className="text-lg text-slate-600 dark:text-slate-400 max-w-2xl mx-auto leading-relaxed">
            HuáVocal AI was created to solve a critical gap in language education: evaluating conversational speaking proficiency holistically rather than grading disjointed sentences.
          </p>
        </div>

        <div className="space-y-8 text-slate-700 dark:text-slate-300 leading-relaxed text-sm sm:text-base">
          <Card className="border-slate-200 dark:border-slate-800">
            <CardContent className="p-8 space-y-4">
              <h2 className="text-2xl font-bold text-slate-900 dark:text-white">
                Why Full-Length Conversation Matters
              </h2>
              <p>
                In standard language testing, a candidate who prepares a single rehearsed sentence may appear fluent for five seconds, but fail when asked to substantiate a point, navigate counterarguments, or sustain dialogue over five conversational stages.
              </p>
              <p>
                HuáVocal AI simulates an actual oral examination board. The AI Examiner listens to your complete response, evaluates lexical range and grammatical connectivity across multiple turns, and presents follow-up questions that challenge your discourse competence.
              </p>
            </CardContent>
          </Card>

          <Card className="border-slate-200 dark:border-slate-800">
            <CardContent className="p-8 space-y-4">
              <h2 className="text-2xl font-bold text-slate-900 dark:text-white">
                CEFR & HSK Proficiency Calibration
              </h2>
              <p>
                Our rubrics are calibrated against the Common European Framework of Reference for Languages (CEFR A1 through C2) and HSK (Hanyu Shuiping Kaoshi) proficiency descriptions.
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-700">
                  <h4 className="font-bold text-slate-900 dark:text-white mb-1">
                    CEFR Benchmark
                  </h4>
                  <p className="text-xs text-slate-500">
                    A1/A2 for basic survival interactions; B1/B2 for independent topical discourse; C1/C2 for spontaneous, articulate abstract reasoning.
                  </p>
                </div>
                <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-700">
                  <h4 className="font-bold text-slate-900 dark:text-white mb-1">
                    HSK Alignment (Unofficial)
                  </h4>
                  <p className="text-xs text-slate-500">
                    Estimated oral capability aligned with HSK 1 through HSK 6 vocabulary bands and grammatical complexity tiers.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <div id="disclaimer" className="p-6 rounded-2xl bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-900/50 text-amber-900 dark:text-amber-200 text-xs sm:text-sm space-y-2">
            <h3 className="font-bold flex items-center gap-2">
              <ShieldCheck className="h-5 w-5 text-amber-600" />
              <span>Official Certification Disclaimer</span>
            </h3>
            <p className="leading-relaxed">
              HuáVocal AI is an independent language assessment technology platform. It provides formative educational estimates and diagnostic feedback. HuáVocal AI is not affiliated with, licensed by, or an official representative of Chinese Testing International (CTI) or the Ministry of Education of the People&apos;s Republic of China. Our assessment reports are for diagnostic and educational advancement.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
