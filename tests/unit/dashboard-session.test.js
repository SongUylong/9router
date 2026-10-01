import { afterAll, describe, expect, it, vi } from "vitest";

vi.stubEnv("JWT_SECRET", "test-only-not-a-credential");
vi.mock("@/lib/localDb", () => ({ getSettings: vi.fn() }));

const { getDashboardAuthCookieOptions } = await import("../../src/lib/auth/dashboardSession.js");

afterAll(() => vi.unstubAllEnvs());

function request(proto) {
  return { headers: new Headers(proto ? { "x-forwarded-proto": proto } : {}) };
}

describe("dashboard auth cookie options", () => {
  it("keeps first-party sessions Lax", () => {
    expect(getDashboardAuthCookieOptions(request("https"))).toMatchObject({
      secure: true,
      sameSite: "lax",
    });
  });

  it("allows embedded sessions only as Secure SameSite=None cookies", () => {
    expect(getDashboardAuthCookieOptions(request("https"), { embedded: true })).toMatchObject({
      secure: true,
      sameSite: "none",
    });
    expect(() => getDashboardAuthCookieOptions(request("http"), { embedded: true })).toThrow(
      "Embedded sign-in requires HTTPS."
    );
  });
});
