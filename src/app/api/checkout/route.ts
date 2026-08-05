import { NextResponse } from "next/server";
import { findListing } from "@/lib/listings/fixtures";
import { StripeConfigError, stripeClient } from "@/lib/payments/stripe";

/**
 * POST /api/checkout
 *
 * Body: { listing_id: string }
 *
 * Gate (server-side, do NOT rely on the UI):
 *   400  missing / non-string listing_id
 *   404  listing not found
 *   400  listing.cert_status !== 'verified'         reason: 'cert_not_verified'
 *   400  listing.images has no entries              reason: 'no_image'
 *   500  STRIPE_SECRET_KEY absent                   reason: 'stripe_not_configured'
 *   500  Stripe API rejected the request            reason: 'stripe_error'
 *   200  { client_secret, payment_intent_id }
 */

export const runtime = "nodejs";

interface CheckoutBody {
  listing_id?: unknown;
}

function badRequest(reason: string, message: string) {
  return NextResponse.json({ error: reason, message }, { status: 400 });
}

export async function POST(request: Request) {
  let body: CheckoutBody;
  try {
    body = (await request.json()) as CheckoutBody;
  } catch {
    return badRequest("invalid_json", "Request body must be JSON.");
  }

  const listingId = body?.listing_id;
  if (typeof listingId !== "string" || listingId.trim() === "") {
    return badRequest("missing_listing_id", "listing_id is required.");
  }

  const listing = findListing(listingId);
  if (!listing) {
    return NextResponse.json(
      { error: "listing_not_found", message: `No listing with id ${listingId}.` },
      { status: 404 },
    );
  }

  if (listing.cert_status !== "verified") {
    return badRequest(
      "cert_not_verified",
      `Listing ${listing.id} cannot be purchased until certification is verified.`,
    );
  }

  if (!Array.isArray(listing.images) || listing.images.length === 0) {
    return badRequest(
      "no_image",
      `Listing ${listing.id} cannot be purchased until at least one image is on file.`,
    );
  }

  let stripe;
  try {
    stripe = stripeClient();
  } catch (err) {
    if (err instanceof StripeConfigError) {
      return NextResponse.json(
        { error: "stripe_not_configured", message: err.message },
        { status: 500 },
      );
    }
    throw err;
  }

  try {
    const intent = await stripe.paymentIntents.create({
      amount: listing.price_cents,
      currency: listing.currency,
      automatic_payment_methods: { enabled: true },
      metadata: {
        listing_id: listing.id,
        cert_number: listing.cert_number ?? "",
        lab: listing.lab ?? "",
      },
      description: `Diamond Marketplace · ${listing.name} (${listing.id})`,
    });

    if (!intent.client_secret) {
      // Stripe returned a PaymentIntent with no client_secret — cannot proceed.
      return NextResponse.json(
        {
          error: "stripe_error",
          message: "Stripe returned a PaymentIntent without a client_secret.",
        },
        { status: 500 },
      );
    }

    return NextResponse.json(
      {
        client_secret: intent.client_secret,
        payment_intent_id: intent.id,
      },
      { status: 200 },
    );
  } catch (err) {
    const message =
      err instanceof Error ? err.message : "Stripe request failed.";
    return NextResponse.json(
      { error: "stripe_error", message },
      { status: 500 },
    );
  }
}
