BEGIN;

-- ============================================
-- 1) USUARIOS
-- ============================================
INSERT INTO users (id, username, email, password_hash, first_name, last_name, is_active, created_at)
VALUES
  ('550e8400-e29b-41d4-a716-446655440001', 'admin_user',   'admin@example.com',   '$2b$10$EXAMPLEHASHADMIN................', 'Carlos', 'Administrador', true, now()),
  ('550e8400-e29b-41d4-a716-446655440002', 'editor_juan',  'juan@example.com',    '$2b$10$EXAMPLEHASHEDITOR1.............', 'Juan',   'Editor',        true, now()),
  ('550e8400-e29b-41d4-a716-446655440003', 'editor_maria', 'maria@example.com',   '$2b$10$EXAMPLEHASHEDITOR2.............', 'María',  'Editor',        true, now()),
  ('550e8400-e29b-41d4-a716-446655440004', 'viewer_luis',  'luis@example.com',    '$2b$10$EXAMPLEHASHVIEWER.............', 'Luis',   'Viewer',        true, now());

-- ============================================
-- 2) ROLES
-- ============================================
INSERT INTO roles (id, name, description, created_at)
VALUES
  ('660e8400-e29b-41d4-a716-446655440001', 'ADMIN',  'Rol administrador con acceso amplio', now()),
  ('660e8400-e29b-41d4-a716-446655440002', 'EDITOR', 'Rol editor con permisos operativos', now()),
  ('660e8400-e29b-41d4-a716-446655440003', 'VIEWER', 'Rol lector', now());

-- ============================================
-- 3) ASIGNAR ROLES A USUARIOS (user_roles)
-- ============================================
INSERT INTO user_roles (id, user_id, role_id, assigned_at, assigned_by)
VALUES
  (gen_random_uuid(), '550e8400-e29b-41d4-a716-446655440001', '660e8400-e29b-41d4-a716-446655440001', now(), NULL), -- admin_user -> ADMIN
  (gen_random_uuid(), '550e8400-e29b-41d4-a716-446655440002', '660e8400-e29b-41d4-a716-446655440002', now(), '550e8400-e29b-41d4-a716-446655440001'), -- editor_juan -> EDITOR
  (gen_random_uuid(), '550e8400-e29b-41d4-a716-446655440003', '660e8400-e29b-41d4-a716-446655440002', now(), '550e8400-e29b-41d4-a716-446655440001'), -- editor_maria -> EDITOR
  (gen_random_uuid(), '550e8400-e29b-41d4-a716-446655440004', '660e8400-e29b-41d4-a716-446655440003', now(), '550e8400-e29b-41d4-a716-446655440001'); -- viewer_luis -> VIEWER

-- ============================================
-- 4) MÓDULOS (modules) - productos y clientes (con submódulos)
-- ============================================
INSERT INTO modules (id, key, name, parent_module_id, order_index, is_active, route, created_at)
VALUES
  ('770e8400-e29b-41d4-a716-446655441001', 'productos',            'Productos',  NULL, 1, true, '/productos', now()),
  ('770e8400-e29b-41d4-a716-446655441002', 'productos.items',      'Items',      '770e8400-e29b-41d4-a716-446655441001', 1, true, '/productos/items', now()),
  ('770e8400-e29b-41d4-a716-446655441010', 'clientes',             'Clientes',   NULL, 2, true, '/clientes', now()),
  ('770e8400-e29b-41d4-a716-446655441011', 'clientes.records',     'Registros',  '770e8400-e29b-41d4-a716-446655441010', 1, true, '/clientes/records', now());

