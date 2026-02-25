import type { FinishWaypointInput, ValidationResult, WaypointStatus } from "./types";
import { err, ok } from "./errors";
import {
  ALLOWED_WAYPOINT_CURRENT_STATUSES,
  ALLOWED_WAYPOINT_TARGET_STATUSES,
  validateWaypointPhotoMeta
} from "./waypoints";

/**
 * Mirrors Finish Waypoint flow rules:
 * - waypoint must exist
 * - target status must be ENTREGUE or allowed FALHA values
 * - current status must be PENDENTE or REORDENADO
 * - photo metadata must be present
 *
 * Note: the flow also uploads to Supabase Storage and writes waypoint_delivery_photo.
 * Those are side-effects; this function validates the prerequisites only.
 */
export function validateFinishWaypoint(input: FinishWaypointInput): ValidationResult<{
  waypoint_id: number;
  new_status: WaypointStatus;
  obs_falha?: string | null;
}> {
  const current = input.currentWaypoint;
  if (!current) {
    return err("waypoint nao encontrado!", "NOT_FOUND");
  }

  if (!ALLOWED_WAYPOINT_TARGET_STATUSES.includes(input.targetStatus)) {
    return err("Status deve ser ENTREGUE ou FALHA!", "INVALID_TRANSITION", {
      allowedTargets: ALLOWED_WAYPOINT_TARGET_STATUSES,
      got: input.targetStatus
    });
  }

  if (!ALLOWED_WAYPOINT_CURRENT_STATUSES.includes(current.status)) {
    return err("Status atual do waypoint deve ser PENDENTE!", "INVALID_STATE", {
      allowedCurrents: ALLOWED_WAYPOINT_CURRENT_STATUSES,
      got: current.status
    });
  }

  const photoOk = validateWaypointPhotoMeta(input.photo);
  if (!photoOk.ok) {
    return photoOk;
  }

  return ok({
    waypoint_id: current.id,
    new_status: input.targetStatus,
    obs_falha: input.obs_falha ?? null
  });
}
