import { describe, expect, it } from "vitest";
import {
  detectCertLab,
  isValidCertNumber,
  normalizeCertNumber,
} from "../parse";

describe("normalizeCertNumber", () => {
  it("strips whitespace/hyphens and uppercases", () => {
    expect(normalizeCertNumber(" ags-104 20193 ")).toBe("AGS10420193");
    expect(normalizeCertNumber("1234-567890")).toBe("1234567890");
  });
});

describe("detectCertLab — GIA + AGS both parse", () => {
  it("detects GIA from 10-digit numeric", () => {
    expect(detectCertLab("1234567890")).toBe("GIA");
  });
  it("detects GIA from 11-digit numeric", () => {
    expect(detectCertLab("22334455667")).toBe("GIA");
  });
  it("detects AGS from explicit prefix", () => {
    expect(detectCertLab("AGS10420193")).toBe("AGS");
    expect(detectCertLab("ags10420193")).toBe("AGS");
  });
  it("detects AGS from short-digit (<10)", () => {
    expect(detectCertLab("12345678")).toBe("AGS");
  });
  it("returns null for garbage", () => {
    expect(detectCertLab("")).toBeNull();
    expect(detectCertLab("hello")).toBeNull();
    expect(detectCertLab("999999999999")).toBeNull();
  });
});

describe("isValidCertNumber", () => {
  it("accepts GIA-format", () => {
    expect(isValidCertNumber("1234567890")).toBe(true);
    expect(isValidCertNumber("22334455667")).toBe(true);
  });
  it("accepts AGS-format (prefixed and bare)", () => {
    expect(isValidCertNumber("AGS10420193")).toBe(true);
    expect(isValidCertNumber("12345678")).toBe(true);
  });
  it("rejects malformed", () => {
    expect(isValidCertNumber("")).toBe(false);
    expect(isValidCertNumber("abcd")).toBe(false);
    expect(isValidCertNumber("12")).toBe(false);
  });
});
