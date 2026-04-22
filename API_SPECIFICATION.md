---
**Especificación de API - SILFAB STO**
**Preparado por:** Trinity
**Fecha:** 30 de enero de 2026
**Versión:** 1.0
**Destinatario:** Equipo de Desarrollo Backend
---

# API SPECIFICATION - SILFAB STO

## 1. RESUMEN EJECUTIVO

### Sobre este documento

Desde Trinity hemos desarrollado el frontend completo del sistema SILFAB STO, una aplicación web progresiva (PWA) para la gestión de servicios técnicos, solicitudes de garantía, compras de repuestos, novedades y capacitaciones para técnicos autorizados de SILFAB Argentina.

Este documento detalla todos los endpoints que nuestro frontend requiere del backend. 
---

### Nota sobre almacenamiento de imágenes

El cliente ha indicado que las imágenes se alojarán en un servidor separado del resto de la API. **La ubicación definitiva está pendiente de definición por parte del cliente.**

Por este motivo:
- No incluimos endpoints de carga/gestión de imágenes en esta especificación
- Los campos de imagen en las respuestas JSON contendrán URLs que serán provistas una vez definido el servidor de archivos
- En los ejemplos JSON de este documento, marcamos las URLs de imágenes como `[Pendiente - servidor de imágenes a definir]`

---

### Estadísticas de la API

| Métrica | Cantidad |
|---------|----------|
| **Total de endpoints** | 25 |
| **Endpoints de autenticación** | 1 |
| **Endpoints de productos** | 4 |
| **Endpoints de solicitudes** | 4 |
| **Endpoints de pedidos** | 2 |
| **Endpoints de novedades** | 6 |
| **Endpoints de capacitaciones** | 7 |
| **Endpoints pendientes (frontend)** | 1 |

### Módulos del Sistema

1. **Autenticación** - Login y gestión de sesiones
2. **Productos** - Catálogo de productos y repuestos
3. **Solicitudes de Garantía** - CRUD de solicitudes de servicio técnico
4. **Pedidos de Compra** - Sistema de compras de repuestos
5. **Novedades** - Publicaciones informativas para técnicos
6. **Capacitaciones** - Material de formación para técnicos

### Stack Tecnológico de Nuestro Frontend

| Tecnología | Versión |
|------------|---------|
| React | 19.1.2 |
| Vite | 7.1.0 |
| React Router DOM | 7.8.0 |
| Tailwind CSS | 4.1.11 |
| vite-plugin-pwa | 1.0.2 |

---

## 2. ÍNDICE DE ENDPOINTS

A continuación listamos todos los endpoints que consumimos desde nuestro frontend, organizados por módulo y con referencia al archivo y línea donde los implementamos.

### Nota sobre Base URLs

**La Base URL de producción será definida por el equipo de backend.**

Para el desarrollo del frontend, utilizamos un backend de pruebas interno con las siguientes URLs temporales:

| Archivo | Base URL (desarrollo) | Propósito |
|---------|----------------------|-----------|
| `AuthService.js` | `https://trinity.com.ar/silfab-api` | Autenticación (login) |
| `ApiService.js` | `https://trinity.com.ar/silfab-api/endpoints` | Todos los demás endpoints |

Estas URLs deberán ser reemplazadas por las URLs de producción que el equipo de backend nos provea.

### Tabla Completa de Endpoints

| # | Endpoint | Método | Función | Archivo | Línea |
|---|----------|--------|---------|---------|-------|
| | **AUTENTICACIÓN** | | | | |
| 1 | `/login` | POST | login() | AuthService.js | 16 |
| | **PRODUCTOS** | | | | |
| 2 | `/get_product.php` | GET | ProductAPI.getProductBySKU() | ApiService.js | 58 |
| 3 | `/get_parts.php` | GET | ProductAPI.getPartsBySKU() | ApiService.js | 64 |
| 4 | `/get_all_products.php` | GET | ProductAPI.getAllProducts() | ApiService.js | 81 |
| 5 | `/get_parts.php` | GET | ProductAPI.getPartsByProductId() | ApiService.js | 87 |
| | **SOLICITUDES / GARANTÍAS** | | | | |
| 6 | `/save_request.php` | POST | RequestAPI.createRequest() | ApiService.js | 170 |
| 7 | `/get_requests.php` | GET | RequestAPI.getRequests() | ApiService.js | 200 |
| 8 | `/update_request_status.php` | POST | RequestAPI.updateRequestStatus() | ApiService.js | 227 |
| 9 | `/download_file.php` | GET | RequestAPI.getDownloadUrl() | ApiService.js | 254 |
| | **PEDIDOS / ÓRDENES** | | | | |
| 10 | `/create_order.php` | POST | OrderAPI.createOrder() | ApiService.js | 264 |
| 11 | `/get_orders.php` | GET | OrderAPI.getOrders() | ApiService.js | 283 |
| | **NOVEDADES** | | | | |
| 12 | `/get_news_categories.php` | GET | NewsAPI.getCategories() | ApiService.js | 297 |
| 13 | `/save_news_category.php` | POST | NewsAPI.saveCategory() | ApiService.js | 302 |
| 14 | `/delete_news_category.php` | POST | NewsAPI.deleteCategory() | ApiService.js | 310 |
| 15 | `/get_news.php` | GET | NewsAPI.getNews() | ApiService.js | 330 |
| 16 | `/save_news.php` | POST | NewsAPI.saveNews() | ApiService.js | 392 |
| 17 | `/archive_news.php` | POST | NewsAPI.archiveNews() | ApiService.js | 418 |
| | **CAPACITACIONES** | | | | |
| 18 | `/get_training_categories.php` | GET | TrainingsAPI.getCategories() | ApiService.js | 449 |
| 19 | `/save_training_category.php` | POST | TrainingsAPI.saveCategory() | ApiService.js | 454 |
| 20 | `/delete_training_category.php` | POST | TrainingsAPI.deleteCategory() | ApiService.js | 462 |
| 21 | `/get_trainings.php` | GET | TrainingsAPI.getTrainings() | ApiService.js | 482 |
| 22 | `/save_training.php` | POST | TrainingsAPI.saveTraining() | ApiService.js | 546 |
| 23 | `/archive_training.php` | POST | TrainingsAPI.archiveTraining() | ApiService.js | 571 |
| | **HELPERS (generan URLs, no hacen fetch)** | | | | |
| 24 | - | - | NewsAPI.getImageUrl() | ApiService.js | 429 |
| 25 | - | - | TrainingsAPI.getImageUrl() | ApiService.js | 583 |

