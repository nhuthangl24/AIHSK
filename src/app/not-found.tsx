import Link from "next/link";
import { Button } from "@/components/ui/button";
import { BrandLogo } from "@/components/ui/brand-logo";

export default function NotFound() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-6 bg-slate-50 dark:bg-slate-950 text-center">
      <BrandLogo size={48} className="mb-4" />
      <h1 className="text-4xl font-extrabold text-slate-900 dark:text-white mb-2">404</h1>
      <h2 className="text-lg font-semibold text-slate-700 dark:text-slate-300 mb-4">
        Trang không tìm thấy / 页面未找到
      </h2>
      <p className="text-sm text-slate-500 max-w-sm mb-6">
        Liên kết bạn truy cập không tồn tại hoặc đã được di chuyển.
      </p>
      <div className="flex gap-3">
        <Link href="/dashboard">
          <Button className="bg-rose-600 hover:bg-rose-700 text-white">
            Vào Bảng Điều Khiển
          </Button>
        </Link>
        <Link href="/login">
          <Button variant="outline">
            Đăng Nhập
          </Button>
        </Link>
      </div>
    </div>
  );
}
