import { NextResponse } from "next/server";
import { lookupCert } from "@/lib/certifications/lookup";
import { matchListingImageToReport, type ImageMetadata } from "@/lib/certifications/imageMatch";
import type { ArrivalCheckResponse } from "@/lib/certifications/types";

/**
 * POST /api/escrow/arrival-check
 *
 * Request:
 *   { bookingId: string, certNumber?: string, imageMetadata?: ImageMetadata }
 *
 * Response (always 200 — the check itself succeeded):
 *   { status: 'go', message, verification, imageConfidence }
 *   { status: 'hold', reason, message, verification?, imageConfidence? }
 *
 * Invariant: `go` is returned ONLY when a cert lookup returned `verified`
 * AND the image match returned `match` with confidence >= IMAGE_MATCH_MIN.
 * ANY other state (missing bookingId, missing certNumber, cert `not_found`,
 * cert `pending`, image `pending`, image `mismatch`, provider throw) MUST
 * return `hold`. Escrow release upstream reads only `status === 'go'`.
 *
 * Bad requests (missing bookingId, malformed JSON) return HTTP 400 with a
 * `hold` payload — never `go`.
 */

const IMAGE_MATCH_MIN = 0.7;

interface ArrivalCheckRequest {
  bookingId?: unknown;
  certNumber?: unknown;
  imageMetadata?: unknown;
}

function hold(
  reason: string,
  extra: Partial<ArrivalCheckResponse> = {},
): ArrivalCheckResponse {
  return {
    status: "hold",
    reason,
    message: `Escrow release blocked: ${reason}`,
    ...extra,
  };
}

export async function POST(request: Request) {
  let body: ArrivalCheckRequest;
  try {
    body = (await request.json()) as ArrivalCheckRequest;
  } catch {
    return NextResponse.json(
      hold("Request body is not valid JSON."),
      { status: 400 },
    );
  }

  const bookingId =
    typeof body?.bookingId === "string" && body.bookingId.trim() !== ""
      ? body.bookingId.trim()
      : null;
  if (!bookingId) {
    return NextResponse.json(hold("bookingId is required."), { status: 400 });
  }

  const certNumber =
    typeof body?.certNumber === "string" ? body.certNumber : "";
  if (!certNumber) {
    // Listing has no cert number attached — hold and prompt.
    return NextResponse.json(
      hold("Listing is missing a certificate number."),
      { status: 200 },
    );
  }

  // Never release on an incomplete lookup — provider errors return `pending`.
  const lookup = await lookupCert(certNumber);
  if (lookup.status !== "verified" || !lookup.report) {
    return NextResponse.json(
      hold(
        lookup.status === "pending"
          ? "Certificate lookup did not complete — retry the check."
          : `Certificate ${certNumber} could not be verified (${lookup.status}).`,
        { verification: lookup.status },
      ),
      { status: 200 },
    );
  }

  const imageMetadata = (body?.imageMetadata ?? {}) as ImageMetadata;
  const imageMatch = matchListingImageToReport(imageMetadata, lookup.report);

  if (imageMatch.outcome === "mismatch") {
    return NextResponse.json(
      hold(imageMatch.reason, {
        verification: "mismatch",
        imageConfidence: imageMatch.confidence,
      }),
      { status: 200 },
    );
  }

  if (imageMatch.outcome === "pending") {
    // Skip the image check but do NOT release — flag as pending for review.
    return NextResponse.json(
      hold(imageMatch.reason, {
        verification: "pending",
        imageConfidence: imageMatch.confidence,
      }),
      { status: 200 },
    );
  }

  if (imageMatch.confidence < IMAGE_MATCH_MIN) {
    return NextResponse.json(
      hold(
        `Image match confidence ${imageMatch.confidence.toFixed(2)} below threshold ${IMAGE_MATCH_MIN}.`,
        { verification: "pending", imageConfidence: imageMatch.confidence },
      ),
      { status: 200 },
    );
  }

  const go: ArrivalCheckResponse = {
    status: "go",
    message: `Cert ${lookup.report.certNumber} verified against ${lookup.report.lab} database; image match ok.`,
    verification: "verified",
    imageConfidence: imageMatch.confidence,
  };
  return NextResponse.json(go, { status: 200 });
}
