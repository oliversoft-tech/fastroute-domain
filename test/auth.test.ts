import { describe, it, expect } from "vitest";
import { normalizeJwtProviderResult, validateJwtInput } from "../src/auth";

describe("auth", () => {
  it("rejects missing authorization", () => {
    const r = validateJwtInput({ authorization: "" });
    expect(r.ok).toBe(false);
    if (!r.ok) expect(r.code).toBe("UNAUTHORIZED");
  });

  it("accepts authorization", () => {
    const r = validateJwtInput({ authorization: "Bearer x.y.z" });
    expect(r.ok).toBe(true);
    if (r.ok) expect(r.value.token).toContain("Bearer");
  });

  it("normalizes provider invalid result", () => {
    const r = normalizeJwtProviderResult({ id: "", error: "nope" });
    expect(r.ok).toBe(false);
    if (!r.ok) expect(r.code).toBe("UNAUTHORIZED");
  });

  it("normalizes provider valid result", () => {
    const r = normalizeJwtProviderResult({ id: "user-123" });
    expect(r.ok).toBe(true);
    if (r.ok) expect(r.value.userId).toBe("user-123");
  });
});
