import { NextRequest, NextResponse } from "next/server";

/**
 * Test endpoint untuk verifikasi akses yang benar ke dynamic route params
 * Test dengan: curl -X DELETE http://localhost:3000/api/test/delete/pendidikan/123
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<Record<string, string | string[]>> }
) {
  const resolvedParams = await params;
  const section = resolvedParams.section;
  const model = resolvedParams.model;
  const id = resolvedParams.id;

  // eslint-disable-next-line no-console
  console.log("[TEST-DELETE] Params received:", {
    section,
    model,
    id,
    idType: typeof id,
    rawParams: resolvedParams,
  });

  return NextResponse.json(
    {
      success: true,
      section,
      model,
      id,
      idType: typeof id,
      idIsArray: Array.isArray(id),
      message: "Test DELETE - params successfully captured",
    },
    { status: 200 }
  );
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<Record<string, string | string[]>> }
) {
  const resolvedParams = await params;
  const section = resolvedParams.section;
  const model = resolvedParams.model;
  const id = resolvedParams.id;
  const body = await request.json().catch(() => null);

  // eslint-disable-next-line no-console
  console.log("[TEST-PATCH] Params received:", {
    section,
    model,
    id,
    idType: typeof id,
    body,
  });

  return NextResponse.json(
    {
      success: true,
      section,
      model,
      id,
      idType: typeof id,
      idIsArray: Array.isArray(id),
      body,
      message: "Test PATCH - params successfully captured",
    },
    { status: 200 }
  );
}
