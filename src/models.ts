/**
 * DB-aligned models — one interface per table in the FastRoute schema.
 */

import type { ISODateTime, WaypointStatus } from "./types";

// ─── Enum types ───────────────────────────────────────────────────────────────

export type ImportStatus = "SEM_ROTA" | "ROTERIZADA" | "NAO_ENTREGUE";

export type DbRouteStatus = "CRIADA" | "CANCELADA" | "EM_ANDAMENTO" | "CONCLUÍDA";

// ─── Table models ─────────────────────────────────────────────────────────────

export interface Client {
  id: number;
  created_at: ISODateTime;
  nome: string;
  endereco?: string | null;
  nif?: string | null;
  numero_whatsup: string;
}

export interface ImportfileLayout {
  id: number;
  created_at: ISODateTime;
  column_names?: string | null;
}

export interface User {
  id: number;
  created_at: ISODateTime;
  numero_whatsup?: string | null;
  id_cliente: number;
  ultima_latitude?: string | null;
  ultima_longitude?: string | null;
  auth_user_id?: string | null;
  role: string;
}

export interface AddressError {
  id: string;
  raw_data?: Record<string, unknown> | null;
  error_message?: string | null;
  created_at: ISODateTime;
}

export interface OrdersImport {
  id: number;
  created_at: ISODateTime;
  user_id: number;
  status: ImportStatus;
  layout_id: number;
}

export interface Order {
  id: number;
  waybill_number: string;
  lp_no?: string | null;
  destination_city?: string | null;
  zip_code?: string | null;
  detailed_address?: string | null;
  receiver_latitude?: string | null;
  receiver_longitude?: string | null;
  actual_delivery_latitude?: string | null;
  actual_delivery_longitude?: string | null;
  delivery_gap_distance?: string | null;
  contact_name?: string | null;
  contact_phone: string;
  contact_phone_1?: string | null;
  mail?: string | null;
  import_id: number;
}

export interface Address {
  id: number;
  created_at: ISODateTime;
  zipcode: string;
  city: string;
  detailed_address: string;
  lat: string;
  longitude: string;
  order_id: number;
}

/** Full DB model for the `routes` table. */
export interface DbRoute {
  id: number;
  created_at: ISODateTime;
  import_id: number;
  driver_id: number;
  cluster_id: number;
  status: DbRouteStatus;
  iniciada_em?: ISODateTime | null;
  planejada_para?: ISODateTime | null;
  finalizada_em?: ISODateTime | null;
  version?: number | null;
  ativa?: boolean | null;
  justificativa_cancel?: string | null;
}

/** Full DB model for the `route_waypoints` table. */
export interface RouteWaypoint {
  id: number;
  created_at: ISODateTime;
  route_id?: number | null;
  address_id?: number | null;
  seq_order?: number | null;
  status: WaypointStatus;
  entregue_em?: ISODateTime | null;
  obs_falha?: string | null;
  version?: number | null;
}

export interface ChangeLog {
  id: number;
  created_at?: ISODateTime | null;
  entity_type: string;
  entity_id: number;
  op: string;
  version?: number | null;
  payload?: Record<string, unknown> | null;
}

export interface MutationApplied {
  device_id: string;
  mutation_id: string;
  created_at?: ISODateTime | null;
}

export interface WaypointDeliveryPhoto {
  id: number;
  route_id: number;
  waypoint_id: number;
  user_id: number;
  bucket: string;
  object_path: string;
  file_name: string;
  file_size_bytes?: number | null;
  created_at: ISODateTime;
}
