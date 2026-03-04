import { z } from "zod";
import type {
  AddressPoint,
  ClusterizedAddressPoint,
  DbscanMetersParams,
  DbscanParams,
  ValidationResult
} from "./types";
import { err, ok } from "./errors";

const EARTH_RADIUS_METERS = 6_371_000;

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
 * DBSCAN defaults using meters (mobile/import use-case).
 * - epsMeters default = 50m
 * - minPts default = 2
 */
export function dbscanMetersDefaults(partial?: Partial<DbscanMetersParams>): DbscanMetersParams {
  const epsMeters =
    typeof partial?.epsMeters === "number" && Number.isFinite(partial.epsMeters) && partial.epsMeters > 0
      ? partial.epsMeters
      : 50;
  const minPts =
    typeof partial?.minPts === "number" && Number.isFinite(partial.minPts) && partial.minPts > 0
      ? Math.floor(partial.minPts)
      : 2;
  return { epsMeters, minPts };
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

function toRadians(value: number) {
  return (value * Math.PI) / 180;
}

function haversineMeters(a: AddressPoint, b: AddressPoint) {
  const dLat = toRadians(b.lat - a.lat);
  const dLon = toRadians(b.longitude - a.longitude);
  const lat1 = toRadians(a.lat);
  const lat2 = toRadians(b.lat);

  const sinLat = Math.sin(dLat / 2);
  const sinLon = Math.sin(dLon / 2);
  const h = sinLat * sinLat + Math.cos(lat1) * Math.cos(lat2) * sinLon * sinLon;
  return 2 * EARTH_RADIUS_METERS * Math.asin(Math.min(1, Math.sqrt(h)));
}

function regionQuery(points: AddressPoint[], index: number, epsMeters: number) {
  const center = points[index];
  if (!center) {
    return [] as number[];
  }
  const neighbors: number[] = [];
  for (let i = 0; i < points.length; i += 1) {
    const candidate = points[i];
    if (!candidate) {
      continue;
    }
    if (haversineMeters(center, candidate) <= epsMeters) {
      neighbors.push(i);
    }
  }
  return neighbors;
}

/**
 * Clusters points with DBSCAN using geodesic distance in meters.
 * cluster_id:
 * - >= 1 => regular cluster
 * - -1 => noise
 */
export function clusterizeAddressPointsByMeters(
  points: unknown,
  partial?: Partial<DbscanMetersParams>
): ValidationResult<ClusterizedAddressPoint[]> {
  const pointsResult = validateDbscanPoints(points);
  if (!pointsResult.ok) {
    return pointsResult;
  }

  const normalizedPoints = pointsResult.value;
  const { epsMeters, minPts } = dbscanMetersDefaults(partial);

  const labels: Array<number | undefined> = new Array(normalizedPoints.length).fill(undefined);
  let clusterId = 0;

  for (let i = 0; i < normalizedPoints.length; i += 1) {
    if (labels[i] !== undefined) {
      continue;
    }

    const neighbors = regionQuery(normalizedPoints, i, epsMeters);
    if (neighbors.length < minPts) {
      labels[i] = -1;
      continue;
    }

    clusterId += 1;
    labels[i] = clusterId;

    const queue = [...neighbors];
    const queued = new Set(queue);

    while (queue.length > 0) {
      const currentIndex = queue.shift() as number;

      if (labels[currentIndex] === -1) {
        labels[currentIndex] = clusterId;
      }

      if (labels[currentIndex] !== undefined) {
        continue;
      }

      labels[currentIndex] = clusterId;
      const currentNeighbors = regionQuery(normalizedPoints, currentIndex, epsMeters);
      if (currentNeighbors.length >= minPts) {
        for (const neighborIndex of currentNeighbors) {
          if (!queued.has(neighborIndex)) {
            queued.add(neighborIndex);
            queue.push(neighborIndex);
          }
        }
      }
    }
  }

  const clusteredPoints = normalizedPoints.map((point, index) => ({
    ...point,
    cluster_id: labels[index] ?? -1
  }));
  return ok(clusteredPoints);
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
