import { scryptSync, timingSafeEqual } from "node:crypto";

/**
 * Pre-launch fixture credential store.
 *
 * There is no live user DB yet. This module stands in with scrypt-hashed
 * passwords so the sign-in route can be exercised end-to-end without
 * shipping plaintext credentials in the codebase. Swap `verifyCredentials`
 * for a real user lookup once the DB is wired; the callers do not need to
 * change.
 *
 * The email/password constants below are for pre-launch smoke tests only.
 * They MUST NOT ship to production and MUST NOT be reused as real accounts.
 */

const SCRYPT_KEYLEN = 32;

interface FixtureUser {
  email: string;
  salt: string;
  passwordHash: Buffer;
}

// Pre-launch fixture accounts. Passwords are hashed at module load; the
// plaintext lives here only so a dev can sign in from the browser during
// scaffolding. The salt is stable so hashes are deterministic (fine for a
// fixture — a real user store will use per-user random salts).
const FIXTURE_ACCOUNTS: Array<{ email: string; password: string }> = [
  { email: "demo@diamond.example", password: "Diamond!Demo123" },
];

const USERS: Map<string, FixtureUser> = new Map(
  FIXTURE_ACCOUNTS.map(({ email, password }) => {
    const salt = `fixture-salt::${email}`;
    return [
      email.toLowerCase(),
      {
        email,
        salt,
        passwordHash: scryptSync(password, salt, SCRYPT_KEYLEN),
      },
    ];
  }),
);

/**
 * Returns true iff the (email, password) pair matches a fixture account.
 * Runs scrypt on both the found-user and no-user paths so an attacker can't
 * infer account existence from response timing.
 */
export function verifyCredentials(email: string, password: string): boolean {
  if (typeof email !== "string" || typeof password !== "string") {
    return false;
  }
  const key = email.trim().toLowerCase();
  const user = USERS.get(key);

  // Always do a scrypt call so timing is roughly independent of hit/miss.
  const salt = user?.salt ?? "fixture-salt::__no_such_user__";
  const attempted = scryptSync(password, salt, SCRYPT_KEYLEN);

  if (!user) return false;
  if (attempted.length !== user.passwordHash.length) return false;
  return timingSafeEqual(attempted, user.passwordHash);
}

// Exposed for tests only. Do not import from application code.
export const _FIXTURE_EMAIL = FIXTURE_ACCOUNTS[0]!.email;
export const _FIXTURE_PASSWORD = FIXTURE_ACCOUNTS[0]!.password;