**Nota:** Los endpoints 4 y 5 usan el mismo archivo PHP (`/get_parts.php`) pero con diferentes parámetros: uno recibe `sku` y el otro `product_id`.

---

## 3. INFORMACIÓN GENERAL DE LA API

### 3.1 Convenciones que Esperamos

| Aspecto | Especificación |
|---------|----------------|
| **Base URL** | A definir por el equipo de backend |
| **Formato de Respuestas** | JSON |
| **Encoding** | UTF-8 |
| **Zona Horaria** | UTC (convertimos a America/Argentina/Buenos_Aires en el frontend) |

### 3.2 Autenticación

En nuestro frontend implementamos autenticación mediante Bearer Token (JWT).

**Header que enviamos:**
```
Authorization: Bearer {token}
```

**Configuración del token:**

| Parámetro | Valor |
|-----------|-------|
| Expiración del access token | A definir por backend |
| Algoritmo | A definir por backend |
| Payload mínimo requerido | `{ user_id, role, email, exp, iat }` |

**Nota importante:** En nuestro código actual enviamos el token tanto en el header `Authorization` como en el query parameter `?token=` debido a limitaciones del backend de pruebas. Para el backend definitivo, esperamos usar **únicamente** el header Authorization.

### 3.3 Códigos de Estado HTTP

Esperamos que el backend responda con estos códigos:

| Código | Cuándo lo esperamos |
|--------|---------------------|
| **200 OK** | Petición exitosa (GET, PUT, PATCH) |
| **201 Created** | Recurso creado exitosamente (POST) |
| **204 No Content** | Eliminación exitosa (DELETE) |
| **400 Bad Request** | Error de validación o formato incorrecto |
| **401 Unauthorized** | Token ausente, inválido o expirado |
| **403 Forbidden** | Permisos insuficientes para el recurso |
| **404 Not Found** | Recurso no encontrado |
| **422 Unprocessable Entity** | Datos válidos pero no procesables |
| **500 Internal Server Error** | Error interno del servidor |

### 3.4 Formato de Respuestas que Consumimos

**Respuesta exitosa:**
```json
{
  "success": true,
  "data": { ... },
  "message": "Operación exitosa"
}
```

**Respuesta exitosa con paginación:**
```json
{
  "success": true,
  "data": {
    "items": [ ... ],
    "pagination": {
      "current_page": 1,
      "per_page": 20,
      "total": 100,
      "total_pages": 5,
      "has_prev": false,
      "has_next": true
    }
  }
}
```

**Respuesta de error:**
```json
{
  "success": false,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Mensaje descriptivo del error",
    "details": {
      "campo": ["Mensaje de error específico"]
    }
  }
}
```

### 3.5 Códigos de Error que Manejamos

| Código | Descripción |
|--------|-------------|
| `VALIDATION_ERROR` | Error de validación de datos |
| `AUTHENTICATION_ERROR` | Error de autenticación |
| `AUTHORIZATION_ERROR` | Error de autorización/permisos |
| `NOT_FOUND` | Recurso no encontrado |
| `DUPLICATE_ENTRY` | Registro duplicado |
| `BUSINESS_RULE_ERROR` | Violación de regla de negocio |
| `FILE_UPLOAD_ERROR` | Error al subir archivo |
| `INTERNAL_ERROR` | Error interno del servidor |

---

## 4. ROLES Y PERMISOS

En nuestro sistema manejamos dos roles de usuario:

| Rol | Código | Descripción |
|-----|--------|-------------|
| **Administrador** | `admin` | Usuario administrativo de SILFAB |
| **Servicio Técnico** | `servicio_tecnico` | Técnico autorizado |

### Matriz de Permisos

Esta es la matriz de permisos que implementamos en el frontend:

| Recurso | admin | servicio_tecnico |
|---------|-------|------------------|
| Login | ✅ | ✅ |
| Ver productos | ✅ | ✅ |
| Crear solicitud | ✅ | ✅ |
| Ver solicitudes propias | ✅ | ✅ |
| Ver todas las solicitudes | ✅ | ❌ |
| Cambiar estado solicitud | ✅ | ❌ |
| Crear pedido | ✅ | ✅ |
| Ver pedidos propios | ✅ | ✅ |
| CRUD Novedades | ✅ | ❌ |
| Ver Novedades | ✅ | ✅ |
| CRUD Capacitaciones | ✅ | ❌ |
| Ver Capacitaciones | ✅ | ✅ |
| Gestión de categorías | ✅ | ❌ |

