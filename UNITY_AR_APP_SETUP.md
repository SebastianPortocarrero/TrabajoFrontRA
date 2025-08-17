# Unity AR Application Setup Guide

## 🎯 Objetivo
Crear una aplicación AR en Unity que permita a los estudiantes escanear marcadores de imagen con la cámara de su dispositivo y ver contenido educativo interactivo.

## 📱 Opciones de Plataforma

### Opción A: Aplicación Móvil (Android/iOS) ⭐ **RECOMENDADO**
- **Pros**: Mejor rendimiento, acceso completo a hardware, experiencia nativa
- **Contras**: Necesita instalación, proceso de distribución

### Opción B: WebGL (Navegador Web)
- **Pros**: Sin instalación, acceso directo via URL
- **Contras**: Limitaciones de WebGL, rendimiento inferior

## 🚀 Setup Inicial de Unity

### 1. Configuración del Proyecto
```
Unity Version: 2022.3 LTS (recomendado)
Template: 3D
```

### 2. Instalar AR Foundation
**Window → Package Manager → Unity Registry**
- `AR Foundation` (5.0.0 o superior)
- `ARCore XR Plugin` (Android)
- `ARKit XR Plugin` (iOS)

### 3. Configuración de Build Settings

#### Para Android:
```
File → Build Settings → Android
- Minimum API Level: 24 (Android 7.0)
- Target API Level: 30+
- Scripting Backend: IL2CPP
- Target Architectures: ARM64
```

#### Para iOS:
```
File → Build Settings → iOS
- Target minimum iOS Version: 11.0
- Architecture: ARM64
```

#### Para WebGL:
```
File → Build Settings → WebGL
- Compression Format: Brotli
- Exception Support: Explicitly Thrown Exceptions Only
```

## 🎨 Estructura del Proyecto Unity

```
Assets/
├── Scripts/
│   ├── ARManager.cs
│   ├── APIController.cs
│   ├── MarkerDetector.cs
│   ├── ContentDisplayer.cs
│   └── UIController.cs
├── Prefabs/
│   ├── ARCamera.prefab
│   ├── MarkerContent.prefab
│   └── UI/
├── Materials/
├── Textures/
├── Models/
└── Scenes/
    ├── MainMenu.unity
    ├── ProjectSelection.unity
    └── ARExperience.unity
```

## 📝 Scripts Principales

### 1. APIController.cs - Conexión con Backend

```csharp
using System.Collections;
using System.Collections.Generic;
using UnityEngine;
using UnityEngine.Networking;
using Newtonsoft.Json;

[System.Serializable]
public class UnityProject
{
    public string id;
    public string name;
    public string displayName;
    public ARContent ar_content;
}

[System.Serializable]
public class ARContent
{
    public List<ARMarker> markers;
    public GlobalSettings global_settings;
}

[System.Serializable]
public class ARMarker
{
    public string id;
    public string name;
    public MarkerImage marker_image;
    public List<ARStep> ar_steps;
}

[System.Serializable]
public class MarkerImage
{
    public string url;
    public string drive_file_id;
}

[System.Serializable]
public class ARStep
{
    public string id;
    public int order;
    public StepContent content;
    public StepMedia media;
    public UnitySettings unity_settings;
}

[System.Serializable]
public class StepContent
{
    public string title;
    public string text;
    public string html_content;
}

[System.Serializable]
public class StepMedia
{
    public MediaItem image;
    public MediaItem video;
    public MediaItem audio;
    public MediaItem model_3d;
}

[System.Serializable]
public class MediaItem
{
    public string url;
    public string drive_file_id;
    public float display_duration;
    public bool auto_play;
    public float volume;
    public float scale;
}

[System.Serializable]
public class UnitySettings
{
    public Vector3 position;
    public Vector3 scale;
    public Vector3 rotation;
    public string animation;
    public string interaction;
}

[System.Serializable]
public class GlobalSettings
{
    public string tracking_quality;
    public int max_simultaneous_markers;
    public bool auto_focus;
}

public class APIController : MonoBehaviour
{
    [Header("API Configuration")]
    public string apiBaseUrl = "http://localhost:3001/api/unity";
    
    [Header("User Configuration")]
    public string userId = "test_user_1";
    
    public static APIController Instance { get; private set; }
    
    void Awake()
    {
        if (Instance == null)
        {
            Instance = this;
            DontDestroyOnLoad(gameObject);
        }
        else
        {
            Destroy(gameObject);
        }
    }
    
    public IEnumerator GetUserProjects(System.Action<List<ProjectInfo>> onComplete)
    {
        string url = $"{apiBaseUrl}/projects/{userId}";
        
        using (UnityWebRequest request = UnityWebRequest.Get(url))
        {
            request.timeout = 30;
            yield return request.SendWebRequest();
            
            if (request.result == UnityWebRequest.Result.Success)
            {
                var response = JsonConvert.DeserializeObject<ProjectListResponse>(request.downloadHandler.text);
                onComplete?.Invoke(response.projects);
            }
            else
            {
                Debug.LogError($"Error getting projects: {request.error}");
                onComplete?.Invoke(new List<ProjectInfo>());
            }
        }
    }
    
    public IEnumerator GetProject(string className, System.Action<UnityProject> onComplete)
    {
        string url = $"{apiBaseUrl}/project/{userId}/{UnityWebRequest.EscapeURL(className)}";
        
        using (UnityWebRequest request = UnityWebRequest.Get(url))
        {
            request.timeout = 30;
            yield return request.SendWebRequest();
            
            if (request.result == UnityWebRequest.Result.Success)
            {
                var response = JsonConvert.DeserializeObject<ProjectResponse>(request.downloadHandler.text);
                onComplete?.Invoke(response.project);
            }
            else
            {
                Debug.LogError($"Error getting project: {request.error}");
                onComplete?.Invoke(null);
            }
        }
    }
    
    public IEnumerator DownloadTexture(string url, System.Action<Texture2D> onComplete)
    {
        using (UnityWebRequest request = UnityWebRequestTexture.GetTexture(url))
        {
            request.timeout = 30;
            yield return request.SendWebRequest();
            
            if (request.result == UnityWebRequest.Result.Success)
            {
                Texture2D texture = DownloadHandlerTexture.GetContent(request);
                onComplete?.Invoke(texture);
            }
            else
            {
                Debug.LogError($"Error downloading texture: {request.error}");
                onComplete?.Invoke(null);
            }
        }
    }
}

[System.Serializable]
public class ProjectListResponse
{
    public bool success;
    public List<ProjectInfo> projects;
}

[System.Serializable]
public class ProjectResponse
{
    public bool success;
    public UnityProject project;
}

[System.Serializable]
public class ProjectInfo
{
    public string id;
    public string className;
    public string displayName;
    public string createdAt;
    public string lastModified;
    public int markerCount;
    public string status;
}
```

