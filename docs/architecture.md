# AR Education Platform - Template System Enhancement Architecture

## Introduction

This document outlines the architectural approach for enhancing the AR Education Platform with a template-based layout system for StepPreview components. The primary goal is to solve content overlap issues while maintaining Unity integration for AR marker scanning functionality.

**Relationship to Existing Architecture:**
This document supplements the existing React/Express.js architecture by defining how template-based layouts will integrate with current systems, providing structured content positioning while maintaining Google Drive storage integration.

### Existing Project Analysis

**Current Project State:**
- **Primary Purpose:** AR Education Platform enabling marker-based content display in Unity
- **Current Tech Stack:** React 18.3.1 + TypeScript + Express.js + Google Drive APIs
- **Architecture Style:** Full-stack web application with separate frontend (BOLT/) and backend (api-backend/) services
- **Deployment Method:** Development setup with Vite for frontend, Node.js for backend

**Available Documentation:**
- Package.json files indicating project structure and dependencies
- Existing component library with StepPreview, Layout, and page components

**Identified Constraints:**
- Frontend constrained to React ecosystem with TypeScript
- Backend using Google Drive for file storage and retrieval
- Unity requires JSON format for AR marker data consumption
- No existing test framework identified in either frontend or backend
- Development-focused setup with existing drag/drop positioning causing overlap issues

## Enhancement Scope and Integration Strategy

**Enhancement Overview:**
- **Enhancement Type:** UI/UX Architecture Enhancement - Template-Based Layout System
- **Scope:** Replace/supplement free-form content positioning with predefined template slots in StepPreview
- **Integration Impact:** Medium - Affects content rendering, data models, and Unity data consumption

**Integration Approach:**
- **Code Integration Strategy:** Hybrid system supporting both template and freeform modes in StepPreview component
- **Database Integration:** Google Drive JSON storage with enhanced data structure for Unity consumption
- **API Integration:** Enhanced backend endpoints for template management and Unity data format
- **UI Integration:** New template selection components with slot-based content placement

**Compatibility Requirements:**
- **Existing API Compatibility:** Maintain backward compatibility with existing ARContent data structure
- **Database Schema Compatibility:** Gradual migration from position-based to slot-based content storage in Google Drive
- **UI/UX Consistency:** Preserve existing content rendering while adding template layout options
- **Performance Impact:** Improved layout performance with predefined positioning, Unity-optimized JSON format

## Tech Stack Alignment

**Existing Technology Stack Integration:**

| Category | Current Technology | Version | Usage in Enhancement | Notes |
|----------|-------------------|---------|---------------------|-------|
| Frontend Framework | React | 18.3.1 | Core component refactoring | Maintain existing React patterns |
| Type System | TypeScript | 5.5.3 | Extended interfaces for templates | Add template/slot type definitions |
| Styling | TailwindCSS | 3.4.1 | Template layout styling | Use existing utility classes for layouts |
| Build Tool | Vite | 6.3.5 | No changes required | Existing build process sufficient |
| UI Components | Lucide React | 0.344.0 | Keep existing icons | Template selection UI icons |
| Drag/Drop Library | React Draggable | 4.4.6 | **KEEP** | Maintain for free-form mode |
| Resize Library | React Resizable | 3.0.5 | **KEEP** | Maintain for free-form mode |
| Storage | Google Drive APIs | Latest | Enhanced JSON structure | Unity-compatible data format |

**Hybrid Layout System Architecture:**
- **Layout Mode Toggle:** Users can switch between "Template Mode" and "Free-form Mode"
- **Template Mode:** Predefined slots with CSS Grid/Flexbox layouts
- **Free-form Mode:** Existing drag/drop functionality (current behavior)
- **Unity Integration:** JSON export format optimized for Unity AR marker consumption

## Data Models and Schema Changes

**New Data Models:**

### Template Definition Model
**Purpose:** Define available layout templates with predefined content slots for Unity positioning
**Integration:** New model that works alongside existing ARContent system

**Key Attributes:**
- `id: string` - Unique template identifier
- `name: string` - Display name for template selection
- `slots: TemplateSlot[]` - Array of predefined content slots with Unity coordinates
- `unityScale: number` - Default scale factor for Unity world positioning
- `contentLimits: Record<ContentType, number>` - Content limits per template

