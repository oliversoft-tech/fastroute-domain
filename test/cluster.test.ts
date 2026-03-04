import { describe, it, expect } from "vitest";
import {
  clusterizeAddressPointsByMeters,
  dbscanDefaults,
  dbscanMetersDefaults,
  groupByClusterId,
  validateDbscanPoints
} from "../src/cluster";

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
    expect(grouped[1]?.length).toBe(2);
    expect(grouped[2]?.length).toBe(1);
  });

  it("returns meter defaults", () => {
    expect(dbscanMetersDefaults()).toEqual({ epsMeters: 50, minPts: 2 });
  });

  it("clusters points by meters", () => {
    const r = clusterizeAddressPointsByMeters(
      [
        { address_id: 1, lat: 40.193024, longitude: -8.408266 },
        { address_id: 2, lat: 40.19303, longitude: -8.40825 },
        { address_id: 3, lat: 40.203024, longitude: -8.418266 },
        { address_id: 4, lat: 40.20303, longitude: -8.41825 }
      ],
      { epsMeters: 100, minPts: 2 }
    );

    expect(r.ok).toBe(true);
    if (!r.ok) {
      return;
    }

    const grouped = groupByClusterId(r.value);
    expect(Object.keys(grouped).length).toBe(2);
    expect(grouped[1]?.length).toBe(2);
    expect(grouped[2]?.length).toBe(2);
  });

  it("marks as noise when eps is too small", () => {
    const r = clusterizeAddressPointsByMeters(
      [
        { address_id: 1, lat: 40.193024, longitude: -8.408266 },
        { address_id: 2, lat: 40.19303, longitude: -8.40825 }
      ],
      { epsMeters: 1, minPts: 2 }
    );

    expect(r.ok).toBe(true);
    if (!r.ok) {
      return;
    }

    expect(r.value.every((entry) => entry.cluster_id === -1)).toBe(true);
  });
});
