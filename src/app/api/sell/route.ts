import { NextResponse } from "next/server";
import { submitApplicationSync } from "@/lib/sell/store";

/**
 * POST /api/sell — seller application intake.
 *
 * Accepts application/json OR multipart form-data / x-www-form-urlencoded.
 * JSON keys use camelCase (businessName, contactName, email); form-data
 * names use snake_case (business_name, contact_name, email) per this repo's
 * form-input convention. Both key styles are accepted on either transport.
 *
 * Responses:
 *   200 { success: true,  message: "Application received" }
 *   400 { success: false, error, missing?: string[] }        (bad body / validation)
 *   409 { success: false, error }                             (duplicate email within 24h)
 *
 * Invariants enforced here:
 *   - businessName, contactName, email are all required (400 lists missing).
 *   - Malformed JSON, unknown content-type, or unreadable form-data => 400.
 *   - Email must match a basic RFC-5322-ish shape (400 otherwise).
 *   - Same email submitted within DEDUPE_WINDOW_MS returns 409, no second row.
 *   - No submitted field value is ever passed to console.* on any code path.
 */

// Loose email shape check — strict enough to catch obvious junk (missing @,
// missing dot, whitespace), loose enough to accept the RFC-legal addresses
// operators will actually see.
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

interface ParsedFields {
  businessName?: string;
  contactName?: string;
  email?: string;
  monthlyVolume?: string;
  notes?: string;
}

type ParseOutcome =
  | { ok: true; fields: ParsedFields }
  | { ok: false };

function trimOrUndef(v: unknown): string | undefined {
  if (typeof v !== "string") return undefined;
  const t = v.trim();
  return t === "" ? undefined : t;
}

function readForm(fd: FormData, ...names: string[]): string | undefined {
  for (const n of names) {
    const v = fd.get(n);
    if (typeof v === "string") return v;
  }
  return undefined;
}

async function parseBody(request: Request): Promise<ParseOutcome> {
  const ct = (request.headers.get("content-type") ?? "").toLowerCase();
  try {
    if (ct.includes("application/json")) {
      const raw = (await request.json()) as Record<string, unknown>;
      return {
        ok: true,
        fields: {
          businessName: trimOrUndef(
            raw.businessName ?? raw.business_name ?? raw.business,
          ),
          contactName: trimOrUndef(
            raw.contactName ?? raw.contact_name ?? raw.contact,
          ),
          email: trimOrUndef(raw.email),
          monthlyVolume: trimOrUndef(
            raw.monthlyVolume ?? raw.monthly_volume ?? raw.volume,
          ),
          notes: trimOrUndef(raw.notes),
        },
      };
    }
    if (
      ct.includes("multipart/form-data") ||
      ct.includes("application/x-www-form-urlencoded")
    ) {
      const fd = await request.formData();
      return {
        ok: true,
        fields: {
          businessName: trimOrUndef(
            readForm(fd, "business_name", "businessName", "business"),
          ),
          contactName: trimOrUndef(
            readForm(fd, "contact_name", "contactName", "contact"),
          ),
          email: trimOrUndef(readForm(fd, "email")),
          monthlyVolume: trimOrUndef(
            readForm(fd, "monthly_volume", "monthlyVolume", "volume"),
          ),
          notes: trimOrUndef(readForm(fd, "notes")),
        },
      };
    }
    return { ok: false };
  } catch {
    // Do NOT surface the underlying parse error — it can capture body bytes.
    return { ok: false };
  }
}

export async function POST(request: Request) {
  const parsed = await parseBody(request);
  if (!parsed.ok) {
    return NextResponse.json(
      {
        success: false,
        error: "Request body could not be parsed as JSON or form data.",
      },
      { status: 400 },
    );
  }

  const { fields } = parsed;
  const missing: string[] = [];
  if (!fields.businessName) missing.push("businessName");
  if (!fields.contactName) missing.push("contactName");
  if (!fields.email) missing.push("email");
  if (missing.length > 0) {
    return NextResponse.json(
      { success: false, error: "Missing required fields.", missing },
      { status: 400 },
    );
  }

  const email = fields.email as string;
  if (!EMAIL_RE.test(email)) {
    return NextResponse.json(
      {
        success: false,
        error: "Email format is invalid.",
        missing: ["email"],
      },
      { status: 400 },
    );
  }

  const result = submitApplicationSync({
    businessName: fields.businessName as string,
    contactName: fields.contactName as string,
    email,
    monthlyVolume: fields.monthlyVolume,
    notes: fields.notes,
  });

  if (result.status === "duplicate") {
    return NextResponse.json(
      {
        success: false,
        error:
          "An application with this email was received within the last 24 hours.",
      },
      { status: 409 },
    );
  }

  return NextResponse.json(
    { success: true, message: "Application received" },
    { status: 200 },
  );
}
