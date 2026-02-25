/**
 * Domain types aligned with your n8n flows.
 */

export type ISODateTime = string;

export type RouteStatus = "PLANEJADA" | "EM_ANDAMENTO" | "CONCLUÍDA";

export type WaypointStatus =
  | "PENDENTE"
  | "REORDENADO"
  | "ENTREGUE"
  | "FALHA MORADOR AUSENTE"
  | "FALHA TEMPO ADVERSO";

export interface Route {
  id: number;
  status: RouteStatus;
  ativa?: boolean;
  versao?: number;
  iniciada_em?: ISODateTime | null;
  finalizada_em?: ISODateTime | null;
}

export interface Waypoint {
  id: number;
  route_id: number;
  seq_order?: number;
  status: WaypointStatus;
  entregue_em?: ISODateTime | null;
  obs_falha?: string | null;
  address_id?: number;
}

export interface AddressPoint {
  address_id: number;
  lat: number;
  longitude: number;
}

export interface DbscanParams {
  eps: number;
  minPts: number;
}

export interface ValidationOk<T> {
  ok: true;
  value: T;
  warnings?: string[];
}

export interface ValidationErr {
  ok: false;
  error: string;
  code?:
    | "UNAUTHORIZED"
    | "NOT_FOUND"
    | "BAD_REQUEST"
    | "INVALID_STATE"
    | "INVALID_TRANSITION"
    | "MISSING_FIELDS"
    | "INVALID_INPUT";
  details?: Record<string, unknown>;
}

export type ValidationResult<T> = ValidationOk<T> | ValidationErr;

export interface JwtValidationInput {
  authorization?: string | null;
}

export interface JwtProviderResult {
  /** Mimics the result you use in flows: presence of an id indicates valid token. */
  id?: string | null;
  error?: string | null;
}

export interface FinishRouteInput {
  route: Route | null | undefined;
  waypoints: Array<Pick<Waypoint, "status">>;
}

export interface FinishWaypointInput {
  currentWaypoint: Waypoint | null | undefined;
  targetStatus: WaypointStatus;
  obs_falha?: string | null;

  /** Photo metadata required by the Finish Waypoint flow */
  photo: {
    waypoint_id?: number | string | null;
    filename?: string | null;
    user_id?: number | string | null;
    object_path?: string | null;
    file_size_bytes?: number | string | null;
    photo_url?: string | null;
  };
}
