import { beforeEach, describe, expect, it, vi } from "vitest";

/**
 * Mock the `stripe` package so we can control constructEvent to simulate
 * valid + invalid signatures without actually signing bodies. This ALSO
 * means the test never depends on network or real Stripe keys.
 */
const constructEvent = vi.fn();

vi.mock("stripe", () => {
  class MockStripe {
    paymentIntents = { create: vi.fn() };
    webhooks = { constructEvent };
    constructor(..._args: unknown[]) {
      void _args;
    }
  }
  return { default: MockStripe };
});

// Import AFTER vi.mock.
import { POST } from "@/app/api/stripe/webhook/route";
import { __resetStripeClientForTest } from "@/lib/payments/stripe";
import { __resetOrderStoreForTest, getOrder } from "@/lib/payments/orders";

function webhookRequest(rawBody: string, headers: Record<string, string> = {}) {
  return new Request("http://localhost/api/stripe/webhook", {
    method: "POST",
    headers: { "content-type": "application/json", ...headers },
    body: rawBody,
  });
}

beforeEach(() => {
  constructEvent.mockReset();
  __resetStripeClientForTest();
  __resetOrderStoreForTest();
  process.env.STRIPE_SECRET_KEY = "sk_test_dummy";
  process.env.STRIPE_WEBHOOK_SECRET = "whsec_test_dummy";
});

describe("POST /api/stripe/webhook — configuration + signature", () => {
  it("returns 500 when STRIPE_WEBHOOK_SECRET is absent", async () => {
    delete process.env.STRIPE_WEBHOOK_SECRET;
    const res = await POST(webhookRequest("{}", { "stripe-signature": "t=1,v1=abc" }));
    expect(res.status).toBe(500);
    const body = await res.json();
    expect(body.error).toBe("webhook_not_configured");
    expect(constructEvent).not.toHaveBeenCalled();
  });

  it("returns 400 when the stripe-signature header is missing", async () => {
    const res = await POST(webhookRequest("{}"));
    expect(res.status).toBe(400);
    const body = await res.json();
    expect(body.error).toBe("missing_signature");
    expect(constructEvent).not.toHaveBeenCalled();
  });

  it("returns 400 when Stripe's constructEvent throws (invalid signature)", async () => {
    constructEvent.mockImplementationOnce(() => {
      throw new Error("No signatures found matching the expected signature.");
    });
    const res = await POST(
      webhookRequest("payload", { "stripe-signature": "t=1,v1=bad" }),
    );
    expect(res.status).toBe(400);
    const body = await res.json();
    expect(body.error).toBe("invalid_signature");
    expect(String(body.message)).toContain("signature");
  });

  it("returns 500 when STRIPE_SECRET_KEY is absent (client can't init)", async () => {
    delete process.env.STRIPE_SECRET_KEY;
    __resetStripeClientForTest();
    const res = await POST(
      webhookRequest("payload", { "stripe-signature": "t=1,v1=abc" }),
    );
    expect(res.status).toBe(500);
    const body = await res.json();
    expect(body.error).toBe("stripe_not_configured");
  });
});

describe("POST /api/stripe/webhook — payment_intent.succeeded", () => {
  it("records a fulfilled order and returns 200", async () => {
    constructEvent.mockReturnValueOnce({
      id: "evt_success_1",
      type: "payment_intent.succeeded",
      data: {
        object: {
          id: "pi_ok_1",
          amount: 824000,
          currency: "usd",
          metadata: { listing_id: "LST-1001" },
        },
      },
    });

    const res = await POST(
      webhookRequest("{}", { "stripe-signature": "t=1,v1=abc" }),
    );
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.outcome).toBe("fulfilled");

    const order = getOrder("pi_ok_1");
    expect(order?.status).toBe("fulfilled");
    expect(order?.listing_id).toBe("LST-1001");
    expect(order?.amount_cents).toBe(824000);
    expect(order?.currency).toBe("usd");
  });
});

