/**
 * Maps each domain model interface to its database table name.
 * Single source of truth: update here when table names change.
 *
 * Usage (in services):
 *   import { TableName } from '@oliverbill/fastroute-domain';
 *   supabase.from(TableName.DbRoute)…
 */
export const TableName = {
  Client:                'clients',
  ImportfileLayout:      'importfile_layout',
  User:                  'users',
  AddressError:          'address_errors',
  OrdersImport:          'orders_import',
  Order:                 'orders',
  Address:               'addresses',
  DbRoute:               'routes',
  RouteWaypoint:         'route_waypoints',
  ChangeLog:             'change_log',
  MutationApplied:       'mutations_applied',
  WaypointDeliveryPhoto: 'waypoint_delivery_photo',
} as const;

export type TableNameValue = typeof TableName[keyof typeof TableName];

/** Maps database views to their names. Update here when view names change. */
export const ViewName = {
  RoutesFull: 'v_routes_full',
} as const;

export type ViewNameValue = typeof ViewName[keyof typeof ViewName];

/**
 * Maps each domain model's column names.
 * Attribute names mirror the interface properties (which already match DB columns).
 * Update here when column names change — services never need to touch raw strings.
 *
 * Usage (in services):
 *   supabase.from(TableName.DbRoute).eq(Columns.DbRoute.driver_id, id)…
 */
export const Columns = {
  Client: {
    id: 'id', created_at: 'created_at',
    nome: 'nome', endereco: 'endereco', nif: 'nif', numero_whatsup: 'numero_whatsup',
  },
  ImportfileLayout: {
    id: 'id', created_at: 'created_at', column_names: 'column_names',
  },
  User: {
    id: 'id', created_at: 'created_at',
    numero_whatsup: 'numero_whatsup', id_cliente: 'id_cliente',
    ultima_latitude: 'ultima_latitude', ultima_longitude: 'ultima_longitude',
    auth_user_id: 'auth_user_id', role: 'role',
  },
  AddressError: {
    id: 'id', created_at: 'created_at',
    raw_data: 'raw_data', error_message: 'error_message',
  },
  OrdersImport: {
    id: 'id', created_at: 'created_at',
    user_id: 'user_id', status: 'status', layout_id: 'layout_id',
  },
  Order: {
    id: 'id', import_id: 'import_id',
    waybill_number: 'waybill_number', lp_no: 'lp_no',
    destination_city: 'destination_city', zip_code: 'zip_code',
    detailed_address: 'detailed_address',
    receiver_latitude: 'receiver_latitude', receiver_longitude: 'receiver_longitude',
    actual_delivery_latitude: 'actual_delivery_latitude', actual_delivery_longitude: 'actual_delivery_longitude',
    delivery_gap_distance: 'delivery_gap_distance',
    contact_name: 'contact_name', contact_phone: 'contact_phone', contact_phone_1: 'contact_phone_1',
    mail: 'mail',
  },
  Address: {
    id: 'id', created_at: 'created_at',
    zipcode: 'zipcode', city: 'city', detailed_address: 'detailed_address',
    lat: 'lat', longitude: 'longitude', order_id: 'order_id',
  },
  DbRoute: {
    id: 'id', created_at: 'created_at',
    import_id: 'import_id', driver_id: 'driver_id', cluster_id: 'cluster_id',
    status: 'status', iniciada_em: 'iniciada_em', planejada_para: 'planejada_para',
    finalizada_em: 'finalizada_em', version: 'version', ativa: 'ativa',
    justificativa_cancel: 'justificativa_cancel',
  },
  RouteWaypoint: {
    id: 'id', created_at: 'created_at',
    route_id: 'route_id', address_id: 'address_id', seq_order: 'seq_order',
    status: 'status', entregue_em: 'entregue_em', obs_falha: 'obs_falha',
    version: 'version',
  },
  ChangeLog: {
    id: 'id', created_at: 'created_at',
    entity_type: 'entity_type', entity_id: 'entity_id',
    op: 'op', version: 'version', payload: 'payload',
  },
  MutationApplied: {
    device_id: 'device_id', mutation_id: 'mutation_id', created_at: 'created_at',
  },
  WaypointDeliveryPhoto: {
    id: 'id', created_at: 'created_at',
    route_id: 'route_id', waypoint_id: 'waypoint_id', user_id: 'user_id',
    bucket: 'bucket', object_path: 'object_path',
    file_name: 'file_name', file_size_bytes: 'file_size_bytes',
  },
} as const;

/** Joins column constants for Supabase .select() calls with specific columns. */
export const selectCols = (...cols: string[]): string => cols.join(', ');
