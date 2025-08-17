# AR Education Platform Backend

## 🎯 Arquitectura Modular

Backend modular para plataforma de educación con realidad aumentada. Permite a profesores crear, gestionar y compartir clases interactivas con **arquitectura completamente modular** usando:

- **🗄️ Google Drive** - Almacenamiento de archivos y assets
- **🐘 PostgreSQL (Neon)** - Base de datos principal 
- **🔐 Better Auth** - Sistema de autenticación moderno

### 📊 Flujo Principal

```
Usuario autenticado → Better Auth → API Modular → Google Drive + PostgreSQL
                                        ↓
                                Estructura organizada
                                        ↓
                              Unity Export Optimizado
```

## 🏗️ Nueva Arquitectura Modular

### Estructura de Directorios

```
src/
├── config/          # Configuraciones centralizadas
│   ├── database.js  # PostgreSQL (Neon) connection
│   ├── auth.js      # Better Auth configuration
│   └── drive.js     # Google Drive setup
├── middleware/      # Middleware reutilizable
│   ├── auth.js      # Autenticación y autorización
│   ├── validation.js # Validación de datos
│   └── errorHandler.js # Manejo de errores
├── routes/          # Rutas modulares
│   ├── auth.js      # Rutas de autenticación
│   ├── projects.js  # Gestión de proyectos
│   ├── unity.js     # Export para Unity
│   └── files.js     # Gestión de archivos
├── services/        # Lógica de negocio
│   ├── driveService.js    # Google Drive operations
│   ├── projectService.js  # Gestión de proyectos
│   └── unityService.js    # Unity export logic
├── models/          # Modelos de datos (futuro)
├── app.js           # Configuración de la aplicación
└── server.js        # Punto de entrada
```

## 🔐 Sistema de Autenticación (Better Auth)

### Características

- ✅ **Email/Password** - Registro y login tradicional
- ✅ **OAuth Social** - Google, GitLab
- ✅ **Sesiones seguras** - JWT con expiración automática
- ✅ **Roles de usuario** - Admin, Teacher, Student
- ✅ **Middleware protegido** - Rutas automáticamente protegidas

### Configuración

```typescript
// src/config/auth.js
betterAuth({
  database: PostgreSQL_Pool,
  emailAndPassword: { enabled: true },
  socialProviders: {
    google: { ... },
    gitlab: { ... }
  },
  session: { expiresIn: 7 * 24 * 60 * 60 }, // 7 días
  user: {
    additionalFields: {
      role: { type: "string", defaultValue: "user" }
    }
  }
})
```

## 📊 Base de Datos (PostgreSQL/Neon)

### Ventajas de PostgreSQL

- 🚀 **Rendimiento superior** para consultas complejas
- 🔍 **Búsquedas avanzadas** con índices optimizados
- 📈 **Escalabilidad** horizontal y vertical
- 🔒 **ACID compliance** para integridad de datos
- 🌐 **Neon** - PostgreSQL serverless

### Migración de Datos

Los datos de proyectos se mantienen en Google Drive (archivos JSON) mientras que usuarios, sesiones y metadatos van a PostgreSQL.

## 🛣️ API Routes Modulares

### Autenticación (`/api/auth/*`)
```bash
POST /api/auth/sign-in       # Login
POST /api/auth/sign-up       # Registro
POST /api/auth/sign-out      # Logout
GET  /api/auth/session       # Info de sesión
```

### Proyectos (`/api/projects`)
```bash
GET    /api/projects/:userId              # Lista proyectos [AUTH]
POST   /api/projects/create               # Crear proyecto [AUTH]
GET    /api/projects/:userId/:className   # Obtener proyecto
PUT    /api/projects/:userId/:className   # Actualizar proyecto [AUTH]
DELETE /api/projects/:userId/:className   # Eliminar proyecto [AUTH]
```

### Unity (`/api/unity`)
```bash
GET  /api/unity/health                           # Health check Unity
GET  /api/unity/projects/:userId                 # Proyectos para Unity
GET  /api/unity/project/:userId/:className       # Proyecto específico Unity
GET  /api/unity/assets/:userId/:className        # Assets optimizados Unity
POST /api/unity/export                           # Generar export Unity
```

### Archivos (`/api/files`)
```bash
POST /api/files/upload      # Subir archivo [AUTH]
GET  /api/files/list/:id    # Listar archivos [AUTH]
GET  /api/files/info/:id    # Info de archivo [AUTH]
```

## 🔧 Configuración del Entorno

### Variables de Entorno (.env)

```bash
# Server
PORT=3002
NODE_ENV=development

# Database (Neon PostgreSQL)
DATABASE_URL=postgresql://user:pass@host/db?sslmode=require

# Authentication
BETTER_AUTH_SECRET=your-super-secret-key
BETTER_AUTH_URL=http://localhost:3002

# OAuth
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret

# Google Drive
GOOGLE_DRIVE_ROOT_FOLDER=your-folder-id

# Frontend
FRONTEND_URL=http://localhost:5173
```

