import { normalizeJwtProviderResult, validateJwtInput } from "../src/auth";
import { describe, it, expect } from "vitest";
import { dbscanDefaults, validateDbscanPoints, groupByClusterId } from "../src/cluster";

describe("cluster", () => {
  it("returns defaults when missing params", () => {
    expect(dbscanDefaults()).toEqual({ eps: 0.001, minPts: 2 });
  });

  it("honors provided params", () => {
    expect(dbscanDefaults({ eps: 0.01, minPts: 3 })).toEqual({ eps: 0.01, minPts: 3 });
  });

  it("rejects fewer than 2 points", () => {
    const r = validateDbscanPoints([{ address_id: 1, lat: 1, longitude: 1 }]);
    expect(r.ok).toBe(false);
  });

  it("accepts 2+ valid points", () => {
    const r = validateDbscanPoints([
      { address_id: 1, lat: 1, longitude: 1 },
      { address_id: 2, lat: 2, longitude: 2 }
    ]);
    expect(r.ok).toBe(true);
  });

  it("groups by cluster_id", () => {
    const grouped = groupByClusterId([
      { cluster_id: 1, x: "a" },
      { cluster_id: 1, x: "b" },
      { cluster_id: 2, x: "c" }
    ]);
    expect(grouped[1].length).toBe(2);
    expect(grouped[2].length).toBe(1);
  });
});
