import { NextResponse } from "next/server";
import { HskkService } from "@/lib/ai/hskk-service";

export async function GET() {
  try {
    const templates = HskkService.getTemplates();
    return NextResponse.json({ success: true, templates });
  } catch (err: any) {
    return NextResponse.json(
      { success: false, error: err?.message || "Failed to load HSKK templates" },
      { status: 500 }
    );
  }
}
