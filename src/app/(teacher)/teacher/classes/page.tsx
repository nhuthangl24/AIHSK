import { getCurrentUser } from "@/lib/auth/session";
import prisma from "@/lib/db/prisma";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Users, Plus, GraduationCap, Copy } from "lucide-react";

export default async function TeacherClassesPage() {
  const user = await getCurrentUser();

  const classes = await prisma.class.findMany({
    where: user?.role === "SUPER_ADMIN" ? {} : { teacherId: user?.userId },
    include: {
      members: {
        include: { user: true },
      },
      assignments: true,
    },
    orderBy: { createdAt: "desc" },
  });

  return (
    <div className="space-y-8">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white">
            Lớp Học & Danh Sách Học Sinh
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Quản lý nhóm học tập, mã tham gia lớp và theo dõi tình hình học sinh theo lớp.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {classes.map((c) => (
          <Card key={c.id} className="border-slate-200 dark:border-slate-800 shadow-sm flex flex-col justify-between">
            <CardHeader className="space-y-2">
              <div className="flex items-center justify-between">
                <Badge variant="outline" className="border-blue-300 text-blue-700 dark:text-blue-300">
                  {c.level}
                </Badge>
                <span className="text-xs font-mono font-bold bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded text-slate-700 dark:text-slate-300">
                  {c.code}
                </span>
              </div>
              <CardTitle className="text-lg font-bold">{c.name}</CardTitle>
              <p className="text-xs text-slate-500">{c.description || "Lớp luyện khẩu ngữ chuyên sâu"}</p>
            </CardHeader>

            <CardContent className="space-y-4 pt-0">
              <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs text-slate-500">
                <span className="flex items-center gap-1.5 font-semibold text-slate-700 dark:text-slate-300">
                  <Users className="h-4 w-4 text-blue-600" />
                  <span>{c.members.length} Học sinh ghi danh</span>
                </span>
                <span>{c.assignments.length} Bài tập</span>
              </div>

              {/* Members preview */}
              <div className="space-y-1.5 pt-2">
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                  Danh Sách Học Sinh:
                </span>
                <ul className="space-y-1 text-xs">
                  {c.members.slice(0, 3).map((m) => (
                    <li key={m.id} className="flex items-center justify-between text-slate-700 dark:text-slate-300">
                      <span className="font-medium">{m.user.name}</span>
                      <span className="text-[11px] text-slate-400">{m.user.email}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
