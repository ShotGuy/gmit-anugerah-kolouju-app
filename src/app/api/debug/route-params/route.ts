import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  const url = new URL(request.url);
  
  return NextResponse.json(
    {
      message: "Debug route - untuk test, kunjungi /api/debug/route-params/pendidikan/test123",
      url: url.toString(),
      headers: Object.fromEntries(request.headers),
    },
    { status: 200 }
  );
}
