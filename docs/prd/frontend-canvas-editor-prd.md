# PRD: AREduca Frontend - Canvas AR Template System

## Product Overview

### Vision Statement
Crear un sistema de editor de canvas AR con plantillas predefinidas para la plataforma AREduca que permita a los profesores diseñar experiencias educativas de realidad aumentada de manera intuitiva, resolviendo los problemas de superposición de contenido y mejorando la experiencia de usuario.

### Mission
Desarrollar una interfaz frontend moderna y eficiente que permita a los educadores crear contenido AR estructurado utilizando un sistema de plantillas predefinidas, mientras mantiene la flexibilidad del modo libre para usuarios avanzados.

## Problem Statement

### Current Pain Points
1. **Superposición de Contenido**: El sistema actual de drag-and-drop causa overlapping de elementos AR
2. **Inconsistencia Visual**: Falta de estructuras predefinidas resulta en designs inconsistentes
3. **Curva de Aprendizaje**: Profesores sin experiencia técnica luchan con el posicionamiento libre
4. **Mantenimiento Complejo**: Contenido no estructurado es difícil de mantener y actualizar
5. **Escalabilidad Limitada**: Sistema actual no escala bien para múltiples marcadores por clase

### Target Users
- **Profesores** (Primary): Educadores que crean contenido AR para sus clases
- **Administradores Educativos** (Secondary): Personal que supervisa múltiples profesores
- **Estudiantes** (End Users): Usuarios finales que consumen el contenido AR

## Product Requirements

### Epic 1: Sistema de Plantillas AR
**Objetivo**: Implementar un sistema de plantillas predefinidas para el editor de canvas AR

#### Features
1. **Selector de Plantillas**
   - Galería visual de plantillas predefinidas
   - Categorías: Educativo Simple, Interactivo Completo, Solo Visual, Video Centrado
   - Preview en tiempo real de cada plantilla
   - Aplicación instantánea al canvas

2. **Plantillas Predefinidas**
   - **Educativo Simple**: 2 botones + 1 imagen + 1 texto
   - **Interactivo Completo**: 4 botones + 1 video + 2 textos + 1 imagen
   - **Solo Visual**: 3 imágenes + 1 texto descriptivo
   - **Video Centrado**: 1 video principal + 2 botones + 1 texto

3. **Sistema de Slots**
   - Áreas predefinidas para cada tipo de contenido
   - Visual feedback al arrastrar elementos a slots
   - Restricciones automáticas (máx elementos por tipo)
   - Snap-to-slot functionality

### Epic 2: Editor de Canvas Híbrido
**Objetivo**: Crear un sistema que soporte tanto modo plantilla como modo libre

#### Features
1. **Toggle de Modo de Layout**
   - Switch entre "Modo Plantilla" y "Modo Libre"
   - Transición suave entre modos
   - Preservación de contenido al cambiar modos
   - Indicador visual del modo activo

2. **Canvas de Preview Móvil**
   - Frame realista de teléfono (9:16 ratio)
   - Grid system 4x6 para posicionamiento
   - Visual feedback para selección/hover
   - Zoom controls para detalle

3. **Sistema de Elementos Draggable**
   - Botones (máximo 4 por marcador)
   - Textos (máximo 3 por marcador)
   - Imágenes (máximo 3 por marcador)  
   - Videos (máximo 2 por marcador)

### Epic 3: Gestión de Assets y Google Drive
**Objetivo**: Integrar completamente el sistema con Google Drive para almacenamiento de assets

#### Features
1. **Sistema de Upload de Assets**
   - Drag & drop para subir archivos
   - Validación de tipos de archivo (jpg, png, mp4, txt)
   - Generación automática de thumbnails
   - Progress indicators para uploads

2. **Organización de Archivos**
   - Estructura de carpetas automática por usuario/clase/marcador
   - Naming convention sistemático (imagen.1.1.jpg, video.2.1.mp4)
   - Asset numbering automático por marcador y elemento
   - Cleanup automático de assets no utilizados

3. **Asset Management Panel**
   - Vista previa de todos los assets del proyecto
   - Reemplazo fácil de assets existentes
   - Información de archivos (tamaño, tipo, fecha)
   - Búsqueda y filtrado de assets

### Epic 4: Panel de Propiedades Dinámico
**Objetivo**: Crear un sistema de edición de propiedades contextual para cada elemento

#### Features
1. **Editor de Propiedades de Botones**
   - Text content input
   - Color picker para background
   - Selector de acción (show_explanation, play_sound, etc.)
   - Icon selector
   - Preview en tiempo real