### 2. ARManager.cs - Controlador Principal AR

```csharp
using System.Collections;
using System.Collections.Generic;
using UnityEngine;
using UnityEngine.XR.ARFoundation;
using UnityEngine.XR.ARSubsystems;

public class ARManager : MonoBehaviour
{
    [Header("AR Components")]
    public ARTrackedImageManager trackedImageManager;
    public ARCamera arCamera;
    
    [Header("Content")]
    public GameObject contentPrefab;
    
    [Header("UI")]
    public GameObject loadingPanel;
    public TMPro.TextMeshProUGUI statusText;
    
    private UnityProject currentProject;
    private Dictionary<string, GameObject> spawnedObjects = new Dictionary<string, GameObject>();
    private Dictionary<string, ARMarker> markerData = new Dictionary<string, ARMarker>();
    
    void Start()
    {
        // Cargar proyecto
        string selectedProject = PlayerPrefs.GetString("SelectedProject", "");
        if (!string.IsNullOrEmpty(selectedProject))
        {
            StartCoroutine(LoadProject(selectedProject));
        }
        else
        {
            statusText.text = "Error: No project selected";
        }
    }
    
    void OnEnable()
    {
        trackedImageManager.trackedImagesChanged += OnTrackedImagesChanged;
    }
    
    void OnDisable()
    {
        trackedImageManager.trackedImagesChanged -= OnTrackedImagesChanged;
    }
    
    IEnumerator LoadProject(string projectName)
    {
        statusText.text = "Loading project...";
        loadingPanel.SetActive(true);
        
        yield return APIController.Instance.GetProject(projectName, (project) =>
        {
            if (project != null)
            {
                currentProject = project;
                SetupImageLibrary();
                statusText.text = "Point camera at markers";
            }
            else
            {
                statusText.text = "Error loading project";
            }
            loadingPanel.SetActive(false);
        });
    }
    
    void SetupImageLibrary()
    {
        // Crear biblioteca de imágenes de marcadores
        var library = trackedImageManager.CreateRuntimeLibrary();
        
        foreach (var marker in currentProject.ar_content.markers)
        {
            markerData[marker.id] = marker;
            
            // Descargar imagen del marcador
            StartCoroutine(APIController.Instance.DownloadTexture(marker.marker_image.url, (texture) =>
            {
                if (texture != null)
                {
                    library.ScheduleAddImageWithValidationJob(texture, marker.name, 0.1f);
                    Debug.Log($"Added marker: {marker.name}");
                }
            }));
        }
        
        trackedImageManager.referenceLibrary = library;
    }
    
    void OnTrackedImagesChanged(ARTrackedImagesChangedEventArgs eventArgs)
    {
        // Marcadores añadidos
        foreach (var trackedImage in eventArgs.added)
        {
            OnMarkerDetected(trackedImage);
        }
        
        // Marcadores actualizados
        foreach (var trackedImage in eventArgs.updated)
        {
            OnMarkerUpdated(trackedImage);
        }
        
        // Marcadores removidos
        foreach (var trackedImage in eventArgs.removed)
        {
            OnMarkerLost(trackedImage);
        }
    }
    
    void OnMarkerDetected(ARTrackedImage trackedImage)
    {
        string markerId = GetMarkerIdByName(trackedImage.referenceImage.name);
        
        if (!string.IsNullOrEmpty(markerId) && markerData.ContainsKey(markerId))
        {
            // Crear contenido AR
            GameObject content = Instantiate(contentPrefab, trackedImage.transform);
            spawnedObjects[markerId] = content;
            
            // Configurar contenido
            var contentController = content.GetComponent<ContentDisplayer>();
            if (contentController != null)
            {
                contentController.SetupContent(markerData[markerId]);
            }
            
            Debug.Log($"Marker detected: {trackedImage.referenceImage.name}");
        }
    }
    
    void OnMarkerUpdated(ARTrackedImage trackedImage)
    {
        string markerId = GetMarkerIdByName(trackedImage.referenceImage.name);
        
        if (spawnedObjects.ContainsKey(markerId))
        {
            var content = spawnedObjects[markerId];
            
            // Actualizar visibilidad basada en tracking state
            content.SetActive(trackedImage.trackingState == TrackingState.Tracking);
        }
    }
    
    void OnMarkerLost(ARTrackedImage trackedImage)
    {
        string markerId = GetMarkerIdByName(trackedImage.referenceImage.name);
        
        if (spawnedObjects.ContainsKey(markerId))
        {
            Destroy(spawnedObjects[markerId]);
            spawnedObjects.Remove(markerId);
        }
    }
    
    string GetMarkerIdByName(string name)
    {
        foreach (var kvp in markerData)
        {
            if (kvp.Value.name == name)
            {
                return kvp.Key;
            }
        }
        return null;
    }
}
```

