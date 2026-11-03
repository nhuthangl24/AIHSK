import { NextResponse } from "next/server";

export async function GET() {
  return NextResponse.json({ message: "pong", version: "2026-11-04-v1" });
}
