import Link from "next/link";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Sign in — Diamond Marketplace",
  description:
    "Sign in to track orders, escrow status, and saved diamonds.",
};

function SignInCard() {
  return (
    <div className="rounded-2xl border border-stone-200 bg-white p-8">
      <form className="grid gap-4" action="/sign-in" method="post">
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
        <button
          type="submit"
          className="mt-2 w-full rounded-full bg-slate-900 px-8 py-3 text-sm font-medium text-white hover:bg-slate-800"
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

export default function SignInPage() {
  return (
    <div className="mx-auto max-w-md px-6 py-16">
      <div className="text-center">
        <h1 className="font-serif text-3xl text-slate-900 sm:text-4xl">
          Welcome back.
        </h1>
        <p className="mt-2 text-sm text-slate-600">
          Sign in to track orders, escrow status, and saved diamonds.
        </p>
      </div>
      <div className="mt-8">
        <SignInCard />
      </div>
      <p className="mt-6 text-center text-xs text-slate-400">
        Selling inventory?{" "}
        <Link
          href="/dealer-access"
          className="text-amber-700 hover:text-amber-800"
        >
          Dealer sign-in →
        </Link>
      </p>
    </div>
  );
}
