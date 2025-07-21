# Epic 1: Core Template System Foundation

## Epic Overview
**Duration:** Week 1-2  
**Phase:** Foundation Phase  
**Goal:** Establish the foundational template system with data models and basic UI components for AR Education Platform layout enhancement.

## Epic Description
Implement the core template system foundation that will enable template-based layouts for StepPreview components, replacing the current free-form positioning that causes content overlap issues in Unity AR marker scanning.

## User Stories

### Story 1.1: Template Data Models and TypeScript Interfaces
**As a** developer  
**I want** TypeScript interfaces and data models for templates and slots  
**so that** the template system has type safety and clear data structures for Unity integration

**Acceptance Criteria:**
1. Template interface includes id, name, slots array, unityScale, and contentLimits
2. TemplateSlot interface includes id, Unity position (x,y,z), size (width,height), contentTypes array, and required boolean
3. Enhanced ARContent interface maintains backward compatibility and adds optional slotId and unityPosition
4. All interfaces exported from types/templates.ts with proper TypeScript documentation
5. Data models support Unity coordinate system requirements

### Story 1.2: TemplateSelector Component Development  
**As a** content creator  
**I want** a UI component to browse and select layout templates  
**so that** I can choose predefined layouts instead of manually positioning content

**Acceptance Criteria:**
1. Component displays available templates in a grid layout using TailwindCSS
2. Template previews show slot positions visually
3. Component accepts selectedTemplate prop and onTemplateSelect callback
4. Component integrates with existing React 18.3.1 patterns
5. Uses Lucide React icons for template visualization
6. Responsive design works on desktop and tablet viewports

### Story 1.3: LayoutModeToggle Component
**As a** content creator  
**I want** to switch between template mode and free-form mode  
**so that** I can choose the layout approach that best fits my content needs

**Acceptance Criteria:**
1. Toggle component switches between 'template' and 'freeform' modes
2. Visual indicator shows current mode state clearly
3. Component accepts mode prop and onModeChange callback
4. Uses existing TailwindCSS styling patterns
5. Maintains accessibility standards with proper ARIA labels
6. Smooth transition animations between modes

### Story 1.4: Enhanced StepPreview with Mode Switching
**As a** content creator  
**I want** the StepPreview component to support both template and free-form modes  
**so that** I have flexibility in how I arrange AR content while maintaining Unity compatibility

**Acceptance Criteria:**
1. StepPreview maintains all existing functionality for backward compatibility
2. New layoutMode prop controls rendering approach (template vs freeform)
3. Template mode renders using slot-based positioning
4. Free-form mode preserves existing drag/drop behavior with React Draggable and React Resizable
5. Mode switching preserves content data without loss
6. Component exports Unity-compatible data format when requested
7. Performance remains equivalent to current implementation

## Technical Context from Architecture

### Key Technologies
- **React:** 18.3.1 with TypeScript 5.5.3
- **Styling:** TailwindCSS 3.4.1 
- **Build:** Vite 6.3.5
- **Drag/Drop:** React Draggable 4.4.6 (maintained for free-form mode)
- **Resize:** React Resizable 3.0.5 (maintained for free-form mode)
- **Icons:** Lucide React 0.344.0

### Integration Requirements
- Maintain backward compatibility with existing ARContent data structure
- Support Unity coordinate system for 3D positioning
- Integrate with Google Drive APIs for asset storage
- Follow existing React patterns and component organization

### File Organization
```
BOLT/src/
├── components/
│   ├── StepPreview.tsx (enhanced)
│   └── templates/ (new)
│       ├── TemplateSelector.tsx
│       ├── LayoutModeToggle.tsx
│       └── index.ts
├── types/
│   ├── index.ts (extended)
│   └── templates.ts (new)
```

## Definition of Done
- [ ] All TypeScript interfaces defined with Unity coordinate support
- [ ] TemplateSelector component renders template options visually
- [ ] LayoutModeToggle provides clear mode switching
- [ ] StepPreview supports both modes without breaking existing functionality
- [ ] Code follows existing React/TypeScript patterns
- [ ] Components are properly exported and importable
- [ ] No regression in existing drag/drop functionality