2. **Editor de Propiedades de Imágenes**
   - File upload con preview
   - Alt text input
   - Border radius slider
   - Opacity slider
   - Crop/resize tools

3. **Editor de Propiedades de Videos**
   - File upload con preview
   - Autoplay toggle
   - Controls toggle
   - Loop toggle
   - Thumbnail selection

4. **Editor de Propiedades de Texto**
   - Content textarea con rich text
   - Font size slider
   - Color picker
   - Alignment options (left, center, right)
   - Font weight selector

### Epic 5: Wizard de Creación de Clases
**Objetivo**: Streamlinar el proceso de creación de clases con un wizard de 3 pasos

#### Features
1. **Paso 1: Información Básica**
   - Input de título de clase
   - Textarea de descripción
   - Ejemplos sugeridos por categoría
   - Tips panel con mejores prácticas

2. **Paso 2: Configuración de Marcadores**
   - Upload de imágenes de marcador base
   - Guidelines para mejores resultados
   - Lista numerada de marcadores añadidos
   - Demo visual del proceso de reconocimiento

3. **Paso 3: Diseño de Experiencia AR**
   - Canvas editor con todas las funcionalidades
   - Template selector
   - Elements palette
   - Properties panel
   - Preview mode

## Technical Specifications

### Frontend Architecture
- **Framework**: React 18.3.1 con TypeScript
- **Styling**: TailwindCSS 3.4.1
- **Build Tool**: Vite 6.3.5
- **Drag & Drop**: React Draggable 4.4.6 + React Resizable 3.0.5
- **Icons**: Lucide React 0.344.0

### Data Models

#### Template Definition
```typescript
interface Template {
  id: string
  name: string
  description: string
  category: 'simple' | 'interactive' | 'visual' | 'video'
  preview: string
  slots: TemplateSlot[]
  maxElements: {
    buttons: number
    images: number
    videos: number
    texts: number
  }
}
```

#### Template Slot
```typescript
interface TemplateSlot {
  id: string
  type: 'button' | 'image' | 'video' | 'text'
  position: { x: number, y: number }
  size: { width: number, height: number }
  constraints: string[]
  required: boolean
}
```

#### AR Canvas Element
```typescript
interface ARCanvasElement {
  id: string
  type: 'button' | 'image' | 'video' | 'text'
  position: { x: number, y: number }
  size: { width: number, height: number }
  slotId?: string // para modo plantilla
  properties: Record<string, any>
  assetUrl?: string
  thumbnailUrl?: string
  fileName: string // formato: tipo.marcador.elemento.ext
}
```

### Component Architecture

#### Core Components
- **ClassCreationWizard**: Wizard principal de 3 pasos
- **TemplateSelector**: Selector visual de plantillas
- **CanvasEditor**: Editor principal del canvas AR
- **ElementPalette**: Palette de elementos draggables
- **PropertiesPanel**: Panel dinámico de propiedades
- **AssetUploader**: Componente de upload a Google Drive
- **PhonePreview**: Preview container con frame móvil

#### Utility Components
- **DragDropCanvas**: Canvas con funcionalidad drag & drop
- **GridOverlay**: Sistema de grid visual
- **ElementRenderer**: Renderizador de elementos AR
- **AssetManager**: Gestor de assets y thumbnails

### Google Drive Integration

#### Folder Structure
```
Google Drive:
├── AR_Education_Platform/
│   ├── Users/
│   │   ├── {userName}__{userId}/
│   │   │   ├── classes/
│   │   │   │   ├── {className}__{classId}/
│   │   │   │   │   ├── class_info.json
│   │   │   │   │   ├── class_qr_code.png
│   │   │   │   │   ├── markers/
│   │   │   │   │   │   ├── marker1__{markerId}/
│   │   │   │   │   │   │   ├── base_image.jpg
│   │   │   │   │   │   │   ├── marker_config.json
│   │   │   │   │   │   │   ├── assets/
│   │   │   │   │   │   │   │   ├── imagen.1.1.jpg
│   │   │   │   │   │   │   │   ├── video.1.1.mp4
│   │   │   │   │   │   │   │   ├── boton.1.1.json
```

#### Asset Naming Convention
- **Imágenes**: `imagen.{markerNumber}.{elementNumber}.ext`
- **Videos**: `video.{markerNumber}.{elementNumber}.ext`
- **Botones**: `boton.{markerNumber}.{elementNumber}.json`
- **Textos**: `texto.{markerNumber}.{elementNumber}.txt`
- **Thumbnails**: `thumb.{markerNumber}.{elementNumber}.ext`

### Export Format for External Consumption

