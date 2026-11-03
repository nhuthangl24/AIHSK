import Link from "next/link";
import {
  Mic,
  ArrowRight,
  ShieldCheck,
  Sparkles,
  BarChart3,
  BookOpen,
  Volume2,
  CheckCircle2,
  Layers,
  Award,
  Globe2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { SoundWave } from "@/components/ui/sound-wave";

export default function HomePage() {
  return (
    <div className="flex flex-col">
      {/* Hero Section */}
      <section className="relative overflow-hidden pt-12 pb-20 md:pt-20 md:pb-32 border-b border-slate-200/60 dark:border-slate-800/60 bg-gradient-to-b from-white via-slate-50/50 to-white dark:from-slate-950 dark:via-slate-900/50 dark:to-slate-950">
        <div className="container mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            {/* Left Column: Hero Text */}
            <div className="lg:col-span-7 space-y-6 text-center lg:text-left">
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-rose-50 border border-rose-200/80 text-rose-700 dark:bg-rose-950/40 dark:border-rose-900 dark:text-rose-300 text-xs font-semibold">
                <Sparkles className="h-3.5 w-3.5 text-rose-600" />
                <span>Next-Gen Oral Chinese Examination Engine</span>
              </div>

              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-slate-900 dark:text-white leading-[1.12]">
                Master Spoken Chinese With{" "}
                <span className="text-rose-600">Standardized AI</span> Examination
              </h1>

              <p className="text-lg sm:text-xl text-slate-600 dark:text-slate-300 max-w-2xl mx-auto lg:mx-0 leading-relaxed font-normal">
                Conduct natural, full-length spoken Mandarin conversations with our pedagogical AI Examiner. Get multi-turn psychometric diagnostics, tone accuracy analysis, and personalized learning roadmaps.
              </p>

              <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-4 pt-2">
                <Link href="/register" className="w-full sm:w-auto">
                  <Button size="lg" className="w-full sm:w-auto bg-rose-600 hover:bg-rose-700 text-white shadow-md font-semibold flex items-center justify-center gap-2">
                    <Mic className="h-5 w-5" />
                    <span>Start Free Assessment</span>
                    <ArrowRight className="h-4 w-4" />
                  </Button>
                </Link>
                <Link href="/dashboard/reports/demo-session-101" className="w-full sm:w-auto">
                  <Button size="lg" variant="outline" className="w-full sm:w-auto font-medium">
                    View Live Sample Report
                  </Button>
                </Link>
              </div>

              {/* Trust Indicators */}
              <div className="pt-6 border-t border-slate-200/80 dark:border-slate-800 flex flex-wrap items-center justify-center lg:justify-start gap-6 text-xs text-slate-500">
                <div className="flex items-center gap-1.5">
                  <CheckCircle2 className="h-4 w-4 text-emerald-600" />
                  <span>Full Dialogue Psychometrics</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <CheckCircle2 className="h-4 w-4 text-emerald-600" />
                  <span>CEFR & HSK Calibrated Rubric</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <CheckCircle2 className="h-4 w-4 text-emerald-600" />
                  <span>Tone Sandhi Diagnostics</span>
                </div>
              </div>
            </div>

            {/* Right Column: Interactive AI Examiner Preview Card */}
            <div className="lg:col-span-5">
              <div className="relative mx-auto max-w-md rounded-2xl border border-slate-200 bg-white p-6 shadow-xl dark:border-slate-800 dark:bg-slate-900">
                {/* Examiner Header */}
                <div className="flex items-center justify-between pb-4 border-b border-slate-100 dark:border-slate-800">
                  <div className="flex items-center gap-3">
                    <div className="relative">
                      <div className="h-11 w-11 rounded-full bg-rose-100 dark:bg-rose-950/60 flex items-center justify-center text-rose-700 dark:text-rose-300 font-bold text-sm border-2 border-rose-500">
                        李
                      </div>
                      <span className="absolute bottom-0 right-0 h-3 w-3 rounded-full bg-emerald-500 ring-2 ring-white dark:ring-slate-900" />
                    </div>
                    <div>
                      <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                        <span>考官李老师 (Examiner Li)</span>
                        <Badge variant="cinnabar" className="text-[10px] px-1.5 py-0">
                          Live Exam
                        </Badge>
                      </h3>
                      <p className="text-xs text-slate-500">Stage 3: Thematic Topic Presentation</p>
                    </div>
                  </div>
                  <SoundWave isActive={true} color="cinnabar" size="sm" />
                </div>

                {/* Simulated Conversation Turns */}
                <div className="py-5 space-y-4 text-xs">
                  {/* Examiner Turn */}
                  <div className="rounded-xl bg-slate-50 p-3.5 border border-slate-100 dark:bg-slate-800/60 dark:border-slate-700/50 space-y-1.5">
                    <span className="font-semibold text-rose-600 dark:text-rose-400 text-[11px] block">
                      AI Examiner &bull; 考官发问
                    </span>
                    <p className="text-slate-800 dark:text-slate-200 font-medium leading-relaxed">
                      你认为利用人工智能学习中文有什么优势？它是否可以完全代替传统的老师呢？
                    </p>
                    <p className="text-[10px] text-slate-400 italic">
                      Nǐ rènwéi lìyòng réngōng zhìnéng xuéxí zhōngwén yǒu shénme yōushì? Tā shìfǒu kěyǐ wánquán dàitì chuántǒng de lǎoshī ne?
                    </p>
                  </div>

                  {/* Learner Spoken Response */}
                  <div className="rounded-xl bg-rose-50/70 p-3.5 border border-rose-100 dark:bg-rose-950/20 dark:border-rose-900/40 ml-4 space-y-1.5">
                    <div className="flex items-center justify-between">
                      <span className="font-semibold text-slate-700 dark:text-slate-300 text-[11px]">
                        Learner Response &bull; 考生应答
                      </span>
                      <span className="text-[10px] text-emerald-600 font-semibold flex items-center gap-1">
                        <Volume2 className="h-3 w-3" /> 00:14
                      </span>
                    </div>
                    <p className="text-slate-800 dark:text-slate-200 leading-relaxed font-normal">
                      我认为科技有很多好处，比如可以随时随地练习发音。但是它不能完全代替老师，因为老师可以有情感交流，能根据我们的情况提出针对性的建议。
                    </p>
                  </div>

                  {/* Real-time Metric Snippet */}
                  <div className="rounded-lg bg-emerald-50/80 border border-emerald-200/80 p-2.5 dark:bg-emerald-950/20 dark:border-emerald-900/40 flex items-center justify-between text-[11px]">
                    <span className="text-emerald-800 dark:text-emerald-300 font-medium">
                      Multi-Turn Discourse Coherence
                    </span>
                    <span className="font-bold text-emerald-700 dark:text-emerald-400">
                      84.5 / 100 &bull; HSK 4 Est.
                    </span>
                  </div>
                </div>

                <div className="pt-2">
                  <Link href="/register">
                    <Button className="w-full bg-slate-900 hover:bg-slate-800 text-white dark:bg-white dark:text-slate-900 dark:hover:bg-slate-100 font-medium text-xs">
                      Try 5-Stage Voice Assessment &rarr;
                    </Button>
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 5-Stage Examination Framework Section */}
      <section className="py-20 bg-white dark:bg-slate-900/60 border-b border-slate-200/60 dark:border-slate-800/60">
        <div className="container mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-16 space-y-3">
            <Badge variant="outline" className="border-rose-300 text-rose-700 dark:border-rose-800 dark:text-rose-400">
              Rigorous Methodology
            </Badge>
            <h2 className="text-3xl sm:text-4xl font-bold tracking-tight text-slate-900 dark:text-white">
              The 5-Stage Standardized Oral Examination
            </h2>
            <p className="text-base text-slate-600 dark:text-slate-400">
              Unlike simplistic chatbots that evaluate isolated sentences, HuáVocal AI administers a comprehensive oral examination designed by applied linguistics specialists.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
            {[
              {
                num: "01",
                stage: "Stage 1",
                title: "Warm-up & Introduction",
                titleZh: "问候与自我介绍",
                desc: "Confirms microphone clarity, establishes candidate rapport, and assesses basic self-presentation.",
              },
              {
                num: "02",
                stage: "Stage 2",
                title: "Daily Life & Routines",
                titleZh: "日常生活与兴趣",
                desc: "Tests daily vocabulary, frequency markers, and narration of personal hobbies and habits.",
              },
              {
                num: "03",
                stage: "Stage 3",
                title: "Topic Presentation",
                titleZh: "主题阐述与表达",
                desc: "Presents cultural, tech, or societal themes requiring structured argumentation and connectives.",
              },
              {
                num: "04",
                stage: "Stage 4",
                title: "Critical Follow-up",
                titleZh: "深入追问与思辨",
                desc: "Probes candidate reasoning with counter-perspectives, testing spontaneous sustained discourse.",
              },
              {
                num: "05",
                stage: "Stage 5",
                title: "Conclusion & Scoring",
                titleZh: "考试总结与终评",
                desc: "Concludes session and transmits complete conversation transcript to the 7-dimension scoring engine.",
              },
            ].map((st) => (
              <Card key={st.num} className="border-slate-200 hover:border-rose-300 dark:border-slate-800 dark:hover:border-rose-900 transition-colors">
                <CardContent className="p-5 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-2xl font-black text-rose-600/30 dark:text-rose-500/20">{st.num}</span>
                    <Badge variant="secondary" className="text-[10px] font-medium">
                      {st.stage}
                    </Badge>
                  </div>
                  <div>
                    <h4 className="font-bold text-sm text-slate-900 dark:text-white leading-tight">
                      {st.title}
                    </h4>
                    <p className="text-xs text-rose-600 dark:text-rose-400 font-medium">{st.titleZh}</p>
                  </div>
                  <p className="text-xs text-slate-500 leading-relaxed">{st.desc}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* 7 Psychometric Dimensions Section */}
      <section className="py-20 bg-slate-50/50 dark:bg-slate-950 border-b border-slate-200/60 dark:border-slate-800/60">
        <div className="container mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-16 space-y-3">
            <Badge variant="outline" className="border-slate-300 text-slate-700 dark:border-slate-700 dark:text-slate-300">
              Scoring Rubric
            </Badge>
            <h2 className="text-3xl sm:text-4xl font-bold tracking-tight text-slate-900 dark:text-white">
              7 Standardized Dimensions of Spoken Mandarin
            </h2>
            <p className="text-base text-slate-600 dark:text-slate-400">
              Evaluated holistically across the entire conversational context, supported by direct transcript citations.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              {
                title: "Pronunciation & Tones",
                weight: "20%",
                desc: "Acoustic evaluation of 4 Mandarin tones, tone sandhi (三声变调), retroflex consonants (zh, ch, sh), and syllable clarity.",
              },
              {
                title: "Fluency & Speech Rhythm",
                weight: "20%",
                desc: "Pace, pause distribution at grammatical boundaries, articulation rate, and hesitation particle reduction.",
              },
              {
                title: "Vocabulary Range",
                weight: "15%",
                desc: "Lexical diversity, HSK tier vocabulary distribution, idiomatic expressions (成语), and register appropriateness.",
              },
              {
                title: "Grammar & Syntax",
                weight: "15%",
                desc: "Word order accuracy, aspect markers (了, 着, 过), '把' construction, and complex compound sentence structures.",
              },
              {
                title: "Discourse Coherence",
                weight: "10%",
                desc: "Use of logical connectives (虽然...但是, 不仅...而且), transition adverbs, and seamless paragraph development.",
              },
              {
                title: "Listening Comprehension",
                weight: "10%",
                desc: "Direct relevance to multi-part examiner questions, accurate grasping of nuances and idiomatic prompts.",
              },
              {
                title: "Interactive Dialogue",
                weight: "10%",
                desc: "Ability to sustain back-and-forth conversation, elaborate arguments independently, and clarify viewpoints.",
              },
              {
                title: "CEFR & HSK Benchmarks",
                weight: "Holistic",
                desc: "Directly maps aggregate performance to CEFR (A1-C2) and unofficial HSK 1-6 proficiency equivalents.",
              },
            ].map((dim, i) => (
              <Card key={i} className="border-slate-200 dark:border-slate-800">
                <CardContent className="p-6 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-rose-600 dark:text-rose-400">
                      Weight: {dim.weight}
                    </span>
                    <Sparkles className="h-4 w-4 text-slate-400" />
                  </div>
                  <h4 className="font-bold text-base text-slate-900 dark:text-white">{dim.title}</h4>
                  <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">{dim.desc}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing Preview Section */}
      <section className="py-20 bg-white dark:bg-slate-900/60">
        <div className="container mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-16 space-y-3">
            <Badge variant="outline" className="border-rose-300 text-rose-700 dark:border-rose-800 dark:text-rose-400">
              Flexible Plans
            </Badge>
            <h2 className="text-3xl sm:text-4xl font-bold tracking-tight text-slate-900 dark:text-white">
              Transparent SaaS Pricing for Learners, Teachers & Schools
            </h2>
            <p className="text-base text-slate-600 dark:text-slate-400">
              Start with free assessments or equip your entire Chinese language department with institutional seats.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            {[
              {
                name: "Free Starter",
                price: "$0",
                period: "/month",
                desc: "Ideal for individual learners testing their oral baseline.",
                features: ["3 Oral Assessments / mo", "AI Examiner (5 stages)", "Standard score report", "CEFR & HSK estimate"],
                cta: "Get Started Free",
                href: "/register",
                highlighted: false,
              },
              {
                name: "Pro Learner",
                price: "$19",
                period: "/month",
                desc: "For dedicated students aiming for HSK 4-6 fluency.",
                features: [
                  "30 Oral Assessments / mo",
                  "Tone Sandhi acoustic feedback",
                  "Grammar & vocab coaching",
                  "Unlimited audio replay",
                  "Weekly personalized plan",
                ],
                cta: "Start Pro Plan",
                href: "/register",
                highlighted: true,
              },
              {
                name: "Educator Class",
                price: "$49",
                period: "/month",
                desc: "For Chinese teachers managing student cohorts.",
                features: [
                  "120 Assessments / mo",
                  "Classroom roster creation",
                  "Assignment dispatch system",
                  "Student gradebook export",
                  "Custom rubric weighting",
                ],
                cta: "Start Educator Plan",
                href: "/register",
                highlighted: false,
              },
              {
                name: "Enterprise Org",
                price: "$199",
                period: "/month",
                desc: "For universities, institutes, and corporate training.",
                features: [
                  "1,000 Assessments / mo",
                  "Unlimited teacher accounts",
                  "250 student seats included",
                  "Multi-tenant data isolation",
                  "Dedicated API & SSO setup",
                ],
                cta: "Contact Enterprise",
                href: "/register",
                highlighted: false,
              },
            ].map((plan, i) => (
              <Card
                key={i}
                className={`relative flex flex-col justify-between ${
                  plan.highlighted
                    ? "border-2 border-rose-500 shadow-lg dark:border-rose-500"
                    : "border-slate-200 dark:border-slate-800"
                }`}
              >
                {plan.highlighted && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full bg-rose-600 px-3 py-0.5 text-[10px] font-bold text-white uppercase tracking-wider">
                    Most Popular
                  </div>
                )}
                <CardContent className="p-6 space-y-4">
                  <div>
                    <h4 className="text-lg font-bold text-slate-900 dark:text-white">{plan.name}</h4>
                    <p className="text-xs text-slate-500 mt-1">{plan.desc}</p>
                  </div>

                  <div className="flex items-baseline gap-1">
                    <span className="text-3xl font-extrabold text-slate-900 dark:text-white">{plan.price}</span>
                    <span className="text-xs text-slate-500">{plan.period}</span>
                  </div>

                  <ul className="space-y-2.5 pt-4 border-t border-slate-100 dark:border-slate-800 text-xs text-slate-600 dark:text-slate-300">
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
                      className={`w-full text-xs font-semibold ${
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
      </section>

      {/* Call to Action Footer Banner */}
      <section className="py-16 bg-slate-900 text-white dark:bg-slate-950 border-t border-slate-800">
        <div className="container mx-auto max-w-5xl px-4 text-center space-y-6">
          <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight">
            Ready to Discover Your True Spoken Mandarin Level?
          </h2>
          <p className="text-slate-400 max-w-xl mx-auto text-sm sm:text-base leading-relaxed">
            Take a 12-minute oral assessment with our AI examiner now. Receive a verified psychometric report with audio playback and tone diagnostics.
          </p>
          <div className="flex justify-center gap-4 pt-2">
            <Link href="/register">
              <Button size="lg" className="bg-rose-600 hover:bg-rose-700 text-white font-semibold flex items-center gap-2">
                <Mic className="h-4 w-4" />
                <span>Begin Assessment Now</span>
                <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
