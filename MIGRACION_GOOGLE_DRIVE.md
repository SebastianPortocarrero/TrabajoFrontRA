# 🚀 Guía Completa: Migración Firebase → Google Drive

## 📋 Resumen de Cambios

### ✅ **Problemas Resueltos:**
1. **Firebase Eliminado** - Sistema 100% Google Drive
2. **Unity Flood Solucionado** - Un archivo por clase, versionado inteligente
3. **Optimización Performance** - Sistema de archiving automático
4. **Estructura Organizada** - Jerarquía clara en Drive

### 🏗️ **Nueva Arquitectura:**
```
ARTrabajo/                    # Carpeta raíz en Google Drive
├── users/                    # Datos de usuarios
│   └── {userId}/
│       ├── classes/          # Clases del usuario
│       │   └── {className}/
│       │       ├── class_data.json      # Metadatos (reemplaza Firestore)
│       │       ├── versions/            # Control de versiones
│       │       │   ├── current.json     # Versión actual
│       │       │   ├── v1.json         # Historial
│       │       │   └── v2.json
│       │       ├── assets/              # Archivos multimedia
│       │       │   ├── images/
│       │       │   ├── videos/
│       │       │   └── 3d-models/
│       │       └── unity_exports/       # ¡SIN FLOOD!
│       │           ├── userId_className_unity_current.json  # Solo 1 archivo actual
│       │           └── archive/         # Versiones importantes solamente
└── templates/                # Templates globales
```

---

## 🔧 PASO 1: Configuración Google Drive API

### **1.1 Google Cloud Console Setup**

