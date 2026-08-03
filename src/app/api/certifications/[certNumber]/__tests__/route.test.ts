import { describe, expect, it } from "vitest";
import { GET } from "../route";

function req(): Request {
  return new Request("http://localhost/api/certifications/x");
}

describe("GET /api/certifications/[certNumber]", () => {
  it("200 verified for a known GIA cert", async () => {
    const res = await GET(req(), {
      params: Promise.resolve({ certNumber: "1234567890" }),
    });
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.status).toBe("verified");
    expect(body.report.lab).toBe("GIA");
  });

  it("200 verified for a known AGS cert", async () => {
    const res = await GET(req(), {
      params: Promise.resolve({ certNumber: "AGS10420193" }),
    });
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.status).toBe("verified");
    expect(body.report.lab).toBe("AGS");
  });

  it("404 not_found for an unknown well-formed cert", async () => {
    const res = await GET(req(), {
      params: Promise.resolve({ certNumber: "9999999999" }),
    });
    expect(res.status).toBe(404);
    const body = await res.json();
    expect(body.status).toBe("not_found");
    expect(body.report).toBeUndefined();
  });

  it("404 not_found for a malformed cert", async () => {
    const res = await GET(req(), {
      params: Promise.resolve({ certNumber: "nope" }),
    });
    expect(res.status).toBe(404);
    const body = await res.json();
    expect(body.status).toBe("not_found");
  });
});
