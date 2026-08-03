import { afterEach, beforeEach, describe, expect, it } from "vitest";
import {
  DEDUPE_WINDOW_MS,
  __configureForTests,
  __resetForTests,
  listApplicationsForOperatorReview,
  submitApplicationSync,
} from "../store";

describe("sell store — dedupe + persistence semantics", () => {
  beforeEach(() => {
    __resetForTests();
    // Disable file persistence during unit tests — no writable path.
    __configureForTests({ file: null });
  });
  afterEach(() => {
    __resetForTests();
  });

  it("creates a new application when nothing exists for that email", () => {
    __configureForTests({ now: () => 1_000_000 });
    const r = submitApplicationSync({
      businessName: "Vale Diamonds",
      contactName: "Jane Doe",
      email: "jane@vale.example",
    });
    expect(r.status).toBe("created");
    if (r.status !== "created") return;
    expect(r.application.email).toBe("jane@vale.example");
    expect(r.application.submittedAt).toBe(1_000_000);
    expect(listApplicationsForOperatorReview()).toHaveLength(1);
  });

  it("rejects a duplicate submitted inside the 24h window", () => {
    __configureForTests({ now: () => 1_000_000 });
    const first = submitApplicationSync({
      businessName: "Vale",
      contactName: "Jane",
      email: "jane@vale.example",
    });
    expect(first.status).toBe("created");

    __configureForTests({ now: () => 1_000_000 + DEDUPE_WINDOW_MS - 1 });
    const second = submitApplicationSync({
      businessName: "Vale",
      contactName: "Jane",
      email: "jane@vale.example",
    });
    expect(second.status).toBe("duplicate");
    if (second.status !== "duplicate") return;
    expect(second.previousSubmittedAt).toBe(1_000_000);
    expect(listApplicationsForOperatorReview()).toHaveLength(1);
  });

  it("allows a second submission AFTER the 24h window elapses", () => {
    __configureForTests({ now: () => 1_000_000 });
    submitApplicationSync({
      businessName: "Vale",
      contactName: "Jane",
      email: "jane@vale.example",
    });
    __configureForTests({ now: () => 1_000_000 + DEDUPE_WINDOW_MS + 1 });
    const r = submitApplicationSync({
      businessName: "Vale",
      contactName: "Jane",
      email: "jane@vale.example",
    });
    expect(r.status).toBe("created");
    expect(listApplicationsForOperatorReview()).toHaveLength(2);
  });

  it("normalizes email to lower-case for dedupe (JANE@X === jane@x)", () => {
    __configureForTests({ now: () => 2_000_000 });
    const first = submitApplicationSync({
      businessName: "Vale",
      contactName: "Jane",
      email: "Jane@Vale.Example",
    });
    expect(first.status).toBe("created");
    if (first.status !== "created") return;
    expect(first.application.email).toBe("jane@vale.example");

    __configureForTests({ now: () => 2_000_001 });
    const second = submitApplicationSync({
      businessName: "Vale",
      contactName: "Jane",
      email: "jane@vale.example",
    });
    expect(second.status).toBe("duplicate");
  });

  it("different emails are independent — never dedupes across accounts", () => {
    submitApplicationSync({
      businessName: "Vale",
      contactName: "Jane",
      email: "jane@vale.example",
    });
    const r = submitApplicationSync({
      businessName: "Arc",
      contactName: "John",
      email: "john@arc.example",
    });
    expect(r.status).toBe("created");
    expect(listApplicationsForOperatorReview()).toHaveLength(2);
  });

  it("check-and-insert is atomic within a tick — two same-tick calls yield 1 create + 1 duplicate", () => {
    // Since submitApplicationSync is synchronous, two back-to-back calls in
    // the same tick model 'concurrent same-second' submissions from two
    // request handlers whose async parsing already completed.
    __configureForTests({ now: () => 3_000_000 });
    const a = submitApplicationSync({
      businessName: "Vale",
      contactName: "Jane",
      email: "race@x.example",
    });
    const b = submitApplicationSync({
      businessName: "Vale",
      contactName: "Jane",
      email: "race@x.example",
    });
    const outcomes = [a.status, b.status].sort();
    expect(outcomes).toEqual(["created", "duplicate"]);
    expect(listApplicationsForOperatorReview()).toHaveLength(1);
  });
});
