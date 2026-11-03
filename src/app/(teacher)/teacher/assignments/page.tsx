"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { ClipboardList, PlusCircle, CheckCircle2, Loader2, Calendar } from "lucide-react";

export default function TeacherAssignmentsPage() {
  const [classes, setClasses] = useState<any[]>([]);
  const [templates, setTemplates] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Form State
  const [selectedClassId, setSelectedClassId] = useState("");
  const [selectedTemplateId, setSelectedTemplateId] = useState("");
  const [title, setTitle] = useState("");
  const [instructions, setInstructions] = useState("");
  const [dueDate, setDueDate] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  useEffect(() => {
    Promise.all([fetch("/api/teacher/classes"), fetch("/api/assessments")])
      .then(async ([resClasses, resAssessments]) => {
        const dataClasses = await resClasses.json();
        const dataAssessments = await resAssessments.json();

        if (dataClasses.classes) setClasses(dataClasses.classes);
        if (dataAssessments.templates) setTemplates(dataAssessments.templates);

        if (dataClasses.classes?.[0]) setSelectedClassId(dataClasses.classes[0].id);
        if (dataAssessments.templates?.[0]) setSelectedTemplateId(dataAssessments.templates[0].id);
      })
      .catch((err) => console.error("Error loading assignments data:", err))
      .finally(() => setIsLoading(false));
  }, []);

  const handleCreateAssignment = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setSuccessMessage(null);

    try {
      const res = await fetch("/api/teacher/assignments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          classId: selectedClassId,
          templateId: selectedTemplateId,
          title,
          instructions,
          dueDate: dueDate || null,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to create assignment");

      setSuccessMessage(`Assessment "${title}" successfully assigned!`);
      setTitle("");
      setInstructions("");
    } catch (err: any) {
      alert(err.message || "Assignment creation failed");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-8 max-w-4xl">
      <div>
        <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white">
          Oral Assessment Assignments
        </h1>
        <p className="text-sm text-slate-500 mt-1">
          Dispatch standardized oral Chinese exams to your classroom cohorts with custom deadlines and instructions.
        </p>
      </div>

      {successMessage && (
        <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-semibold flex items-center gap-2">
          <CheckCircle2 className="h-4 w-4 text-emerald-600" />
          <span>{successMessage}</span>
        </div>
      )}

      <Card className="border-slate-200 dark:border-slate-800 shadow-sm">
        <CardHeader>
          <CardTitle className="text-lg font-bold flex items-center gap-2">
            <PlusCircle className="h-5 w-5 text-blue-600" />
            <span>Create & Assign New Oral Checkpoint</span>
          </CardTitle>
          <CardDescription>
            Students enrolled in the selected class will receive an immediate assignment notification.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleCreateAssignment} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label htmlFor="classSelect">Target Class</Label>
                <select
                  id="classSelect"
                  value={selectedClassId}
                  onChange={(e) => setSelectedClassId(e.target.value)}
                  className="flex h-10 w-full rounded-lg border border-input bg-background px-3 py-2 text-sm text-slate-800 dark:text-slate-200"
                  required
                >
                  {classes.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name} ({c.code}) - {c.members?.length || 0} Students
                    </option>
                  ))}
                </select>
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="templateSelect">Assessment Template</Label>
                <select
                  id="templateSelect"
                  value={selectedTemplateId}
                  onChange={(e) => setSelectedTemplateId(e.target.value)}
                  className="flex h-10 w-full rounded-lg border border-input bg-background px-3 py-2 text-sm text-slate-800 dark:text-slate-200"
                  required
                >
                  {templates.map((t) => (
                    <option key={t.id} value={t.id}>
                      {t.title} ({t.targetLevel})
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="title">Assignment Title</Label>
              <Input
                id="title"
                placeholder="e.g. Mid-Term Oral Proficiency Diagnostic"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                required
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="dueDate">Due Date (Optional)</Label>
              <Input
                id="dueDate"
                type="date"
                value={dueDate}
                onChange={(e) => setDueDate(e.target.value)}
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="instructions">Teacher Instructions</Label>
              <textarea
                id="instructions"
                rows={3}
                placeholder="Please complete all 5 stages in a quiet environment. Focus on clear tones and answering the follow-up probing questions thoroughly."
                value={instructions}
                onChange={(e) => setInstructions(e.target.value)}
                className="w-full rounded-lg border border-input bg-background p-3 text-sm text-slate-800 dark:text-slate-200 leading-relaxed"
              />
            </div>

            <Button
              type="submit"
              disabled={isSubmitting}
              className="bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs h-10 px-6 flex items-center gap-2"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  <span>Dispatching Assignment...</span>
                </>
              ) : (
                <>
                  <ClipboardList className="h-4 w-4" />
                  <span>Dispatch Assignment to Class</span>
                </>
              )}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
