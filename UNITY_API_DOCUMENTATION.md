# Unity Integration API Documentation

## 🎯 Overview

Esta API permite que Unity consuma los datos del proyecto AR de manera optimizada. Los datos se almacenan en Google Drive y se sirven a través del backend Node.js.

## 🚀 Base URL
```
http://localhost:3001/api/unity
```

## 📋 Available Endpoints

### 1. Health Check
**GET** `/api/unity/health`

Verifica que la API Unity esté funcionando correctamente.

**Response:**
```json
{
  "success": true,
  "unity_api_status": "healthy",
  "services": {
    "drive": true,
    "backend": true
  },
  "unity_version": "1.0.0",
  "api_version": "2.0.0",
  "timestamp": "2024-01-15T10:30:00.000Z"
}
```

### 2. List User Projects
**GET** `/api/unity/projects/:userId`

Obtiene la lista de todos los proyectos AR de un usuario.

**Parameters:**
- `userId` (string): ID del usuario

**Response:**
```json
{
  "success": true,
  "projects": [
    {
      "id": "test_user_1_MyProject_1642234567890",
      "className": "Historia del Perú",
      "displayName": "Historia del Perú", 
      "createdAt": "2024-01-15T08:00:00.000Z",
      "lastModified": "2024-01-15T10:00:00.000Z",
      "version": 1,
      "hasAssets": true,
      "markerCount": 3,
      "status": "ready"
    }
  ],
  "total_count": 1,
  "user_id": "test_user_1",
  "unity_version": "1.0.0",
  "timestamp": "2024-01-15T10:30:00.000Z"
}
```

### 3. Get Project Data
**GET** `/api/unity/project/:userId/:className`

Obtiene los datos completos de un proyecto específico, optimizado para Unity.

**Parameters:**
- `userId` (string): ID del usuario
- `className` (string): Nombre de la clase/proyecto

**Response:**
```json
{
  "success": true,
  "project": {
    "id": "test_user_1_MyProject_unity",
    "name": "Historia del Perú",
    "displayName": "Historia del Perú",
    "userId": "test_user_1",
    "createdAt": "2024-01-15T08:00:00.000Z",
    "lastModified": "2024-01-15T10:00:00.000Z",
    "version": 1,
    
    "ar_content": {
      "markers": [
        {
          "id": "marker_1",
          "name": "Marker 1",
          "marker_image": {
            "url": "https://drive.google.com/uc?id=abc123",
            "drive_file_id": "abc123",
            "tracking_quality": "high"
          },
          "ar_steps": [
            {
              "id": "step_1",
              "order": 0,
              "content": {
                "title": "Introducción",
                "text": "Contenido del paso...",
                "html_content": "<p>Contenido HTML...</p>"
              },
              "media": {
                "image": {
                  "url": "https://drive.google.com/uc?id=def456",
                  "drive_file_id": "def456",
                  "display_duration": 5.0
                },
                "video": null,
                "model_3d": null,
                "audio": null
              },
              "unity_settings": {
                "position": { "x": 0, "y": 0, "z": 0 },
                "scale": { "x": 1, "y": 1, "z": 1 },
                "rotation": { "x": 0, "y": 0, "z": 0 },
                "animation": "none",
                "interaction": "none"
              }
            }
          ]
        }
      ],
      "global_settings": {
        "tracking_quality": "high",
        "max_simultaneous_markers": 10,
        "auto_focus": true
      }
    },
    
    "asset_folders": {
      "images": "folder_id_images",
      "videos": "folder_id_videos", 
      "models_3d": "folder_id_3d"
    },
    
    "drive_structure": {
      "main_folder": "main_folder_id",
      "assets_folder": "assets_folder_id",
      "versions_folder": "versions_folder_id",
      "unity_exports_folder": "unity_exports_folder_id"
    }
  },
  "unity_version": "1.0.0",
  "api_version": "2.0.0",
  "timestamp": "2024-01-15T10:30:00.000Z"
}
```

### 4. Get Project Assets
**GET** `/api/unity/assets/:userId/:className`

