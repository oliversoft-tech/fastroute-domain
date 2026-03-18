-- LOGISTICS DATABASE SCHEMA
-- Complete PostgreSQL Setup Script

CREATE EXTENSION IF NOT EXISTS pgcrypto;

CREATE TYPE import_status AS ENUM ('SEM_ROTA','ROTERIZADA','NAO_ENTREGUE');
CREATE TYPE route_status AS ENUM ('CRIADA','CANCELADA','EM_ANDAMENTO','CONCLUÍDA');
CREATE TYPE waypoint_status AS ENUM ('PENDENTE','ENTREGUE','FALHA TEMPO ADVERSO','FALHA MORADOR AUSENTE','REORDENADO');

CREATE SEQUENCE change_log_id_seq;
CREATE SEQUENCE waypoint_delivery_photo_id_seq;

CREATE TABLE clients (
  id bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  created_at timestamptz NOT NULL DEFAULT now(),
  nome text NOT NULL, endereco text, nif text,
  numero_whatsup text NOT NULL UNIQUE
);

CREATE TABLE importfile_layout (
  id bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  created_at timestamptz NOT NULL DEFAULT now(),
  column_names text
);

CREATE TABLE users (
  id bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  created_at timestamptz NOT NULL DEFAULT now(),
  numero_whatsup text, id_cliente bigint NOT NULL,
  ultima_latitude text DEFAULT '', ultima_longitude text,
  auth_user_id uuid UNIQUE, role text NOT NULL DEFAULT 'motorista',
  CONSTRAINT users_client_fk FOREIGN KEY (id_cliente) REFERENCES clients(id)
);

CREATE TABLE address_errors (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  raw_data jsonb UNIQUE, error_message text, created_at timestamp DEFAULT now()
);

CREATE TABLE orders_import (
  id bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  created_at timestamptz NOT NULL DEFAULT now(),
  user_id bigint NOT NULL, status import_status NOT NULL DEFAULT 'SEM_ROTA',
  layout_id bigint NOT NULL DEFAULT 1,
  CONSTRAINT orders_import_user_fk FOREIGN KEY (user_id) REFERENCES users(id),
  CONSTRAINT orders_import_layout_fk FOREIGN KEY (layout_id) REFERENCES importfile_layout(id)
);

CREATE TABLE orders (
  id bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  waybill_number text NOT NULL, lp_no text, destination_city text,
  zip_code text, detailed_address text, receiver_latitude text,
  receiver_longitude text, actual_delivery_latitude text,
  actual_delivery_longitude text, delivery_gap_distance text,
  contact_name text, contact_phone text NOT NULL, contact_phone_1 text,
  mail text, import_id bigint NOT NULL,
  CONSTRAINT orders_import_fk FOREIGN KEY (import_id) REFERENCES orders_import(id)
);

CREATE TABLE addresses (
  id bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  created_at timestamptz NOT NULL DEFAULT now(),
  zipcode text NOT NULL, city text NOT NULL, detailed_address text NOT NULL,
  lat text NOT NULL, longitude text NOT NULL, order_id bigint NOT NULL,
  CONSTRAINT addresses_order_fk FOREIGN KEY (order_id) REFERENCES orders(id)
);

CREATE TABLE routes (
  id bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  created_at timestamptz NOT NULL DEFAULT now(),
  import_id bigint NOT NULL, driver_id bigint NOT NULL, cluster_id bigint NOT NULL,
  status route_status NOT NULL DEFAULT 'CRIADA',
  iniciada_em timestamptz, planejada_para timestamptz, finalizada_em timestamptz,
  version smallint DEFAULT 1, ativa boolean DEFAULT false, justificativa_cancel varchar,
  CONSTRAINT routes_import_fk FOREIGN KEY (import_id) REFERENCES orders_import(id),
  CONSTRAINT routes_driver_fk FOREIGN KEY (driver_id) REFERENCES users(id)
);

CREATE TABLE route_waypoints (
  id bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  created_at timestamptz NOT NULL DEFAULT now(),
  route_id bigint, address_id bigint, seq_order integer,
  status waypoint_status NOT NULL, entregue_em timestamptz,
  obs_falha text, version smallint DEFAULT 1
);

CREATE TABLE change_log (
  id bigint PRIMARY KEY DEFAULT nextval('change_log_id_seq'),
  created_at timestamptz DEFAULT now(), entity_type text NOT NULL,
  entity_id bigint NOT NULL, op text NOT NULL, version smallint, payload jsonb
);

CREATE TABLE mutations_applied (
  device_id text NOT NULL, mutation_id text NOT NULL,
  created_at timestamptz DEFAULT now(),
  PRIMARY KEY (device_id, mutation_id)
);

CREATE TABLE waypoint_delivery_photo (
  id bigint PRIMARY KEY DEFAULT nextval('waypoint_delivery_photo_id_seq'),
  route_id bigint NOT NULL, waypoint_id bigint NOT NULL, user_id bigint NOT NULL,
  bucket text NOT NULL DEFAULT 'delivery-photos', object_path text NOT NULL,
  file_name text NOT NULL, file_size_bytes bigint,
  created_at timestamptz NOT NULL DEFAULT now()
);

-- Indexes
CREATE INDEX idx_orders_import_id ON orders(import_id);
CREATE INDEX idx_orders_contact_phone ON orders(contact_phone);
CREATE INDEX idx_addresses_order_id ON addresses(order_id);
CREATE INDEX idx_addresses_zipcode ON addresses(zipcode);
CREATE INDEX idx_users_cliente ON users(id_cliente);
CREATE INDEX idx_users_whatsapp ON users(numero_whatsup);
CREATE INDEX idx_orders_import_user ON orders_import(user_id);
CREATE INDEX idx_orders_import_status ON orders_import(status);
CREATE INDEX idx_routes_driver ON routes(driver_id);
CREATE INDEX idx_routes_import ON routes(import_id);
CREATE INDEX idx_routes_status ON routes(status);
CREATE INDEX idx_routes_ativa ON routes(ativa);
CREATE INDEX idx_routes_driver_active ON routes(driver_id) WHERE ativa = true;
CREATE INDEX idx_waypoints_route ON route_waypoints(route_id);
CREATE INDEX idx_waypoints_address ON route_waypoints(address_id);
CREATE INDEX idx_waypoints_status ON route_waypoints(status);
CREATE INDEX idx_waypoints_seq ON route_waypoints(route_id, seq_order);
CREATE INDEX idx_change_log_entity ON change_log(entity_type, entity_id);
CREATE INDEX idx_change_log_created ON change_log(created_at);
CREATE INDEX idx_mutations_created ON mutations_applied(created_at);
CREATE INDEX idx_delivery_photo_route ON waypoint_delivery_photo(route_id);
CREATE INDEX idx_delivery_photo_waypoint ON waypoint_delivery_photo(waypoint_id);
CREATE INDEX idx_delivery_photo_user ON waypoint_delivery_photo(user_id);
CREATE INDEX idx_delivery_photo_created ON waypoint_delivery_photo(created_at);