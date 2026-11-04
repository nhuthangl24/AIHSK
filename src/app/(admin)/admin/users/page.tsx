import { assessmentStore } from "@/lib/db/assessment-store";
import { ADMIN_EMAILS } from "@/lib/auth/session";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Shield } from "lucide-react";
import { formatDate } from "@/lib/utils";

export default async function AdminUsersPage() {
  const profiles = assessmentStore.getAllProfiles();

  const users = profiles.map((p) => {
    const email = p.email || "";
    const isAdmin = ADMIN_EMAILS.includes(email.toLowerCase().trim());
    return {
      id: p.userId,
      name: p.name || email.split("@")[0] || "Học Viên",
      email,
      role: isAdmin ? "ADMIN" : "USER",
      targetLevel: p.targetLevel || "HSK 3",
      isActive: true,
      createdAt: p.updatedAt || new Date().toISOString(),
    };
  });

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white">
          Quản Trị Người Dùng Nền Tảng
        </h1>
        <p className="text-sm text-slate-500 mt-1">
          Quản lý danh sách tài khoản học viên (User) và quản trị viên (Admin) trên toàn hệ thống.
        </p>
      </div>

      <Card className="border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-500 uppercase font-semibold border-b border-slate-200 dark:bg-slate-800 dark:border-slate-700">
              <tr>
                <th className="py-3 px-4">Người Dùng</th>
                <th className="py-3 px-4">Vai Trò</th>
                <th className="py-3 px-4">Trình Độ Mục Tiêu</th>
                <th className="py-3 px-4">Trạng Thái</th>
                <th className="py-3 px-4">Ngày Tham Gia</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {users.map((u) => (
                <tr key={u.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/30">
                  <td className="py-3 px-4">
                    <span className="font-bold text-slate-900 dark:text-white block">{u.name}</span>
                    <span className="text-slate-400 text-[11px]">{u.email}</span>
                  </td>
                  <td className="py-3 px-4">
                    {u.role === "ADMIN" ? (
                      <Badge variant="destructive" className="flex items-center gap-1 w-fit text-[10px]">
                        <Shield className="h-2.5 w-2.5" /> Quản Trị Viên
                      </Badge>
                    ) : (
                      <Badge variant="secondary" className="text-[10px]">
                        Học Viên
                      </Badge>
                    )}
                  </td>
                  <td className="py-3 px-4 font-medium text-slate-700 dark:text-slate-300">
                    {u.targetLevel}
                  </td>
                  <td className="py-3 px-4">
                    <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-medium bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-400">
                      Hoạt động
                    </span>
                  </td>
                  <td className="py-3 px-4 text-slate-400">
                    {formatDate(u.createdAt)}
                  </td>
                </tr>
              ))}
              {users.length === 0 && (
                <tr>
                  <td colSpan={5} className="py-8 text-center text-slate-400">
                    Chưa có học viên nào tham gia.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}
