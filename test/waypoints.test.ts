import { normalizeJwtProviderResult, validateJwtInput } from "../src/auth";
import { describe, it, expect } from "vitest";
import { generateWaypointsForCluster, validateWaypointPhotoMeta } from "../src/waypoints";

describe("waypoints", () => {
  it("generates PENDENTE waypoints with seq_order", () => {
    const r = generateWaypointsForCluster({
      route_id: 10,
      cluster_id: 2,
      addresses: [{ address_id: 1 }, { address_id: 2 }, { address_id: 3 }]
    });

    expect(r.ok).toBe(true);
    if (r.ok) {
      expect(r.value.length).toBe(3);
      expect(r.value[0].seq_order).toBe(1);
      expect(r.value[2].seq_order).toBe(3);
      expect(r.value.every((w) => w.status === "PENDENTE")).toBe(true);
    }
  });

  it("rejects invalid generation input", () => {
    const r = generateWaypointsForCluster({ route_id: "x", cluster_id: 2, addresses: [] });
    expect(r.ok).toBe(false);
  });

  it("requires all photo meta fields", () => {
    const r = validateWaypointPhotoMeta({ waypoint_id: 1 });
    expect(r.ok).toBe(false);
    if (!r.ok) expect(r.code).toBe("MISSING_FIELDS");
  });

  it("accepts full photo meta", () => {
    const r = validateWaypointPhotoMeta({
      waypoint_id: 1,
      filename: "a.jpg",
      user_id: 99,
      object_path: "10/1/a.jpg",
      file_size_bytes: 12345,
      photo_url: "https://example.com/x"
    });
    expect(r.ok).toBe(true);
  });
});