Esperamos que el backend valide estos permisos en cada endpoint.

---

## 5. ENDPOINTS DETALLADOS POR MÓDULO

---

## MÓDULO: AUTENTICACIÓN

---

### `POST /login`

**Descripción:** Endpoint que utilizamos para autenticar usuarios y obtener el token JWT.

**Autenticación:** No requerida

**Roles permitidos:** Público

**Headers que enviamos:**

| Header | Valor |
|--------|-------|
| Content-Type | `application/json` |

**Request Body que enviamos:**
```json
{
  "email": "usuario@ejemplo.com",
  "password": "contraseña123"
}
```

**Response que esperamos (200 - Éxito):**
```json
{
  "success": true,
  "data": {
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "user": {
      "id": 1,
      "name": "Juan Pérez",
      "email": "juan@ejemplo.com",
      "role": "servicio_tecnico"
    }
  }
}
```

**Response de error (401 - Credenciales inválidas):**
```json
{
  "success": false,
  "error": {
    "code": "AUTHENTICATION_ERROR",
    "message": "Credenciales inválidas"
  }
}
```

**Validaciones que esperamos:**
- email: formato válido, usuario existente y activo
- password: verificar contra hash almacenado

**Implementación frontend:** `src/services/AuthService.js` (línea 14-50)

---

## MÓDULO: PRODUCTOS

---

### `GET /get_product.php`

**Descripción:** Usamos este endpoint para obtener la información de un producto específico por su SKU.

**Autenticación:** Requerida

**Roles permitidos:** admin, servicio_tecnico

**Query Parameters que enviamos:**

| Parámetro | Tipo | Requerido | Ejemplo |
|-----------|------|-----------|---------|
| sku | string | Sí | "NM10", "N30" |

**Response que esperamos (200):**
```json
{
  "success": true,
  "product": {
    "id": 1,
    "sku": "NM10",
    "nombre": "NEBULIZADOR MESH miniMESH NM10",
    "imagen": "[Pendiente - servidor de imágenes a definir]",
    "warranty_days": 90,
    "descripcion": "Nebulizador portátil con tecnología mesh...",
    "categoria": "Nebulizadores"
  }
}
```

**Response de error (404):**
```json
{
  "success": false,
  "error": {
    "code": "NOT_FOUND",
    "message": "Producto no encontrado"
  }
}
```

**Implementación frontend:** `src/services/ApiService.js` (línea 56-59)

---

### `GET /get_all_products.php`

**Descripción:** Endpoint que consumimos para listar todos los productos con paginación y búsqueda.

**Autenticación:** Requerida

**Roles permitidos:** admin, servicio_tecnico

**Query Parameters que enviamos:**

| Parámetro | Tipo | Requerido | Default | Descripción |
|-----------|------|-----------|---------|-------------|
| page | integer | No | 1 | Número de página |
| limit | integer | No | 20 | Items por página (máx 100) |
| search | string | No | - | Término de búsqueda (nombre o SKU) |
| sort | string | No | nombre | Campo de ordenamiento |
| order | string | No | asc | Dirección (asc, desc) |

**Response que esperamos (200):**
```json
{
  "success": true,
  "data": {
    "products": [
      {
        "id": 1,
        "sku": "NM10",
        "nombre": "NEBULIZADOR MESH miniMESH NM10",
        "imagen": "[Pendiente - servidor de imágenes a definir]",
        "warranty_days": 90,
        "categoria": "Nebulizadores",
        "documentation_url": "[Pendiente - servidor de archivos a definir]",
        "images_url": "[Pendiente - servidor de imágenes a definir]"
      }
    ],
    "pagination": {
      "current_page": 1,
      "per_page": 20,
      "total_products": 45,
      "total_pages": 3,
      "has_prev": false,
      "has_next": true
    }
  }
}
```

**Implementación frontend:** `src/services/ApiService.js` (línea 72-82)

---

### `GET /get_parts.php`

**Descripción:** Usamos este endpoint para obtener los repuestos disponibles para un producto. Lo llamamos de dos formas: por SKU o por product_id.

**Autenticación:** Requerida

**Roles permitidos:** admin, servicio_tecnico

**Query Parameters que enviamos:**

| Parámetro | Tipo | Requerido | Descripción |
|-----------|------|-----------|-------------|
| product_id | integer | Sí* | ID numérico del producto |
| sku | string | Sí* | SKU del producto (alternativo) |

*Enviamos uno de los dos parámetros.

**Response que esperamos (200):**
```json
{
  "success": true,
  "data": {
    "product_id": 1,
    "product_name": "NEBULIZADOR MESH miniMESH NM10",
    "parts": [
      {
        "id": 101,
        "codigo": "A-NM2",
        "descripcion": "Accesorio - cabezal completo para nebulizadores mesh",
        "imagen": "[Pendiente - servidor de imágenes a definir]",
        "precio": 15000.00,
        "stock": 25,
        "max_cantidad": 5
      },
      {
        "id": 102,
        "codigo": "A-NM3",
        "descripcion": "Accesorio - Mascarilla adulto para nebulizadores mesh",
        "imagen": "[Pendiente - servidor de imágenes a definir]",
        "precio": 8500.00,
        "stock": 50,
        "max_cantidad": 10
      }
    ]
  }
}
```

**Campos de cada repuesto que utilizamos:**

