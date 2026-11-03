"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Mic, Clock, Award, Layers, Loader2, Sparkles, CheckCircle2 } from "lucide-react";

interface AssessmentTemplate {
  id: string;
  title: string;
  slug: string;
  description: string;
  category: string;
  targetLevel: string;
  estimatedDurationMinutes: number;
  maxTurns: number;
}

export default function AssessmentSelectionPage() {
  const router = useRouter();
  const [templates, setTemplates] = useState<AssessmentTemplate[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [startingId, setStartingId] = useState<string | null>(null);

  useEffect(() => {
    fetch("/api/assessments")
      .then((res) => res.json())
      .then((data) => {
        if (data.templates) {
          setTemplates(data.templates);
        }
      })
      .catch((err) => console.error("Error fetching templates:", err))
      .finally(() => setIsLoading(false));
  }, []);

  const handleStartExam = async (templateId: string) => {
    setStartingId(templateId);
    try {
      const res = await fetch("/api/assessments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ templateId }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to start assessment");

      router.push(`/dashboard/assessments/${data.session.id}`);
    } catch (err: any) {
      alert(err.message || "Failed to launch oral exam");
      setStartingId(null);
    }
  };

  return (
    <div className="space-y-8">
      <div className="space-y-2">
        <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white">
          Select an Oral Chinese Assessment
        </h1>
        <p className="text-sm text-slate-500 max-w-2xl leading-relaxed">
          Choose a standardized oral assessment calibrated to your proficiency level. Once started, Examiner Li will conduct a natural 5-stage spoken interview through your microphone.
        </p>
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center p-16">
          <Loader2 className="h-8 w-8 animate-spin text-rose-600" />
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {templates.map((tpl) => (
            <Card
              key={tpl.id}
              className="flex flex-col justify-between border-slate-200 dark:border-slate-800 hover:border-rose-300 dark:hover:border-rose-900 transition-all shadow-sm"
            >
              <CardHeader className="space-y-3 pb-4">
                <div className="flex items-center justify-between">
                  <Badge variant="cinnabar" className="text-[10px]">
                    {tpl.targetLevel}
                  </Badge>
                  <span className="flex items-center gap-1 text-xs text-slate-500">
                    <Clock className="h-3.5 w-3.5" />
                    <span>~{tpl.estimatedDurationMinutes} mins</span>
                  </span>
                </div>
                <CardTitle className="text-lg font-bold leading-tight">
                  {tpl.title}
                </CardTitle>
                <CardDescription className="text-xs leading-relaxed line-clamp-3">
                  {tpl.description}
                </CardDescription>
              </CardHeader>

              <CardContent className="space-y-4 pt-0">
                <div className="space-y-2 pt-3 border-t border-slate-100 dark:border-slate-800 text-xs text-slate-600 dark:text-slate-400">
                  <div className="flex items-center gap-2">
                    <Layers className="h-3.5 w-3.5 text-rose-500" />
                    <span>5 Conversational Stages</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Sparkles className="h-3.5 w-3.5 text-rose-500" />
                    <span>Full 7-Dimension Scoring</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600" />
                    <span>Acoustic Tone & Pinyin Diagnostics</span>
                  </div>
                </div>

                <Button
                  onClick={() => handleStartExam(tpl.id)}
                  disabled={Boolean(startingId)}
                  className="w-full bg-rose-600 hover:bg-rose-700 text-white font-medium text-xs flex items-center justify-center gap-2 shadow-sm"
                >
                  {startingId === tpl.id ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      <span>Initializing Exam Room...</span>
                    </>
                  ) : (
                    <>
                      <Mic className="h-4 w-4" />
                      <span>Begin Spoken Interview</span>
                    </>
                  )}
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
