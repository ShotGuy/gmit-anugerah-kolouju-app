import { NextResponse } from "next/server";

/**
 * Debug endpoint to inspect params received by dynamic routes.
 * GET /api/debug/params/[id] — logs and returns params.
 */
export async function GET(request: Request, { params }: { params: any }) {
  const { searchParams } = new URL(request.url);
  const id = searchParams.get("id");
  
  // eslint-disable-next-line no-console
  console.log("Debug params endpoint:", { params, id, searchParams: Object.fromEntries(searchParams) });
  
  return NextResponse.json({
    message: "Check server console for detailed params",
    params,
    queryId: id,
  });
}