| Campo | Tipo | Descripción |
|-------|------|-------------|
| id | integer | ID único del repuesto |
| codigo | string | Código de referencia |
| descripcion | string | Descripción completa |
| imagen | string/null | URL de imagen (servidor a definir) |
| precio | decimal | Precio unitario |
| stock | integer | Stock disponible |
| max_cantidad | integer | Máximo por orden |

**Implementación frontend:** `src/services/ApiService.js` (líneas 62-65 y 85-88)

---

## MÓDULO: SOLICITUDES DE GARANTÍA

---

### `POST /save_request.php`

**Descripción:** Endpoint que usamos para crear nuevas solicitudes de servicio técnico (garantía). Enviamos archivos adjuntos mediante FormData.

**Autenticación:** Requerida

**Roles permitidos:** admin, servicio_tecnico

**Headers que enviamos:**

| Header | Valor |
|--------|-------|
| Authorization | Bearer {token} |
| Content-Type | `multipart/form-data` (con archivos) o `application/json` (sin archivos) |

**Request Body (FormData) que enviamos:**

| Campo | Tipo | Requerido | Descripción |
|-------|------|-----------|-------------|
| user_name | string | Sí | Nombre del técnico |
| user_email | string | Sí | Email del técnico |
| product_sku | string | Sí | SKU del producto |
| product_name | string | Sí | Nombre del producto |
| serial_number | string | No | Número de serie del equipo |
| purchase_date | date | No | Fecha de compra (YYYY-MM-DD) |
| warranty_number | string | No | Número de garantía |
| fault_description | string | Sí | Descripción de la falla |
| request_type | string | Sí | "repuestos" o "envio" |
| selected_parts | JSON string | Condicional | Array de repuestos (si request_type = "repuestos") |
| factura | file | Condicional | PDF/imagen de factura (obligatorio si request_type = "envio") |
| garantia | file | Condicional | PDF/imagen de garantía (obligatorio si request_type = "envio") |
| imagenes | file | No | Imágenes del producto/falla |

**Formato de selected_parts que enviamos:**
```json
[
  {"codigo": "A-NM2", "descripcion": "Cabezal completo", "cantidad": 1},
  {"codigo": "A-NM3", "descripcion": "Mascarilla adulto", "cantidad": 2}
]
```

**Response que esperamos (201):**
```json
{
  "success": true,
  "data": {
    "id": 123,
    "status": "pendiente",
    "created_at": "2026-01-30T10:30:00Z",
    "message": "Solicitud creada exitosamente"
  }
}
```

**Response de error (400):**
```json
{
  "success": false,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Error de validación",
    "details": {
      "fault_description": ["La descripción de la falla es requerida"],
      "factura": ["La factura es obligatoria para solicitudes de envío"]
    }
  }
}
```

**Validaciones que esperamos:**
- fault_description: mínimo 10 caracteres
- request_type: debe ser "repuestos" o "envio"
- Si request_type = "envio": factura y garantia son obligatorios
- Si request_type = "repuestos": selected_parts debe tener al menos 1 item
- Archivos: máximo 10MB, tipos permitidos: PDF, JPG, PNG, WEBP

**Implementación frontend:** `src/services/ApiService.js` (línea 96-192)

---

### `GET /get_requests.php`

**Descripción:** Usamos este endpoint para obtener las solicitudes de garantía. Los técnicos solo ven las propias, los admins ven todas.

**Autenticación:** Requerida

**Roles permitidos:** admin, servicio_tecnico

**Query Parameters que enviamos:**

| Parámetro | Tipo | Requerido | Default |
|-----------|------|-----------|---------|
| limit | integer | No | 50 |
| page | integer | No | 1 |

**Response que esperamos (200):**
```json
{
  "success": true,
  "data": [
    {
      "id": 123,
      "user_id": 5,
      "user_name": "Juan Pérez",
      "user_email": "juan@ejemplo.com",
      "product_sku": "NM10",
      "product_name": "NEBULIZADOR MESH miniMESH NM10",
      "product_warranty_days": 90,
      "serial_number": "SN123456",
      "purchase_date": "2025-10-15",
      "warranty_number": "GAR-2025-001",
      "fault_description": "El equipo no enciende correctamente...",
      "request_type": "repuestos",
      "status": "pendiente",
      "selected_parts": [
        {"codigo": "A-NM2", "descripcion": "Cabezal completo", "cantidad": 1}
      ],
      "uploaded_files": {
        "factura": "[Ruta relativa - servidor a definir]",
        "garantia": "[Ruta relativa - servidor a definir]",
        "imagenes": "[Ruta relativa - servidor a definir]"
      },
      "created_at": "2026-01-30T10:30:00Z",
      "updated_at": "2026-01-30T10:30:00Z"
    }
  ]
}
```

**Comportamiento por rol que esperamos:**
- `servicio_tecnico`: Solo devuelve sus propias solicitudes (filtrado por user_id del token)
- `admin`: Devuelve todas las solicitudes del sistema

**Implementación frontend:** `src/services/ApiService.js` (línea 195-203)

---

### `POST /update_request_status.php`

**Descripción:** Endpoint que usamos para que los admins cambien el estado de una solicitud.

**Autenticación:** Requerida

**Roles permitidos:** admin

**Request Body que enviamos:**
```json
{
  "request_id": 123,
  "new_status": "aprobado",
  "comment": "Aprobado para envío de repuestos"
}
```

**Estados válidos (enum):**

| Valor | Descripción |
|-------|-------------|
| `pendiente` | Solicitud recibida, pendiente de revisión |
| `en_revision` | Solicitud siendo evaluada |
| `aprobado` | Solicitud aprobada |
| `rechazado` | Solicitud rechazada |
| `completado` | Proceso finalizado |

