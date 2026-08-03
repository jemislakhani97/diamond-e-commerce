import { NextResponse } from "next/server";
import { lookupCert } from "@/lib/certifications/lookup";

/**
 * GET /api/certifications/[certNumber]
 *
 * Response shapes:
 *   200 { status: 'verified', message, report }
 *   200 { status: 'pending', message }               (provider retryable)
 *   404 { status: 'not_found', message }
 *
 * `pending` is intentionally a 200 — the request itself succeeded; the caller
 * should retry the LOOKUP, not the HTTP call.
 */
export async function GET(
  _request: Request,
  { params }: { params: Promise<{ certNumber: string }> },
) {
  const { certNumber } = await params;
  const result = await lookupCert(certNumber);
  const httpStatus = result.status === "not_found" ? 404 : 200;
  return NextResponse.json(result, { status: httpStatus });
}