### Template Slot Model
**Purpose:** Define individual content placement areas with Unity 3D positioning
**Integration:** Slots map to Unity world coordinates for AR marker positioning

**Key Attributes:**
- `id: string` - Unique slot identifier
- `position: {x: number, y: number, z: number}` - Unity world position relative to marker
- `size: {width: number, height: number}` - Predefined dimensions for Unity scaling
- `contentTypes: ContentType[]` - Allowed content types for this slot
- `required: boolean` - Whether slot must be filled

### Enhanced ARContent Model
**Purpose:** Support both template slots and Unity positioning data
**Integration:** Backward compatible extension of existing ARContent interface

**Key Attributes:**
- All existing ARContent properties maintained
- `slotId?: string` - Template slot assignment (template mode)
- `unityPosition?: Vector3` - Unity world coordinates (freeform mode)
- `googleDriveAssets: {main: string, thumbnail?: string}` - Google Drive file IDs

**Google Drive Schema Integration:**

**Folder Structure:**
```
Google Drive:
├── AR_Projects/
│   ├── {userId}/
│   │   ├── {projectId}/
│   │   │   ├── markers/
│   │   │   │   └── {markerId}.json     # Unity-compatible AR layout
│   │   │   ├── assets/
│   │   │   │   ├── images/
│   │   │   │   ├── videos/
│   │   │   │   └── audio/
│   │   │   └── templates/
│   │   │       └── custom_templates.json
```

**Unity JSON Format:**
```json
{
  "markerId": "marker_123",
  "version": "1.0",
  "layout": {
    "mode": "template",
    "templateId": "grid_2x2",
    "worldScale": 1.0,
    "contents": [
      {
        "id": "content_1",
        "type": "button",
        "slotId": "top_left",
        "unityPosition": {"x": -0.5, "y": 0.5, "z": 0},
        "data": {"title": "Click Me", "action": "navigate"},
        "assets": {"main": "googleDriveFileId123"}
      }
    ]
  }
}
```

## Component Architecture

**New Components:**

### TemplateSelector Component
**Responsibility:** Template browsing and selection UI
**Integration:** Integrates with StepPreview layout mode state

**Key Interfaces:**
- `selectedTemplate?: string` - Currently active template
- `onTemplateSelect(templateId: string): void` - Template selection callback
- `availableTemplates: Template[]` - Available template definitions

### LayoutModeToggle Component  
**Responsibility:** Switch between template and freeform layout modes
**Integration:** Controls StepPreview rendering mode

**Key Interfaces:**
- `mode: 'template' | 'freeform'` - Current layout mode
- `onModeChange(mode: LayoutMode): void` - Mode switching callback

### TemplateSlotRenderer Component
**Responsibility:** Render content slots using CSS Grid positioning
**Integration:** Replaces drag/drop when in template mode

**Key Interfaces:**
- `slot: TemplateSlot` - Slot definition with Unity positioning
- `content?: ARContent` - Content assigned to slot
- `onContentAssign(contentId: string, slotId: string): void` - Content assignment

### Enhanced StepPreview Component
**Responsibility:** Orchestrate both template and freeform rendering modes
**Integration:** Central component integrating all template functionality

**Enhanced Interfaces:**
- All existing props maintained for backward compatibility
- `layoutMode: LayoutMode` - Controls rendering approach
- `selectedTemplate?: Template` - Active template for slot-based rendering
- `onUnityExport?: () => UnityARData` - Generate Unity-compatible data format

## Source Tree Integration

**New File Organization:**
```
BOLT/
├── src/
│   ├── components/
│   │   ├── StepPreview.tsx                    # Enhanced - backward compatible
│   │   ├── templates/                         # New template components
│   │   │   ├── TemplateSelector.tsx
│   │   │   ├── LayoutModeToggle.tsx
│   │   │   ├── TemplateSlotRenderer.tsx
│   │   │   └── index.ts                       # Export barrel
│   ├── types/
│   │   ├── index.ts                           # Extended with template types
│   │   └── templates.ts                       # New template type definitions
│   ├── data/
│   │   └── templates/                         # Template definitions
│   │       ├── defaultTemplates.ts            # Predefined templates with Unity positioning
│   │       └── index.ts
│   ├── utils/
│   │   ├── templateUtils.ts                   # Template helper functions
│   │   ├── unityDataExport.ts                 # Unity JSON format generation
│   │   └── googleDriveTemplates.ts            # Google Drive template storage
```

