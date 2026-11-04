import Link from "next/link";
import { getCurrentUser } from "@/lib/auth/session";
import { AIClient } from "@/lib/ai/ai-client";
import { assessmentStore } from "@/lib/db/assessment-store";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  ShieldAlert,
  Users,
  Activity,
  Cpu,
  CheckCircle2,
  AlertTriangle,
  Clock,
  Layers,
  HelpCircle,
  Flame,
  ArrowRight,
  ExternalLink,
} from "lucide-react";
import { formatDate } from "@/lib/utils";

export default async function PlatformAdminPage() {
  const allSessions = assessmentStore.getAllSessions();
  const templates = assessmentStore.getTemplates();
  const allTickets = assessmentStore.getAllSupportTickets();

  const assessmentCount = allSessions.length;
  const completedCount = allSessions.filter((s) => s.status === "COMPLETED").length;
  const failedCount = allSessions.filter((s) => s.status === "FAILED").length;
  const userCount = Math.max(1, new Set(allSessions.map((s) => s.userId)).size);

  const openTickets = allTickets.filter((t) => t.status === "OPEN" || t.status === "IN_PROGRESS");
  const urgentTickets = allTickets.filter((t) => t.priority === "URGENT" && t.status !== "RESOLVED" && t.status !== "CLOSED");
  const recentTickets = allTickets.slice(0, 5);

  const recentJobs: any[] = [];
  const auditLogs: any[] = [];
  const activeAI = await AIClient.getActiveConfig().catch(() => ({
    providerName: "hhtech",
    modelId: "claude-sonnet-4.6",
    isEnabled: true,
    apiKey: "configured",
  }));

  const activeLLMTitle = activeAI.apiKey && activeAI.isEnabled
    ? `${activeAI.providerName === "hhtech" ? "HHTECH.API" : activeAI.providerName.toUpperCase()} · ${activeAI.modelId}`
    : "Built-in Adaptive Neural Engine";

  return (
    <div className="space-y-8">
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-200 dark:border-slate-800">
        <div>
          <div className="flex items-center gap-2">
            <Badge variant="destructive" className="text-xs">
              Quản Trị Viên Cấp Cao
            </Badge>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white">
              Quản Trị Nền Tảng Classnia AI
            </h1>
          </div>
          <p className="text-sm text-slate-500 mt-1">
            Giám sát hệ thống, điều phối mô hình AI, tiếp nhận yêu cầu hỗ trợ và nhật ký bảo mật.
          </p>
        </div>

        <Link href="/admin/support">
          <Button className="bg-purple-600 hover:bg-purple-700 text-white font-bold text-xs rounded-xl gap-2 shadow-xs h-10 px-4">
            <HelpCircle className="h-4 w-4" />
            <span>Xử Lý Yêu Cầu ({openTickets.length})</span>
            {urgentTickets.length > 0 && (
              <span className="h-2 w-2 rounded-full bg-rose-400 animate-pulse" />
            )}
          </Button>
        </Link>
      </div>

      {/* KPI Stats (5 Columns) */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
        <Card className="border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-2xs">
          <CardContent className="p-4 space-y-1.5">
            <div className="flex items-center justify-between text-xs font-medium text-slate-500">
              <span>Người Dùng</span>
              <Users className="h-4 w-4 text-purple-600" />
            </div>
            <div className="text-2xl font-black text-slate-900 dark:text-white">
              {userCount}
            </div>
            <p className="text-[10px] text-slate-500">Học viên & Quản trị</p>
          </CardContent>
        </Card>

        <Card className="border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-2xs">
          <CardContent className="p-4 space-y-1.5">
            <div className="flex items-center justify-between text-xs font-medium text-slate-500">
              <span>Phiên Thi Khẩu Ngữ</span>
              <Activity className="h-4 w-4 text-blue-600" />
            </div>
            <div className="text-2xl font-black text-slate-900 dark:text-white">
              {assessmentCount}
            </div>
            <p className="text-[10px] text-emerald-600 font-medium">
              {assessmentCount > 0 ? Math.round((completedCount / assessmentCount) * 100) : 100}% Hoàn thành
            </p>
          </CardContent>
        </Card>

        {/* Support Tickets KPI Card */}
        <Link href="/admin/support" className="block group">
          <Card className="border-purple-200/90 dark:border-purple-900/60 bg-purple-50/30 dark:bg-purple-950/20 shadow-2xs group-hover:border-purple-500 transition-all">
            <CardContent className="p-4 space-y-1.5">
              <div className="flex items-center justify-between text-xs font-bold text-purple-700 dark:text-purple-300">
                <span>Yêu Cầu & Báo Lỗi</span>
                <HelpCircle className="h-4 w-4 text-purple-600" />
              </div>
              <div className="text-2xl font-black text-purple-700 dark:text-purple-300">
                {allTickets.length}
              </div>
              <p className="text-[10px] text-purple-600 font-semibold flex items-center gap-1">
                {openTickets.length > 0 ? (
                  <>
                    <span className="w-1.5 h-1.5 rounded-full bg-amber-500" />
                    {openTickets.length} chờ xử lý
                  </>
                ) : (
                  "Đã xử lý tất cả"
                )}
              </p>
            </CardContent>
          </Card>
        </Link>

        <Card className="border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-2xs">
          <CardContent className="p-4 space-y-1.5">
            <div className="flex items-center justify-between text-xs font-medium text-slate-500">
              <span>Động Cơ Chấm Điểm</span>
              <Cpu className="h-4 w-4 text-emerald-600" />
            </div>
            <div className="text-xl font-black text-emerald-600">
              Sẵn Sàng
            </div>
            <p className="text-[10px] text-slate-500">Động cơ hội thoại chuẩn</p>
          </CardContent>
        </Card>

        <Card className="border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-2xs">
          <CardContent className="p-4 space-y-1.5">
            <div className="flex items-center justify-between text-xs font-medium text-slate-500">
              <span>Mẫu Đề Khảo Thí</span>
              <Layers className="h-4 w-4 text-rose-600" />
            </div>
            <div className="text-2xl font-black text-slate-900 dark:text-white">
              {templates.length}
            </div>
            <p className="text-[10px] text-slate-500">Bộ đề chuẩn hóa HSK</p>
          </CardContent>
        </Card>
      </div>

      {/* Recent Support Tickets Section */}
      <Card className="border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-2xs">
        <CardHeader className="flex flex-row items-center justify-between pb-3">
          <div>
            <CardTitle className="text-base font-bold flex items-center gap-2">
              <HelpCircle className="h-5 w-5 text-purple-600" />
              <span>Yêu Cầu Hỗ Trợ & Báo Lỗi Mới Nhất</span>
            </CardTitle>
            <CardDescription className="text-xs">
              Các phản hồi kỹ thuật và góp ý Giám khảo AI cần theo dõi từ học viên
            </CardDescription>
          </div>
          <Link href="/admin/support">
            <Button variant="ghost" size="sm" className="text-xs text-purple-700 dark:text-purple-300 font-bold gap-1">
              <span>Xem Tất Cả & Phản Hồi</span>
              <ArrowRight className="h-3.5 w-3.5" />
            </Button>
          </Link>
        </CardHeader>
        <CardContent className="p-5 pt-0">
          {recentTickets.length === 0 ? (
            <div className="py-8 text-center text-xs text-slate-400">
              Chưa có yêu cầu hỗ trợ nào từ học viên.
            </div>
          ) : (
            <div className="divide-y divide-slate-100 dark:divide-slate-800 text-xs">
              {recentTickets.map((ticket) => {
                const isUrgent = ticket.priority === "URGENT";
                const isResolved = ticket.status === "RESOLVED" || ticket.status === "CLOSED";

                return (
                  <div key={ticket.id} className="py-3 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2 flex-wrap mb-1">
                        <span className="font-mono font-bold text-purple-700 dark:text-purple-300">
                          #{ticket.id}
                        </span>
                        {isUrgent && (
                          <Badge variant="destructive" className="text-[9px] font-bold px-1.5 py-0">
                            Khẩn cấp
                          </Badge>
                        )}
                        <Badge
                          variant="outline"
                          className={
                            isResolved
                              ? "bg-emerald-50 text-emerald-700 border-emerald-300 text-[9px]"
                              : ticket.status === "IN_PROGRESS"
                              ? "bg-blue-50 text-blue-700 border-blue-300 text-[9px]"
                              : "bg-amber-50 text-amber-700 border-amber-300 text-[9px]"
                          }
                        >
                          {isResolved ? "Đã giải quyết" : ticket.status === "IN_PROGRESS" ? "Đang xử lý" : "Mới tiếp nhận"}
                        </Badge>
                        <span className="text-[11px] text-slate-400">
                          {ticket.userName} ({ticket.userEmail})
                        </span>
                      </div>
                      <p className="font-bold text-slate-800 dark:text-slate-200 truncate">
                        {ticket.title}
                      </p>
                      <p className="text-[11px] text-slate-500 line-clamp-1 mt-0.5">
                        {ticket.description}
                      </p>
                    </div>

                    <Link href="/admin/support" className="shrink-0 self-start sm:self-center">
                      <Button size="sm" variant="outline" className="text-xs h-7 px-3 rounded-lg border-purple-200 text-purple-700 hover:bg-purple-50">
                        Xử lý &rarr;
                      </Button>
                    </Link>
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Recent Exam Sessions Section */}
      <Card className="border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-2xs">
        <CardHeader className="flex flex-row items-center justify-between pb-3">
          <div>
            <CardTitle className="text-base font-bold flex items-center gap-2">
              <Activity className="h-5 w-5 text-rose-600" />
              <span>Phiên Thi Khẩu Ngữ Gần Đây</span>
            </CardTitle>
            <CardDescription className="text-xs">
              Các lượt thi mới nhất của học viên trên toàn hệ thống
            </CardDescription>
          </div>
          <Link href="/admin/sessions">
            <Button variant="ghost" size="sm" className="text-xs text-rose-600 hover:text-rose-700 font-bold gap-1">
              <span>Xem Tất Cả Bài Thi</span>
              <ArrowRight className="h-3.5 w-3.5" />
            </Button>
          </Link>
        </CardHeader>
        <CardContent className="p-5 pt-0">
          {allSessions.length === 0 ? (
            <div className="py-8 text-center text-xs text-slate-400">
              Chưa có phiên thi nào được ghi nhận.
            </div>
          ) : (
            <div className="divide-y divide-slate-100 dark:divide-slate-800 text-xs">
              {allSessions.slice(0, 5).map((session) => {
                const targetLvl = session.template?.targetLevel || session.result?.hskLevel || "HSK 3";
                const isCompleted = session.status === "COMPLETED";
                const score = session.result?.overallScore;

                return (
                  <div key={session.id} className="py-3 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2 flex-wrap mb-1">
                        <span className="font-mono font-bold text-rose-600 dark:text-rose-400">
                          {session.id.substring(0, 10)}...
                        </span>
                        <Badge variant="cinnabar" className="text-[9px] font-bold px-1.5 py-0">
                          {targetLvl}
                        </Badge>
                        <Badge
                          variant="outline"
                          className={
                            isCompleted
                              ? "bg-emerald-50 text-emerald-700 border-emerald-300 text-[9px]"
                              : session.status === "IN_PROGRESS"
                              ? "bg-blue-50 text-blue-700 border-blue-300 text-[9px]"
                              : "bg-slate-100 text-slate-700 border-slate-300 text-[9px]"
                          }
                        >
                          {isCompleted ? "Hoàn thành" : session.status === "IN_PROGRESS" ? "Đang thi" : session.status}
                        </Badge>
                        <span className="text-[11px] text-slate-400">
                          {session.userEmail || session.userId}
                        </span>
                      </div>
                      <p className="font-semibold text-slate-800 dark:text-slate-200 truncate">
                        {session.template?.title || "Khảo thí khẩu ngữ chuẩn HSK"} &bull; Chặng {session.currentStage}/5 ({session.turns?.length || 0} lượt thoại)
                      </p>
                    </div>

                    <div className="flex items-center gap-3 shrink-0 self-start sm:self-center">
                      {isCompleted && typeof score === "number" && (
                        <div className="text-right">
                          <span className={`text-sm font-black ${score >= 60 ? "text-emerald-600" : "text-rose-600"}`}>
                            {score}
                          </span>
                          <span className="text-[10px] text-slate-400">/100</span>
                        </div>
                      )}
                      <Link href={`/admin/sessions?search=${session.id}`}>
                        <Button size="sm" variant="outline" className="text-xs h-7 px-3 rounded-lg border-slate-200 hover:bg-slate-50">
                          Chi tiết &rarr;
                        </Button>
                      </Link>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>

      {/* AI Provider Configuration & Health */}
      <Card className="border-slate-200 dark:border-slate-800">
        <CardHeader>
          <CardTitle className="text-base font-bold flex items-center gap-2">
            <Cpu className="h-5 w-5 text-purple-600" />
            <span>Trạng Thái Mô Hình AI & Giọng Nói</span>
          </CardTitle>
          <CardDescription>
            Trạng thái các nhà cung cấp AI với cơ chế tự động chuyển dự phòng sang mô hình ngôn ngữ tích hợp.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
            <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/40 space-y-1.5">
              <span className="font-bold text-slate-500 uppercase tracking-wider text-[10px]">
                Mô Hình AI Giám Khảo
              </span>
              <h4 className="font-bold text-sm text-slate-900 dark:text-white">
                {activeLLMTitle}
              </h4>
              <p className="text-slate-500">
                Điều phối phỏng vấn khẩu ngữ 5 giai đoạn kèm phiên âm Pinyin tự động.
              </p>
            </div>

            <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/40 space-y-1.5">
              <span className="font-bold text-slate-500 uppercase tracking-wider text-[10px]">
                Nhận Dạng Giọng Nói & Âm Thanh
              </span>
              <h4 className="font-bold text-sm text-slate-900 dark:text-white">
                Web Audio STT / Cloud Whisper API
              </h4>
              <p className="text-slate-500">
                Nhận dạng luồng âm thanh tiếng Trung và trích xuất đường nét thanh điệu.
              </p>
            </div>

            <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/40 space-y-1.5">
              <span className="font-bold text-slate-500 uppercase tracking-wider text-[10px]">
                Động Cơ Chấm Điểm
              </span>
              <h4 className="font-bold text-sm text-slate-900 dark:text-white">
                Tâm trắc học 7 chiều kích v1.0
              </h4>
              <p className="text-slate-500">
                Trích xuất quy tắc & bằng chứng hội thoại theo chuẩn HSK & HSKK.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Recent Exam Sessions Section */}
      <Card className="border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-2xs">
        <CardHeader className="flex flex-row items-center justify-between pb-3">
          <div>
            <CardTitle className="text-base font-bold flex items-center gap-2">
              <Activity className="h-5 w-5 text-rose-600" />
              <span>Phiên Thi Khẩu Ngữ Gần Đây</span>
            </CardTitle>
            <CardDescription className="text-xs">
              Các lượt thi mới nhất của học viên trên toàn hệ thống
            </CardDescription>
          </div>
          <Link href="/admin/sessions">
            <Button variant="ghost" size="sm" className="text-xs text-rose-600 hover:text-rose-700 font-bold gap-1">
              <span>Xem Tất Cả Bài Thi</span>
              <ArrowRight className="h-3.5 w-3.5" />
            </Button>
          </Link>
        </CardHeader>
        <CardContent className="p-5 pt-0">
          {allSessions.length === 0 ? (
            <div className="py-8 text-center text-xs text-slate-400">
              Chưa có phiên thi nào được ghi nhận.
            </div>
          ) : (
            <div className="divide-y divide-slate-100 dark:divide-slate-800 text-xs">
              {allSessions.slice(0, 5).map((session) => {
                const targetLvl = session.template?.targetLevel || session.result?.hskLevel || "HSK 3";
                const isCompleted = session.status === "COMPLETED";
                const score = session.result?.overallScore;

                return (
                  <div key={session.id} className="py-3 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2 flex-wrap mb-1">
                        <span className="font-mono font-bold text-rose-600 dark:text-rose-400">
                          {session.id.substring(0, 10)}...
                        </span>
                        <Badge variant="cinnabar" className="text-[9px] font-bold px-1.5 py-0">
                          {targetLvl}
                        </Badge>
                        <Badge
                          variant="outline"
                          className={
                            isCompleted
                              ? "bg-emerald-50 text-emerald-700 border-emerald-300 text-[9px]"
                              : session.status === "IN_PROGRESS"
                              ? "bg-blue-50 text-blue-700 border-blue-300 text-[9px]"
                              : "bg-slate-100 text-slate-700 border-slate-300 text-[9px]"
                          }
                        >
                          {isCompleted ? "Hoàn thành" : session.status === "IN_PROGRESS" ? "Đang thi" : session.status}
                        </Badge>
                        <span className="text-[11px] text-slate-400">
                          {session.userEmail || session.userId}
                        </span>
                      </div>
                      <p className="font-semibold text-slate-800 dark:text-slate-200 truncate">
                        {session.template?.title || "Khảo thí khẩu ngữ chuẩn HSK"} &bull; Chặng {session.currentStage}/5 ({session.turns?.length || 0} lượt thoại)
                      </p>
                    </div>

                    <div className="flex items-center gap-3 shrink-0 self-start sm:self-center">
                      {isCompleted && typeof score === "number" && (
                        <div className="text-right">
                          <span className={`text-sm font-black ${score >= 60 ? "text-emerald-600" : "text-rose-600"}`}>
                            {score}
                          </span>
                          <span className="text-[10px] text-slate-400">/100</span>
                        </div>
                      )}
                      <Link href={`/admin/sessions?search=${session.id}`}>
                        <Button size="sm" variant="outline" className="text-xs h-7 px-3 rounded-lg border-slate-200 hover:bg-slate-50">
                          Chi tiết &rarr;
                        </Button>
                      </Link>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Background Jobs & Audit Logs */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card className="border-slate-200 dark:border-slate-800">
          <CardHeader>
            <CardTitle className="text-base font-bold flex items-center gap-2">
              <Activity className="h-4 w-4 text-blue-600" />
              <span>Hàng Đợi Xử Lý Ngầm</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6 pt-0">
            <div className="divide-y divide-slate-100 dark:divide-slate-800 text-xs">
              {recentJobs.length === 0 ? (
                <p className="py-4 text-slate-500">Chưa có tác vụ ngầm nào</p>
              ) : (
                recentJobs.map((j) => (
                  <div key={j.id} className="py-2.5 flex items-center justify-between">
                    <div>
                      <span className="font-semibold text-slate-900 dark:text-white">{j.jobType}</span>
                      <p className="text-[10px] text-slate-400">{formatDate(j.createdAt)}</p>
                    </div>
                    <Badge variant={j.status === "COMPLETED" ? "success" : "warning"} className="text-[10px]">
                      {j.status}
                    </Badge>
                  </div>
                ))
              )}
            </div>
          </CardContent>
        </Card>

        <Card className="border-slate-200 dark:border-slate-800">
          <CardHeader>
            <CardTitle className="text-base font-bold flex items-center gap-2">
              <ShieldAlert className="h-4 w-4 text-purple-600" />
              <span>Nhật Ký Bảo Mật & Hệ Thống</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6 pt-0">
            <div className="divide-y divide-slate-100 dark:divide-slate-800 text-xs">
              {auditLogs.map((log) => (
                <div key={log.id} className="py-2.5 flex items-center justify-between">
                  <div>
                    <span className="font-semibold text-slate-800 dark:text-slate-200">{log.action}</span>
                    <p className="text-[10px] text-slate-400">Người thực hiện: {log.actor?.email || "Hệ thống"} &bull; {formatDate(log.createdAt)}</p>
                  </div>
                  <span className="font-mono text-[10px] text-slate-500 bg-slate-100 dark:bg-slate-800 px-1.5 py-0.5 rounded">
                    {log.entityType}
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
