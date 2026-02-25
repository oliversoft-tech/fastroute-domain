import type { FinishRouteInput, RouteStatus, ValidationResult } from "./types";
import { err, ok } from "./errors";

export const ROUTE_FINISH_REQUIRED_STATUS: RouteStatus = "EM_ANDAMENTO";

/**
 * Mirrors Finish Route flow rules:
 * - route must exist
 * - route.status must be EM_ANDAMENTO
 * - no waypoint may be PENDENTE
 */
export function canFinishRoute(input: FinishRouteInput): ValidationResult<true> {
  const route = input.route;
  if (!route) {
    return err("Rota não encontrada.", "NOT_FOUND");
  }

  if (route.status !== ROUTE_FINISH_REQUIRED_STATUS) {
    return err("Nao é possível finalizar a rota! Ela não está em andamento!", "INVALID_STATE", {
      expected: ROUTE_FINISH_REQUIRED_STATUS,
      actual: route.status
    });
  }

  const hasPending = input.waypoints.some((w) => w.status === "PENDENTE");
  if (hasPending) {
    return err("Não é Possível finalizar a rota. Existem Entregas Pendentes !", "INVALID_STATE");
  }

  return ok(true);
}