**Response que esperamos (200):**
```json
{
  "success": true,
  "data": {
    "id": 123,
    "status": "aprobado",
    "updated_at": "2026-01-30T15:00:00Z",
    "status_history": [
      {
        "status": "pendiente",
        "changed_at": "2026-01-30T10:30:00Z",
        "changed_by": null
      },
      {
        "status": "aprobado",
        "changed_at": "2026-01-30T15:00:00Z",
        "changed_by": "Admin Usuario",
        "comment": "Aprobado para envío de repuestos"
      }
    ]
  }
}
```

**Response de error (403):**
```json
{
  "success": false,
  "error": {
    "code": "AUTHORIZATION_ERROR",
    "message": "No tiene permisos para realizar esta acción"
  }
}
```

**Implementación frontend:** `src/services/ApiService.js` (línea 218-235)

---

### `GET /download_file.php`

**Descripción:** Endpoint que usamos para descargar archivos adjuntos de una solicitud.

**Autenticación:** Requerida

**Roles permitidos:** admin, servicio_tecnico (solo archivos propios)

**Query Parameters que enviamos:**

| Parámetro | Tipo | Requerido | Descripción |
|-----------|------|-----------|-------------|
| request_id | integer | Sí | ID de la solicitud |
| file_type | string | Sí | "factura", "garantia" o "imagenes" |

**Response que esperamos (200):**
- Content-Type: application/octet-stream (o tipo MIME específico)
- Content-Disposition: attachment; filename="factura_123.pdf"
- Body: Contenido binario del archivo

**Validaciones que esperamos:**
- Técnicos solo pueden descargar archivos de sus propias solicitudes
- Admins pueden descargar cualquier archivo

**Implementación frontend:** `src/services/ApiService.js` (línea 248-255)

---

## MÓDULO: PEDIDOS DE COMPRA

---

### `POST /create_order.php`

**Descripción:** Endpoint que usamos para crear pedidos de compra de repuestos desde el carrito.

**Autenticación:** Requerida

**Roles permitidos:** admin, servicio_tecnico

**Request Body que enviamos:**
```json
{
  "order_items": [
    {
      "part_id": 101,
      "cantidad": 2
    },
    {
      "part_id": 102,
      "cantidad": 1
    }
  ],
  "shipping_address": "Av. Corrientes 1234, CABA",
  "notes": "Urgente"
}
```

**Response que esperamos (201):**
```json
{
  "success": true,
  "data": {
    "id": 456,
    "order_number": "ORD-2026-00456",
    "status": "pendiente",
    "total_items": 3,
    "total_amount": 45500.00,
    "created_at": "2026-01-30T12:00:00Z"
  }
}
```

**Response de error (422 - Stock insuficiente):**
```json
{
  "success": false,
  "error": {
    "code": "BUSINESS_RULE_ERROR",
    "message": "Stock insuficiente",
    "details": {
      "part_id": 101,
      "requested": 10,
      "available": 5
    }
  }
}
```

**Validaciones que esperamos:**
- order_items: al menos 1 item
- cantidad: mayor a 0, menor o igual a max_cantidad del repuesto
- Verificar stock disponible antes de crear

**Implementación frontend:** `src/services/ApiService.js` (línea 263-268)

---

### `GET /get_orders.php`

**Descripción:** Endpoint que consumimos para listar los pedidos de compra.

**Autenticación:** Requerida

**Roles permitidos:** admin, servicio_tecnico

**Query Parameters que enviamos:**

| Parámetro | Tipo | Requerido | Default | Descripción |
|-----------|------|-----------|---------|-------------|
| page | integer | No | 1 | Número de página |
| limit | integer | No | 20 | Items por página |
| status | string | No | - | Filtrar por estado |
| date_from | date | No | - | Fecha desde (YYYY-MM-DD) |
| date_to | date | No | - | Fecha hasta (YYYY-MM-DD) |
| order_id | string | No | - | Buscar por número de orden |
| sort | string | No | created_at | Campo de orden |
| order | string | No | desc | Dirección |

**Estados de pedido (enum):**

| Valor | Descripción |
|-------|-------------|
| `pendiente` | Pedido recibido |
| `procesando` | En preparación |
| `enviado` | Despachado |
| `completado` | Entregado |
| `cancelado` | Cancelado |

**Response que esperamos (200):**
```json
{
  "success": true,
  "data": {
    "orders": [
      {
        "id": 456,
        "order_number": "ORD-2026-00456",
        "status": "procesando",
        "total_items": 3,
        "total_amount": 45500.00,
        "shipping_address": "Av. Corrientes 1234, CABA",
        "notes": "Urgente",
        "order_items": [
          {
            "part_id": 101,
            "codigo": "A-NM2",
            "descripcion": "Cabezal completo",
            "cantidad": 2,
            "precio_unitario": 15000.00,
            "subtotal": 30000.00
          }
        ],
        "created_at": "2026-01-30T12:00:00Z",
        "updated_at": "2026-01-30T14:00:00Z"
      }
    ],
    "pagination": {
      "current_page": 1,
      "per_page": 20,
      "total": 15,
      "total_pages": 1,
      "has_prev": false,
      "has_next": false
    }
  }
}
```

**Comportamiento por rol que esperamos:**
- `servicio_tecnico`: Solo devuelve sus propios pedidos
- `admin`: Devuelve todos los pedidos

