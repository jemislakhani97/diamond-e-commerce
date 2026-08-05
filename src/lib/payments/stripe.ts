import Stripe from "stripe";

/**
 * Thin Stripe client factory.
 *
 * Reads `STRIPE_SECRET_KEY` at call time (not module load) so:
 *   1. Tests can set the env AFTER importing the module.
 *   2. The checkout route can catch the well-known error and return 500 with
 *      a descriptive message when the key is genuinely absent.
 *
 * Callers MUST NOT cache the client themselves — cache lives inside this
 * module so a test that clears env + resets modules gets a fresh client.
 */

export class StripeConfigError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "StripeConfigError";
  }
}

let cached: Stripe | null = null;
let cachedForKey: string | null = null;

export function stripeClient(): Stripe {
  const key = process.env.STRIPE_SECRET_KEY;
  if (!key || key.trim() === "") {
    throw new StripeConfigError(
      "STRIPE_SECRET_KEY is not configured. Set STRIPE_SECRET_KEY in the environment to enable checkout.",
    );
  }
  if (cached && cachedForKey === key) return cached;
  cached = new Stripe(key, {
    // Pin API version so behavior does not drift with account defaults.
    // (Stripe accepts any supported dated version string.)
    apiVersion: "2024-06-20" as Stripe.LatestApiVersion,
    typescript: true,
  });
  cachedForKey = key;
  return cached;
}

/** Test-only: drop the cached client so a subsequent call rebuilds with fresh env. */
export function __resetStripeClientForTest() {
  cached = null;
  cachedForKey = null;
}
