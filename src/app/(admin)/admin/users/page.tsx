import prisma from "@/lib/db/prisma";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Users, Shield } from "lucide-react";
import { formatDate } from "@/lib/utils";

export default async function AdminUsersPage() {
  const users = await prisma.user.findMany({
    orderBy: { createdAt: "desc" },
    include: { profile: true },
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
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase bg-purple-100 text-purple-700 dark:bg-purple-950/60 dark:text-purple-300">
                        Admin
                      </span>
                    ) : (
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300">
                        User
                      </span>
                    )}
                  </td>
                  <td className="py-3 px-4 text-slate-600 dark:text-slate-400">
                    {u.profile?.targetLevel || "—"}
                  </td>
                  <td className="py-3 px-4">
                    <Badge variant={u.isActive ? "success" : "destructive"} className="text-[10px]">
                      {u.isActive ? "Hoạt động" : "Tạm khóa"}
                    </Badge>
                  </td>
                  <td className="py-3 px-4 text-slate-500">
                    {formatDate(u.createdAt)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}
