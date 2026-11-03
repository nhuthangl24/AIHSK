import Link from "next/link";
import { Mic } from "lucide-react";

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen flex flex-col justify-center items-center p-4 bg-slate-50 dark:bg-slate-950">
      <Link href="/" className="flex items-center gap-2 mb-8 group">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-rose-600 text-white shadow-md transition-transform group-hover:scale-105">
          <Mic className="h-5 w-5" />
        </div>
        <div className="flex flex-col">
          <span className="text-xl font-bold tracking-tight text-slate-900 dark:text-white">
            HuáVocal <span className="text-rose-600">AI</span>
          </span>
          <span className="text-[10px] font-medium text-slate-500 tracking-wider -mt-1">
            华语考官 · 口语智能评测
          </span>
        </div>
      </Link>
      <div className="w-full max-w-md">{children}</div>
    </div>
  );
}
