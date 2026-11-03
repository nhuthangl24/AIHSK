import Link from "next/link";
import { CheckCircle2, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

export default function PricingPage() {
  return (
    <div className="py-16 md:py-24">
      <div className="container mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto mb-16 space-y-4">
          <Badge variant="cinnabar">Simple, Transparent Pricing</Badge>
          <h1 className="text-4xl sm:text-5xl font-extrabold tracking-tight text-slate-900 dark:text-white">
            Invest in Validated Chinese Oral Fluency
          </h1>
          <p className="text-lg text-slate-600 dark:text-slate-400">
            Choose the ideal plan for your learning routine, language classroom, or university department.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-16">
          {[
            {
              name: "Free Starter",
              price: "$0",
              desc: "Quick diagnostic for individual candidates.",
              features: [
                "3 Assessments per month",
                "Standard 5-stage AI examination",
                "CEFR & HSK level estimates",
                "Basic strengths and weaknesses",
                "Community support",
              ],
              cta: "Start Free",
              href: "/register",
              highlighted: false,
            },
            {
              name: "Pro Learner",
              price: "$19",
              period: "/mo",
              desc: "Comprehensive coaching for active learners.",
              features: [
                "30 Assessments per month",
                "Full 7-dimension psychometric score",
                "Mandarin tone sandhi diagnostics",
                "Grammar & vocab upgrade recommendations",
                "Audio recording replay & storage",
                "PDF Diagnostic export",
                "Personalized 4-week learning roadmap",
              ],
              cta: "Upgrade to Pro",
              href: "/register",
              highlighted: true,
            },
            {
              name: "Teacher & Class",
              price: "$49",
              period: "/mo",
              desc: "Tools for Chinese teachers and tutors.",
              features: [
                "120 Assessments per month",
                "Create unlimited student classes",
                "Assign oral assessments with due dates",
                "Review student transcripts & audio",
                "Cohort progress analytics & gradebook",
                "Class performance CSV export",
                "Priority teacher support",
              ],
              cta: "Start Teacher Plan",
              href: "/register",
              highlighted: false,
            },
            {
              name: "Enterprise",
              price: "$199",
              period: "/mo",
              desc: "Complete assessment infrastructure for institutions.",
              features: [
                "1,000 Assessments per month",
                "Multi-teacher department management",
                "Up to 250 learner seats included",
                "Strict multi-tenant database isolation",
                "Custom assessment templates & rubrics",
                "SSO, SAML & LMS integration support",
                "Dedicated educational success manager",
              ],
              cta: "Contact Enterprise",
              href: "/register",
              highlighted: false,
            },
          ].map((plan, i) => (
            <Card
              key={i}
              className={`flex flex-col justify-between ${
                plan.highlighted
                  ? "border-2 border-rose-600 shadow-xl dark:border-rose-500"
                  : "border-slate-200 dark:border-slate-800"
              }`}
            >
              <CardContent className="p-6 space-y-4">
                {plan.highlighted && (
                  <Badge variant="cinnabar" className="text-[10px]">
                    Recommended
                  </Badge>
                )}
                <h3 className="text-xl font-bold text-slate-900 dark:text-white">{plan.name}</h3>
                <p className="text-xs text-slate-500">{plan.desc}</p>
                <div className="flex items-baseline gap-1 pt-2">
                  <span className="text-4xl font-extrabold text-slate-900 dark:text-white">
                    {plan.price}
                  </span>
                  {plan.period && <span className="text-xs text-slate-500">{plan.period}</span>}
                </div>
                <ul className="space-y-3 pt-6 border-t border-slate-100 dark:border-slate-800 text-xs text-slate-600 dark:text-slate-300">
                  {plan.features.map((feat, idx) => (
                    <li key={idx} className="flex items-center gap-2">
                      <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0" />
                      <span>{feat}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
              <div className="p-6 pt-0">
                <Link href={plan.href}>
                  <Button
                    className={`w-full font-semibold ${
                      plan.highlighted
                        ? "bg-rose-600 hover:bg-rose-700 text-white"
                        : "bg-slate-900 hover:bg-slate-800 text-white dark:bg-slate-100 dark:text-slate-900"
                    }`}
                  >
                    {plan.cta}
                  </Button>
                </Link>
              </div>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}
