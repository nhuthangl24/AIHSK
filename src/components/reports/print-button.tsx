"use client";

import { Printer } from "lucide-react";
import { Button } from "@/components/ui/button";

export function PrintButton() {
  return (
    <Button
      variant="outline"
      size="sm"
      onClick={() => window.print()}
      className="text-xs flex items-center gap-1.5"
    >
      <Printer className="h-3.5 w-3.5" />
      <span>In / Xuất PDF</span>
    </Button>
  );
}
