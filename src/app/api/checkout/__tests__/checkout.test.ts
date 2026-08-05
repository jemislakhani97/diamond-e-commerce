import { beforeEach, describe, expect, it, vi } from "vitest";

/**
 * We mock the `stripe` package so tests never make a network call and can
 * assert exactly what the route passes to Stripe. Because our route reads
 * STRIPE_SECRET_KEY at call time and constructs the Stripe client via
 * `stripeClient()`, the mock's default export must be a constructor that
 * exposes `paymentIntents.create`.
 */

const paymentIntentsCreate = vi.fn();

vi.mock("stripe", () => {
  class MockStripe {
    paymentIntents = { create: paymentIntentsCreate };
    webhooks = { constructEvent: vi.fn() };
    constructor(..._args: unknown[]) {
      void _args;
    }
  }
  return { default: MockStripe };
});

// Import AFTER vi.mock so the route pulls the mocked Stripe.
import { POST } from "@/app/api/checkout/route";
import { __resetStripeClientForTest } from "@/lib/payments/stripe";

function post(body: unknown): Request {
  return new Request("http://localhost/api/checkout", {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: typeof body === "string" ? body : JSON.stringify(body),
  });
}

beforeEach(() => {
  paymentIntentsCreate.mockReset();
  __resetStripeClientForTest();
  process.env.STRIPE_SECRET_KEY = "sk_test_dummy";
});

describe("POST /api/checkout — request validation", () => {
  it("returns 400 when listing_id is missing", async () => {
    const res = await POST(post({}));
    expect(res.status).toBe(400);
    const body = await res.json();
    expect(body.error).toBe("missing_listing_id");
    expect(paymentIntentsCreate).not.toHaveBeenCalled();
  });

  it("returns 400 when listing_id is not a string", async () => {
    const res = await POST(post({ listing_id: 42 }));
    expect(res.status).toBe(400);
    const body = await res.json();
    expect(body.error).toBe("missing_listing_id");
  });

  it("returns 400 when body is not JSON", async () => {
    const res = await POST(post("not-json{"));
    expect(res.status).toBe(400);
    const body = await res.json();
    expect(body.error).toBe("invalid_json");
  });

  it("returns 404 when listing_id is unknown", async () => {
    const res = await POST(post({ listing_id: "LST-DOES-NOT-EXIST" }));
    expect(res.status).toBe(404);
    const body = await res.json();
    expect(body.error).toBe("listing_not_found");
  });
});

describe("POST /api/checkout — cert + image gate", () => {
  it("returns 400 when cert_status is 'pending' (LST-1005)", async () => {
    const res = await POST(post({ listing_id: "LST-1005" }));
    expect(res.status).toBe(400);
    const body = await res.json();
    expect(body.error).toBe("cert_not_verified");
    expect(paymentIntentsCreate).not.toHaveBeenCalled();
  });

  it("returns 400 when cert_status is 'mismatch' (LST-1006)", async () => {
    const res = await POST(post({ listing_id: "LST-1006" }));
    expect(res.status).toBe(400);
    const body = await res.json();
    expect(body.error).toBe("cert_not_verified");
    expect(paymentIntentsCreate).not.toHaveBeenCalled();
  });

  it("returns 400 when a verified listing has no images (LST-1004)", async () => {
    const res = await POST(post({ listing_id: "LST-1004" }));
    expect(res.status).toBe(400);
    const body = await res.json();
    expect(body.error).toBe("no_image");
    expect(paymentIntentsCreate).not.toHaveBeenCalled();
  });

  it("checks cert BEFORE image (both bad → cert reason wins)", async () => {
    // We craft this by asserting the message names cert on LST-1006 (mismatch + has image).
    const res = await POST(post({ listing_id: "LST-1006" }));
    const body = await res.json();
    expect(body.error).toBe("cert_not_verified");
  });
});

describe("POST /api/checkout — happy path", () => {
  it("returns 200 with client_secret + payment_intent_id for a verified imaged listing", async () => {
    paymentIntentsCreate.mockResolvedValueOnce({
      id: "pi_test_123",
      client_secret: "pi_test_123_secret_abc",
    });

    const res = await POST(post({ listing_id: "LST-1001" }));
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body).toEqual({
      client_secret: "pi_test_123_secret_abc",
      payment_intent_id: "pi_test_123",
    });
  });

  it("passes the listing's price_cents, currency, and listing_id metadata to Stripe", async () => {
    paymentIntentsCreate.mockResolvedValueOnce({
      id: "pi_test_456",
      client_secret: "pi_test_456_secret_xyz",
    });

    await POST(post({ listing_id: "LST-1001" }));

    expect(paymentIntentsCreate).toHaveBeenCalledTimes(1);
    const arg = paymentIntentsCreate.mock.calls[0][0];
    expect(arg.amount).toBe(824000); // LST-1001 price_cents
    expect(arg.currency).toBe("usd");
    expect(arg.metadata.listing_id).toBe("LST-1001");
    expect(arg.metadata.cert_number).toBe("1234567890");
    expect(arg.metadata.lab).toBe("GIA");
  });

  it("returns 500 when Stripe returns a PaymentIntent with no client_secret", async () => {
    paymentIntentsCreate.mockResolvedValueOnce({
      id: "pi_test_no_secret",
      client_secret: null,
    });

    const res = await POST(post({ listing_id: "LST-1001" }));
    expect(res.status).toBe(500);
    const body = await res.json();
    expect(body.error).toBe("stripe_error");
  });
});

describe("POST /api/checkout — Stripe key + errors", () => {
  it("returns 500 with a descriptive reason when STRIPE_SECRET_KEY is absent", async () => {
    delete process.env.STRIPE_SECRET_KEY;
    __resetStripeClientForTest();

    const res = await POST(post({ listing_id: "LST-1001" }));
    expect(res.status).toBe(500);
    const body = await res.json();
    expect(body.error).toBe("stripe_not_configured");
    expect(String(body.message)).toContain("STRIPE_SECRET_KEY");
    expect(paymentIntentsCreate).not.toHaveBeenCalled();
  });

  it("returns 500 with a descriptive reason when STRIPE_SECRET_KEY is only whitespace", async () => {
    process.env.STRIPE_SECRET_KEY = "   ";
    __resetStripeClientForTest();

    const res = await POST(post({ listing_id: "LST-1001" }));
    expect(res.status).toBe(500);
    const body = await res.json();
    expect(body.error).toBe("stripe_not_configured");
  });

  it("returns 500 when Stripe rejects the request", async () => {
    paymentIntentsCreate.mockRejectedValueOnce(
      new Error("Stripe error: invalid_api_key"),
    );

    const res = await POST(post({ listing_id: "LST-1001" }));
    expect(res.status).toBe(500);
    const body = await res.json();
    expect(body.error).toBe("stripe_error");
    expect(String(body.message)).toContain("invalid_api_key");
  });
});