**Implementación frontend:** `src/services/ApiService.js` (línea 271-284)

---

## MÓDULO: NOVEDADES

---

### `GET /get_news_categories.php`

**Descripción:** Endpoint que usamos para obtener las categorías de novedades.

**Autenticación:** Requerida

**Roles permitidos:** admin, servicio_tecnico

**Response que esperamos (200):**
```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "name": "Promociones",
      "created_at": "2026-01-15T10:00:00Z"
    },
    {
      "id": 2,
      "name": "Actualizaciones",
      "created_at": "2026-01-16T11:00:00Z"
    }
  ]
}
```

**Implementación frontend:** `src/services/ApiService.js` (línea 296-298)

---

### `POST /save_news_category.php`

**Descripción:** Endpoint que usamos para crear o editar categorías de novedades.

**Autenticación:** Requerida

**Roles permitidos:** admin

**Request Body que enviamos:**
```json
{
  "id": 1,
  "name": "Promociones Especiales"
}
```

*Si no enviamos `id`, creamos una nueva categoría.*

**Response que esperamos (200/201):**
```json
{
  "success": true,
  "data": {
    "id": 1,
    "name": "Promociones Especiales",
    "created_at": "2026-01-15T10:00:00Z"
  }
}
```

**Validaciones que esperamos:**
- name: mínimo 2 caracteres, máximo 100, único

**Implementación frontend:** `src/services/ApiService.js` (línea 301-306)

---

### `POST /delete_news_category.php`

**Descripción:** Endpoint que usamos para eliminar una categoría de novedades.

**Autenticación:** Requerida

**Roles permitidos:** admin

**Request Body que enviamos:**
```json
{
  "id": 1
}
```

**Response que esperamos (200):**
```json
{
  "success": true,
  "affected_news": 5,
  "message": "Categoría eliminada. 5 novedades quedaron sin categoría."
}
```

**Comportamiento que esperamos:**
- Las novedades asociadas quedan con category_id = NULL
- Preferimos soft-delete si es posible

**Implementación frontend:** `src/services/ApiService.js` (línea 309-314)

---

### `GET /get_news.php`

**Descripción:** Endpoint que consumimos para listar novedades.

**Autenticación:** Requerida

**Roles permitidos:** admin, servicio_tecnico

**Query Parameters que enviamos:**

| Parámetro | Tipo | Requerido | Default | Descripción |
|-----------|------|-----------|---------|-------------|
| archived | boolean | No | 0 | 1 para ver archivadas |
| category_id | integer | No | - | Filtrar por categoría |
| limit | integer | No | 50 | Items por página |
| offset | integer | No | 0 | Offset para paginación |

**Response que esperamos (200):**
```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "title": "Nuevo catálogo de productos 2026",
      "content": "Descarga nuestro nuevo catálogo actualizado...",
      "category_id": 1,
      "category_name": "Actualizaciones",
      "featured": 1,
      "image_url": "[Pendiente - servidor de imágenes a definir]",
      "link_url": "https://ejemplo.com/catalogo",
      "archived": 0,
      "created_at": "2026-01-25T09:00:00Z",
      "updated_at": "2026-01-25T09:00:00Z"
    }
  ]
}
```

**Campos importantes que utilizamos:**

| Campo | Tipo | Descripción |
|-------|------|-------------|
| featured | integer | 1 = destacada, 0 = normal |
| archived | integer | 1 = archivada, 0 = activa |
| image_url | string/null | Ruta relativa de la imagen (servidor a definir) |
| link_url | string/null | URL externa (imagen clickeable) |

**Implementación frontend:** `src/services/ApiService.js` (línea 321-333)

---

### `POST /save_news.php`

**Descripción:** Endpoint que usamos para crear o editar novedades. Enviamos imagen mediante FormData.

**Autenticación:** Requerida

**Roles permitidos:** admin

**Request Body (FormData) que enviamos:**

| Campo | Tipo | Requerido | Descripción |
|-------|------|-----------|-------------|
| id | integer | No | Si enviamos, actualizamos |
| title | string | Sí | Título (máx 255 caracteres) |
| content | string | Sí | Contenido/descripción |
| category_id | integer | No | ID de categoría |
| featured | string | No | "1" o "0" |
| link_url | string | No | URL externa |
| image | file | No | Imagen (JPG, PNG, WEBP, máx 5MB) |
| keep_current_image | string | No | "1" para mantener imagen actual |

**Response que esperamos (200/201):**
```json
{
  "success": true,
  "data": {
    "id": 10,
    "title": "Nueva Novedad",
    "image_url": "[Ruta relativa - servidor a definir]",
    "created_at": "2026-01-30T10:00:00Z"
  }
}
```

**Validaciones que esperamos:**
- title: requerido, máximo 255 caracteres
- content: requerido
- image: tipos permitidos image/jpeg, image/png, image/webp; máximo 5MB

**Implementación frontend:** `src/services/ApiService.js` (línea 336-414)

---

### `POST /archive_news.php`

**Descripción:** Endpoint que usamos para archivar o restaurar una novedad (toggle).

**Autenticación:** Requerida

**Roles permitidos:** admin

**Request Body que enviamos:**
```json
{
  "id": 1
}
```

**Response que esperamos (200):**
```json
{
  "success": true,
  "data": {
    "id": 1,
    "archived": 1,
    "message": "Novedad archivada exitosamente"
  }
}
```

**Comportamiento que esperamos:**
- Si archived = 0, cambia a 1 (archivar)
- Si archived = 1, cambia a 0 (restaurar)
- Soft-delete: no elimina físicamente

