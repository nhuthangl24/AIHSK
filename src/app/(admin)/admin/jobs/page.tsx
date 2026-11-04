import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Activity } from "lucide-react";
import { formatDate } from "@/lib/utils";

export default async function AdminJobsPage() {
  const jobs: any[] = [];

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white">
          Xử Lý Tác Vụ Ngầm & Hàng Đợi Worker
        </h1>
        <p className="text-sm text-slate-500 mt-1">
          Theo dõi quy trình chấm điểm bất đồng bộ, tác vụ chuyển văn bản giọng nói và thử lại tác vụ lỗi.
        </p>
      </div>

      <Card className="border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-500 uppercase font-semibold border-b border-slate-200 dark:bg-slate-800 dark:border-slate-700">
              <tr>
                <th className="py-3 px-4">Mã Tác Vụ</th>
                <th className="py-3 px-4">Loại Tác Vụ</th>
                <th className="py-3 px-4">Trạng Thái</th>
                <th className="py-3 px-4">Số Lần Thử Lại</th>
                <th className="py-3 px-4">Ngày Tạo</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {jobs.map((j) => (
                <tr key={j.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/30">
                  <td className="py-3 px-4 font-mono text-[11px] text-slate-600 dark:text-slate-400">
                    {j.id.substring(0, 12)}...
                  </td>
                  <td className="py-3 px-4 font-bold text-slate-900 dark:text-white">
                    {j.jobType}
                  </td>
                  <td className="py-3 px-4">
                    <Badge variant={j.status === "COMPLETED" ? "success" : "warning"} className="text-[10px]">
                      {j.status}
                    </Badge>
                  </td>
                  <td className="py-3 px-4 text-slate-500">
                    {j.retries} / {j.maxRetries}
                  </td>
                  <td className="py-3 px-4 text-slate-500">
                    {formatDate(j.createdAt)}
                  </td>
                </tr>
              ))}
              {jobs.length === 0 && (
                <tr>
                  <td colSpan={5} className="py-8 text-center text-slate-400">
                    Không có tác vụ ngầm nào đang chờ xử lý.
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
