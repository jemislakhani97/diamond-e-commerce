import Link from "next/link";
import type { Metadata } from "next";
import { SignInForm } from "./SignInForm";

export const metadata: Metadata = {
  title: "Sign in — Diamond Marketplace",
  description:
    "Sign in to track orders, escrow status, and saved diamonds.",
};

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
        <SignInForm />
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