**Implementación frontend:** `src/services/ApiService.js` (línea 417-422)

---

## MÓDULO: CAPACITACIONES

---

### `GET /get_training_categories.php`

**Descripción:** Endpoint que usamos para obtener las categorías de capacitaciones.

**Autenticación:** Requerida

**Roles permitidos:** admin, servicio_tecnico

**Response que esperamos (200):**
```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "name": "Videos Técnicos",
      "created_at": "2026-01-10T10:00:00Z"
    },
    {
      "id": 2,
      "name": "Manuales",
      "created_at": "2026-01-11T11:00:00Z"
    }
  ]
}
```

**Implementación frontend:** `src/services/ApiService.js` (línea 448-450)

---

### `POST /save_training_category.php`

**Descripción:** Endpoint que usamos para crear o editar categorías de capacitaciones.

**Autenticación:** Requerida

**Roles permitidos:** admin

**Request Body que enviamos:**
```json
{
  "id": 1,
  "name": "Videos Técnicos Avanzados"
}
```

**Response que esperamos (200/201):**
```json
{
  "success": true,
  "data": {
    "id": 1,
    "name": "Videos Técnicos Avanzados",
    "created_at": "2026-01-10T10:00:00Z"
  }
}
```

**Implementación frontend:** `src/services/ApiService.js` (línea 453-458)

---

### `POST /delete_training_category.php`

**Descripción:** Endpoint que usamos para eliminar una categoría de capacitaciones.

**Autenticación:** Requerida

**Roles permitidos:** admin

**Request Body que enviamos:**
```json
{
  "id": 1
}
```

**Response que esperamos (200):**
```json
{
  "success": true,
  "affected_trainings": 3,
  "message": "Categoría eliminada"
}
```

**Implementación frontend:** `src/services/ApiService.js` (línea 461-466)

---

### `GET /get_trainings.php`

**Descripción:** Endpoint que consumimos para listar capacitaciones.

**Autenticación:** Requerida

**Roles permitidos:** admin, servicio_tecnico

**Query Parameters que enviamos:**

| Parámetro | Tipo | Requerido | Default | Descripción |
|-----------|------|-----------|---------|-------------|
| archived | boolean | No | 0 | 1 para ver archivadas |
| category_id | integer | No | - | Filtrar por categoría |
| limit | integer | No | 50 | Items por página |
| offset | integer | No | 0 | Offset para paginación |

**Response que esperamos (200):**
```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "title": "Mantenimiento de nebulizadores mesh",
      "content": "En este video aprenderás los pasos para...",
      "category_id": 1,
      "category_name": "Videos Técnicos",
      "featured": 1,
      "image_url": "[Pendiente - servidor de imágenes a definir]",
      "button_text": "Ver Video",
      "button_url": "https://youtube.com/watch?v=xxxxx",
      "archived": 0,
      "created_at": "2026-01-20T09:00:00Z",
      "updated_at": "2026-01-20T09:00:00Z"
    }
  ]
}
```

**Diferencias con Novedades:**

| Campo | Descripción |
|-------|-------------|
| button_text | Texto del botón de acción |
| button_url | URL del recurso externo |

**Implementación frontend:** `src/services/ApiService.js` (línea 473-485)

---

### `POST /save_training.php`

**Descripción:** Endpoint que usamos para crear o editar capacitaciones. Enviamos imagen mediante FormData.

**Autenticación:** Requerida

**Roles permitidos:** admin

**Request Body (FormData) que enviamos:**

| Campo | Tipo | Requerido | Descripción |
|-------|------|-----------|-------------|
| id | integer | No | Si enviamos, actualizamos |
| title | string | Sí | Título (máx 255 caracteres) |
| content | string | Sí | Descripción |
| category_id | integer | No | ID de categoría |
| featured | string | No | "1" o "0" |
| button_text | string | No | Texto del botón (máx 100) |
| button_url | string | No | URL del recurso |
| image | file | No | Imagen (JPG, PNG, WEBP, máx 5MB) |
| keep_current_image | string | No | "1" para mantener imagen actual |

**Response que esperamos (200/201):**
```json
{
  "success": true,
  "data": {
    "id": 5,
    "title": "Nueva Capacitación",
    "image_url": "[Ruta relativa - servidor a definir]",
    "created_at": "2026-01-30T10:00:00Z"
  }
}
```

**Implementación frontend:** `src/services/ApiService.js` (línea 488-568)

---

### `POST /archive_training.php`

**Descripción:** Endpoint que usamos para archivar o restaurar una capacitación (toggle).

**Autenticación:** Requerida

**Roles permitidos:** admin

**Request Body que enviamos:**
```json
{
  "id": 1
}
```

**Response que esperamos (200):**
```json
{
  "success": true,
  "data": {
    "id": 1,
    "archived": 1,
    "message": "Capacitación archivada exitosamente"
  }
}
```

**Implementación frontend:** `src/services/ApiService.js` (línea 571-576)

---

## 6. ARCHIVOS Y UPLOADS

### Nota sobre almacenamiento de archivos

El almacenamiento de archivos (imágenes, PDFs, documentos) está pendiente de definición por parte del cliente. La infraestructura de almacenamiento será determinada por el equipo de backend en coordinación con el cliente.

### Configuración que Manejamos en Frontend

| Parámetro | Valor |
|-----------|-------|
| **Tamaño máximo por archivo** | 10 MB (solicitudes), 5 MB (imágenes) |

