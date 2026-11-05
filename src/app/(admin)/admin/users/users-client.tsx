"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import {
  Users,
  Search,
  Shield,
  UserCheck,
  Award,
  BookOpen,
  ExternalLink,
  RefreshCw,
  Clock,
  Sparkles,
  ChevronLeft,
  ChevronRight,
  User as UserIcon,
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { formatDate } from "@/lib/utils";

export interface EnrichedUser {
  userId: string;
  name: string;
  email: string;
  role: "ADMIN" | "USER";
  targetLevel: string;
  nativeLanguage: string;
  studyHoursWeekly: number;
  totalSessions: number;
  completedSessions: number;
  avgScore: number | null;
  lastActive: string;
  avatar?: string | null;
}

interface UsersClientProps {
  initialUsers: EnrichedUser[];
}

const ITEMS_PER_PAGE = 20;

export function UsersClient({ initialUsers }: UsersClientProps) {
  const [users, setUsers] = useState<EnrichedUser[]>(initialUsers);
  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState("ALL");
  const [levelFilter, setLevelFilter] = useState("ALL");
  const [currentPage, setCurrentPage] = useState(1);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const stats = useMemo(() => {
    const admins = users.filter((u) => u.role === "ADMIN").length;
    const learners = users.filter((u) => u.role === "USER").length;
    const totalSessions = users.reduce((sum, u) => sum + u.totalSessions, 0);

    return { total: users.length, admins, learners, totalSessions };
  }, [users]);

  const filteredUsers = useMemo(() => {
    return users.filter((u) => {
      const matchRole = roleFilter === "ALL" || u.role === roleFilter;
      const matchLevel = levelFilter === "ALL" || u.targetLevel === levelFilter;
      const q = search.toLowerCase().trim();
      const matchSearch =
        !q ||
        u.name.toLowerCase().includes(q) ||
        u.email.toLowerCase().includes(q) ||
        u.userId.toLowerCase().includes(q);

      return matchRole && matchLevel && matchSearch;
    });
  }, [users, roleFilter, levelFilter, search]);

  const totalPages = Math.max(1, Math.ceil(filteredUsers.length / ITEMS_PER_PAGE));
  const currentUsers = useMemo(() => {
    const start = (currentPage - 1) * ITEMS_PER_PAGE;
    return filteredUsers.slice(start, start + ITEMS_PER_PAGE);
  }, [filteredUsers, currentPage]);

  const handleRefresh = async () => {
    setIsRefreshing(true);
    try {
      const res = await fetch("/api/admin/users");
      const d = await res.json();
      if (d.users) {
        setUsers(d.users);
      }
    } catch {
      // ignore
    } finally {
      setIsRefreshing(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200 dark:border-slate-800">
        <div>
          <div className="flex items-center gap-2">
            <Badge variant="destructive" className="bg-purple-600 text-xs">
              Người Dùng Nền Tảng
            </Badge>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white">
              Quản Trị Học Viên & Phân Quyền
            </h1>
          </div>
          <p className="text-sm text-slate-500 mt-1">
            Đồng bộ hồ sơ tài khoản từ Firebase SSO, theo dõi mục tiêu HSK và kết quả khảo thí khẩu ngữ.
          </p>
        </div>

        <Button
          variant="outline"
          size="sm"
          onClick={handleRefresh}
          disabled={isRefreshing}
          className="text-xs flex items-center gap-1.5"
        >
          <RefreshCw className={`h-3.5 w-3.5 ${isRefreshing ? "animate-spin" : ""}`} />
          <span>{isRefreshing ? "Đang đồng bộ..." : "Làm mới dữ liệu"}</span>
        </Button>
      </div>

      {/* KPI Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <Card className="border-slate-200 dark:border-slate-800">
          <CardContent className="p-4 space-y-1">
            <div className="flex items-center justify-between text-xs text-slate-500 font-medium">
              <span>Tổng Người Dùng</span>
              <Users className="h-4 w-4 text-purple-600" />
            </div>
            <div className="text-2xl font-black text-slate-900 dark:text-white">
              {stats.total}
            </div>
            <p className="text-[11px] text-slate-400">Firebase & Khảo thí</p>
          </CardContent>
        </Card>

        <Card className="border-slate-200 dark:border-slate-800">
          <CardContent className="p-4 space-y-1">
            <div className="flex items-center justify-between text-xs text-slate-500 font-medium">
              <span>Học Viên Luyện Thi</span>
              <BookOpen className="h-4 w-4 text-blue-600" />
            </div>
            <div className="text-2xl font-black text-blue-600">
              {stats.learners}
            </div>
            <p className="text-[11px] text-slate-400">Tài khoản học viên</p>
          </CardContent>
        </Card>

        <Card className="border-slate-200 dark:border-slate-800">
          <CardContent className="p-4 space-y-1">
            <div className="flex items-center justify-between text-xs text-slate-500 font-medium">
              <span>Quản Trị Viên</span>
              <Shield className="h-4 w-4 text-rose-600" />
            </div>
            <div className="text-2xl font-black text-rose-600">
              {stats.admins}
            </div>
            <p className="text-[11px] text-slate-400">Quyền truy cập Admin</p>
          </CardContent>
        </Card>

        <Card className="border-slate-200 dark:border-slate-800">
          <CardContent className="p-4 space-y-1">
            <div className="flex items-center justify-between text-xs text-slate-500 font-medium">
              <span>Tổng Phiên Khảo Thí</span>
              <Award className="h-4 w-4 text-emerald-600" />
            </div>
            <div className="text-2xl font-black text-emerald-600">
              {stats.totalSessions}
            </div>
            <p className="text-[11px] text-slate-400">Đã tham gia đánh giá</p>
          </CardContent>
        </Card>
      </div>

      {/* Filter Toolbar */}
      <div className="flex flex-col sm:flex-row gap-3 items-stretch sm:items-center justify-between">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
          <input
            type="text"
            placeholder="Tìm theo tên học viên, email, mã UID..."
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setCurrentPage(1);
            }}
            className="w-full pl-9 pr-4 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-900 dark:text-white placeholder-slate-400 focus:outline-hidden focus:ring-2 focus:ring-purple-500"
          />
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          {/* Level Filter */}
          <select
            value={levelFilter}
            onChange={(e) => {
              setLevelFilter(e.target.value);
              setCurrentPage(1);
            }}
            className="px-3 py-1.5 text-xs rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 focus:outline-hidden"
          >
            <option value="ALL">Mọi trình độ HSK</option>
            {["HSK 1", "HSK 2", "HSK 3", "HSK 4", "HSK 5", "HSK 6"].map((lvl) => (
              <option key={lvl} value={lvl}>
                {lvl}
              </option>
            ))}
          </select>

          {/* Role Filter */}
          <div className="flex rounded-xl bg-slate-100 dark:bg-slate-800 p-0.5 text-xs">
            {["ALL", "USER", "ADMIN"].map((r) => (
              <button
                key={r}
                onClick={() => {
                  setRoleFilter(r);
                  setCurrentPage(1);
                }}
                className={`px-2.5 py-1.5 rounded-lg font-medium transition-all ${
                  roleFilter === r
                    ? "bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-xs"
                    : "text-slate-500 hover:text-slate-900 dark:hover:text-white"
                }`}
              >
                {r === "ALL" ? "Tất cả vai trò" : r === "ADMIN" ? "Quản trị viên" : "Học viên"}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Users Table */}
      <Card className="border-slate-200 dark:border-slate-800 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 dark:bg-slate-900/70 text-slate-500 uppercase font-semibold border-b border-slate-200 dark:border-slate-800">
              <tr>
                <th className="py-3 px-4">Học Viên</th>
                <th className="py-3 px-4">Vai Trò</th>
                <th className="py-3 px-4">Mục Tiêu HSK</th>
                <th className="py-3 px-4">Số Bài Thi</th>
                <th className="py-3 px-4">Điểm TB</th>
                <th className="py-3 px-4">Hoạt Động Cuối</th>
                <th className="py-3 px-4 text-right">Lịch Sử Thi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {currentUsers.map((u) => (
                <tr key={u.userId} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/30">
                  <td className="py-3 px-4">
                    <div className="flex items-center gap-2.5">
                      {u.avatar ? (
                        <img
                          src={u.avatar}
                          alt={u.name}
                          className="w-7 h-7 rounded-full object-cover shrink-0 border border-purple-200"
                        />
                      ) : (
                        <div className="w-7 h-7 rounded-full bg-purple-100 dark:bg-purple-950/60 text-purple-700 dark:text-purple-300 flex items-center justify-center font-bold text-xs shrink-0">
                          {u.name ? u.name.charAt(0).toUpperCase() : "U"}
                        </div>
                      )}
                      <div className="min-w-0">
                        <span className="font-bold text-slate-900 dark:text-white block truncate max-w-[200px]">
                          {u.name}
                        </span>
                        <span className="text-slate-400 text-[11px] block truncate max-w-[200px]">
                          {u.email || u.userId}
                        </span>
                      </div>
                    </div>
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

                  <td className="py-3 px-4">
                    <Badge variant="cinnabar" className="text-[10px] font-bold">
                      {u.targetLevel}
                    </Badge>
                  </td>

                  <td className="py-3 px-4 text-slate-700 dark:text-slate-300">
                    <span className="font-bold text-slate-900 dark:text-white">{u.completedSessions}</span>
                    <span className="text-slate-400 text-[10px]"> / {u.totalSessions} bài</span>
                  </td>

                  <td className="py-3 px-4">
                    {typeof u.avgScore === "number" ? (
                      <span className={`font-bold ${u.avgScore >= 60 ? "text-emerald-600" : "text-rose-600"}`}>
                        {u.avgScore} / 100
                      </span>
                    ) : (
                      <span className="text-slate-400 italic text-[11px]">Chưa thi</span>
                    )}
                  </td>

                  <td className="py-3 px-4 text-slate-400 text-[11px]">
                    {formatDate(u.lastActive)}
                  </td>

                  <td className="py-3 px-4 text-right">
                    <Link
                      href={`/admin/sessions?search=${encodeURIComponent(u.email || u.userId)}`}
                      className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-purple-600 hover:text-purple-700 hover:bg-purple-50 dark:hover:bg-purple-950/50 font-semibold transition-colors"
                    >
                      <span>Xem bài thi</span>
                      <ExternalLink className="h-3 w-3" />
                    </Link>
                  </td>
                </tr>
              ))}

              {filteredUsers.length === 0 && (
                <tr>
                  <td colSpan={7} className="py-10 text-center text-slate-400">
                    <Users className="h-8 w-8 mx-auto text-slate-300 dark:text-slate-700 mb-2" />
                    <p className="font-medium text-sm">Không tìm thấy người dùng phù hợp</p>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Bar */}
        {filteredUsers.length > ITEMS_PER_PAGE && (
          <div className="p-3 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between text-xs text-slate-500 bg-slate-50/50 dark:bg-slate-900/50">
            <span>
              Hiển thị {(currentPage - 1) * ITEMS_PER_PAGE + 1} -{" "}
              {Math.min(currentPage * ITEMS_PER_PAGE, filteredUsers.length)} trên tổng số {filteredUsers.length} người dùng
            </span>

            <div className="flex items-center gap-1">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                disabled={currentPage === 1}
                className="h-7 px-2 text-xs"
              >
                <ChevronLeft className="h-3.5 w-3.5" />
                <span>Trước</span>
              </Button>

              <span className="px-2 font-bold text-slate-700 dark:text-slate-300">
                {currentPage} / {totalPages}
              </span>

              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                disabled={currentPage === totalPages}
                className="h-7 px-2 text-xs"
              >
                <span>Sau</span>
                <ChevronRight className="h-3.5 w-3.5" />
              </Button>
            </div>
          </div>
        )}
      </Card>
    </div>
  );
}