-- ============================================
-- 5) OPCIONES (options) - acciones por módulo
-- ============================================
-- Opciones para productos.items
INSERT INTO options (id, module_id, key, name, description, created_at)
VALUES
  ('880e8400-e29b-41d4-a716-446655441001','770e8400-e29b-41d4-a716-446655441002','create',      'Crear producto',      'Crear nuevo producto', now()),
  ('880e8400-e29b-41d4-a716-446655441002','770e8400-e29b-41d4-a716-446655441002','read',        'Ver producto',        'Ver detalles del producto', now()),
  ('880e8400-e29b-41d4-a716-446655441003','770e8400-e29b-41d4-a716-446655441002','update',      'Actualizar producto', 'Modificar datos del producto', now()),
  ('880e8400-e29b-41d4-a716-446655441004','770e8400-e29b-41d4-a716-446655441002','delete',      'Eliminar producto',   'Eliminar producto', now()),
  ('880e8400-e29b-41d4-a716-446655441005','770e8400-e29b-41d4-a716-446655441002','export_excel', 'Exportar Excel',      'Exportar listado a Excel', now()),
  ('880e8400-e29b-41d4-a716-446655441006','770e8400-e29b-41d4-a716-446655441002','view_movements','Ver movimientos',   'Ver movimientos de inventario', now()),
  ('880e8400-e29b-41d4-a716-446655441007','770e8400-e29b-41d4-a716-446655441002','add_variant',  'Agregar variante',    'Agregar variante al producto', now());

-- Opciones para clientes.records
INSERT INTO options (id, module_id, key, name, description, created_at)
VALUES
  ('880e8400-e29b-41d4-a716-446655441101','770e8400-e29b-41d4-a716-446655441011','create',      'Crear cliente',      'Crear nuevo cliente', now()),
  ('880e8400-e29b-41d4-a716-446655441102','770e8400-e29b-41d4-a716-446655441011','read',        'Ver cliente',        'Ver datos del cliente', now()),
  ('880e8400-e29b-41d4-a716-446655441103','770e8400-e29b-41d4-a716-446655441011','update',      'Actualizar cliente', 'Modificar cliente', now()),
  ('880e8400-e29b-41d4-a716-446655441104','770e8400-e29b-41d4-a716-446655441011','delete',      'Eliminar cliente',   'Eliminar cliente', now()),
  ('880e8400-e29b-41d4-a716-446655441105','770e8400-e29b-41d4-a716-446655441011','add_contact', 'Agregar contacto',   'Agregar contacto al cliente', now()),
  ('880e8400-e29b-41d4-a716-446655441106','770e8400-e29b-41d4-a716-446655441011','view_history','Ver historial',      'Ver historial de interacciones', now()),
  ('880e8400-e29b-41d4-a716-446655441107','770e8400-e29b-41d4-a716-446655441011','export_excel','Exportar Excel',    'Exportar clientes a Excel', now());

-- ============================================
-- 6) PERMISOS DE ROLES (role_permissions)
-- ============================================
-- ADMIN: permiso completo sobre módulos "productos" y "clientes" (module-level, allow_children = true)
INSERT INTO role_permissions (id, role_id, module_id, option_id, allow_children, granted, created_at)
VALUES
  (gen_random_uuid(), '660e8400-e29b-41d4-a716-446655440001', '770e8400-e29b-41d4-a716-446655441001', NULL, true,  true, now()), -- ADMIN -> productos (todo)
  (gen_random_uuid(), '660e8400-e29b-41d4-a716-446655440001', '770e8400-e29b-41d4-a716-446655441010', NULL, true,  true, now()); -- ADMIN -> clientes (todo)

-- EDITOR: permisos finos por opción en productos (crea/lee/actualiza, ve movimientos, agrega variantes), pero no export Excel ni delete (ejemplo con DENY)
INSERT INTO role_permissions (id, role_id, module_id, option_id, allow_children, granted, created_at)
VALUES
  (gen_random_uuid(), '660e8400-e29b-41d4-a716-446655440002', '770e8400-e29b-41d4-a716-446655441002', '880e8400-e29b-41d4-a716-446655441001', false, true, now()), -- create product
  (gen_random_uuid(), '660e8400-e29b-41d4-a716-446655441002', '770e8400-e29b-41d4-a716-446655441002', '880e8400-e29b-41d4-a716-446655441002', false, true, now()), -- read product
  (gen_random_uuid(), '660e8400-e29b-41d4-a716-446655440002', '770e8400-e29b-41d4-a716-446655441002', '880e8400-e29b-41d4-a716-446655441003', false, true, now()), -- update product
  (gen_random_uuid(), '660e8400-e29b-41d4-a716-446655440002', '770e8400-e29b-41d4-a716-446655441002', '880e8400-e29b-41d4-a716-446655441006', false, true, now()), -- view movements
  (gen_random_uuid(), '660e8400-e29b-41d4-a716-446655440002', '770e8400-e29b-41d4-a716-446655441002', '880e8400-e29b-41d4-a716-446655441007', false, true, now()), -- add variant

