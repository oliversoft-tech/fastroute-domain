import { z } from "zod";
import type { ValidationResult, WaypointStatus } from "./types";
import { err, ok } from "./errors";

export const ALLOWED_WAYPOINT_TARGET_STATUSES: WaypointStatus[] = [
  "ENTREGUE",
  "FALHA MORADOR AUSENTE",
  "FALHA TEMPO ADVERSO"
];

export const ALLOWED_WAYPOINT_CURRENT_STATUSES: WaypointStatus[] = ["PENDENTE", "REORDENADO"];

export function isAllowedWaypointTargetStatus(status: string): status is WaypointStatus {
  return (ALLOWED_WAYPOINT_TARGET_STATUSES as string[]).includes(status);
}

export function isAllowedWaypointCurrentStatus(status: string): status is WaypointStatus {
  return (ALLOWED_WAYPOINT_CURRENT_STATUSES as string[]).includes(status);
}

/**
 * Mirrors Add Route flow "Generate Waypoints":
 * - route_id must be valid
 * - cluster_id must be valid
 * - each address_id must be valid
 * - seq_order = index+1
 * - status = PENDENTE
 */
export function generateWaypointsForCluster(input: {
  route_id: unknown;
  cluster_id: unknown;
  addresses: unknown;
}): ValidationResult<
  Array<{
    route_id: number;
    cluster_id: number;
    address_id: number;
    seq_order: number;
    status: "PENDENTE";
  }>
> {
  const schema = z.object({
    route_id: z.number().int().positive(),
    cluster_id: z.number().int(),
    addresses: z
      .array(
        z.object({
          address_id: z.number().int().positive()
        })
      )
      .min(1)
  });

  const parsed = schema.safeParse(input);
  if (!parsed.success) {
    return err("Dados inválidos para gerar waypoints.", "INVALID_INPUT", { issues: parsed.error.issues });
  }

  const { route_id, cluster_id, addresses } = parsed.data;

  const out = addresses.map((a, idx) => ({
    route_id,
    cluster_id,
    address_id: a.address_id,
    seq_order: idx + 1,
    status: "PENDENTE" as const
  }));

  return ok(out);
}

/**
 * Minimal validation of mandatory photo metadata from Finish Waypoint flow.
 */
export function validateWaypointPhotoMeta(photo: unknown): ValidationResult<{
  waypoint_id: number | string;
  filename: string;
  user_id: number | string;
  object_path: string;
  file_size_bytes: number | string;
  photo_url: string;
}> {
  const schema = z.object({
    waypoint_id: z.union([z.number().int().positive(), z.string().min(1)]),
    filename: z.string().min(1),
    user_id: z.union([z.number().int().positive(), z.string().min(1)]),
    object_path: z.string().min(1),
    file_size_bytes: z.union([z.number().positive(), z.string().min(1)]),
    photo_url: z.string().min(1)
  });

  const parsed = schema.safeParse(photo);
  if (!parsed.success) {
    return err("Campos obrigatórios não preenchidos (foto).", "MISSING_FIELDS", { issues: parsed.error.issues });
  }
  return ok(parsed.data);
}
