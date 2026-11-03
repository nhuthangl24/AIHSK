import { NextResponse } from "next/server";
import { getAuthCookieOptions } from "@/lib/auth/session";

export async function POST() {
  const response = NextResponse.json({ success: true });
  const cookieOpts = getAuthCookieOptions();
  response.cookies.set({
    ...cookieOpts,
    value: "",
    expires: new Date(0),
    maxAge: 0,
  });
  return response;
}