describe("POST /api/stripe/webhook — payment_intent.payment_failed", () => {
  it("records a failed order and returns 200", async () => {
    constructEvent.mockReturnValueOnce({
      id: "evt_failed_1",
      type: "payment_intent.payment_failed",
      data: {
        object: {
          id: "pi_fail_1",
          amount: 541000,
          currency: "usd",
          metadata: { listing_id: "LST-1003" },
        },
      },
    });

    const res = await POST(
      webhookRequest("{}", { "stripe-signature": "t=1,v1=abc" }),
    );
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.outcome).toBe("failed");

    const order = getOrder("pi_fail_1");
    expect(order?.status).toBe("failed");
    expect(order?.listing_id).toBe("LST-1003");
  });
});

describe("POST /api/stripe/webhook — idempotency", () => {
  it("processes a duplicate event id exactly ONCE (second call reports duplicate)", async () => {
    const event = {
      id: "evt_dup_1",
      type: "payment_intent.succeeded",
      data: {
        object: {
          id: "pi_dup_1",
          amount: 100000,
          currency: "usd",
          metadata: { listing_id: "LST-1001" },
        },
      },
    };
    constructEvent.mockReturnValue(event);

    const first = await POST(
      webhookRequest("{}", { "stripe-signature": "t=1,v1=first" }),
    );
    expect(first.status).toBe(200);
    const firstBody = await first.json();
    expect(firstBody.outcome).toBe("fulfilled");
    expect(firstBody.duplicate).toBeUndefined();

    const orderAfterFirst = getOrder("pi_dup_1");
    const recordedAt = orderAfterFirst?.recorded_at;
    expect(recordedAt).toBeTruthy();

    // Tamper the order in-place so we can prove the second call did NOT overwrite it.
    if (orderAfterFirst) orderAfterFirst.status = "failed";

    const second = await POST(
      webhookRequest("{}", { "stripe-signature": "t=1,v1=second" }),
    );
    expect(second.status).toBe(200);
    const secondBody = await second.json();
    expect(secondBody.duplicate).toBe(true);

    // Side-effects did NOT run again — our tamper survived.
    const orderAfterSecond = getOrder("pi_dup_1");
    expect(orderAfterSecond?.status).toBe("failed");
    expect(orderAfterSecond?.recorded_at).toBe(recordedAt);
  });

  it("distinct event ids are BOTH processed (idempotency is per-event-id)", async () => {
    constructEvent
      .mockReturnValueOnce({
        id: "evt_a",
        type: "payment_intent.succeeded",
        data: {
          object: {
            id: "pi_a",
            amount: 1,
            currency: "usd",
            metadata: { listing_id: "LST-1001" },
          },
        },
      })
      .mockReturnValueOnce({
        id: "evt_b",
        type: "payment_intent.succeeded",
        data: {
          object: {
            id: "pi_b",
            amount: 2,
            currency: "usd",
            metadata: { listing_id: "LST-1002" },
          },
        },
      });

    await POST(webhookRequest("{}", { "stripe-signature": "t=1,v1=a" }));
    await POST(webhookRequest("{}", { "stripe-signature": "t=1,v1=b" }));

    expect(getOrder("pi_a")?.status).toBe("fulfilled");
    expect(getOrder("pi_b")?.status).toBe("fulfilled");
  });
});

describe("POST /api/stripe/webhook — unhandled types", () => {
  it("returns 200 with outcome:'ignored' for event types we don't handle", async () => {
    constructEvent.mockReturnValueOnce({
      id: "evt_other_1",
      type: "charge.refunded",
      data: { object: { id: "ch_1" } },
    });

    const res = await POST(
      webhookRequest("{}", { "stripe-signature": "t=1,v1=abc" }),
    );
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.outcome).toBe("ignored");
    expect(body.type).toBe("charge.refunded");
    expect(getOrder("ch_1")).toBeUndefined();
  });
});