#### Class Data Export
```json
{
  "classId": "math_class_2024_01",
  "className": "Matemáticas Básicas",
  "teacherId": "user_123",
  "teacherName": "Prof. Maria González",
  "markers": [
    {
      "markerId": "marker_fractions_01",
      "markerNumber": 1,
      "markerName": "Fracciones Básicas",
      "baseImage": {
        "driveUrl": "https://drive.google.com/uc?id=base_image_id",
        "fileName": "base_image.jpg"
      },
      "canvas": {
        "elements": [
          {
            "id": "btn_explain_fractions",
            "type": "button",
            "elementNumber": 1,
            "fileName": "boton.1.1.json",
            "position": { "x": 0.2, "y": 0.3 },
            "content": {
              "text": "Explicar Fracciones",
              "action": "show_explanation",
              "backgroundColor": "#FF6B35",
              "textColor": "#FFFFFF"
            },
            "assetUrl": "https://drive.google.com/uc?id=button_asset_id"
          }
        ]
      }
    }
  ]
}
```

## User Experience Design

### User Flow: Crear Nueva Clase

1. **Dashboard** → Click "Crear Nueva Clase"
2. **Paso 1**: Información Básica
   - Input título de clase
   - Input descripción (opcional)
   - Ver ejemplos sugeridos
   - Click "Siguiente"

3. **Paso 2**: Configuración de Marcadores
   - Upload imagen de marcador base
   - Ver guidelines de calidad
   - Añadir marcadores adicionales (opcional)
   - Click "Continuar"

4. **Paso 3**: Diseño de Experiencia AR
   - Seleccionar plantilla predefinida O modo libre
   - Arrastrar elementos desde palette al canvas
   - Configurar propiedades de cada elemento
   - Upload assets (imágenes, videos)
   - Preview del resultado
   - Click "Crear Clase"

5. **Resultado**: QR Code generado y clase guardada

### Design Principles

1. **Simplicidad**: Interfaz limpia y minimalista
2. **Consistencia**: Patrones visuales consistentes en toda la app
3. **Feedback Visual**: Indicadores claros de estado y acciones
4. **Accesibilidad**: Cumplimiento de estándares WCAG 2.1
5. **Responsividad**: Funcional en dispositivos desktop y tablet

## Success Metrics

### Primary KPIs
- **Reducción de Overlap**: 90% reducción en problemas de superposición
- **Tiempo de Creación**: 50% reducción en tiempo promedio de creación de clases
- **Adopción de Plantillas**: 70% de nuevas clases usan modo plantilla
- **Satisfacción del Usuario**: Score NPS > 70

### Secondary KPIs
- **Error Rate**: <5% de clases con problemas de assets
- **Asset Upload Success**: >95% éxito en uploads a Google Drive
- **Performance**: Canvas editor responsive en <200ms
- **Mobile Preview**: Preview rendering en <1 segundo

## Implementation Timeline

### Phase 1: Core Template System (3 semanas)
- Template selector component
- Basic template definitions
- Slot-based rendering system
- Mode toggle functionality

### Phase 2: Canvas Editor Enhancement (3 semanas)
- Hybrid canvas editor (template + freeform)
- Enhanced drag & drop with constraints
- Properties panel development
- Mobile preview container

### Phase 3: Google Drive Integration (2 semanas)
- Asset upload system
- Folder structure automation
- Asset naming convention
- File management panel

### Phase 4: Wizard & Polish (2 semanas)
- 3-step creation wizard
- UI/UX improvements
- Performance optimization
- Testing & bug fixes

## Risk Assessment

### Technical Risks
- **Google Drive API Limits**: Mitigar con caching y batch operations
- **Browser Performance**: Optimizar rendering con virtual scrolling
- **Asset File Sizes**: Implementar compresión automática
- **Cross-browser Compatibility**: Testing extensivo en browsers principales

### UX Risks
- **Learning Curve**: Mitigar con onboarding progresivo y tooltips
- **Template Limitations**: Ofrecer modo libre como fallback
- **Performance Perception**: Loading states y skeleton screens

### Business Risks
- **User Adoption**: Plan de rollout gradual con feedback loops
- **Backward Compatibility**: Mantener soporte para clases existentes
- **Scalability**: Arquitectura preparada para crecimiento

## Next Steps

1. **Design Review**: Validar mockups con stakeholders
2. **Technical Spike**: Prototipar Google Drive integration
3. **User Testing**: Validar flujo con profesores reales
4. **Development Kickoff**: Iniciar implementación Phase 1

---

*Este PRD se enfoca exclusivamente en el desarrollo frontend del sistema de plantillas para el editor de canvas AR, sin considerar integración directa con Unity. Los datos exportados serán consumidos por sistemas externos a través de la estructura de archivos en Google Drive.*