"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

/**
 * Sign-in form.
 *
 * Fetches a CSRF token from `GET /api/auth/csrf` on mount, embeds it in a
 * hidden field, and POSTs to `/api/auth`. The submit button stays disabled
 * until the CSRF token is available so the server never receives a stale
 * or empty token on the first paint.
 */
export function SignInForm() {
  const [csrfToken, setCsrfToken] = useState("");
  const [csrfError, setCsrfError] = useState(false);

  useEffect(() => {
    let cancelled = false;
    fetch("/api/auth/csrf", { credentials: "same-origin" })
      .then((r) => (r.ok ? r.json() : Promise.reject(new Error("csrf_fetch_failed"))))
      .then((data: unknown) => {
        if (cancelled) return;
        if (
          data &&
          typeof data === "object" &&
          typeof (data as { token?: unknown }).token === "string"
        ) {
          setCsrfToken((data as { token: string }).token);
        } else {
          setCsrfError(true);
        }
      })
      .catch(() => {
        if (!cancelled) setCsrfError(true);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <div className="rounded-2xl border border-stone-200 bg-white p-8">
      <form className="grid gap-4" action="/api/auth" method="post">
        <input type="hidden" name="csrf_token" value={csrfToken} />
        <div>
          <label
            htmlFor="email"
            className="block text-xs font-medium uppercase tracking-wide text-slate-500"
          >
            Email
          </label>
          <input
            id="email"
            name="email"
            type="email"
            placeholder="you@example.com"
            autoComplete="email"
            required
            className="mt-1 w-full rounded-md border border-stone-300 bg-white px-3 py-2 text-sm text-slate-900 focus:border-slate-900 focus:outline-none"
          />
        </div>
        <div>
          <label
            htmlFor="password"
            className="block text-xs font-medium uppercase tracking-wide text-slate-500"
          >
            Password
          </label>
          <input
            id="password"
            name="password"
            type="password"
            autoComplete="current-password"
            required
            className="mt-1 w-full rounded-md border border-stone-300 bg-white px-3 py-2 text-sm text-slate-900 focus:border-slate-900 focus:outline-none"
          />
        </div>
        <div className="flex items-center justify-between text-xs text-slate-500">
          <label className="flex items-center gap-1.5">
            <input type="checkbox" name="remember" />
            Keep me signed in
          </label>
          <Link
            href="/sign-in/forgot"
            className="text-amber-700 hover:text-amber-800"
          >
            Forgot password?
          </Link>
        </div>
        {csrfError ? (
          <p className="text-xs text-red-700" role="alert">
            Could not initialize sign-in. Refresh the page to try again.
          </p>
        ) : null}
        <button
          type="submit"
          disabled={csrfToken === ""}
          className="mt-2 w-full rounded-full bg-slate-900 px-8 py-3 text-sm font-medium text-white hover:bg-slate-800 disabled:cursor-not-allowed disabled:bg-slate-400"
        >
          Sign in
        </button>
      </form>
      <div className="my-5 flex items-center gap-3 text-xs uppercase tracking-wide text-slate-400">
        <span className="h-px flex-1 bg-stone-200" aria-hidden="true" />
        <span>or</span>
        <span className="h-px flex-1 bg-stone-200" aria-hidden="true" />
      </div>
      <button
        type="button"
        className="w-full rounded-full border border-stone-300 bg-white px-6 py-3 text-sm font-medium text-slate-900 hover:border-slate-900"
      >
        Continue with Google
      </button>
      <p className="mt-6 text-center text-xs text-slate-500">
        New here?{" "}
        <Link
          href="/sign-in/create"
          className="text-amber-700 hover:text-amber-800"
        >
          Create an account →
        </Link>
      </p>
    </div>
  );
}