-- Deny explicit (editor cannot export or delete products)
INSERT INTO role_permissions (id, role_id, module_id, option_id, allow_children, granted, created_at)
VALUES
  (gen_random_uuid(), '660e8400-e29b-41d4-a716-446655440002', '770e8400-e29b-41d4-a716-446655441002', '880e8400-e29b-41d4-a716-446655441005', false, false, now()), -- deny export_excel
  (gen_random_uuid(), '660e8400-e29b-41d4-a716-446655440002', '770e8400-e29b-41d4-a716-446655441002', '880e8400-e29b-41d4-a716-446655441004', false, false, now()); -- deny delete

-- EDITOR: permisos para clientes (create, read, add_contact, view_history) example
INSERT INTO role_permissions (id, role_id, module_id, option_id, allow_children, granted, created_at)
VALUES
  (gen_random_uuid(), '660e8400-e29b-41d4-a716-446655440002', '770e8400-e29b-41d4-a716-446655441011', '880e8400-e29b-41d4-a716-446655441101', false, true, now()), -- create cliente
  (gen_random_uuid(), '660e8400-e29b-41d4-a716-446655440002', '770e8400-e29b-41d4-a716-446655441011', '880e8400-e29b-41d4-a716-446655441102', false, true, now()), -- read cliente
  (gen_random_uuid(), '660e8400-e29b-41d4-a716-446655440002', '770e8400-e29b-41d4-a716-446655441011', '880e8400-e29b-41d4-a716-446655441105', false, true, now()), -- add_contact
  (gen_random_uuid(), '660e8400-e29b-41d4-a716-446655440002', '770e8400-e29b-41d4-a716-446655441011', '880e8400-e29b-41d4-a716-446655441106', false, true, now()); -- view_history

-- VIEWER role: example read-only on products and clients (no exports)
INSERT INTO role_permissions (id, role_id, module_id, option_id, allow_children, granted, created_at)
VALUES
  (gen_random_uuid(), '660e8400-e29b-41d4-a716-446655440003', '770e8400-e29b-41d4-a716-446655441002', '880e8400-e29b-41d4-a716-446655441002', false, true, now()), -- reader product
  (gen_random_uuid(), '660e8400-e29b-41d4-a716-446655440003', '770e8400-e29b-41d4-a716-446655441011', '880e8400-e29b-41d4-a716-446655441102', false, true, now()), -- reader cliente
  (gen_random_uuid(), '660e8400-e29b-41d4-a716-446655440003', '770e8400-e29b-41d4-a716-446655441011', '880e8400-e29b-41d4-a716-446655441107', false, false, now()); -- deny export clientes

-- ============================================
-- 7) AUDIT LOGS - ejemplos de acciones administrativas
-- ============================================
INSERT INTO audit_logs (id, user_id, action, entity_type, entity_id, new_values, ip_address, user_agent, created_at)
VALUES
  (gen_random_uuid(), '550e8400-e29b-41d4-a716-446655440001', 'CREATE_MODULE', 'modules', '770e8400-e29b-41d4-a716-446655441001', '{"key":"productos","name":"Productos"}'::jsonb, '10.0.0.1', 'admin-ui/1.0', now()),
  (gen_random_uuid(), '550e8400-e29b-41d4-a716-446655440001', 'ASSIGN_PERMISSION', 'role_permissions', NULL, '{"role":"ADMIN","module":"productos","granted":true}'::jsonb, '10.0.0.1', 'admin-ui/1.0', now());

COMMIT;