### 3. ContentDisplayer.cs - Mostrar Contenido AR

```csharp
using System.Collections;
using System.Collections.Generic;
using UnityEngine;
using TMPro;

public class ContentDisplayer : MonoBehaviour
{
    [Header("UI Components")]
    public GameObject contentPanel;
    public TextMeshProUGUI titleText;
    public TextMeshProUGUI descriptionText;
    public GameObject imageContainer;
    public GameObject videoContainer;
    public GameObject modelContainer;
    
    [Header("Media Components")]
    public UnityEngine.UI.Image displayImage;
    public UnityEngine.Video.VideoPlayer videoPlayer;
    public AudioSource audioSource;
    
    private ARMarker currentMarker;
    private int currentStepIndex = 0;
    private List<ARStep> steps;
    
    public void SetupContent(ARMarker marker)
    {
        currentMarker = marker;
        steps = marker.ar_steps;
        currentStepIndex = 0;
        
        if (steps.Count > 0)
        {
            DisplayStep(steps[0]);
        }
        
        // Configurar navegación si hay múltiples pasos
        if (steps.Count > 1)
        {
            SetupStepNavigation();
        }
    }
    
    void DisplayStep(ARStep step)
    {
        // Mostrar contenido de texto
        if (titleText != null)
            titleText.text = step.content.title;
            
        if (descriptionText != null)
            descriptionText.text = step.content.text;
        
        // Ocultar todos los contenedores de media
        imageContainer?.SetActive(false);
        videoContainer?.SetActive(false);
        modelContainer?.SetActive(false);
        
        // Mostrar media según el tipo
        if (step.media.image != null && !string.IsNullOrEmpty(step.media.image.url))
        {
            StartCoroutine(LoadImage(step.media.image));
        }
        else if (step.media.video != null && !string.IsNullOrEmpty(step.media.video.url))
        {
            LoadVideo(step.media.video);
        }
        else if (step.media.model_3d != null && !string.IsNullOrEmpty(step.media.model_3d.url))
        {
            Load3DModel(step.media.model_3d);
        }
        
        // Aplicar configuraciones Unity
        ApplyUnitySettings(step.unity_settings);
        
        // Reproducir audio si existe
        if (step.media.audio != null && !string.IsNullOrEmpty(step.media.audio.url))
        {
            StartCoroutine(LoadAudio(step.media.audio));
        }
    }
    
    IEnumerator LoadImage(MediaItem imageMedia)
    {
        imageContainer.SetActive(true);
        
        yield return APIController.Instance.DownloadTexture(imageMedia.url, (texture) =>
        {
            if (texture != null && displayImage != null)
            {
                Sprite sprite = Sprite.Create(texture, new Rect(0, 0, texture.width, texture.height), Vector2.one * 0.5f);
                displayImage.sprite = sprite;
                
                // Auto-hide después del display_duration
                if (imageMedia.display_duration > 0)
                {
                    StartCoroutine(HideImageAfterDuration(imageMedia.display_duration));
                }
            }
        });
    }
    
    IEnumerator HideImageAfterDuration(float duration)
    {
        yield return new WaitForSeconds(duration);
        imageContainer?.SetActive(false);
    }
    
    void LoadVideo(MediaItem videoMedia)
    {
        videoContainer.SetActive(true);
        
        if (videoPlayer != null)
        {
            videoPlayer.url = videoMedia.url;
            videoPlayer.isLooping = false; // Configurar según media settings
            
            if (videoMedia.auto_play)
            {
                videoPlayer.Play();
            }
        }
    }
    
    void Load3DModel(MediaItem modelMedia)
    {
        modelContainer.SetActive(true);
        
        // Aquí cargarías el modelo 3D
        // Puedes usar AssetBundles o un loader como Trilib
        Debug.Log($"Loading 3D model from: {modelMedia.url}");
    }
    
    IEnumerator LoadAudio(MediaItem audioMedia)
    {
        using (UnityEngine.Networking.UnityWebRequest request = 
               UnityEngine.Networking.UnityWebRequestMultimedia.GetAudioClip(audioMedia.url, AudioType.MPEG))
        {
            yield return request.SendWebRequest();
            
            if (request.result == UnityEngine.Networking.UnityWebRequest.Result.Success)
            {
                AudioClip clip = UnityEngine.Networking.DownloadHandlerAudioClip.GetContent(request);
                
                if (audioSource != null)
                {
                    audioSource.clip = clip;
                    audioSource.volume = audioMedia.volume;
                    
                    if (audioMedia.auto_play)
                    {
                        audioSource.Play();
                    }
                }
            }
        }
    }
    
    void ApplyUnitySettings(UnitySettings settings)
    {
        if (settings != null)
        {
            transform.localPosition = settings.position;
            transform.localScale = settings.scale;
            transform.localRotation = Quaternion.Euler(settings.rotation);
            
            // Aplicar animaciones o interacciones adicionales
            ApplyAnimation(settings.animation);
        }
    }
    
    void ApplyAnimation(string animationType)
    {
        switch (animationType.ToLower())
        {
            case "fade_in":
                StartCoroutine(FadeIn());
                break;
            case "scale_up":
                StartCoroutine(ScaleUp());
                break;
            case "rotate":
                StartCoroutine(Rotate());
                break;
            // Agregar más animaciones según necesites
        }
    }
    
    IEnumerator FadeIn()
    {
        CanvasGroup canvasGroup = contentPanel.GetComponent<CanvasGroup>();
        if (canvasGroup == null)
            canvasGroup = contentPanel.AddComponent<CanvasGroup>();
        
        canvasGroup.alpha = 0;
        
        while (canvasGroup.alpha < 1)
        {
            canvasGroup.alpha += Time.deltaTime * 2f;
            yield return null;
        }
    }
    
    IEnumerator ScaleUp()
    {
        Vector3 originalScale = transform.localScale;
        transform.localScale = Vector3.zero;
        
        while (transform.localScale.x < originalScale.x)
        {
            transform.localScale = Vector3.Lerp(transform.localScale, originalScale, Time.deltaTime * 3f);
            yield return null;
        }
        
        transform.localScale = originalScale;
    }
    
    IEnumerator Rotate()
    {
        while (true)
        {
            transform.Rotate(0, 50 * Time.deltaTime, 0);
            yield return null;
        }
    }
    
    void SetupStepNavigation()
    {
        // Agregar botones de navegación entre pasos
        // Implementar UI para siguiente/anterior paso
    }
    
    public void NextStep()
    {
        if (currentStepIndex < steps.Count - 1)
        {
            currentStepIndex++;
            DisplayStep(steps[currentStepIndex]);
        }
    }
    
    public void PreviousStep()
    {
        if (currentStepIndex > 0)
        {
            currentStepIndex--;
            DisplayStep(steps[currentStepIndex]);
        }
    }
}
```