Obtiene los assets (archivos multimedia) de un proyecto con metadata optimizada para Unity.

**Parameters:**
- `userId` (string): ID del usuario
- `className` (string): Nombre de la clase/proyecto

**Query Parameters:**
- `assetType` (optional): Filtrar por tipo de asset (`images`, `videos`, `3d-models`, `all`)

**Response:**
```json
{
  "success": true,
  "assets": [
    {
      "id": "file_id_123",
      "name": "marker_image.jpg",
      "type": "images",
      
      "download_url": "https://drive.google.com/uc?id=file_id_123",
      "preview_url": "https://drive.google.com/thumbnail?id=file_id_123",
      "drive_view_url": "https://drive.google.com/file/d/file_id_123/view",
      
      "size": 2048576,
      "mime_type": "image/jpeg",
      "created_at": "2024-01-15T08:30:00.000Z",
      "modified_at": "2024-01-15T08:30:00.000Z",
      
      "unity_asset_type": "Texture2D",
      "is_streamable": false,
      "estimated_load_time": 1.0,
      
      "drive_folder_id": "images_folder_id",
      "drive_file_id": "file_id_123"
    }
  ],
  "total_count": 1,
  "asset_type": "all",
  "unity_version": "1.0.0",
  "timestamp": "2024-01-15T10:30:00.000Z"
}
```

## 🔧 Unity Asset Types Mapping

| MIME Type | Unity Asset Type |
|-----------|-----------------|
| image/* | Texture2D |
| video/* | VideoClip |
| audio/* | AudioClip |
| model files | Model |

## 🚨 Error Handling

Todos los endpoints devuelven errores en formato Unity-friendly:

```json
{
  "success": false,
  "error": "Error message",
  "unity_error_code": "UNITY_SPECIFIC_ERROR_CODE",
  "details": "Detailed error information",
  "timestamp": "2024-01-15T10:30:00.000Z"
}
```

### Error Codes:
- `PROJECT_NOT_FOUND`: Proyecto no encontrado
- `UNITY_PROJECT_ERROR`: Error general del proyecto
- `UNITY_ASSETS_ERROR`: Error obteniendo assets
- `UNITY_PROJECTS_ERROR`: Error listando proyectos
- `UNITY_HEALTH_ERROR`: Error en health check

## 🔨 Usage Example in Unity C#

```csharp
// Example Unity script to fetch project data
public class ARProjectLoader : MonoBehaviour 
{
    private string apiBaseUrl = "http://localhost:3001/api/unity";
    
    [System.Serializable]
    public class UnityProjectResponse 
    {
        public bool success;
        public UnityProject project;
        public string unity_version;
        public string timestamp;
    }
    
    public IEnumerator LoadProject(string userId, string className) 
    {
        string url = $"{apiBaseUrl}/project/{userId}/{className}";
        
        using (UnityWebRequest request = UnityWebRequest.Get(url)) 
        {
            yield return request.SendWebRequest();
            
            if (request.result == UnityWebRequest.Result.Success) 
            {
                var response = JsonUtility.FromJson<UnityProjectResponse>(request.downloadHandler.text);
                if (response.success) 
                {
                    // Process project data
                    ProcessProjectData(response.project);
                }
            }
        }
    }
}
```

## 🔄 Data Flow

1. **Usuario crea contenido** → Frontend React
2. **Datos se guardan** → Backend Node.js → Google Drive
3. **Unity solicita datos** → Backend API → Datos transformados
4. **Unity carga assets** → Directamente desde Google Drive URLs

## 🔒 Security Notes

- La API requiere que el sistema esté inicializado
- Los assets se sirven con URLs públicas de Google Drive
- No hay autenticación implementada (agregar según necesidades)

## 🚀 Getting Started

1. Asegurate que el backend esté ejecutándose: `npm start`
2. Inicializa el sistema: `POST /api/system/initialize`
3. Verifica que Unity API esté funcionando: `GET /api/unity/health`
4. Comienza a consumir los datos desde Unity