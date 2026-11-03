import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";

export default function FAQPage() {
  const faqs = [
    {
      q: "How does the AI Examiner conduct the oral assessment?",
      a: "The assessment proceeds through 5 structured stages: Warm-up & Introduction, Daily Routines, Thematic Topic Presentation, Critical Probing & Reasoning, and Professional Conclusion. The AI Examiner speaks natural Putonghua (Mandarin Chinese) and listens to your spoken audio responses through your device microphone.",
    },
    {
      q: "How is my speaking score calculated?",
      a: "Scoring is performed by a dedicated psychometric engine evaluating your entire dialogue across 7 weighted dimensions: Pronunciation (20%), Fluency (20%), Vocabulary (15%), Grammar (15%), Coherence (10%), Comprehension (10%), and Interactive Dialogue (10%). Every score is supported by verbatim transcript quotes and linguistic analysis.",
    },
    {
      q: "Can I use HuáVocal AI on mobile devices?",
      a: "Yes! HuáVocal AI is built with responsive mobile-first architecture. You can take your spoken assessment seamlessly on iPhone, iPad, Android phones, tablets, or desktop laptops equipped with a microphone.",
    },
    {
      q: "Does HuáVocal AI provide official HSK certification?",
      a: "No. HuáVocal AI provides unofficial educational diagnostic estimates calibrated to HSK and CEFR scales. It is an ideal preparation and diagnostic tool for students taking official exams, but cannot substitute for official CTI certification.",
    },
    {
      q: "Is my voice recording stored securely?",
      a: "Yes. All audio recordings are encrypted at rest and in transit. Your recordings are only accessible by you and authorized teachers in your enrolled classes. We never sell your voice data or use it for unconsented public model training.",
    },
    {
      q: "How do teachers assign oral exams to students?",
      a: "Teachers can sign up for an Educator account, create a classroom code (e.g. ZH-SPRING-2026), invite students, dispatch standardized oral assessment assignments with due dates, and monitor cohort score distributions directly from the Teacher Portal.",
    },
  ];

  return (
    <div className="py-16 md:py-24">
      <div className="container mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 space-y-12">
        <div className="text-center space-y-4">
          <Badge variant="cinnabar">Frequently Asked Questions</Badge>
          <h1 className="text-4xl sm:text-5xl font-extrabold tracking-tight text-slate-900 dark:text-white">
            Everything You Need to Know
          </h1>
          <p className="text-lg text-slate-600 dark:text-slate-400">
            Learn more about our oral examination methodology, scoring criteria, and technical setup.
          </p>
        </div>

        <div className="space-y-4">
          {faqs.map((f, i) => (
            <Card key={i} className="border-slate-200 dark:border-slate-800">
              <CardContent className="p-6 space-y-2">
                <h3 className="font-bold text-base text-slate-900 dark:text-white">{f.q}</h3>
                <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed">{f.a}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}