## 🎮 Configuración de Escenas

### Scene 1: MainMenu - Paso a Paso

#### 1. Crear la Escena
1. **File → New Scene** → Seleccionar "2D Template"
2. **File → Save As** → Guardar como `MainMenu.unity` en carpeta `Assets/Scenes/`

#### 2. Configurar Canvas Principal
1. **Click derecho en Hierarchy → UI → Canvas**
2. **Configurar Canvas:**
   - Canvas Scaler: Scale With Screen Size
   - Reference Resolution: 1920x1080
   - Screen Match Mode: Match Width Or Height
   - Match: 0.5

#### 3. Crear Panel Principal
1. **Click derecho en Canvas → UI → Panel**
2. **Renombrar a "MainPanel"**
3. **Configurar Panel:**
   - Anchor: Fill (stretch completo)
   - Color: Azul oscuro con alpha 0.8

#### 4. Agregar Título de la App
1. **Click derecho en MainPanel → UI → Text - TextMeshPro**
2. **Renombrar a "TitleText"**
3. **Configurar:**
   - Text: "AR Education App"
   - Font Size: 60
   - Alignment: Center
   - Color: Blanco
   - Anchor: Top-Center
   - Position Y: -100

#### 5. Crear Input Field para Usuario
1. **Click derecho en MainPanel → UI → Input Field - TextMeshPro**
2. **Renombrar a "UserIdInput"**
3. **Configurar:**
   - Placeholder Text: "Ingrese su ID de usuario"
   - Character Limit: 50
   - Content Type: Standard
   - Width: 400, Height: 60
   - Anchor: Middle-Center
   - Position Y: 50

