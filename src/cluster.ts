import { z } from "zod";
import type { AddressPoint, DbscanParams, ValidationResult } from "./types";
import { err, ok } from "./errors";

/**
 * Defaults from your flows:
 * - eps default = 0.001
 * - minPts default = 2
 */
export function dbscanDefaults(partial?: Partial<DbscanParams>): DbscanParams {
  const eps = typeof partial?.eps === "number" && Number.isFinite(partial.eps) ? partial.eps : 0.001;
  const minPts =
    typeof partial?.minPts === "number" && Number.isFinite(partial.minPts) && partial.minPts > 0
      ? Math.floor(partial.minPts)
      : 2;
  return { eps, minPts };
}

/**
 * Validates points required for clustering:
 * - each point must have address_id, lat, longitude
 * - at least 2 valid points are needed (as enforced in your DBSCAN code)
 */
export function validateDbscanPoints(points: unknown): ValidationResult<AddressPoint[]> {
  const schema = z
    .array(
      z.object({
        address_id: z.number().int().positive(),
        lat: z.number().finite(),
        longitude: z.number().finite()
      })
    )
    .min(2);

  const parsed = schema.safeParse(points);
  if (!parsed.success) {
    return err(
      "Coordenadas insuficientes ou inválidas para gerar cluster (mínimo 2 pontos válidos).",
      "INVALID_INPUT",
      { issues: parsed.error.issues }
    );
  }
  return ok(parsed.data);
}

/**
 * Helper: group records by cluster_id (mirrors your n8n "Agrupar Resultados por Cluster").
 */
export function groupByClusterId<T extends { cluster_id: number }>(items: T[]): Record<number, T[]> {
  const grouped: Record<number, T[]> = {};
  for (const it of items) {
    const cid = it.cluster_id;
    grouped[cid] ||= [];
    grouped[cid].push(it);
  }
  return grouped;
}
