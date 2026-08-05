import { NextResponse } from "next/server";
import type Stripe from "stripe";
import { StripeConfigError, stripeClient } from "@/lib/payments/stripe";
import { claimEvent, recordOrder } from "@/lib/payments/orders";

/**
 * POST /api/stripe/webhook
 *
 * Requirements:
 *   - Signature verified via Stripe.webhooks.constructEvent on the RAW body.
 *   - Missing / invalid signature → 400 immediately, no side effects.
 *   - Missing STRIPE_WEBHOOK_SECRET or STRIPE_SECRET_KEY → 500.
 *   - Idempotent: a duplicate event id returns 200 without re-processing.
 *
 * Response body is always JSON so Stripe's dashboard shows a readable diag.
 */

export const runtime = "nodejs";

function json(status: number, body: Record<string, unknown>) {
  return NextResponse.json(body, { status });
}

export async function POST(request: Request) {
  const secret = process.env.STRIPE_WEBHOOK_SECRET;
  if (!secret || secret.trim() === "") {
    return json(500, {
      error: "webhook_not_configured",
      message: "STRIPE_WEBHOOK_SECRET is not configured.",
    });
  }

  const signature = request.headers.get("stripe-signature");
  if (!signature) {
    return json(400, {
      error: "missing_signature",
      message: "Missing stripe-signature header.",
    });
  }

  let rawBody: string;
  try {
    rawBody = await request.text();
  } catch {
    return json(400, {
      error: "unreadable_body",
      message: "Could not read request body.",
    });
  }

  let stripe;
  try {
    stripe = stripeClient();
  } catch (err) {
    if (err instanceof StripeConfigError) {
      return json(500, {
        error: "stripe_not_configured",
        message: err.message,
      });
    }
    throw err;
  }

  let event: Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(rawBody, signature, secret);
  } catch (err) {
    const message =
      err instanceof Error ? err.message : "Signature verification failed.";
    return json(400, { error: "invalid_signature", message });
  }

  // Idempotency: claim the event id BEFORE side effects.
  if (!claimEvent(event.id)) {
    return json(200, { received: true, duplicate: true, event_id: event.id });
  }

  switch (event.type) {
    case "payment_intent.succeeded": {
      const intent = event.data.object as Stripe.PaymentIntent;
      recordOrder({
        payment_intent_id: intent.id,
        listing_id:
          typeof intent.metadata?.listing_id === "string"
            ? intent.metadata.listing_id
            : null,
        amount_cents: intent.amount ?? null,
        currency: intent.currency ?? null,
        status: "fulfilled",
        recorded_at: new Date().toISOString(),
      });
      return json(200, {
        received: true,
        event_id: event.id,
        outcome: "fulfilled",
      });
    }
    case "payment_intent.payment_failed": {
      const intent = event.data.object as Stripe.PaymentIntent;
      recordOrder({
        payment_intent_id: intent.id,
        listing_id:
          typeof intent.metadata?.listing_id === "string"
            ? intent.metadata.listing_id
            : null,
        amount_cents: intent.amount ?? null,
        currency: intent.currency ?? null,
        status: "failed",
        recorded_at: new Date().toISOString(),
      });
      return json(200, {
        received: true,
        event_id: event.id,
        outcome: "failed",
      });
    }
    default: {
      // Unhandled event types acknowledge with 200 so Stripe doesn't retry.
      return json(200, {
        received: true,
        event_id: event.id,
        outcome: "ignored",
        type: event.type,
      });
    }
  }
}
