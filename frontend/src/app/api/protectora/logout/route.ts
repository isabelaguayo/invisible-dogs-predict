import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { PROTECTORA_SESSION_COOKIE } from "@/lib/protectora/auth";

export const runtime = "nodejs";

export async function POST() {
  (await cookies()).delete(PROTECTORA_SESSION_COOKIE);
  return NextResponse.json({ ok: true });
}
