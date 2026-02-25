import { normalizeJwtProviderResult, validateJwtInput } from "../src/auth";
import { describe, it, expect } from "vitest";
import { canFinishRoute } from "../src/routes";

describe("routes", () => {
  it("fails when route missing", () => {
    const r = canFinishRoute({ route: null, waypoints: [] });
    expect(r.ok).toBe(false);
    if (!r.ok) expect(r.code).toBe("NOT_FOUND");
  });

  it("fails when route not EM_ANDAMENTO", () => {
    const r = canFinishRoute({
      route: { id: 1, status: "PLANEJADA" },
      waypoints: [{ status: "ENTREGUE" }]
    });
    expect(r.ok).toBe(false);
    if (!r.ok) expect(r.code).toBe("INVALID_STATE");
  });

  it("fails when there are pending waypoints", () => {
    const r = canFinishRoute({
      route: { id: 1, status: "EM_ANDAMENTO" },
      waypoints: [{ status: "PENDENTE" }, { status: "ENTREGUE" }]
    });
    expect(r.ok).toBe(false);
  });

  it("passes when EM_ANDAMENTO and none pending", () => {
    const r = canFinishRoute({
      route: { id: 1, status: "EM_ANDAMENTO" },
      waypoints: [{ status: "ENTREGUE" }]
    });
    expect(r.ok).toBe(true);
  });
});
