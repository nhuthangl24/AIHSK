"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import {
  User,
  Mail,
  GraduationCap,
  Globe2,
  Clock,
  Target,
  CheckCircle2,
  AlertCircle,
  Loader2,
  Save,
  ShieldCheck,
} from "lucide-react";

interface ProfileClientProps {
  initialData: {
    name: string;
    email: string;
    targetLevel: string;
    nativeLanguage: string;
    studyHoursWeekly: number;
    learningGoal: string;
  };
}

const HSK_LEVELS = [
  { value: "HSK 1", label: "HSK 1 (Sơ cấp 1 - Tự giới thiệu & hội thoại cơ bản)" },
  { value: "HSK 2", label: "HSK 2 (Sơ cấp 2 - Giao tiếp tình huống hàng ngày)" },
  { value: "HSK 3", label: "HSK 3 (Trung cấp 1 - Độc lập trao đổi đời sống)" },
  { value: "HSK 4", label: "HSK 4 (Trung cấp 2 - Thảo luận và phản biện theo chủ đề)" },
  { value: "HSK 5", label: "HSK 5 (Cao cấp 1 - Thuyết trình trôi chảy & tư duy sâu)" },
  { value: "HSK 6", label: "HSK 6 (Cao cấp 2 - Sử dụng điêu luyện như người bản xứ)" },
];

const NATIVE_LANGUAGES = [
  "Tiếng Việt",
  "English",
  "한국어 (Korean)",
  "日本語 (Japanese)",
  "Tiếng Pháp (Français)",
  "Khác",
];

