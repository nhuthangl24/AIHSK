"use client";

import { useState } from "react";
import {
  Settings2,
  Plus,
  Clock,
  Layers,
  Edit,
  Trash2,
  CheckCircle2,
  XCircle,
  X,
  Save,
  RefreshCw,
  Sparkles,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import type { StoredTemplate } from "@/lib/db/assessment-store";

interface TemplatesClientProps {
  initialTemplates: StoredTemplate[];
}

export function TemplatesClient({ initialTemplates }: TemplatesClientProps) {
  const [templates, setTemplates] = useState<StoredTemplate[]>(initialTemplates);
  const [editingTemplate, setEditingTemplate] = useState<Partial<StoredTemplate> | null>(null);
  const [isCreating, setIsCreating] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  const handleToggleActive = async (template: StoredTemplate) => {
    const newActive = !template.isActive;
    try {
      const res = await fetch("/api/admin/templates", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: template.id, isActive: newActive }),
      });
      const data = await res.json();
      if (res.ok) {
        setTemplates((prev) =>
          prev.map((t) => (t.id === template.id ? data.template : t))
        );
      } else {
        alert(data.error || "Không thể cập nhật trạng thái");
      }
    } catch {
      alert("Lỗi kết nối");
    }
  };

  const handleDelete = async (id: string, title: string) => {
    if (!confirm(`Bạn có chắc muốn xóa đề thi "${title}"?`)) return;
    try {
      const res = await fetch(`/api/admin/templates?id=${id}`, { method: "DELETE" });
      if (res.ok) {
        setTemplates((prev) => prev.filter((t) => t.id !== id));
      } else {
        alert("Xóa thất bại");
      }
    } catch {
      alert("Lỗi kết nối");
    }
  };

  const handleSaveForm = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingTemplate?.title) return;
    setIsSaving(true);

    try {
      if (isCreating) {
        const res = await fetch("/api/admin/templates", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(editingTemplate),
        });
        const data = await res.json();
        if (res.ok) {
          setTemplates((prev) => [...prev, data.template]);
          setEditingTemplate(null);
          setIsCreating(false);
        } else {
          alert(data.error || "Lỗi tạo mẫu đề");
        }
      } else {
        const res = await fetch("/api/admin/templates", {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(editingTemplate),
        });
        const data = await res.json();
        if (res.ok) {
          setTemplates((prev) =>
            prev.map((t) => (t.id === data.template.id ? data.template : t))
          );
          setEditingTemplate(null);
        } else {
          alert(data.error || "Lỗi lưu mẫu đề");
        }
      }
    } catch {
      alert("Lỗi kết nối mạng");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200 dark:border-slate-800">
        <div>
          <div className="flex items-center gap-2">
            <Badge variant="destructive" className="bg-purple-600 text-xs">
              Ngân Hàng Đề Thi
            </Badge>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white">
              Quản Trị Mẫu Đề Khảo Thí
            </h1>
          </div>
          <p className="text-sm text-slate-500 mt-1">
            Quản lý kịch bản phỏng vấn 5 giai đoạn, thời lượng, số lượt đối thoại và prompt của Giám khảo AI.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={async () => {
              const res = await fetch("/api/admin/templates");
              const d = await res.json();
              if (d.templates) setTemplates(d.templates);
            }}
            className="text-xs flex items-center gap-1.5"
          >
            <RefreshCw className="h-3.5 w-3.5" />
            <span>Làm mới</span>
          </Button>

          <Button
            size="sm"
            onClick={() => {
              setEditingTemplate({
                title: "",
                targetLevel: "HSK 3",
                category: "HSK_ORIENTED",
                description: "",
                estimatedDurationMinutes: 15,
                maxTurns: 18,
                examinerPrompt: "Assess everyday conversational Mandarin under adaptive probing questions.",
                isActive: true,
                isPublic: true,
              });
              setIsCreating(true);
            }}
            className="text-xs bg-purple-600 hover:bg-purple-700 text-white flex items-center gap-1.5"
          >
            <Plus className="h-4 w-4" />
            <span>Tạo Mẫu Đề Mới</span>
          </Button>
        </div>
      </div>

      {/* Templates Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {templates.map((t) => (
          <Card
            key={t.id}
            className={`border transition-all ${
              t.isActive
                ? "border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900"
                : "border-slate-200/50 dark:border-slate-800/50 bg-slate-50/50 dark:bg-slate-950/40 opacity-70"
            }`}
          >
            <CardHeader className="space-y-2 p-5 pb-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Badge variant="cinnabar" className="text-[10px] font-bold">
                    {t.targetLevel}
                  </Badge>
                  <button
                    onClick={() => handleToggleActive(t)}
                    title={t.isActive ? "Bấm để tạm dừng đề này" : "Bấm để kích hoạt"}
                    className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold border transition-colors ${
                      t.isActive
                        ? "bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-300"
                        : "bg-slate-100 text-slate-500 border-slate-200 dark:bg-slate-800 dark:text-slate-400"
                    }`}
                  >
                    {t.isActive ? <CheckCircle2 className="h-3 w-3" /> : <XCircle className="h-3 w-3" />}
                    <span>{t.isActive ? "Đang bật" : "Tạm dừng"}</span>
                  </button>
                </div>

                <span className="text-xs text-slate-500 flex items-center gap-1">
                  <Clock className="h-3.5 w-3.5" /> ~{t.estimatedDurationMinutes}p
                </span>
              </div>

              <CardTitle className="text-sm sm:text-base font-bold text-slate-900 dark:text-white line-clamp-1">
                {t.title}
              </CardTitle>
              <p className="text-xs text-slate-500 line-clamp-2 min-h-[32px]">{t.description}</p>
            </CardHeader>

            <CardContent className="p-5 pt-0 space-y-3 text-xs">
              <div className="pt-2.5 border-t border-slate-100 dark:border-slate-800 flex justify-between text-slate-500">
                <span>Số lượt tối đa:</span>
                <span className="font-semibold text-slate-800 dark:text-slate-200">
                  {t.maxTurns} lượt thoại
                </span>
              </div>

              <div className="flex justify-between text-slate-500">
                <span>Thang đo:</span>
                <span className="font-semibold text-slate-800 dark:text-slate-200">
                  Chuẩn 7 Chiều Kích v1.0
                </span>
              </div>

              <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800">
                <span className="text-[10px] uppercase font-bold text-slate-400 block mb-0.5">Prompt Giám Khảo:</span>
                <p className="text-[11px] text-slate-600 dark:text-slate-300 line-clamp-2 italic">
                  &ldquo;{t.examinerPrompt}&rdquo;
                </p>
              </div>

              {/* Action buttons */}
              <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100 dark:border-slate-800">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => {
                    setEditingTemplate({ ...t });
                    setIsCreating(false);
                  }}
                  className="text-xs h-7 px-2.5 text-slate-700 dark:text-slate-300"
                >
                  <Edit className="h-3.5 w-3.5 mr-1" />
                  <span>Sửa</span>
                </Button>

                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => handleDelete(t.id, t.title)}
                  className="text-xs h-7 px-2.5 text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Edit / Create Modal */}
      {editingTemplate && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/70 backdrop-blur-xs animate-in fade-in duration-150">
          <div
            role="dialog"
            aria-modal="true"
            className="relative w-full max-w-xl max-h-[90vh] flex flex-col rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-2xl overflow-hidden animate-in zoom-in-95 duration-150"
          >
            <div className="p-5 sm:p-6 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
              <div>
                <h3 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white">
                  {isCreating ? "Tạo Mẫu Đề Khảo Thí Mới" : `Chỉnh Sửa: ${editingTemplate.title}`}
                </h3>
                <p className="text-xs text-slate-500">
                  Cấu hình các tham số đánh giá và câu lệnh hệ thống dành cho Giám khảo AI.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setEditingTemplate(null)}
                className="p-1.5 rounded-xl text-slate-400 hover:text-slate-700 dark:hover:text-slate-200"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleSaveForm} className="p-5 sm:p-6 space-y-4 overflow-y-auto flex-1 text-xs">
              <div className="space-y-1">
                <label className="font-bold text-slate-700 dark:text-slate-300">
                  Tiêu đề bài thi khảo thí: *
                </label>
                <input
                  type="text"
                  required
                  value={editingTemplate.title || ""}
                  onChange={(e) => setEditingTemplate({ ...editingTemplate, title: e.target.value })}
                  placeholder="VD: HSK 4 Khảo Thí Biện Luận Hiện Đại..."
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-950 text-slate-900 dark:text-white focus:outline-hidden focus:ring-2 focus:ring-purple-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="font-bold text-slate-700 dark:text-slate-300">
                    Cấp độ mục tiêu:
                  </label>
                  <select
                    value={editingTemplate.targetLevel || "HSK 3"}
                    onChange={(e) => setEditingTemplate({ ...editingTemplate, targetLevel: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-950 text-slate-900 dark:text-white focus:outline-hidden"
                  >
                    {["HSK 1", "HSK 2", "HSK 3", "HSK 4", "HSK 5", "HSK 6"].map((lvl) => (
                      <option key={lvl} value={lvl}>{lvl}</option>
                    ))}
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="font-bold text-slate-700 dark:text-slate-300">
                    Thời lượng ước tính (phút):
                  </label>
                  <input
                    type="number"
                    min={5}
                    max={60}
                    value={editingTemplate.estimatedDurationMinutes || 15}
                    onChange={(e) => setEditingTemplate({ ...editingTemplate, estimatedDurationMinutes: Number(e.target.value) })}
                    className="w-full px-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-950 text-slate-900 dark:text-white focus:outline-hidden focus:ring-2 focus:ring-purple-500"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="font-bold text-slate-700 dark:text-slate-300">
                  Số lượt đối thoại tối đa (Turns):
                </label>
                <input
                  type="number"
                  min={8}
                  max={30}
                  value={editingTemplate.maxTurns || 18}
                  onChange={(e) => setEditingTemplate({ ...editingTemplate, maxTurns: Number(e.target.value) })}
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-950 text-slate-900 dark:text-white focus:outline-hidden focus:ring-2 focus:ring-purple-500"
                />
              </div>

              <div className="space-y-1">
                <label className="font-bold text-slate-700 dark:text-slate-300">
                  Mô tả bài thi:
                </label>
                <textarea
                  rows={2}
                  value={editingTemplate.description || ""}
                  onChange={(e) => setEditingTemplate({ ...editingTemplate, description: e.target.value })}
                  placeholder="Mô tả nội dung kiểm tra, mục tiêu phản xạ..."
                  className="w-full p-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-950 text-slate-900 dark:text-white focus:outline-hidden focus:ring-2 focus:ring-purple-500"
                />
              </div>

              <div className="space-y-1">
                <label className="font-bold text-purple-700 dark:text-purple-400 flex items-center gap-1.5">
                  <Sparkles className="h-3.5 w-3.5" />
                  <span>Prompt chỉ đạo Giám Khảo AI:</span>
                </label>
                <textarea
                  rows={3}
                  value={editingTemplate.examinerPrompt || ""}
                  onChange={(e) => setEditingTemplate({ ...editingTemplate, examinerPrompt: e.target.value })}
                  placeholder="Chỉ dẫn AI điều phối các câu hỏi gợi mở, chấm phát âm và cách đối thoại..."
                  className="w-full p-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-950 text-slate-900 dark:text-white font-mono text-[11px] focus:outline-hidden focus:ring-2 focus:ring-purple-500"
                />
              </div>

              <div className="pt-2 flex items-center justify-between border-t border-slate-100 dark:border-slate-800">
                <label className="flex items-center gap-2 cursor-pointer text-slate-700 dark:text-slate-300">
                  <input
                    type="checkbox"
                    checked={Boolean(editingTemplate.isActive)}
                    onChange={(e) => setEditingTemplate({ ...editingTemplate, isActive: e.target.checked })}
                    className="rounded border-slate-300 text-purple-600 focus:ring-purple-500 h-4 w-4"
                  />
                  <span className="font-semibold">Kích hoạt mở bài thi cho học viên</span>
                </label>
              </div>

              <div className="p-4 border-t border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950/50 flex justify-end gap-2 -mx-6 -mb-6 mt-4">
                <Button
                  type="button"
                  variant="secondary"
                  onClick={() => setEditingTemplate(null)}
                >
                  Hủy
                </Button>
                <Button
                  type="submit"
                  disabled={isSaving}
                  className="bg-purple-600 hover:bg-purple-700 text-white font-bold flex items-center gap-1.5"
                >
                  <Save className="h-3.5 w-3.5" />
                  <span>{isSaving ? "Đang lưu..." : "Lưu Mẫu Đề"}</span>
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
