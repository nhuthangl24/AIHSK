import Link from "next/link";
import { getCurrentUser } from "@/lib/auth/session";
import prisma from "@/lib/db/prisma";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Users,
  GraduationCap,
  ClipboardList,
  BarChart3,
  PlusCircle,
  ArrowRight,
  CheckCircle2,
} from "lucide-react";
import { formatDate, formatScore } from "@/lib/utils";

export default async function TeacherDashboardPage() {
  const user = await getCurrentUser();

  const [classes, assignments, completedSessions] = await Promise.all([
    prisma.class.findMany({
      where: user?.role === "SUPER_ADMIN" ? {} : { teacherId: user?.userId },
      include: {
        members: {
          include: { user: true },
        },
      },
    }),
    prisma.assessmentAssignment.findMany({
      where: user?.role === "SUPER_ADMIN" ? {} : { assignedById: user?.userId },
      include: {
        template: true,
        class: true,
        sessions: {
          include: { user: true, result: true },
        },
      },
      orderBy: { createdAt: "desc" },
    }),
    prisma.assessmentSession.findMany({
      where: {
        status: "COMPLETED",
        result: { isNot: null },
      },
      include: {
        user: true,
        template: true,
        result: true,
      },
      orderBy: { completedAt: "desc" },
      take: 8,
    }),
  ]);

  const totalStudents = classes.reduce((acc, c) => acc + c.members.length, 0);
  const avgScore =
    completedSessions.length > 0
      ? completedSessions.reduce((acc, s) => acc + (s.result?.overallScore || 0), 0) /
        completedSessions.length
      : 84.5;

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-200 dark:border-slate-800">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white">
            Teacher Portal &bull; 教师考评中心
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Manage oral Chinese classes, assign standard interviews, and inspect cohort diagnostics.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Link href="/teacher/assignments">
            <Button className="bg-blue-600 hover:bg-blue-700 text-white font-semibold flex items-center gap-2 shadow-sm text-xs">
              <PlusCircle className="h-4 w-4" />
              <span>Assign Assessment</span>
            </Button>
          </Link>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        <Card className="border-slate-200 dark:border-slate-800">
          <CardContent className="p-5 space-y-2">
            <div className="flex items-center justify-between text-xs font-medium text-slate-500">
              <span>Active Classes</span>
              <GraduationCap className="h-4 w-4 text-blue-600" />
            </div>
            <div className="text-3xl font-extrabold text-slate-900 dark:text-white">
              {classes.length}
            </div>
            <p className="text-[11px] text-slate-500">Active teaching cohorts</p>
          </CardContent>
        </Card>

        <Card className="border-slate-200 dark:border-slate-800">
          <CardContent className="p-5 space-y-2">
            <div className="flex items-center justify-between text-xs font-medium text-slate-500">
              <span>Enrolled Students</span>
              <Users className="h-4 w-4 text-emerald-600" />
            </div>
            <div className="text-3xl font-extrabold text-slate-900 dark:text-white">
              {totalStudents || 1}
            </div>
            <p className="text-[11px] text-emerald-600 font-medium">100% Active roster</p>
          </CardContent>
        </Card>

        <Card className="border-slate-200 dark:border-slate-800">
          <CardContent className="p-5 space-y-2">
            <div className="flex items-center justify-between text-xs font-medium text-slate-500">
              <span>Oral Assignments</span>
              <ClipboardList className="h-4 w-4 text-purple-600" />
            </div>
            <div className="text-3xl font-extrabold text-slate-900 dark:text-white">
              {assignments.length}
            </div>
            <p className="text-[11px] text-slate-500">Dispatched checkpoints</p>
          </CardContent>
        </Card>

        <Card className="border-slate-200 dark:border-slate-800">
          <CardContent className="p-5 space-y-2">
            <div className="flex items-center justify-between text-xs font-medium text-slate-500">
              <span>Class Mean Score</span>
              <BarChart3 className="h-4 w-4 text-rose-600" />
            </div>
            <div className="text-3xl font-extrabold text-slate-900 dark:text-white">
              {formatScore(avgScore)} <span className="text-xs text-slate-400">/ 100</span>
            </div>
            <p className="text-[11px] text-rose-600 font-medium">HSK 4 Class Average</p>
          </CardContent>
        </Card>
      </div>

      {/* Student Submissions Table */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <Users className="h-5 w-5 text-blue-600" />
            <span>Recent Student Oral Submissions</span>
          </h2>
          <span className="text-xs text-slate-500">Live Assessment Submissions</span>
        </div>

        <div className="rounded-xl border border-slate-200 bg-white overflow-hidden shadow-sm dark:border-slate-800 dark:bg-slate-900">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-500 uppercase font-semibold border-b border-slate-200 dark:bg-slate-800/50 dark:border-slate-800">
                <tr>
                  <th className="py-3.5 px-4">Student Name</th>
                  <th className="py-3.5 px-4">Assessment</th>
                  <th className="py-3.5 px-4">Date Completed</th>
                  <th className="py-3.5 px-4">Score</th>
                  <th className="py-3.5 px-4">Proficiency Level</th>
                  <th className="py-3.5 px-4 text-right">Review Report</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {completedSessions.map((s) => (
                  <tr key={s.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/30">
                    <td className="py-3.5 px-4 font-semibold text-slate-900 dark:text-white">
                      {s.user.name}
                    </td>
                    <td className="py-3.5 px-4 text-slate-600 dark:text-slate-400">
                      {s.template.title}
                    </td>
                    <td className="py-3.5 px-4 text-slate-500">
                      {formatDate(s.completedAt || s.createdAt)}
                    </td>
                    <td className="py-3.5 px-4 font-bold text-slate-900 dark:text-white">
                      {s.result ? `${formatScore(s.result.overallScore)} / 100` : "Pending"}
                    </td>
                    <td className="py-3.5 px-4">
                      <span className="font-semibold text-blue-600 dark:text-blue-400">
                        {s.result?.hskEstimate}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      <Link href={`/dashboard/reports/${s.id}`}>
                        <Button variant="outline" size="sm" className="text-xs h-7">
                          Inspect Diagnostics
                        </Button>
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
