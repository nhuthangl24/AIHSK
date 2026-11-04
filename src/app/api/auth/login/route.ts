import { NextRequest, NextResponse } from "next/server";
import { loginSchema } from "@/lib/validation/auth";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    loginSchema.parse(body);

    return NextResponse.json(
      { error: "Vui lòng sử dụng nút 'Đăng nhập với Google (Classnia)' hoặc đăng nhập bằng tài khoản Classnia." },
      { status: 503 }
    );
  } catch (err: any) {
    if (err.name === "ZodError") {
      return NextResponse.json({ error: err.errors[0]?.message }, { status: 400 });
    }
    return NextResponse.json({ error: "Lỗi đăng nhập" }, { status: 500 });
  }
}
