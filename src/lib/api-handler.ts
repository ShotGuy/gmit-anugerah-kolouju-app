import { NextResponse } from "next/server";

import { createResponse } from "@/lib/api-response";
import { AppError, UnauthorizedError } from "@/lib/errors";
import { readSession } from "@/lib/session.server";

type Handler<TParams extends Record<string, unknown> = Record<string, unknown>> = (
  request: Request,
  ctx: { params: TParams | Promise<TParams> },
) => Promise<NextResponse>;

export const guardAdmin = async () => {
  const session = await readSession();

  if (!session) {
    throw new UnauthorizedError();
  }

  return session;
};

export const withErrorHandling =
  <TParams extends Record<string, unknown> = Record<string, unknown>>(
    handler: Handler<TParams>,
    { auth = true } = {},
  ) =>
  async (request: Request, ctx: { params: TParams | Promise<TParams> }) => {
    try {
      if (auth) {
        await guardAdmin();
      }

      return await handler(request, ctx);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      const errorStack = error instanceof Error ? error.stack : "";
      
      // eslint-disable-next-line no-console
      console.error(`[API Error] ${errorMessage}`, errorStack);

      if (error instanceof AppError) {
        // Normalize details to Record<string, string> for API response
        let details: Record<string, string> | undefined = undefined;
        if (error.details && typeof error.details === "object") {
          details = Object.fromEntries(
            Object.entries(error.details as Record<string, unknown>).map(([k, v]) => {
              if (Array.isArray(v)) return [k, String(v[0] ?? "")];
              return [k, String(v ?? "")];
            }),
          );
        }

        return NextResponse.json(
          createResponse(false, null, error.message, details),
          { status: error.status },
        );
      }

      // Include error details in development
      const isDev = process.env.NODE_ENV === "development";
      const details = isDev ? { originalError: errorMessage } : undefined;

      return NextResponse.json(
        createResponse(false, null, `Internal server error: ${errorMessage}`, details),
        { status: 500 },
      );
    }
  };