#### 6. Agregar Botón Continuar
1. **Click derecho en MainPanel → UI → Button - TextMeshPro**
2. **Renombrar a "ContinueButton"**
3. **Configurar:**
   - Text: "CONTINUAR"
   - Width: 300, Height: 80
   - Anchor: Middle-Center
   - Position Y: -50
   - Colors: Normal: Verde, Highlighted: Verde claro

#### 7. Crear Script MainMenuController
1. **Crear script `MainMenuController.cs` en Assets/Scripts/**
2. **Agregar el script al Canvas**

```csharp
using UnityEngine;
using UnityEngine.SceneManagement;
using TMPro;
using UnityEngine.UI;

public class MainMenuController : MonoBehaviour
{
    [Header("UI Components")]
    public TMP_InputField userIdInput;
    public Button continueButton;
    public TextMeshProUGUI errorText;
    
    void Start()
    {
        // Cargar usuario guardado si existe
        string savedUserId = PlayerPrefs.GetString("UserId", "");
        if (!string.IsNullOrEmpty(savedUserId))
        {
            userIdInput.text = savedUserId;
        }
        
        // Configurar evento del botón
        continueButton.onClick.AddListener(OnContinueButtonClicked);
    }
    
    public void OnContinueButtonClicked()
    {
        string userId = userIdInput.text.Trim();
        
        if (string.IsNullOrEmpty(userId))
        {
            ShowError("Por favor ingrese su ID de usuario");
            return;
        }
        
        // Guardar usuario
        PlayerPrefs.SetString("UserId", userId);
        PlayerPrefs.Save();
        
        // Ir a selección de proyectos
        SceneManager.LoadScene("ProjectSelection");
    }
    
    void ShowError(string message)
    {
        if (errorText != null)
        {
            errorText.text = message;
            errorText.gameObject.SetActive(true);
            Invoke("HideError", 3f);
        }
    }
    
    void HideError()
    {
        if (errorText != null)
            errorText.gameObject.SetActive(false);
    }
}
```

#### 8. Agregar Texto de Error
1. **Click derecho en MainPanel → UI → Text - TextMeshPro**
2. **Renombrar a "ErrorText"**
3. **Configurar:**
   - Color: Rojo
   - Font Size: 24
   - Alignment: Center
   - Anchor: Middle-Center
   - Position Y: -150
   - **Desactivar el GameObject inicialmente**

#### 9. Asignar Referencias en el Script
1. **Seleccionar Canvas**
2. **En MainMenuController component:**
   - Arrastrar UserIdInput al campo correspondiente
   - Arrastrar ContinueButton al campo correspondiente
   - Arrastrar ErrorText al campo correspondiente

### Scene 2: ProjectSelection - Paso a Paso

#### 1. Crear la Escena
1. **File → New Scene** → Seleccionar "2D Template"
2. **File → Save As** → Guardar como `ProjectSelection.unity` en carpeta `Assets/Scenes/`

#### 2. Configurar Canvas Principal
1. **Click derecho en Hierarchy → UI → Canvas**
2. **Configurar igual que MainMenu (Canvas Scaler, etc.)**

#### 3. Crear Header Panel
1. **Click derecho en Canvas → UI → Panel**
2. **Renombrar a "HeaderPanel"**
3. **Configurar:**
   - Anchor: Top-Stretch
   - Height: 120
   - Color: Azul oscuro

#### 4. Agregar Título y Usuario
1. **En HeaderPanel, crear Text "ProjectSelectionTitle":**
   - Text: "Seleccionar Proyecto"
   - Font Size: 40
   - Color: Blanco
   - Anchor: Left-Center

2. **En HeaderPanel, crear Text "UserIdDisplay":**
   - Text: "Usuario: [UserID]"
   - Font Size: 24
   - Color: Blanco claro
   - Anchor: Right-Center

#### 5. Crear Scroll View para Proyectos
1. **Click derecho en Canvas → UI → Scroll View**
2. **Renombrar a "ProjectScrollView"**
3. **Configurar:**
   - Anchor: Fill (con margen superior para header)
   - Top: -120, Bottom: 100, Left: 50, Right: -50

#### 6. Configurar Content del Scroll View
1. **Seleccionar Content (hijo de Viewport)**
2. **Agregar Component: Vertical Layout Group**
3. **Configurar Vertical Layout Group:**
   - Spacing: 10
   - Padding: Top: 20, Bottom: 20, Left: 20, Right: 20
   - Child Force Expand Width: True

4. **Agregar Component: Content Size Fitter**
5. **Configurar Content Size Fitter:**
   - Vertical Fit: Preferred Size

#### 7. Crear Prefab de Project Item
1. **Click derecho en Content → UI → Panel**
2. **Renombrar a "ProjectItem"**
3. **Configurar Panel:**
   - Color: Blanco con alpha 0.9
   - Height: 120

4. **Agregar Layout Group al ProjectItem:**
   - Horizontal Layout Group
   - Padding: 20
   - Spacing: 15

5. **Crear elementos del ProjectItem:**

**Imagen del Proyecto:**
```
Click derecho en ProjectItem → UI → Image
- Nombre: "ProjectImage"
- Size: 80x80
- Color: Gris claro
```

**Panel de Información:**
```
Click derecho en ProjectItem → UI → Panel
- Nombre: "InfoPanel"
- Background: Transparente
- Layout Element: Flexible Width: 1

Dentro de InfoPanel:
- Text "ProjectName" (Font Size: 24, Bold)
- Text "ProjectDescription" (Font Size: 16, Color gris)
- Text "MarkerCount" (Font Size: 14, Italic)
```

**Botón Seleccionar:**
```
Click derecho en ProjectItem → UI → Button
- Nombre: "SelectButton"
- Text: "SELECCIONAR"
- Width: 150
- Color: Verde
```

6. **Convertir a Prefab:**
   - Arrastrar ProjectItem a carpeta Assets/Prefabs/
   - Eliminar de la escena

#### 8. Crear Panel de Carga
1. **Click derecho en Canvas → UI → Panel**
2. **Renombrar a "LoadingPanel"**
3. **Configurar:**
   - Anchor: Fill
   - Color: Negro con alpha 0.7

4. **Agregar elementos de carga:**
   - Text "Cargando proyectos..."
   - Image con sprite de loading (opcional)

#### 9. Crear Panel de Botones Inferiores
1. **Click derecho en Canvas → UI → Panel**
2. **Renombrar a "BottomPanel"**
3. **Configurar:**
   - Anchor: Bottom-Stretch
   - Height: 80

4. **Agregar botones:**
   - Button "BackButton": "VOLVER"
   - Button "RefreshButton": "ACTUALIZAR"

#### 10. Crear Script ProjectSelectionController
```csharp
using System.Collections;
using System.Collections.Generic;
using UnityEngine;
using UnityEngine.SceneManagement;
using TMPro;
using UnityEngine.UI;

public class ProjectSelectionController : MonoBehaviour
{
    [Header("UI References")]
    public Transform projectContainer;
    public GameObject projectItemPrefab;
    public GameObject loadingPanel;
    public TextMeshProUGUI userIdDisplay;
    public Button backButton;
    public Button refreshButton;
    
    [Header("No Projects Panel")]
    public GameObject noProjectsPanel;
    public TextMeshProUGUI noProjectsText;
    
    private string currentUserId;
    private List<GameObject> spawnedProjectItems = new List<GameObject>();
    
    void Start()
    {
        currentUserId = PlayerPrefs.GetString("UserId", "Usuario");
        userIdDisplay.text = $"Usuario: {currentUserId}";
        
        // Configurar botones
        backButton.onClick.AddListener(() => SceneManager.LoadScene("MainMenu"));
        refreshButton.onClick.AddListener(LoadProjects);
        
        // Cargar proyectos
        LoadProjects();
    }
    
    public void LoadProjects()
    {
        StartCoroutine(LoadProjectsCoroutine());
    }
    
    IEnumerator LoadProjectsCoroutine()
    {
        loadingPanel.SetActive(true);
        noProjectsPanel.SetActive(false);
        
        // Limpiar proyectos existentes
        foreach (var item in spawnedProjectItems)
        {
            Destroy(item);
        }
        spawnedProjectItems.Clear();
        
        // Obtener proyectos desde API
        yield return APIController.Instance.GetUserProjects((projects) =>
        {
            loadingPanel.SetActive(false);
            
            if (projects.Count == 0)
            {
                noProjectsPanel.SetActive(true);
                noProjectsText.text = "No se encontraron proyectos para este usuario.";
            }
            else
            {
                CreateProjectItems(projects);
            }
        });
    }
    
    void CreateProjectItems(List<ProjectInfo> projects)
    {
        foreach (var project in projects)
        {
            GameObject item = Instantiate(projectItemPrefab, projectContainer);
            
            // Configurar datos del proyecto
            var projectItemController = item.GetComponent<ProjectItemController>();
            if (projectItemController != null)
            {
                projectItemController.SetupProject(project, OnProjectSelected);
            }
            
            spawnedProjectItems.Add(item);
        }
    }
    
    public void OnProjectSelected(string projectClassName)
    {
        PlayerPrefs.SetString("SelectedProject", projectClassName);
        PlayerPrefs.Save();
        
        SceneManager.LoadScene("ARExperience");
    }
}
```

#### 11. Crear Script ProjectItemController
```csharp
using UnityEngine;
using UnityEngine.UI;
using TMPro;
using System;

public class ProjectItemController : MonoBehaviour
{
    [Header("UI Components")]
    public TextMeshProUGUI projectNameText;
    public TextMeshProUGUI projectDescriptionText;
    public TextMeshProUGUI markerCountText;
    public Button selectButton;
    public Image projectImage;
    
    private ProjectInfo projectData;
    private Action<string> onSelectCallback;
    
    public void SetupProject(ProjectInfo project, Action<string> onSelect)
    {
        projectData = project;
        onSelectCallback = onSelect;
        
        // Configurar UI
        projectNameText.text = project.displayName;
        projectDescriptionText.text = $"Clase: {project.className}";
        markerCountText.text = $"Marcadores: {project.markerCount}";
        
        // Configurar botón
        selectButton.onClick.AddListener(() => onSelectCallback?.Invoke(project.className));
        
        // Cargar imagen si existe (opcional)
        // LoadProjectImage();
    }
}
```

### Scene 3: ARExperience - Paso a Paso

#### 1. Crear la Escena
1. **File → New Scene** → Seleccionar "3D Template"
2. **File → Save As** → Guardar como `ARExperience.unity` en carpeta `Assets/Scenes/`

#### 2. Eliminar Objetos por Defecto
1. **Eliminar "Main Camera" de la Hierarchy**
2. **Eliminar "Directional Light" (opcional, mantener si necesitas luz adicional)**

#### 3. Crear AR Session
1. **Click derecho en Hierarchy → XR → AR Session**
2. **Verificar que tiene el component ARSession**

#### 4. Crear AR Session Origin
1. **Click derecho en Hierarchy → XR → AR Session Origin**
2. **Verificar estructura:**
   ```
   AR Session Origin
   ├── AR Camera (con ARCamera component)
   └── (otros objetos AR se crearán aquí)
   ```

#### 5. Configurar AR Camera
1. **Seleccionar AR Camera**
2. **Verificar components:**
   - Camera
   - ARCamera
   - ARCameraManager
   - ARCameraBackground

#### 6. Agregar AR Tracked Image Manager
1. **Seleccionar AR Session Origin**
2. **Add Component → AR Tracked Image Manager**
3. **Configurar:**
   - Max Number Of Moving Images: 3
   - Tracked Image Prefab: (se asignará después)

#### 7. Crear Canvas para UI del AR
1. **Click derecho en Hierarchy → UI → Canvas**
2. **Renombrar a "ARCanvas"**
3. **Configurar Canvas:**
   - Render Mode: Screen Space - Overlay
   - Pixel Perfect: True

#### 8. Crear Panel de Estado
1. **Click derecho en ARCanvas → UI → Panel**
2. **Renombrar a "StatusPanel"**
3. **Configurar:**
   - Anchor: Top-Stretch
   - Height: 100
   - Color: Negro con alpha 0.5

4. **Agregar elementos al StatusPanel:**
   ```
   StatusText (TextMeshPro):
   - Text: "Cargando..."
   - Color: Blanco
   - Alignment: Center
   - Font Size: 24
   ```

#### 9. Crear Panel de Carga
1. **Click derecho en ARCanvas → UI → Panel**
2. **Renombrar a "LoadingPanel"**
3. **Configurar igual que en ProjectSelection**

#### 10. Crear Panel de Instrucciones
1. **Click derecho en ARCanvas → UI → Panel**
2. **Renombrar a "InstructionsPanel"**
3. **Configurar:**
   - Anchor: Bottom-Stretch
   - Height: 150
   - Color: Negro con alpha 0.6

4. **Agregar texto de instrucciones:**
   ```
   InstructionsText:
   - Text: "Apunta la cámara hacia un marcador para ver el contenido"
   - Color: Blanco
   - Font Size: 20
   - Alignment: Center
   ```

#### 11. Crear Prefab de Contenido AR
1. **Click derecho en Hierarchy → Create Empty**
2. **Renombrar a "ARContent"**
3. **Configurar:**
   - Position: (0, 0, 0)
   - Scale: (1, 1, 1)

4. **Agregar Canvas hijo:**
   ```
   Click derecho en ARContent → UI → Canvas
   - Render Mode: World Space
   - Width: 2, Height: 2
   - Scale: 0.001 para todos los ejes
   ```

5. **Crear estructura del contenido:**
   ```
   ARContent
   ├── ContentCanvas (World Space)
   │   └── ContentPanel
   │       ├── TitleText
   │       ├── DescriptionText
   │       ├── ImageContainer
   │       │   └── DisplayImage
   │       ├── VideoContainer
   │       │   └── VideoPlayer
   │       └── NavigationPanel
   │           ├── PreviousButton
   │           └── NextButton
   ├── AudioSource
   └── ModelContainer (para modelos 3D)
   ```

6. **Agregar ContentDisplayer script al ARContent**
7. **Convertir a Prefab:**
   - Arrastrar ARContent a Assets/Prefabs/
   - Eliminar de la escena

#### 12. Configurar AR Tracked Image Manager
1. **Seleccionar AR Session Origin**
2. **En AR Tracked Image Manager:**
   - Tracked Image Prefab: Asignar el prefab ARContent

#### 13. Crear GameObject Principal con ARManager
1. **Click derecho en Hierarchy → Create Empty**
2. **Renombrar a "ARController"**
3. **Agregar script ARManager**
4. **Asignar referencias:**
   - AR Tracked Image Manager
   - AR Camera
   - Content Prefab
   - Loading Panel
   - Status Text

#### 14. Configurar Lighting para AR
1. **Window → Rendering → Lighting**
2. **Environment:**
   - Skybox Material: None
   - Environment Lighting Source: Color
   - Ambient Color: Gris medio
   - Environment Reflections: None

#### 15. Configurar Build Settings
1. **File → Build Settings**
2. **Agregar escenas en orden:**
   - MainMenu
   - ProjectSelection
   - ARExperience

#### 16. Testing en Editor (opcional)
1. **Para testing sin dispositivo, instalar:**
   - AR Foundation Remote (Asset Store)
   - O usar AR Device Simulator

---

**Orden de Navegación:**
`MainMenu` → `ProjectSelection` → `ARExperience`

Cada escena está completamente configurada para funcionar de manera independiente y fluir naturalmente a la siguiente.

## 📱 Prefabs Necesarios

### ARCamera Prefab
```
ARCamera (GameObject)
├── AR Camera (Camera + ARCamera)
├── AR Session (ARSession)
├── AR Session Origin (ARSessionOrigin)
│   └── AR Camera (Child of Session Origin)
└── AR Tracked Image Manager (ARTrackedImageManager)
```

### MarkerContent Prefab
```
MarkerContent (GameObject)
├── ContentDisplayer (Script)
├── Canvas (World Space)
│   ├── ContentPanel
│   │   ├── TitleText (TextMeshPro)
│   │   ├── DescriptionText (TextMeshPro)
│   │   ├── ImageContainer
│   │   │   └── DisplayImage (UI Image)
│   │   ├── VideoContainer
│   │   │   └── VideoPlayer
│   │   └── NavigationButtons
│   │       ├── PreviousButton
│   │       └── NextButton
├── AudioSource
└── ModelContainer (3D Content)
```

## 🔧 Configuraciones Adicionales

### Player Settings (Android)
```
Company Name: Tu Empresa
Product Name: AR Education App
Package Name: com.tuempresa.areducation
Version: 1.0
Bundle Version Code: 1

XR Settings:
- Initialize XR on Startup: True
- Virtual Reality Supported: False

Other Settings:
- Scripting Runtime Version: .NET Standard 2.1
- Api Compatibility Level: .NET Standard 2.1
- Target Architectures: ARM64
```

### Permissions (Android Manifest)
```xml
<uses-permission android:name="android.permission.CAMERA" />
<uses-permission android:name="android.permission.INTERNET" />
<uses-feature android:name="android.hardware.camera.ar" android:required="true" />
```

## 🌐 Para WebGL

### Adicional para WebGL:
1. **WebGL Publisher Settings**:
   - Exception Support: Explicitly Thrown Exceptions Only
   - Compression Format: Brotli
   - Memory Size: 512 MB (mínimo)

2. **WebXR Support**:
   - Usar `WebXR Export` package
   - Configurar para AR Session en navegador

3. **Limitaciones WebGL**:
   - Sin acceso directo a archivos
   - Rendimiento limitado
   - Solo algunos navegadores soportan WebXR

## 📋 Checklist de Testing

### ✅ Pre-Launch Testing:
- [ ] API Health Check funciona
- [ ] Descarga de proyectos exitosa  
- [ ] Marcadores se detectan correctamente
- [ ] Contenido aparece en posición correcta
- [ ] Media (imágenes/videos) cargan correctamente
- [ ] Audio funciona
- [ ] Navegación entre pasos funciona
- [ ] App funciona en diferentes dispositivos
- [ ] Testing en lighting conditions diferentes

## 🚀 Deployment

### Android (.apk)
```bash
1. Build Settings → Android
2. Build → Generate APK
3. Test on device
4. Upload to Google Play Console (opcional)
```

### iOS (.ipa)
```bash
1. Build Settings → iOS  
2. Build → Xcode Project
3. Open in Xcode → Archive
4. Upload to App Store (opcional)
```

### WebGL
```bash
1. Build Settings → WebGL
2. Build → Web Files
3. Upload to web server
4. Access via HTTPS (required for camera)
```

## 🔍 Troubleshooting

### Problemas Comunes:

**❌ "No tracked images detected"**
- Verificar que las imágenes tengan suficiente contraste
- Asegurar buena iluminación
- Confirmar que la biblioteca de imágenes se cargó

**❌ "API Connection Failed"**
- Verificar que el backend esté corriendo
- Comprobar la URL de la API
- Revisar permisos de Internet

**❌ "Content not displaying"**
- Verificar URLs de media
- Comprobar permisos de acceso a Google Drive
- Revisar logs de Unity Console

## 📚 Recursos Adicionales

- [AR Foundation Documentation](https://docs.unity3d.com/Packages/com.unity.xr.arfoundation@5.0/manual/index.html)
- [Google ARCore](https://developers.google.com/ar)
- [Apple ARKit](https://developer.apple.com/arkit/)
- [Unity WebXR](https://docs.unity3d.com/Packages/com.unity.webxr@0.17/manual/index.html)

---

¡Con esta configuración tendrás una aplicación AR completamente funcional que consume los datos educativos desde tu backend! 🎉📱