export default function ProfileClient({ initialData }: ProfileClientProps) {
  const [name, setName] = useState(initialData.name);
  const [targetLevel, setTargetLevel] = useState(
    initialData.targetLevel.replace(/\s*\/\s*[A-Z][0-9]/g, "").trim() || "HSK 3"
  );
  const [nativeLanguage, setNativeLanguage] = useState(initialData.nativeLanguage || "Tiếng Việt");
  const [studyHoursWeekly, setStudyHoursWeekly] = useState(initialData.studyHoursWeekly || 3);
  const [learningGoal, setLearningGoal] = useState(initialData.learningGoal || "");

  const [isSaving, setIsSaving] = useState(false);
  const [statusMessage, setStatusMessage] = useState<{
    type: "success" | "error";
    text: string;
  } | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    setStatusMessage(null);

    try {
      const res = await fetch("/api/user/profile", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: name.trim(),
          targetLevel,
          nativeLanguage,
          studyHoursWeekly: Number(studyHoursWeekly),
          learningGoal: learningGoal.trim(),
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Không thể lưu thông tin hồ sơ");
      }

      setStatusMessage({
        type: "success",
        text: "Đã lưu cập nhật hồ sơ & mục tiêu học tập thành công!",
      });

      setTimeout(() => {
        setStatusMessage(null);
      }, 4000);
    } catch (err: any) {
      setStatusMessage({
        type: "error",
        text: err.message || "Đã xảy ra lỗi khi lưu hồ sơ. Vui lòng thử lại.",
      });
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {statusMessage && (
        <div
          className={`p-4 rounded-2xl flex items-center gap-3 text-sm animate-in fade-in slide-in-from-top-2 border ${
            statusMessage.type === "success"
              ? "bg-emerald-50 text-emerald-800 border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-300 dark:border-emerald-800"
              : "bg-rose-50 text-rose-800 border-rose-200 dark:bg-rose-950/40 dark:text-rose-300 dark:border-rose-800"
          }`}
        >
          {statusMessage.type === "success" ? (
            <CheckCircle2 className="h-5 w-5 text-emerald-600 shrink-0" />
          ) : (
            <AlertCircle className="h-5 w-5 text-rose-600 shrink-0" />
          )}
          <span className="font-medium">{statusMessage.text}</span>
        </div>
      )}

      <Card className="border-slate-200 dark:border-slate-800 shadow-sm rounded-2xl overflow-hidden">
        <CardHeader className="bg-slate-50/50 dark:bg-slate-900/40 border-b border-slate-100 dark:border-slate-800 pb-5">
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <User className="h-5 w-5 text-rose-600" />
                Thông Tin Cá Nhân & Tài Khoản
              </CardTitle>
              <CardDescription className="text-xs text-slate-500 mt-1">
                Tùy chỉnh thông số học viên và chuẩn cấp độ mục tiêu HSK cho các kỳ khảo thí.
              </CardDescription>
            </div>
            <span className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-semibold bg-emerald-50 text-emerald-700 dark:bg-emerald-950/50 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800">
              <ShieldCheck className="h-3.5 w-3.5" />
              Đã xác thực
            </span>
          </div>
        </CardHeader>

        <CardContent className="p-6 space-y-6">
          {/* Row 1: Name & Email */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div className="space-y-2">
              <Label htmlFor="name" className="text-xs font-semibold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                <User className="h-3.5 w-3.5 text-slate-400" />
                Họ và Tên
              </Label>
              <Input
                id="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Nhập họ và tên học viên..."
                required
                className="h-10 text-sm rounded-xl focus-visible:ring-rose-500"
              />
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="email" className="text-xs font-semibold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                  <Mail className="h-3.5 w-3.5 text-slate-400" />
                  Địa Chỉ Email
                </Label>
                <span className="text-[10px] text-slate-400 font-medium">Cố định theo tài khoản</span>
              </div>
              <Input
                id="email"
                value={initialData.email}
                disabled
                className="h-10 text-sm rounded-xl bg-slate-50 dark:bg-slate-900/80 text-slate-500 cursor-not-allowed border-dashed"
              />
            </div>
          </div>

          {/* Row 2: Target Level & Native Language */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div className="space-y-2">
              <Label htmlFor="targetLevel" className="text-xs font-semibold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                <GraduationCap className="h-3.5 w-3.5 text-rose-500" />
                Cấp Độ HSK Mục Tiêu
              </Label>
              <select
                id="targetLevel"
                value={targetLevel}
                onChange={(e) => setTargetLevel(e.target.value)}
                className="w-full h-10 px-3 text-sm rounded-xl border border-input bg-background text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-rose-500 transition-all cursor-pointer font-medium"
              >
                {HSK_LEVELS.map((lvl) => (
                  <option key={lvl.value} value={lvl.value}>
                    {lvl.label}
                  </option>
                ))}
              </select>
              <p className="text-[11px] text-slate-500">
                Giám khảo AI sẽ điều chỉnh độ khó từ vựng và câu hỏi phỏng vấn tương ứng theo cấp độ này.
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="nativeLanguage" className="text-xs font-semibold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                <Globe2 className="h-3.5 w-3.5 text-slate-400" />
                Ngôn Ngữ Mẹ Đẻ
              </Label>
              <select
                id="nativeLanguage"
                value={nativeLanguage}
                onChange={(e) => setNativeLanguage(e.target.value)}
                className="w-full h-10 px-3 text-sm rounded-xl border border-input bg-background text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-rose-500 transition-all cursor-pointer font-medium"
              >
                {NATIVE_LANGUAGES.map((lang) => (
                  <option key={lang} value={lang}>
                    {lang}
                  </option>
                ))}
              </select>
              <p className="text-[11px] text-slate-500">
                Hệ thống âm học AI dùng để phân tích các lỗi phát âm và thanh điệu đặc trưng.
              </p>
            </div>
          </div>

          {/* Row 3: Study Hours */}
          <div className="space-y-2">
            <Label htmlFor="studyHours" className="text-xs font-semibold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
              <Clock className="h-3.5 w-3.5 text-slate-400" />
              Số Giờ Luyện Nói Hàng Tuần
            </Label>
            <div className="flex items-center gap-3">
              <Input
                id="studyHours"
                type="number"
                min={1}
                max={40}
                value={studyHoursWeekly}
                onChange={(e) => setStudyHoursWeekly(Number(e.target.value))}
                className="h-10 w-32 text-sm rounded-xl focus-visible:ring-rose-500 font-semibold"
              />
              <span className="text-xs text-slate-500">giờ / tuần (Khuyến nghị 3 - 5 giờ để duy trì phản xạ khẩu ngữ)</span>
            </div>
          </div>

          {/* Row 4: Learning Goal */}
          <div className="space-y-2">
            <Label htmlFor="learningGoal" className="text-xs font-semibold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
              <Target className="h-3.5 w-3.5 text-slate-400" />
              Mục Tiêu Học Tập & Khảo Thí
            </Label>
            <textarea
              id="learningGoal"
              rows={3}
              value={learningGoal}
              onChange={(e) => setLearningGoal(e.target.value)}
              placeholder="Ví dụ: Chuẩn bị thi HSKK Trung cấp, ứng tuyển học bổng du học Bắc Kinh hoặc giao tiếp thương mại..."
              className="w-full rounded-xl border border-input bg-background p-3.5 text-sm text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-rose-500 transition-all resize-none"
            />
          </div>

          {/* Action Button Bar */}
          <div className="pt-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-end gap-3">
            <Button
              type="submit"
              disabled={isSaving}
              className="bg-rose-600 hover:bg-rose-700 text-white font-semibold text-xs h-10 px-6 rounded-xl flex items-center gap-2 shadow-xs transition-all"
            >
              {isSaving ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  <span>Đang lưu thay đổi...</span>
                </>
              ) : (
                <>
                  <Save className="h-4 w-4" />
                  <span>Lưu Thay Đổi</span>
                </>
              )}
            </Button>
          </div>
        </CardContent>
      </Card>
    </form>
  );
}