## 🚀 Inicio Rápido

### 1. Instalación

```bash
npm install
```

### 2. Configuración

```bash
# Copiar ejemplo de configuración
cp .env.example .env

# Editar variables de entorno
nano .env
```

### 3. Ejecutar

```bash
# Desarrollo (auto-reload)
npm run dev

# Producción
npm start

# Legacy (archivo anterior)
npm run start:legacy
```

### 4. Inicializar Sistema

```bash
# Inicializar servicios
curl -X POST http://localhost:3002/api/system/initialize

# Verificar estado
curl http://localhost:3002/health
```

## 🛡️ Middleware de Seguridad

### Autenticación
```javascript
// Requerir autenticación
router.get('/protected', requireAuth, handler)

// Autenticación opcional
router.get('/public', optionalAuth, handler)

// Requerir rol específico
router.post('/admin', requireAuth, requireRole('admin'), handler)
```

### Validación
```javascript
// Validar datos de entrada
router.post('/create', validateCreateProject, handler)

// Validar parámetros de URL
router.get('/:userId/:className', validateProjectParams, handler)
```

## 📁 Gestión de Archivos

### Google Drive Structure
```
ARTrabajo/
├── users/
│   └── {userId}/
│       └── {className}/
│           ├── {className}_project.json
│           ├── assets/
│           │   ├── images/
│           │   ├── videos/
│           │   └── 3d-models/
│           ├── versions/
│           └── unity_exports/
├── collaboration/
└── templates/
```

## 🎮 Unity Integration

### Features Optimizadas

- ✅ **Estructura consistente** - Mismos archivos, no flood
- ✅ **Assets optimizados** - Metadatos para Unity
- ✅ **AR Foundation ready** - Compatible con últimas versiones
- ✅ **Download directo** - URLs de descarga directa

### Export Format
```json
{
  "projectInfo": { ... },
  "unityConfig": {
    "targetUnityVersion": "2023.3.x",
    "arFoundationVersion": "5.1.x"
  },
  "markers": [ ... ],
  "assets": [ ... ]
}
```

## 🧪 Testing y Development

### Scripts de Desarrollo
```bash
# Ejecutar en modo desarrollo
npm run dev

# Migración de base de datos
npm run migrate

# Tests (futuro)
npm test
```

### Health Checks
```bash
# Estado general
GET /health

# Estado Unity específico
GET /api/unity/health

# Estado del sistema
GET /api/system/status
```

## 🔄 Migración desde Versión Anterior

### Cambios Principales

1. **✅ Modularización completa**
   - Separación por responsabilidades
   - Middleware reutilizable
   - Configuración centralizada

2. **✅ Better Auth integrado**
   - Reemplazo del sistema auth anterior
   - OAuth social providers
   - Roles y permisos

3. **✅ PostgreSQL (Neon)**
   - Base de datos moderna
   - Mejor rendimiento
   - Escalabilidad

4. **✅ Estructura de archivos optimizada**
   - Mantenimiento más fácil
   - Testing simplificado
   - Documentación clara

### Compatibilidad

- **✅ API endpoints** - Mantiene compatibilidad
- **✅ Google Drive** - Misma estructura de archivos
- **✅ Unity exports** - Formato mejorado pero compatible

## 🚨 Troubleshooting

### Errores Comunes

**"System not initialized"**
```bash
curl -X POST http://localhost:3002/api/system/initialize
```

**"Authentication failed"**
- Verificar `BETTER_AUTH_SECRET` en .env
- Comprobar configuración OAuth

**"Database connection failed"**
- Verificar `DATABASE_URL` de Neon
- Comprobar SSL settings

**"Drive permission denied"**
- Verificar service account permisos
- Comprobar `google-drive-key.json` (ver configuración abajo)

### Configuración de Google Drive

1. **Crear Service Account** en Google Cloud Console
2. **Descargar** el archivo JSON de credenciales
3. **Renombrar** a `google-drive-key.json`
4. **Colocar** en la carpeta `api-backend/`

```bash
# El archivo debe estar en:
api-backend/google-drive-key.json
```

**⚠️ IMPORTANTE**: El archivo `google-drive-key.json` está en `.gitignore` y NO debe subirse a Git.

## 🎯 Roadmap

### Próximas Características

- [ ] **Testing completo** - Jest + Supertest
- [ ] **Documentación API** - Swagger/OpenAPI
- [ ] **Logging avanzado** - Winston + structured logs
- [ ] **Metrics** - Prometheus + Grafana
- [ ] **Docker** - Containerización
- [ ] **CI/CD** - GitHub Actions

---

**Versión**: 3.0.0 (Modular)  
**Estado**: ✅ Producción Ready  
**Última actualización**: Agosto 2025  
**Arquitectura**: Modular + Better Auth + Neon PostgreSQL