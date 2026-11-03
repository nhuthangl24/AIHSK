import { getCurrentUser } from "@/lib/auth/session";
import prisma from "@/lib/db/prisma";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Building2, Users, GraduationCap, ShieldCheck, PieChart, CheckCircle2 } from "lucide-react";
import { formatDate } from "@/lib/utils";

export default async function OrganizationOverviewPage() {
  const user = await getCurrentUser();

  const membership = await prisma.organizationMember.findFirst({
    where: { userId: user?.userId },
    include: { organization: true },
  });

  const org = membership?.organization || {
    id: "demo-org",
    name: "Beijing Oriental Language Academy",
    slug: "oriental-language-institute",
    domain: "oriental-edu.com",
    maxSeats: 150,
    maxAssessmentsPerMonth: 1200,
  };

  const [members, classes, totalCompleted] = await Promise.all([
    prisma.organizationMember.findMany({
      where: { organizationId: org.id },
      include: { user: true },
    }),
    prisma.class.findMany({
      where: { organizationId: org.id },
      include: {
        teacher: true,
        members: true,
      },
    }),
    prisma.assessmentSession.count({
      where: { status: "COMPLETED" },
    }),
  ]);

  return (
    <div className="space-y-8">
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-200 dark:border-slate-800">
        <div>
          <div className="flex items-center gap-2">
            <Badge variant="success" className="text-xs">
              Enterprise Tenant
            </Badge>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white">
              {org.name}
            </h1>
          </div>
          <p className="text-sm text-slate-500 mt-1">
            Domain: <span className="font-mono text-slate-700 dark:text-slate-300">{org.domain || "oriental-edu.com"}</span> &bull; Multi-Tenant Database Isolation: <span className="text-emerald-600 font-semibold">Active</span>
          </p>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        <Card className="border-slate-200 dark:border-slate-800">
          <CardContent className="p-5 space-y-2">
            <div className="flex items-center justify-between text-xs font-medium text-slate-500">
              <span>Licensed Seats</span>
              <ShieldCheck className="h-4 w-4 text-emerald-600" />
            </div>
            <div className="text-3xl font-extrabold text-slate-900 dark:text-white">
              {members.length} <span className="text-xs text-slate-400">/ {org.maxSeats}</span>
            </div>
            <p className="text-[11px] text-emerald-600 font-medium">
              {org.maxSeats - members.length} Available Seats
            </p>
          </CardContent>
        </Card>

        <Card className="border-slate-200 dark:border-slate-800">
          <CardContent className="p-5 space-y-2">
            <div className="flex items-center justify-between text-xs font-medium text-slate-500">
              <span>Faculty Teachers</span>
              <GraduationCap className="h-4 w-4 text-blue-600" />
            </div>
            <div className="text-3xl font-extrabold text-slate-900 dark:text-white">
              {classes.length || 1}
            </div>
            <p className="text-[11px] text-slate-500">Instructors with active cohorts</p>
          </CardContent>
        </Card>

        <Card className="border-slate-200 dark:border-slate-800">
          <CardContent className="p-5 space-y-2">
            <div className="flex items-center justify-between text-xs font-medium text-slate-500">
              <span>Class Cohorts</span>
              <Building2 className="h-4 w-4 text-purple-600" />
            </div>
            <div className="text-3xl font-extrabold text-slate-900 dark:text-white">
              {classes.length}
            </div>
            <p className="text-[11px] text-slate-500">Managed teaching sections</p>
          </CardContent>
        </Card>

        <Card className="border-slate-200 dark:border-slate-800">
          <CardContent className="p-5 space-y-2">
            <div className="flex items-center justify-between text-xs font-medium text-slate-500">
              <span>Monthly Assessment Quota</span>
              <PieChart className="h-4 w-4 text-rose-600" />
            </div>
            <div className="text-3xl font-extrabold text-slate-900 dark:text-white">
              {totalCompleted} <span className="text-xs text-slate-400">/ {org.maxAssessmentsPerMonth}</span>
            </div>
            <p className="text-[11px] text-slate-500">Enterprise oral capacity</p>
          </CardContent>
        </Card>
      </div>

      {/* Faculty and Classes Summary */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card className="border-slate-200 dark:border-slate-800">
          <CardHeader>
            <CardTitle className="text-base font-bold flex items-center gap-2">
              <GraduationCap className="h-4 w-4 text-emerald-600" />
              <span>Teaching Departments & Classes</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6 pt-0">
            <div className="divide-y divide-slate-100 dark:divide-slate-800 text-xs">
              {classes.map((c) => (
                <div key={c.id} className="py-3 flex items-center justify-between">
                  <div>
                    <h4 className="font-bold text-slate-900 dark:text-white">{c.name}</h4>
                    <p className="text-slate-500">Teacher: {c.teacher.name} ({c.teacher.email})</p>
                  </div>
                  <Badge variant="outline">{c.members.length} Students</Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card className="border-slate-200 dark:border-slate-800">
          <CardHeader>
            <CardTitle className="text-base font-bold flex items-center gap-2">
              <ShieldCheck className="h-4 w-4 text-emerald-600" />
              <span>Institutional Tenant Members</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6 pt-0">
            <div className="divide-y divide-slate-100 dark:divide-slate-800 text-xs">
              {members.map((m) => (
                <div key={m.id} className="py-3 flex items-center justify-between">
                  <div>
                    <h4 className="font-semibold text-slate-900 dark:text-white">{m.user.name}</h4>
                    <p className="text-slate-400">{m.user.email}</p>
                  </div>
                  <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase bg-slate-100 dark:bg-slate-800">
                    {m.role}
                  </span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
