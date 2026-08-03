import { promises as fs } from "node:fs";
import path from "node:path";

/**
 * Seller-application store.
 *
 * Pre-launch: an in-memory list is the source of truth for dedupe and reads,
 * with a best-effort JSONL append to disk so an operator can inspect the
 * queue between deploys. When the operator wires a real datastore, swap the
 * body of `submitApplicationSync` and `persistBestEffort` without touching
 * any route caller. See src/app/api/sell/route.ts for the invariant.
 *
 * We NEVER log field values from this module — no console.* calls anywhere.
 * Field values include PII (business/contact/email); the handler must not
 * emit them and this store must not either, even inside error paths.
 */

export interface SellApplication {
  businessName: string;
  contactName: string;
  email: string; // normalized lower-case, trimmed
  monthlyVolume?: string;
  notes?: string;
  submittedAt: number; // epoch ms
}

export const DEDUPE_WINDOW_MS = 24 * 60 * 60 * 1000;

interface StoreState {
  applications: SellApplication[];
  lastByEmail: Map<string, number>;
}

const state: StoreState = {
  applications: [],
  lastByEmail: new Map<string, number>(),
};

let filePath: string | null = defaultFilePath();
let clock: () => number = () => Date.now();

function defaultFilePath(): string | null {
  const env = process.env.SELL_APPLICATIONS_FILE;
  if (env === "") return null;
  if (env) return env;
  return path.join(process.cwd(), ".data", "sell-applications.jsonl");
}

export type SubmitResult =
  | { status: "created"; application: SellApplication }
  | { status: "duplicate"; previousSubmittedAt: number };

/**
 * Synchronous check-and-insert. The dedupe check and the insert MUST happen
 * inside a single event-loop tick (no awaits between them) so two concurrent
 * requests for the same email cannot both create a record. Callers are
 * expected to do all async parsing BEFORE invoking this.
 */
export function submitApplicationSync(
  input: Omit<SellApplication, "submittedAt">,
): SubmitResult {
  const now = clock();
  const emailKey = input.email.toLowerCase();
  const last = state.lastByEmail.get(emailKey);
  if (last !== undefined && now - last < DEDUPE_WINDOW_MS) {
    return { status: "duplicate", previousSubmittedAt: last };
  }
  const application: SellApplication = {
    ...input,
    email: emailKey,
    submittedAt: now,
  };
  state.applications.push(application);
  state.lastByEmail.set(emailKey, now);
  // Fire-and-forget: never blocks the response, and never rejects to an
  // unhandled promise (the inner catch swallows).
  void persistBestEffort(application);
  return { status: "created", application };
}

async function persistBestEffort(application: SellApplication): Promise<void> {
  const target = filePath;
  if (!target) return;
  try {
    await fs.mkdir(path.dirname(target), { recursive: true });
    await fs.appendFile(target, JSON.stringify(application) + "\n", "utf8");
  } catch {
    // Best-effort persistence. Deliberately no logging: an error object can
    // carry request-field values via message/stack, and the top-level rule
    // is that field values never leave the process via logs.
  }
}

export function listApplicationsForOperatorReview(): SellApplication[] {
  return [...state.applications].sort((a, b) => b.submittedAt - a.submittedAt);
}

export function __configureForTests(opts: {
  file?: string | null;
  now?: () => number;
} = {}): void {
  if ("file" in opts) filePath = opts.file ?? null;
  if (opts.now) clock = opts.now;
}

export function __resetForTests(): void {
  state.applications = [];
  state.lastByEmail.clear();
  filePath = defaultFilePath();
  clock = () => Date.now();
}
