/**
 * Pre-launch in-memory order store.
 *
 * Two structures, both module-scope:
 *   - `orders`          — paymentIntentId → fulfilled/failed record
 *   - `processedEvents` — Stripe event IDs already handled (idempotency guard)
 *
 * The webhook MUST record the event id BEFORE side-effects; a duplicate
 * event id returns early without touching the order state.
 *
 * A durable store (Postgres, Supabase) will replace this in phase 2; the
 * function contract (idempotent recordOrder + isProcessed check) is designed
 * to survive that swap.
 */

export type OrderStatus = "fulfilled" | "failed";

export interface OrderRecord {
  payment_intent_id: string;
  listing_id: string | null;
  amount_cents: number | null;
  currency: string | null;
  status: OrderStatus;
  /** ISO timestamp when the webhook recorded the outcome. */
  recorded_at: string;
}

const orders = new Map<string, OrderRecord>();
const processedEvents = new Set<string>();

export function isEventProcessed(eventId: string): boolean {
  return processedEvents.has(eventId);
}

/**
 * Mark an event id processed. Returns true if this is the FIRST time the id
 * is seen (caller should perform side-effects), false if already processed.
 * Atomic with respect to the in-process caller.
 */
export function claimEvent(eventId: string): boolean {
  if (processedEvents.has(eventId)) return false;
  processedEvents.add(eventId);
  return true;
}

export function recordOrder(record: OrderRecord): void {
  orders.set(record.payment_intent_id, record);
}

export function getOrder(paymentIntentId: string): OrderRecord | undefined {
  return orders.get(paymentIntentId);
}

/** Test-only helpers. */
export function __resetOrderStoreForTest() {
  orders.clear();
  processedEvents.clear();
}
