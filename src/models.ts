/**
 * DB-aligned models — one interface per table in src/supabase-schema.sql.
 * This file is self-contained; types.ts imports from here, not the other way.
 */

// ─── Primitives ───────────────────────────────────────────────────────────────

export type ISODateTime = string;

// ─── Enum types (mirror PostgreSQL ENUMs) ─────────────────────────────────────

/** mirrors: CREATE TYPE import_status */
export type ImportStatus = "SEM_ROTA" | "ROTERIZADA" | "NAO_ENTREGUE";

/** mirrors: CREATE TYPE route_status */
export type DbRouteStatus = "CRIADA" | "CANCELADA" | "EM_ANDAMENTO" | "CONCLUÍDA";

/** mirrors: CREATE TYPE waypoint_status */
export type WaypointStatus =
  | "PENDENTE"
  | "ENTREGUE"
  | "FALHA TEMPO ADVERSO"
  | "FALHA MORADOR AUSENTE"
  | "REORDENADO";

// ─── Table: clients ───────────────────────────────────────────────────────────

export interface Client {
  id: number;
  created_at: ISODateTime;
  nome: string;
  endereco?: string | null;
  nif?: string | null;
  numero_whatsup: string;
}

// ─── Table: importfile_layout ─────────────────────────────────────────────────

export interface ImportfileLayout {
  id: number;
  created_at: ISODateTime;
  column_names?: string | null;
}

// ─── Table: users ─────────────────────────────────────────────────────────────

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

// ─── Table: address_errors ────────────────────────────────────────────────────

export interface AddressError {
  id: string;
  raw_data?: Record<string, unknown> | null;
  error_message?: string | null;
  created_at?: ISODateTime | null;
}

// ─── Table: orders_import ─────────────────────────────────────────────────────

export interface OrdersImport {
  id: number;
  created_at: ISODateTime;
  user_id: number;
  status: ImportStatus;
  layout_id: number;
}

// ─── Table: orders ────────────────────────────────────────────────────────────

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

// ─── Table: addresses ─────────────────────────────────────────────────────────

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

// ─── Table: routes ────────────────────────────────────────────────────────────

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

// ─── Table: route_waypoints ───────────────────────────────────────────────────

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

// ─── Table: change_log ────────────────────────────────────────────────────────

export interface ChangeLog {
  id: number;
  created_at?: ISODateTime | null;
  entity_type: string;
  entity_id: number;
  op: string;
  version?: number | null;
  payload?: Record<string, unknown> | null;
}

// ─── Table: mutations_applied ─────────────────────────────────────────────────

export interface MutationApplied {
  device_id: string;
  mutation_id: string;
  created_at?: ISODateTime | null;
}

// ─── Table: waypoint_delivery_photo ───────────────────────────────────────────

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
