"use client";

import { useState } from "react";
import {
  Activity,
  Cpu,
  HardDrive,
  Server,
  RefreshCw,
  CheckCircle2,
  Clock,
  Layers,
  Zap,
  ShieldCheck,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { formatDate } from "@/lib/utils";

interface JobsClientProps {
  initialHealth: any;
  initialJobs: any[];
}

export function JobsClient({ initialHealth, initialJobs }: JobsClientProps) {
  const [health, setHealth] = useState<any>(initialHealth);
  const [jobs, setJobs] = useState<any[]>(initialJobs);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);

  const handleRefresh = async () => {
    setIsRefreshing(true);
    setStatusMessage(null);
    try {
      const res = await fetch("/api/admin/jobs");
      const data = await res.json();
      if (data.health) setHealth(data.health);
      if (data.jobs) setJobs(data.jobs);
      setStatusMessage("Đã cập nhật chỉ số hệ thống!");
      setTimeout(() => setStatusMessage(null), 3000);
    } catch {
      alert("Lỗi tải thông tin hệ thống");
    } finally {
      setIsRefreshing(false);
    }
  };

  const handleReloadStore = async () => {
    setIsRefreshing(true);
    try {
      const res = await fetch("/api/admin/jobs", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "reload-store" }),
      });
      const data = await res.json();
      if (res.ok) {
        setStatusMessage(data.message);
        setTimeout(() => setStatusMessage(null), 3500);
      }
    } catch {
      alert("Lỗi kết nối");
    } finally {
      setIsRefreshing(false);
    }
  };

  const formatUptime = (seconds: number) => {
    const d = Math.floor(seconds / (3600 * 24));
    const h = Math.floor((seconds % (3600 * 24)) / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    const s = seconds % 60;
    if (d > 0) return `${d}d ${h}h ${m}m`;
    if (h > 0) return `${h}h ${m}m ${s}s`;
    return `${m}m ${s}s`;
  };

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200 dark:border-slate-800">
        <div>
          <div className="flex items-center gap-2">
            <Badge variant="destructive" className="bg-purple-600 text-xs">
              Hệ Thống & Hiệu Năng
            </Badge>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white">
              Hàng Đợi & Chẩn Đoán Hệ Thống
            </h1>
          </div>
          <p className="text-sm text-slate-500 mt-1">
            Giám sát tài nguyên máy chủ, bộ nhớ Node.js, tệp dữ liệu lưu trữ và tác vụ chấm điểm ngầm.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            disabled={isRefreshing}
            onClick={handleReloadStore}
            className="text-xs"
          >
            Làm Mới Cache Đĩa
          </Button>

          <Button
            size="sm"
            disabled={isRefreshing}
            onClick={handleRefresh}
            className="text-xs bg-purple-600 hover:bg-purple-700 text-white flex items-center gap-1.5"
          >
            <RefreshCw className={`h-3.5 w-3.5 ${isRefreshing ? "animate-spin" : ""}`} />
            <span>Chẩn đoán lại</span>
          </Button>
        </div>
      </div>

      {statusMessage && (
        <div className="p-3 rounded-2xl bg-emerald-50 text-emerald-800 dark:bg-emerald-950/50 dark:text-emerald-300 border border-emerald-200 flex items-center gap-2 text-xs animate-in fade-in">
          <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0" />
          <span>{statusMessage}</span>
        </div>
      )}

      {/* Diagnostics Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Memory */}
        <Card className="border-slate-200 dark:border-slate-800">
          <CardContent className="p-5 space-y-2">
            <div className="flex items-center justify-between text-xs text-slate-500">
              <span>Bộ Nhớ Node.js Heap</span>
              <Cpu className="h-4 w-4 text-purple-600" />
            </div>
            <div className="text-2xl font-black text-slate-900 dark:text-white">
              {health?.memory?.heapUsedMb || 0} MB
            </div>
            <div className="space-y-1">
              <div className="h-2 w-full bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                <div
                  className="h-full bg-purple-600 rounded-full transition-all"
                  style={{ width: `${Math.min(100, health?.memory?.percent || 20)}%` }}
                />
              </div>
              <p className="text-[10px] text-slate-400">
                {health?.memory?.heapTotalMb || 0} MB cấp phát ({health?.memory?.percent || 0}%)
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Runtime */}
        <Card className="border-slate-200 dark:border-slate-800">
          <CardContent className="p-5 space-y-2">
            <div className="flex items-center justify-between text-xs text-slate-500">
              <span>Thời Gian Hoạt Động (Uptime)</span>
              <Clock className="h-4 w-4 text-emerald-600" />
            </div>
            <div className="text-2xl font-black text-emerald-600">
              {formatUptime(health?.uptimeSeconds || 0)}
            </div>
            <p className="text-[11px] text-slate-400">
              Runtime: {health?.nodeVersion} ({health?.platform})
            </p>
          </CardContent>
        </Card>

        {/* Storage */}
        <Card className="border-slate-200 dark:border-slate-800">
          <CardContent className="p-5 space-y-2">
            <div className="flex items-center justify-between text-xs text-slate-500">
              <span>Tệp Cơ Sở Dữ Liệu</span>
              <HardDrive className="h-4 w-4 text-blue-600" />
            </div>
            <div className="text-2xl font-black text-slate-900 dark:text-white">
              {(health?.storage?.sessionsCount || 0) + (health?.storage?.profilesCount || 0) + (health?.storage?.ticketsCount || 0)} tệp
            </div>
            <p className="text-[11px] text-slate-400">
              {health?.storage?.sessionsCount || 0} phiên, {health?.storage?.ticketsCount || 0} tickets
            </p>
          </CardContent>
        </Card>

        {/* AI Engine */}
        <Card className="border-slate-200 dark:border-slate-800">
          <CardContent className="p-5 space-y-2">
            <div className="flex items-center justify-between text-xs text-slate-500">
              <span>Trạng Thái Cổng AI</span>
              <Zap className="h-4 w-4 text-amber-600" />
            </div>
            <div className="text-lg font-black text-slate-900 dark:text-white truncate">
              {health?.activeAI?.provider?.toUpperCase() || "HHTECH.API"}
            </div>
            <p className="text-[11px] text-emerald-600 font-semibold flex items-center gap-1">
              <ShieldCheck className="h-3.5 w-3.5" />
              <span>{health?.activeAI?.model || "claude-sonnet-4.6"}</span>
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Jobs Queue Table */}
      <Card className="border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
        <CardHeader className="p-5 pb-3 border-b border-slate-100 dark:border-slate-800">
          <CardTitle className="text-sm font-bold flex items-center gap-2">
            <Activity className="h-4 w-4 text-purple-600" />
            <span>Hàng Đợi Xử Lý Tác Vụ Ngầm (Live Background Queue)</span>
          </CardTitle>
        </CardHeader>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 dark:bg-slate-900/70 text-slate-500 uppercase font-semibold border-b border-slate-200 dark:border-slate-800">
              <tr>
                <th className="py-3 px-4">Mã Tác Vụ</th>
                <th className="py-3 px-4">Loại Tác Vụ</th>
                <th className="py-3 px-4">Đối Tượng Xử Lý</th>
                <th className="py-3 px-4">Độ Trễ</th>
                <th className="py-3 px-4">Trạng Thái</th>
                <th className="py-3 px-4">Thời Gian</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {jobs.map((j) => (
                <tr key={j.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/30">
                  <td className="py-3 px-4 font-mono text-[11px] text-purple-600 dark:text-purple-400 font-bold">
                    {j.id}
                  </td>
                  <td className="py-3 px-4 font-bold text-slate-900 dark:text-white">
                    {j.jobType}
                  </td>
                  <td className="py-3 px-4 text-slate-600 dark:text-slate-400">
                    {j.target}
                  </td>
                  <td className="py-3 px-4 text-slate-500 font-mono text-[11px]">
                    {j.latencyMs > 0 ? `${j.latencyMs}ms` : "~realtime"}
                  </td>
                  <td className="py-3 px-4">
                    <Badge
                      variant={j.status === "COMPLETED" ? "success" : j.status === "IN_PROGRESS" ? "warning" : "secondary"}
                      className="text-[10px]"
                    >
                      {j.status === "COMPLETED" ? "Hoàn thành" : j.status === "IN_PROGRESS" ? "Đang chạy" : j.status}
                    </Badge>
                  </td>
                  <td className="py-3 px-4 text-slate-400 text-[11px]">
                    {formatDate(j.createdAt)}
                  </td>
                </tr>
              ))}

              {jobs.length === 0 && (
                <tr>
                  <td colSpan={6} className="py-8 text-center text-slate-400">
                    Không có tác vụ ngầm nào đang xếp hàng.
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