**Integration Guidelines:**
- **File Naming:** Follow existing camelCase patterns
- **Folder Organization:** Group template functionality in dedicated subfolders
- **Import/Export Patterns:** Use barrel exports for clean component imports

## Infrastructure and Deployment Integration

**Existing Infrastructure:**
- **Current Deployment:** Development setup with Vite dev server and Node.js backend
- **Infrastructure Tools:** Google Drive APIs, Express.js server
- **Environments:** Development environment with local file structure

**Enhancement Deployment Strategy:**
- **Deployment Approach:** Incremental deployment maintaining existing development setup
- **Infrastructure Changes:** Enhanced Google Drive folder structure, new API endpoints
- **Pipeline Integration:** Existing build process with additional template asset management

**Unity Integration Strategy:**
- **Data Export:** New API endpoints generating Unity-compatible JSON format
- **Asset Management:** Google Drive file ID references for Unity asset loading
- **Real-time Updates:** Unity polling mechanism for marker data updates

## Testing Strategy

**Integration with Existing Tests:**
- **Existing Test Framework:** No formal testing framework identified
- **Test Organization:** Recommend implementing Jest + React Testing Library
- **Coverage Requirements:** Focus on template rendering and Unity data export

**New Testing Requirements:**

### Unit Tests for Template Components
- **Framework:** Jest + React Testing Library (recommended)
- **Location:** `src/components/templates/__tests__/`
- **Coverage Target:** 80% for new template functionality
- **Integration:** Test template selection, slot rendering, mode switching

### Unity Integration Tests
- **Scope:** Unity JSON format validation and Google Drive integration
- **Validation:** Ensure exported JSON matches Unity expected format
- **Asset Loading:** Test Google Drive file ID resolution

### Template System Tests
- **Template Rendering:** Verify slot positioning and content assignment
- **Mode Switching:** Test seamless switching between template and freeform modes
- **Backward Compatibility:** Ensure existing projects continue working

## Security Integration

**Existing Security Measures:**
- **Authentication:** User-based Google Drive folder isolation
- **Authorization:** Google Drive API key management
- **Data Protection:** User data separation through folder structure

**Enhancement Security Requirements:**
- **Template Security:** Validate template definitions to prevent XSS
- **Unity Data Security:** Sanitize JSON output for Unity consumption
- **Asset Security:** Maintain Google Drive file access controls

## Implementation Roadmap

### Phase 1: Core Template System (Week 1-2)
- Implement template data models and TypeScript interfaces
- Create TemplateSelector and LayoutModeToggle components
- Enhance StepPreview with mode switching capability

### Phase 2: Slot-Based Rendering (Week 3-4)
- Implement TemplateSlotRenderer with CSS Grid positioning
- Create default template definitions with Unity coordinates
- Integrate template mode with existing content rendering

### Phase 3: Unity Data Pipeline (Week 5-6)
- Implement Unity JSON export functionality
- Create Google Drive enhanced folder structure
- Develop Unity-compatible data format generation

### Phase 4: Google Drive Integration (Week 7)
- Enhance backend API for template storage
- Implement Google Drive template management
- Create Unity asset reference system

### Phase 5: Testing and Polish (Week 8)
- Implement comprehensive testing suite
- Performance optimization for Unity data loading
- User experience refinement and documentation

## Success Metrics

- **Overlap Reduction:** 90% reduction in content overlap issues
- **Unity Performance:** Marker data loading in <2 seconds
- **Backward Compatibility:** 100% compatibility with existing projects
- **User Adoption:** Template mode usage in 70% of new projects
- **Developer Experience:** Reduced development time for AR content creation

## Next Steps

### Story Manager Handoff
Create implementation stories focusing on:
- Template component development with Unity positioning requirements
- Google Drive integration for scalable asset storage
- Backward compatibility validation for existing AR projects
- Unity JSON format optimization for mobile performance

### Developer Handoff  
Begin implementation with:
- Template TypeScript interface definitions based on Unity coordinate system
- TemplateSelector component following existing React patterns
- Enhanced StepPreview with conditional rendering for dual-mode support
- Google Drive API integration for template and asset storage

---

🚀 **Generated with [Claude Code](https://claude.ai/code)**

Co-Authored-By: Claude <noreply@anthropic.com>