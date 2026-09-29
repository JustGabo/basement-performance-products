import { NextResponse } from "next/server";

export async function POST(request: Request) {
  const body = await request.json().catch(() => null) as { country?: string } | null;
  const country = body?.country?.toUpperCase();
  if (country !== "US" && country !== "DO") {
    return NextResponse.json({ error: "Unsupported market." }, { status: 400 });
  }

  const response = NextResponse.json({ country });
  response.cookies.set("basement-market", country, {
    path: "/",
    maxAge: 60 * 60 * 24 * 365,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
  });
  return response;
}
