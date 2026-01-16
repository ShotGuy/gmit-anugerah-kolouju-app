import { NextRequest, NextResponse } from "next/server";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<Record<string, string | string[]>> }
) {
  const resolvedParams = await params;
  const model = resolvedParams.model;
  const id = resolvedParams.id;

  // eslint-disable-next-line no-console
  console.log("[DEBUG] GET /api/debug/route-params/[model]/[id]", {
    model,
    id,
    idType: typeof id,
    idIsArray: Array.isArray(id),
    paramsKeys: Object.keys(resolvedParams),
  });

  return NextResponse.json(
    {
      message: "Debug endpoint untuk capture params di dynamic route",
      model,
      id,
      idType: typeof id,
      idIsArray: Array.isArray(id),
      timestamp: new Date().toISOString(),
    },
    { status: 200 }
  );
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<Record<string, string | string[]>> }
) {
  const resolvedParams = await params;
  const model = resolvedParams.model;
  const id = resolvedParams.id;

  // eslint-disable-next-line no-console
  console.log("[DEBUG] DELETE /api/debug/route-params/[model]/[id]", {
    model,
    id,
    idType: typeof id,
    idIsArray: Array.isArray(id),
    body: await request.json().catch(() => null),
  });

  return NextResponse.json(
    {
      message: "DELETE debug",
      model,
      id,
      idType: typeof id,
      idIsArray: Array.isArray(id),
    },
    { status: 200 }
  );
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<Record<string, string | string[]>> }
) {
  const resolvedParams = await params;
  const model = resolvedParams.model;
  const id = resolvedParams.id;

  // eslint-disable-next-line no-console
  console.log("[DEBUG] PATCH /api/debug/route-params/[model]/[id]", {
    model,
    id,
    idType: typeof id,
    idIsArray: Array.isArray(id),
    body: await request.json().catch(() => null),
  });

  return NextResponse.json(
    {
      message: "PATCH debug",
      model,
      id,
      idType: typeof id,
      idIsArray: Array.isArray(id),
    },
    { status: 200 }
  );
}
