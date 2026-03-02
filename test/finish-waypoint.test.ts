import { describe, it, expect } from "vitest";
import { validateFinishWaypoint } from "../src/validation";

describe("finish waypoint", () => {
  const photo = {
    waypoint_id: 1,
    filename: "photo.jpg",
    user_id: 10,
    object_path: "1/1/photo.jpg",
    file_size_bytes: 123,
    photo_url: "https://x/y"
  };

  it("fails if waypoint not found", () => {
    const r = validateFinishWaypoint({
      currentWaypoint: null,
      targetStatus: "ENTREGUE",
      photo
    });
    expect(r.ok).toBe(false);
    if (!r.ok) expect(r.code).toBe("NOT_FOUND");
  });

  it("fails if target status invalid", () => {
    const r = validateFinishWaypoint({
      currentWaypoint: { id: 1, route_id: 1, status: "PENDENTE" },
      // @ts-expect-error
      targetStatus: "CANCELADO",
      photo
    });
    expect(r.ok).toBe(false);
    if (!r.ok) expect(r.code).toBe("INVALID_TRANSITION");
  });

  it("fails if current status invalid", () => {
    const r = validateFinishWaypoint({
      currentWaypoint: { id: 1, route_id: 1, status: "ENTREGUE" },
      targetStatus: "FALHA MORADOR AUSENTE",
      photo
    });
    expect(r.ok).toBe(false);
    if (!r.ok) expect(r.code).toBe("INVALID_STATE");
  });

  it("fails if photo meta missing", () => {
    const r = validateFinishWaypoint({
      currentWaypoint: { id: 1, route_id: 1, status: "PENDENTE" },
      targetStatus: "ENTREGUE",
      photo: { waypoint_id: 1 }
    });
    expect(r.ok).toBe(false);
    if (!r.ok) expect(r.code).toBe("MISSING_FIELDS");
  });

  it("passes with valid inputs", () => {
    const r = validateFinishWaypoint({
      currentWaypoint: { id: 1, route_id: 1, status: "REORDENADO" },
      targetStatus: "ENTREGUE",
      obs_falha: null,
      photo
    });
    expect(r.ok).toBe(true);
    if (r.ok) {
      expect(r.value.waypoint_id).toBe(1);
      expect(r.value.new_status).toBe("ENTREGUE");
    }
  });
});