### Tipos MIME que Aceptamos

| Contexto | Tipos Permitidos |
|----------|------------------|
| **Imágenes** | image/jpeg, image/jpg, image/png, image/webp |
| **Documentos** | application/pdf, image/jpeg, image/png |

### Construcción de URLs de Imágenes

En nuestro frontend, construimos la URL completa de imágenes concatenando:
- Base URL del servidor de imágenes (a definir)
- Ruta relativa almacenada en la BD

Ejemplo de lo que esperamos:
```
Base URL: [A definir por el cliente]
Ruta almacenada: uploads/news/imagen.jpg
URL completa: [Base URL]/uploads/news/imagen.jpg
```

---

## 7. CONSIDERACIONES TÉCNICAS

### Índices de BD que Necesitamos

| Tabla | Campo(s) | Tipo de Índice |
|-------|----------|----------------|
| users | email | UNIQUE |
| users | role | INDEX |
| products | sku | UNIQUE |
| products | nombre | FULLTEXT |
| requests | user_id | INDEX |
| requests | status | INDEX |
| requests | created_at | INDEX |
| orders | user_id | INDEX |
| orders | order_number | UNIQUE |
| orders | status | INDEX |
| news | archived | INDEX |
| news | featured | INDEX |
| trainings | archived | INDEX |

### Datos Sensibles

| Dato | Tratamiento Esperado |
|------|----------------------|
| Contraseñas | Hash bcrypt |
| Tokens JWT | No almacenar en BD si es posible |
| Archivos de usuarios | Validar permisos antes de servir |

---

## 8. ANEXOS

### 8.1 Estructura de Entidades

```
┌─────────────┐     ┌─────────────┐     ┌─────────────┐
│   users     │     │  products   │     │   parts     │
├─────────────┤     ├─────────────┤     ├─────────────┤
│ id          │     │ id          │     │ id          │
│ name        │     │ sku (unique)│     │ product_id  │──┐
│ email       │     │ nombre      │     │ codigo      │  │
│ password    │     │ imagen      │     │ descripcion │  │
│ role        │     │ warranty    │     │ precio      │  │
│ created_at  │     │ doc_url     │     │ stock       │  │
└─────────────┘     │ images_url  │     │ max_cantidad│  │
       │            └─────────────┘     └─────────────┘  │
       │                   │                             │
       │                   └─────────────────────────────┘
       │
       ▼
┌─────────────────┐     ┌─────────────────┐
│    requests     │     │     orders      │
├─────────────────┤     ├─────────────────┤
│ id              │     │ id              │
│ user_id      ───┼──┐  │ user_id      ───┼──┐
│ product_sku     │  │  │ order_number    │  │
│ product_name    │  │  │ status          │  │
│ serial_number   │  │  │ total_amount    │  │
│ request_type    │  │  │ shipping_addr   │  │
│ fault_desc      │  │  │ notes           │  │
│ status          │  │  │ created_at      │  │
│ selected_parts  │  │  └─────────────────┘  │
│ uploaded_files  │  │         │             │
│ created_at      │  │         ▼             │
└─────────────────┘  │  ┌─────────────────┐  │
                     │  │   order_items   │  │
                     │  ├─────────────────┤  │
                     │  │ id              │  │
                     │  │ order_id        │  │
                     │  │ part_id         │  │
                     │  │ cantidad        │  │
                     │  │ precio_unitario │  │
                     │  │ subtotal        │  │
                     │  └─────────────────┘  │
                     │                       │
                     └───────────────────────┘
```

### 8.2 Enums y Valores Fijos

**user.role:**
```
admin | servicio_tecnico
```

**request.request_type:**
```
repuestos | envio
```

**request.status:**
```
pendiente | en_revision | aprobado | rechazado | completado
```

**order.status:**
```
pendiente | procesando | enviado | completado | cancelado
```

**news.featured / trainings.featured:**
```
0 = Normal | 1 = Destacado
```

**news.archived / trainings.archived:**
```
0 = Activo | 1 = Archivado
```

### 8.3 Backend de Desarrollo

Para el desarrollo del frontend, utilizamos un backend de pruebas interno en `trinity.com.ar/silfab-api`. **Los endpoints de producción serán provistos por el equipo de backend.**

**Nota sobre autenticación en desarrollo:** Nuestro backend de pruebas tiene limitaciones para recibir el header `Authorization`, por lo que temporalmente también enviamos el token como query parameter (`?token=xxx`). Para el backend definitivo esperamos usar únicamente el header Authorization estándar.

---

## 9. RESUMEN DE PRIORIDADES

| Prioridad | Endpoints | Descripción |
|-----------|-----------|-------------|
| **Alta** | /login, /get_product.php, /get_all_products.php, /get_parts.php, /save_request.php, /get_requests.php, /update_request_status.php, /create_order.php, /get_orders.php, /get_news.php, /save_news.php, /get_trainings.php, /save_training.php | Críticos para MVP |
| **Media** | /download_file.php, /get_news_categories.php, /save_news_category.php, /archive_news.php, /get_training_categories.php, /save_training_category.php, /archive_training.php | Importantes pero no bloqueantes |
| **Baja** | /delete_news_category.php, /delete_training_category.php | Pueden implementarse después |

---

## 10. CONTACTO

Para cualquier consulta técnica sobre esta especificación, pueden contactarnos:

**Trinity**
Equipo de Desarrollo Frontend

---

*Documento preparado por Trinity*
*Versión 1.0 - 30 de enero de 2026*