1. **Ir a:** [Google Cloud Console](https://console.cloud.google.com/)
2. **Crear proyecto nuevo** o seleccionar existente
3. **Habilitar Google Drive API:**
   ```
   APIs & Services → Library → Buscar "Google Drive API" → Enable
   ```

### **1.2 Crear Service Account**

1. **Ir a:** `APIs & Services → Credentials`
2. **Crear credenciales → Service Account**
3. **Nombre:** `ar-backend-service`
4. **Rol:** `Editor` (o más específico si prefieres)
5. **Crear y descargar JSON key**

### **1.3 Configurar Archivo de Credenciales**

1. **Descargar** el archivo JSON (ej: `ar-backend-service-abc123.json`)
2. **Renombrar** a `google-drive-key.json`
3. **Colocar** en carpeta `api-backend/`
4. **IMPORTANTE:** Añadir a `.gitignore`

```bash
# En tu .gitignore
api-backend/google-drive-key.json
api-backend/firebase-key.json  # Ya no se usa pero por seguridad
```

### **1.4 Configurar Permisos Drive**

**Opción A - Carpeta específica (Recomendado):**
1. Crear carpeta `ARTrabajo` en tu Google Drive
2. Compartir con el email del service account
3. Dar permisos de **Editor**

**Opción B - Drive completo:**
El service account tendrá acceso a todo tu Drive (menos seguro)

---

## 🔄 PASO 2: Migración del Código

### **2.1 Reemplazar index.js**

```bash
# Respaldar archivo actual
cp api-backend/index.js api-backend/index_firebase_backup.js

# Usar nueva versión
cp api-backend/index_drive_only.js api-backend/index.js
```

### **2.2 Instalar Dependencias (si faltan)**

```bash
cd api-backend
npm install googleapis multer dotenv express cors
```

### **2.3 Actualizar package.json**

```json
{
  "name": "ar-backend",
  "version": "2.0.0",
  "description": "AR Backend - Google Drive Only",
  "main": "index.js",
  "scripts": {
    "start": "node index.js",
    "dev": "nodemon index.js",
    "test": "echo \"No tests yet\" && exit 0"
  },
  "dependencies": {
    "express": "^4.18.2",
    "cors": "^2.8.5",
    "dotenv": "^16.0.0",
    "googleapis": "^118.0.0",
    "multer": "^1.4.5",
    "uuid": "^9.0.0"
  }
}
```

### **2.4 Configurar Variables de Entorno**

```bash
# Crear/actualizar .env
cat > api-backend/.env << EOF
PORT=3001
GOOGLE_DRIVE_KEY_PATH=./google-drive-key.json
DRIVE_ROOT_FOLDER=ARTrabajo
NODE_ENV=development
FRONTEND_URL=http://localhost:5173
EOF
```

---

## 🚀 PASO 3: Testing del Sistema

### **3.1 Inicializar Servicios**

```bash
cd api-backend
npm start
```

**Verificar logs:**
```
✅ DriveDataService inicializado correctamente
📁 Root folder ID: 1ABC...xyz
🚀 Servidor escuchando en puerto 3001
```

### **3.2 Verificar API Health**

```bash
curl http://localhost:3001/health
```

**Respuesta esperada:**
```json
{
  "status": "healthy",
  "services": {
    "drive": true,
    "ai": true
  },
  "timestamp": "2025-01-06T..."
}
```

### **3.3 Test Crear Proyecto**

```bash
curl -X POST http://localhost:3001/api/projects/create \
  -H "Content-Type: application/json" \
  -d '{
    "userId": "test_user",
    "className": "test_class",
    "projectData": {
      "description": "Test project",
      "contents": []
    }
  }'
```

### **3.4 Verificar en Drive**

Deberías ver la estructura creada:
```
ARTrabajo/
└── users/
    └── test_user/
        └── classes/
            └── test_class/
                ├── class_data.json
                ├── versions/
                ├── assets/
                └── unity_exports/
```

---

## 🎮 PASO 4: Sistema Unity Optimizado

### **4.1 Nuevo Endpoint Unity**

El nuevo sistema usa: `/api/unity/export/optimized`

**Características:**
- **Un archivo por clase:** `userId_className_unity_current.json`
- **Versionado inteligente:** Solo archiva cambios importantes
- **Auto-cleanup:** Mantiene máximo 10 versiones archivadas

### **4.2 Flujo Unity Mejorado**

```javascript
// Frontend - Guardar clase
const response = await fetch('/api/unity/export/optimized', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    userId: 'user123',
    className: 'MiClase',
    contents: [...], // Contenido de la clase
    template: {...}, // Template si aplica
    config: {
      targetUnityVersion: '2023.3.x',
      performanceProfile: 'mobile'
    }
  })
});

const result = await response.json();
// result.export.fileName será siempre: "user123_MiClase_unity_current.json"
// ¡NO más flood de archivos!
```

### **4.3 Unity Integration Script**

Para Unity, crear script que limpie imports anteriores:

```csharp
// UnityPackageManager.cs
using UnityEngine;
using UnityEditor;

public class UnityPackageManager : MonoBehaviour
{
    public static void ImportARContent(string jsonFilePath)
    {
        // Limpiar contenido anterior
        if (AssetDatabase.IsValidFolder("Assets/AR_Content"))
        {
            AssetDatabase.DeleteAsset("Assets/AR_Content");
        }
        
        // Importar nuevo contenido
        // ... lógica de importación
        
        AssetDatabase.Refresh();
        Debug.Log("AR Content imported successfully - old content cleaned");
    }
}
```

---

## 📊 PASO 5: Verificación y Monitoreo

### **5.1 Endpoints Disponibles**

**Proyectos:**
- `POST /api/projects/create` - Crear proyecto
- `GET /api/projects/:userId` - Listar proyectos
- `GET /api/projects/:userId/:className` - Obtener proyecto
- `PUT /api/projects/:userId/:className` - Actualizar proyecto
- `DELETE /api/projects/:userId/:className` - Eliminar proyecto

**Versiones:**
- `POST /api/versions/:userId/:className` - Crear versión
- `GET /api/versions/:userId/:className` - Historial versiones
- `POST /api/versions/:userId/:className/:version/restore` - Restaurar

**Unity (Optimizado):**
- `POST /api/unity/export/optimized` - Export sin flood
- `GET /api/unity/export/:userId/:className/current` - Export actual
- `GET /api/unity/export/:userId/:className/history` - Historial exports

**Assets:**
- `POST /api/assets/:userId/:className/upload` - Subir archivo
- `GET /api/assets/:userId/:className` - Listar assets

### **5.2 Monitorear Uso Drive**

```bash
# Ver estadísticas
curl http://localhost:3001/api/system/status
```

### **5.3 Logs Importantes**

**Inicialización exitosa:**
```
✅ DriveDataService inicializado correctamente
📁 Root folder ID: 1ABC...xyz
```

**Unity export optimizado:**
```
📄 Archivo Unity creado: user123_MiClase_unity_current.json
📦 Archivo Unity archivado: user123_MiClase_unity_v20250106T...json
```

**Cleanup automático:**
```
🧹 Archivo Unity antiguo eliminado: user123_MiClase_unity_v20241201T...json
```

---

## ⚠️ PASO 6: Migración de Datos Existentes (Opcional)

Si tienes datos en Firebase y quieres migrarlos:

### **6.1 Export Firebase Data**

```javascript
// scripts/exportFirebaseData.js
const admin = require('firebase-admin');

async function exportAllData() {
  const db = admin.firestore();
  
  // Export projects
  const projects = await db.collection('projects').get();
  const exportData = {};
  
  projects.forEach(doc => {
    exportData[doc.id] = doc.data();
  });
  
  console.log('Exported data:', JSON.stringify(exportData, null, 2));
}
```

### **6.2 Import to Drive**

```javascript
// scripts/importToDrive.js
const driveDataService = require('../driveDataService');

async function importData(firebaseData) {
  await driveDataService.initialize();
  
  for (const [projectId, projectData] of Object.entries(firebaseData)) {
    // Crear proyecto en Drive
    await driveDataService.createProject(
      projectData.userId,
      projectData.className,
      projectData
    );
  }
}
```

---

## 🎯 PASO 7: Frontend Updates (Si necesario)

### **7.1 Actualizar URLs API**

Cambiar calls de:
```javascript
// Antes
fetch('/api/firebase/save-class', ...)

// Ahora
fetch('/api/projects/create', ...)
```

### **7.2 Nuevo Unity Export**

```javascript
// Usar endpoint optimizado
const exportUnity = async (userId, className, contents) => {
  const response = await fetch('/api/unity/export/optimized', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      userId,
      className,
      contents,
      config: {
        targetUnityVersion: '2023.3.x',
        performanceProfile: 'mobile'
      }
    })
  });
  
  const result = await response.json();
  
  if (result.success) {
    // Solo UN archivo - no más flood
    console.log('Unity file:', result.export.fileName);
    console.log('Download:', result.export.downloadUrl);
  }
};
```

---

## 🔒 PASO 8: Seguridad y Backup

### **8.1 Seguridad**

```bash
# Verificar permisos
chmod 600 api-backend/google-drive-key.json

# Verificar .gitignore
echo "google-drive-key.json" >> api-backend/.gitignore
```

### **8.2 Backup Strategy**

- **Google Drive nativo:** Historial de versiones automático
- **Control versiones local:** Implementado en `driveVersionControl.js`
- **Redundancia:** Considerar Google Drive Business

---

## 🚀 PASO 9: Deploy y Producción

### **9.1 Variables Producción**

```bash
# .env.production
PORT=80
NODE_ENV=production
GOOGLE_DRIVE_KEY_PATH=/app/credentials/google-drive-key.json
DRIVE_ROOT_FOLDER=ARTrabajo_PROD
```

### **9.2 Docker (Opcional)**

```dockerfile
FROM node:18
WORKDIR /app
COPY package*.json ./
RUN npm install --production
COPY . .
EXPOSE 3001
CMD ["npm", "start"]
```

---

## ✅ RESUMEN FINAL

### **✅ Completado:**
1. **Firebase eliminado** - 100% Google Drive
2. **Unity flood solucionado** - 1 archivo por clase
3. **Versionado inteligente** - Solo archiva cambios importantes
4. **API completa** - Endpoints para proyectos, versiones, assets
5. **Auto-cleanup** - Mantiene Drive limpio
6. **Performance optimizada** - Estructura eficiente

### **🎯 Beneficios:**
- **Sin flood Unity** - Un archivo `current.json` por clase
- **Drive organizado** - Estructura jerárquica clara
- **Versionado completo** - Historial sin perder datos
- **Escalable** - Crece limpiamente con uso
- **Mantenible** - Código más simple sin Firebase

### **📞 Próximos Pasos:**
1. Testear con datos reales
2. Entrenar al equipo en nueva API
3. Monitorear performance
4. Considerar features adicionales (colaboración, permisos)

¿Listo para migrar? ¡El sistema está preparado! 🚀