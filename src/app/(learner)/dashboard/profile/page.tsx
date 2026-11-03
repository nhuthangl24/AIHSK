import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth/session";
import prisma from "@/lib/db/prisma";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export const dynamic = "force-dynamic";

export default async function ProfilePage() {
  const user = await getCurrentUser();
  if (!user) {
    redirect("/login");
  }

  const userRecord = await prisma.user.findUnique({
    where: { id: user.userId },
    include: { profile: true },
  });

  return (
    <div className="space-y-8 max-w-3xl">
      <div>
        <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white">
          Learner Profile & Goals
        </h1>
        <p className="text-sm text-slate-500 mt-1">
          Configure your study parameters and target proficiency level for adaptive examinations.
        </p>
      </div>

      <Card className="border-slate-200 dark:border-slate-800 shadow-sm">
        <CardHeader>
          <CardTitle className="text-lg font-bold">Personal Information</CardTitle>
          <CardDescription>
            Your account identity and target Mandarin assessment benchmarks.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-1.5">
            <Label>Full Name</Label>
            <Input defaultValue={userRecord?.name || "Alex Chen"} disabled />
          </div>

          <div className="space-y-1.5">
            <Label>Email Address</Label>
            <Input defaultValue={userRecord?.email || "learner@aihsk.com"} disabled />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label>Target HSK Level</Label>
              <Input defaultValue={userRecord?.profile?.targetLevel || "HSK 4"} disabled />
            </div>

            <div className="space-y-1.5">
              <Label>Native Language</Label>
              <Input defaultValue={userRecord?.profile?.nativeLanguage || "English"} disabled />
            </div>
          </div>

          <div className="space-y-1.5">
            <Label>Weekly Oral Practice Hours</Label>
            <Input
              defaultValue={userRecord?.profile?.studyHoursWeekly?.toString() || "5"}
              disabled
            />
          </div>

          <div className="space-y-1.5">
            <Label>Learning Goal</Label>
            <textarea
              defaultValue={
                userRecord?.profile?.learningGoal ||
                "Prepare for study abroad in Beijing and work in bilingual tech environments."
              }
              rows={3}
              disabled
              className="w-full rounded-lg border border-input bg-background p-3 text-sm text-slate-700 dark:text-slate-300"
            />
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
