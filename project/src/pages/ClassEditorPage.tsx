import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { 
  Plus, Trash2, Copy, ArrowLeft, Link as LinkIcon, 
  Image, FileText, Video, Music, Loader2, UploadCloud, AlertCircle, 
  ArrowRight, Layout, BookOpen, Check
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { getClassById, saveClass } from '../utils/storage';
import { ARClass, MarkerObject, ARStep, ARContent, ContentType, ButtonAction } from '../types';
import FloatingSubmitButton from '../components/FloatingSubmitButton';
import QRCodeModal from '../components/QRCodeModal';

interface FormData {
  title: string;
  description: string;
}

const defaultContent = (type: ContentType): Omit<ARContent, 'id'> => ({
  type: type,
  value: '',
  title: '',
  // action and actionValue will be added if type is button
});

const defaultStep: Omit<ARStep, 'id'> = {
  contents: [], 
};

const defaultMarkerObject: Omit<MarkerObject, 'id'> = {
  markerImage: '',
  steps: [{ id: `step_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`, contents: [] }],
};

// Define el tipo para el estado de la página de edición (para manejar la navegación entre secciones)
// Type for the editing page step (used to manage navigation between sections)
type EditorStep = 'class-details' | 'marker-list' | 'marker-editor' | 'step-editor';

const ClassEditorPage = () => {
  const { classId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  
  const [currentEditorStep, setCurrentEditorStep] = useState<EditorStep>('class-details');
  // const [selectedTypes, setSelectedTypes] = useState<ContentType[]>([]); // Eliminado, se maneja por paso
  const [isLoading, setIsLoading] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [showQRModal, setShowQRModal] = useState(false);
  const [activeMarkerIndex, setActiveMarkerIndex] = useState(0);
  const [activeStepIndex, setActiveStepIndex] = useState(0); // Nuevo estado para el paso activo
  const [error, setError] = useState('');
  
  const [arClass, setArClass] = useState<ARClass>(() => {
    const newClassId = classId || `class_${Date.now()}`;
    const initialUserId = user?.id || '';
    return {
      id: newClassId,
      title: '',
      description: '',
      thumbnail: '',
      markerObjects: [{ 
        id: `marker_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        ...defaultMarkerObject 
      }],
      createdAt: Date.now(),
      updatedAt: Date.now(),
      userId: initialUserId,
    };
  });
  
  const { 
    register, 
    handleSubmit, 
    setValue,
    formState: { errors }, 
  } = useForm<FormData>();
  
  useEffect(() => {
    if (user && !arClass.userId) {
      setArClass(prev => ({ ...prev, userId: user.id }));
    }
    if (classId) {
      const existingClass = getClassById(classId);
      if (existingClass) {
        setArClass({
          ...existingClass,
          userId: existingClass.userId || user?.id || '',
          markerObjects: existingClass.markerObjects.map((mo: MarkerObject) => ({
            ...mo,
            steps: (mo.steps && mo.steps.length > 0) 
              ? mo.steps.map((st: ARStep) => ({
                  ...st,
                  contents: st.contents || [],
                })) 
              : [{ id: `step_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`, ...defaultStep }],
          })),
        });
        setValue('title', existingClass.title);
        setValue('description', existingClass.description);
        setCurrentEditorStep('marker-list'); 
      } else {
        navigate('/editor'); // O a una página de error/nueva clase
      }
    } 
  }, [classId, navigate, setValue, user, arClass.userId]);

  // UI Content Types (para la selección en la UI, si se necesita)
  const contentTypesMeta = [
    { type: 'text' as ContentType, icon: FileText, label: 'Texto', description: 'Añade contenido textual.' },
    { type: 'image' as ContentType, icon: Image, label: 'Imagen', description: 'Incluye imágenes.' },
    { type: 'video' as ContentType, icon: Video, label: 'Video', description: 'Integra videos.' },
    { type: 'url' as ContentType, icon: LinkIcon, label: 'Enlace', description: 'Vincula a recursos externos.' },
    { type: 'audio' as ContentType, icon: Music, label: 'Audio', description: 'Agrega clips de audio.' },
    { type: 'button' as ContentType, icon: ArrowRight, label: 'Botón', description: 'Añade un botón interactivo.' },
  ];

  // ----- Funciones para Marcadores -----
  const addMarkerObject = () => {
    setArClass(prev => ({
      ...prev,
      markerObjects: [
        ...prev.markerObjects,
        { 
          id: `marker_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
          ...defaultMarkerObject
        },
      ],
    }));
    setActiveMarkerIndex(arClass.markerObjects.length);
    setActiveStepIndex(0); 
    setCurrentEditorStep('marker-editor');
  };
  
  const removeMarkerObject = (index: number) => {
    if (arClass.markerObjects.length <= 1 && index === 0) {
        setError("No se puede eliminar el único marcador.");
        return;
    }
    const newMarkers = arClass.markerObjects.filter((_, i) => i !== index);
    setArClass(prev => ({
      ...prev,
      markerObjects: newMarkers,
    }));

    if (activeMarkerIndex >= index && activeMarkerIndex > 0) {
      setActiveMarkerIndex(prevActive => prevActive - 1);
    } else if (newMarkers.length > 0 && activeMarkerIndex >= newMarkers.length) {
      setActiveMarkerIndex(newMarkers.length - 1);
    }

    if (newMarkers.length === 0) {
        setCurrentEditorStep('class-details') 
    } else if (activeMarkerIndex >= newMarkers.length ){
        setActiveMarkerIndex(newMarkers.length -1)
    }
  };
    
  const handleMarkerImageChange = (markerIdx: number, imageDataUrl: string) => {
    setArClass(prev => {
      const updatedMarkers = [...prev.markerObjects];
      updatedMarkers[markerIdx] = {
        ...updatedMarkers[markerIdx],
        markerImage: imageDataUrl,
      };
      // Si es el primer marcador y no hay thumbnail, usar esta imagen
      if (markerIdx === 0 && !prev.thumbnail) {
        return {
          ...prev,
          markerObjects: updatedMarkers,
          thumbnail: imageDataUrl,
        };
      }
      return {
        ...prev,
        markerObjects: updatedMarkers,
      };
    });
  };

  const handleImageUpload = (markerIdx: number, event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        handleMarkerImageChange(markerIdx, reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  // ----- Funciones para Pasos (Steps) -----
  const addStepToMarker = (markerIdx: number) => {
    setArClass(prev => {
      const updatedMarkers = [...prev.markerObjects];
      const newStep: ARStep = {
        id: `step_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        contents: [],
      };
      updatedMarkers[markerIdx] = {
        ...updatedMarkers[markerIdx],
        steps: [...updatedMarkers[markerIdx].steps, newStep],
      };
      return { ...prev, markerObjects: updatedMarkers };
    });
    setActiveStepIndex(arClass.markerObjects[markerIdx].steps.length);
  };

  const removeStepFromMarker = (markerIdx: number, stepIdx: number) => {
    if (arClass.markerObjects[markerIdx].steps.length <= 1 && stepIdx === 0) {
        setError("No se puede eliminar el único paso de un marcador.");
        return;
    }
    const currentMarker = arClass.markerObjects[markerIdx];
    const newSteps = currentMarker.steps.filter((_: ARStep, i: number) => i !== stepIdx);

    setArClass(prev => {
      const updatedMarkers = [...prev.markerObjects];
      updatedMarkers[markerIdx] = {
        ...updatedMarkers[markerIdx],
        steps: newSteps,
      };
      return { ...prev, markerObjects: updatedMarkers };
    });

    if (activeStepIndex >= stepIdx && activeStepIndex > 0) {
      setActiveStepIndex(prevActive => prevActive - 1);
    } else if (newSteps.length > 0 && activeStepIndex >= newSteps.length) {
        setActiveStepIndex(newSteps.length -1);
    }

    if (newSteps.length === 0){
        // Handled by potentially setting activeStepIndex to 0 or navigating
        // No specific navigation here, relies on activeStepIndex update
    } else if (activeStepIndex >= newSteps.length ) {
        setActiveStepIndex(newSteps.length -1)
    }
  };

  // ----- Funciones para Contenido (ARContent) dentro de un Paso -----
  const addContentToStep = (markerIdx: number, stepIdx: number, type: ContentType) => {
    setArClass(prev => {
      const updatedMarkers = [...prev.markerObjects];
      const updatedSteps = [...updatedMarkers[markerIdx].steps];
      const newContent: ARContent = {
        id: `content_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        type: type,
        value: '',
        ...(type === 'button' ? { action: 'nextStep', actionValue: '' } : {}) // Default for button
      };
      updatedSteps[stepIdx] = {
        ...updatedSteps[stepIdx],
        contents: [...updatedSteps[stepIdx].contents, newContent],
      };
      updatedMarkers[markerIdx] = { ...updatedMarkers[markerIdx], steps: updatedSteps };
      return { ...prev, markerObjects: updatedMarkers };
    });
  };

  const updateContentInStep = (markerIdx: number, stepIdx: number, contentIdx: number, newContent: Partial<ARContent>) => {
    setArClass(prev => {
      const updatedMarkers = [...prev.markerObjects];
      const updatedSteps = [...updatedMarkers[markerIdx].steps];
      const updatedContents = [...updatedSteps[stepIdx].contents];
      updatedContents[contentIdx] = { ...updatedContents[contentIdx], ...newContent };
      updatedSteps[stepIdx] = { ...updatedSteps[stepIdx], contents: updatedContents };
      updatedMarkers[markerIdx] = { ...updatedMarkers[markerIdx], steps: updatedSteps };
      return { ...prev, markerObjects: updatedMarkers };
    });
  };

  const removeContentFromStep = (markerIdx: number, stepIdx: number, contentIdx: number) => {
    setArClass(prev => {
      const updatedMarkers = [...prev.markerObjects];
      const updatedSteps = [...updatedMarkers[markerIdx].steps];
      updatedSteps[stepIdx] = {
        ...updatedSteps[stepIdx],
        contents: updatedSteps[stepIdx].contents.filter((_: ARContent, i: number) => i !== contentIdx),
      };
      updatedMarkers[markerIdx] = { ...updatedMarkers[markerIdx], steps: updatedSteps };
      return { ...prev, markerObjects: updatedMarkers };
    });
  };
  
  // ----- Submit ----- 
  const onSubmit = (data: FormData) => {
    setError('');
    if (!arClass.markerObjects.some(marker => marker.markerImage)) {
      setError('Al menos un marcador debe tener una imagen asignada.');
      return;
    }
    if (arClass.markerObjects.some(marker => marker.markerImage && marker.steps.every((step: ARStep) => step.contents.length === 0))) {
      setError('Todos los marcadores con imagen deben tener al menos un contenido en al menos un paso.');
      return;
    }
    // Validación más específica: cada contenido debe tener un value si no es botón (o una lógica similar)
    for (const marker of arClass.markerObjects) {
      if (marker.markerImage) {
        for (const step of marker.steps) {
          for (const content of step.contents) {
            if (!content.value && content.type !== 'button') { // Botones pueden no tener 'value' si su texto es fijo
              setError(`Contenido tipo '${content.type}' en el marcador '${marker.id}', paso '${step.id}' necesita un valor.`);
              // Aquí podrías navegar al marcador/paso/contenido específico
              return;
            }
          }
        }
      }
    }

    setIsLoading(true);
    try {
      if (!user || !arClass.userId) {
        throw new Error('Usuario no autenticado o ID de usuario faltante.');
      }
      
      const classToSave: ARClass = {
        ...arClass,
        title: data.title,
        description: data.description,
        updatedAt: Date.now(),
        // Filtrar marcadores sin imagen física (opcional, pero buena práctica)
        markerObjects: arClass.markerObjects.filter(marker => marker.markerImage),
      };
      
      saveClass(user.id, classToSave);
      setArClass(classToSave); // Actualizar estado local con la clase guardada (incluyendo IDs generados si es el caso)
      setSaveSuccess(true);
      
      setTimeout(() => {
        setSaveSuccess(false);
        setShowQRModal(true);
      }, 2000);
    } catch (err: any) {
      console.error('Error al guardar la clase:', err);
      setError(err.message || 'Error al guardar la clase. Por favor, intenta de nuevo.');
    } finally {
      setIsLoading(false);
    }
  };
  
  // ----- Renderizado condicional de secciones del editor -----
  const activeMarker = activeMarkerIndex < arClass.markerObjects.length ? arClass.markerObjects[activeMarkerIndex] : null;
  const activeStep = activeMarker && activeStepIndex < activeMarker.steps.length ? activeMarker.steps[activeStepIndex] : null;

  // Renderizado de los detalles de la clase (título, descripción)
  const renderClassDetailsForm = () => (
    <div className="max-w-4xl mx-auto bg-white shadow-md rounded-lg p-6 mb-8">
      <h2 className="text-xl font-bold mb-6">Detalles de la Clase RA</h2>
      {error && (
        <div className="mb-6 bg-error-50 border border-error-200 text-error-700 px-4 py-3 rounded flex items-start">
          <AlertCircle className="h-5 w-5 mr-2 flex-shrink-0 mt-0.5" />
          <p>{error}</p>
        </div>
      )}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
        <div>
          <label htmlFor="title" className="form-label">Título de la Clase</label>
          <input id="title" type="text" {...register('title', { required: 'El título es requerido' })} className="form-input" />
          {errors.title && <p className="mt-1 text-sm text-error-600">{errors.title.message}</p>}
        </div>
        <div>
          <label htmlFor="description" className="form-label">Descripción</label>
          <textarea id="description" rows={3} {...register('description', { required: 'La descripción es requerida' })} className="form-input" />
          {errors.description && <p className="mt-1 text-sm text-error-600">{errors.description.message}</p>}
        </div>
      </div>
      <div className="flex justify-end">
        <button type="button" onClick={() => { setCurrentEditorStep('marker-list'); setError(''); }} className="btn-primary">
          Siguiente: Marcadores <ArrowRight className="ml-2 h-4 w-4" />
        </button>
      </div>
    </div>
  );

  // Renderizado de la lista de marcadores
  const renderMarkerList = () => (
    <div className="max-w-6xl mx-auto bg-white shadow-md rounded-lg p-6 mb-8">
      <h2 className="text-xl font-bold mb-6">Marcadores de la Clase</h2>
      <p className="text-gray-600 mb-4">Añade y gestiona las imágenes que activarán tu contenido RA.</p>
      {error && (
        <div className="mb-6 bg-error-50 border border-error-200 text-error-700 px-4 py-3 rounded flex items-start">
          <AlertCircle className="h-5 w-5 mr-2 flex-shrink-0 mt-0.5" />
          <p>{error}</p>
        </div>
      )}
      <div className="space-y-4 mb-6">
        {arClass.markerObjects.map((marker, index) => (
          <div key={marker.id} className="flex items-center justify-between p-4 border rounded-lg hover:shadow-md">
            <div className="flex items-center">
              {marker.markerImage ? (
                <img src={marker.markerImage} alt={`Marcador ${index + 1}`} className="h-16 w-16 object-cover rounded mr-4" />
              ) : (
                <div className="h-16 w-16 bg-gray-200 rounded mr-4 flex items-center justify-center">
                  <Image className="h-8 w-8 text-gray-400" />
                </div>
              )}
              <div>
                <h3 className="font-semibold">Marcador {index + 1}</h3>
                <p className="text-sm text-gray-500">{marker.steps.length} paso(s)</p>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <button 
                type="button" 
                onClick={() => { setActiveMarkerIndex(index); setActiveStepIndex(0); setCurrentEditorStep('marker-editor'); setError('');}}
                className="btn-secondary text-sm p-2"
              >
                Editar Marcador
              </button>
              <button 
                type="button" 
                onClick={() => removeMarkerObject(index)} 
                className="btn-danger-outline text-sm p-2"
                aria-label="Eliminar Marcador"
              >
                <Trash2 className="h-4 w-4"/>
              </button>
            </div>
          </div>
        ))}
      </div>
      <div className="flex justify-between items-center">
        <button type="button" onClick={addMarkerObject} className="btn-primary">
          <Plus className="mr-2 h-4 w-4" /> Añadir Nuevo Marcador
        </button>
        <button type="submit" className="btn-success" disabled={isLoading || arClass.markerObjects.length === 0}>
          {isLoading ? <Loader2 className="animate-spin h-4 w-4 mr-2"/> : <Check className="h-4 w-4 mr-2" />} Guardar Clase y Generar QR
        </button>
      </div>
    </div>
  );

  // Renderizado del editor de un marcador específico (imagen y lista de pasos)
  const renderMarkerEditor = () => {
    if (!activeMarker) return <p>Selecciona un marcador para editar o crea uno nuevo.</p>;
    return (
      <div className="max-w-4xl mx-auto bg-white shadow-md rounded-lg p-6 mb-8">
        <h2 className="text-xl font-bold mb-2">Editando Marcador {activeMarkerIndex + 1}</h2>
        <p className="text-gray-600 mb-6">Sube la imagen para este marcador y gestiona sus pasos de contenido.</p>
        {error && (
          <div className="mb-6 bg-error-50 border border-error-200 text-error-700 px-4 py-3 rounded flex items-start">
            <AlertCircle className="h-5 w-5 mr-2 flex-shrink-0 mt-0.5" />
            <p>{error}</p>
          </div>
        )}
        {/* Sección para la imagen del marcador */}
        <div className="mb-6">
          <h3 className="text-lg font-medium mb-2">Imagen del Marcador</h3>
          <div className="border border-dashed border-gray-300 rounded-lg bg-gray-50 p-4 min-h-[200px] flex flex-col items-center justify-center">
            {activeMarker.markerImage ? (
              <div className="relative">
                <img src={activeMarker.markerImage} alt={`Marcador ${activeMarkerIndex + 1}`} className="max-h-60 max-w-full mx-auto rounded-lg" />
                <button type="button" onClick={() => handleMarkerImageChange(activeMarkerIndex, '')} className="absolute top-1 right-1 bg-white p-1.5 rounded-full shadow-md hover:bg-gray-100" title="Eliminar imagen">
                  <Trash2 className="h-4 w-4 text-error-600" />
                </button>
              </div>
            ) : (
              <div className="text-center">
                <UploadCloud className="h-10 w-10 text-gray-400 mx-auto mb-2" />
                <p className="text-gray-600 mb-2">Sube una imagen de marcador</p>
                <input id={`marker-img-upload-${activeMarker.id}`} type="file" accept="image/*" onChange={(e) => handleImageUpload(activeMarkerIndex, e)} className="hidden" />
                <label htmlFor={`marker-img-upload-${activeMarker.id}`} className="btn-secondary text-sm cursor-pointer">Seleccionar Imagen</label>
              </div>
            )}
          </div>
        </div>
        {/* Sección para la lista de pasos del marcador */}
        <div className="mb-6">
          <h3 className="text-lg font-medium mb-2">Pasos de Contenido para este Marcador</h3>
          {activeMarker.steps.map((step, stepIdx) => (
            <div key={step.id} className="flex items-center justify-between p-3 mb-2 border rounded-lg hover:shadow">
              <p>Paso {stepIdx + 1} ({step.contents.length} contenido(s))</p>
              <div className="flex items-center space-x-2">
                <button type="button" onClick={() => { setActiveStepIndex(stepIdx); setCurrentEditorStep('step-editor'); setError(''); }} className="btn-secondary text-sm p-1.5">
                  Editar Paso
                </button>
                <button 
                  type="button" 
                  onClick={() => removeStepFromMarker(activeMarkerIndex, stepIdx)} 
                  className="btn-danger-outline text-sm p-1.5"
                  aria-label="Eliminar Paso"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            </div>
          ))}
          <button type="button" onClick={() => addStepToMarker(activeMarkerIndex)} className="btn-primary text-sm mt-2">
            <Plus className="mr-1 h-4 w-4" /> Añadir Nuevo Paso
          </button>
        </div>
        <div className="flex justify-end">
            <button type="button" onClick={() => setCurrentEditorStep('marker-list')} className="btn-secondary">
                <ArrowLeft className="mr-2 h-4 w-4" /> Volver a Lista de Marcadores
            </button>
        </div>
      </div>
    );
  };

  // Renderizado del editor de un paso específico (lista de contenidos)
  const renderStepEditor = () => {
    if (!activeMarker || !activeStep) return <p>Selecciona un marcador y un paso para editar.</p>;
    return (
      <div className="max-w-3xl mx-auto bg-white shadow-md rounded-lg p-6 mb-8">
        <h2 className="text-xl font-bold mb-2">Editando Paso {activeStepIndex + 1} (Marcador {activeMarkerIndex + 1})</h2>
        <p className="text-gray-600 mb-6">Añade y configura los bloques de contenido para este paso.</p>
        {error && (
          <div className="mb-6 bg-error-50 border border-error-200 text-error-700 px-4 py-3 rounded flex items-start">
            <AlertCircle className="h-5 w-5 mr-2 flex-shrink-0 mt-0.5" />
            <p>{error}</p>
          </div>
        )}
        {/* Lista de contenidos del paso activo */}
        <div className="space-y-4 mb-6">
          {activeStep.contents.map((content, contentIdx) => (
            <div key={content.id} className="p-4 border rounded-lg bg-gray-50">
              <div className="flex justify-between items-center mb-2">
                <h4 className="font-semibold capitalize flex items-center">
                  {contentTypesMeta.find(ctm => ctm.type === content.type)?.icon && 
                    React.createElement(contentTypesMeta.find(ctm => ctm.type === content.type)!.icon, { className: 'h-5 w-5 mr-2 text-gray-600' })}
                  Editando: {contentTypesMeta.find(ctm => ctm.type === content.type)?.label || content.type}
                </h4>
                <button 
                  type="button" 
                  onClick={() => removeContentFromStep(activeMarkerIndex, activeStepIndex, contentIdx)} 
                  className="text-error-500 hover:text-error-700"
                  aria-label="Eliminar Contenido"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
              
              <div className="mb-2">
                <label htmlFor={`content-title-${content.id}`} className="form-label text-sm">Título (Opcional)</label>
                <input 
                  id={`content-title-${content.id}`} 
                  type="text" 
                  value={content.title || ''} 
                  onChange={(e) => updateContentInStep(activeMarkerIndex, activeStepIndex, contentIdx, { title: e.target.value })}
                  className="form-input text-sm"
                  placeholder="Ej: Información Principal"
                />
              </div>

              <div className="mb-2">
                <label htmlFor={`content-value-${content.id}`} className="form-label text-sm">
                  {content.type === 'text' ? 'Texto' : content.type === 'button' ? 'Texto del Botón' : 'URL o Valor'}
                </label>
                {content.type === 'text' ? (
                  <textarea 
                    id={`content-value-${content.id}`} 
                    rows={3} 
                    value={content.value} 
                    onChange={(e) => updateContentInStep(activeMarkerIndex, activeStepIndex, contentIdx, { value: e.target.value })}
                    className="form-input text-sm"
                    placeholder="Escribe tu texto aquí..."
                  />
                ) : (
                  <input 
                    id={`content-value-${content.id}`} 
                    type={content.type === 'url' || content.type === 'image' || content.type === 'video' || content.type === 'audio' ? 'url' : 'text'} 
                    value={content.value} 
                    onChange={(e) => updateContentInStep(activeMarkerIndex, activeStepIndex, contentIdx, { value: e.target.value })}
                    className="form-input text-sm"
                    placeholder={content.type === 'button' ? 'Ej: Continuar' : `Pega la URL para ${content.type}`}
                  />
                )}
              </div>

              {/* Campos adicionales para botones */}
              {content.type === 'button' && (
                <div className="mt-2">
                  <label htmlFor={`content-action-${content.id}`} className="form-label text-sm">Acción del Botón</label>
                  <select 
                    id={`content-action-${content.id}`} 
                    value={content.action || ''} 
                    onChange={(e) => updateContentInStep(activeMarkerIndex, activeStepIndex, contentIdx, { action: e.target.value as ButtonAction })}
                    className="form-input text-sm"
                  >
                    <option value="">Seleccionar Acción</option>
                    <option value="nextStep">Siguiente Paso</option>
                    <option value="prevStep">Paso Anterior</option>
                    <option value="openUrl">Abrir URL</option>
                    {/* <option value="custom">Acción Personalizada</option> */}
                  </select>
                  {(content.action === 'openUrl') && (
                    <div className="mt-1">
                      <label htmlFor={`content-actionValue-${content.id}`} className="form-label text-xs">URL para Abrir</label>
                      <input 
                        id={`content-actionValue-${content.id}`} 
                        type="url" 
                        value={content.actionValue || ''} 
                        onChange={(e) => updateContentInStep(activeMarkerIndex, activeStepIndex, contentIdx, { actionValue: e.target.value })}
                        className="form-input text-xs"
                        placeholder="https://ejemplo.com"
                      />
                    </div>
                  )}
                </div>
              )}

              {/* Vista previa para imágenes */}
              {content.type === 'image' && content.value && (
                <div className="mt-2 p-2 border rounded">
                  <img src={content.value} alt={content.title || 'Vista previa'} className="max-h-32 rounded" onError={(e) => (e.currentTarget.style.display = 'none')} />
                </div>
              )}
            </div>
          ))}
        </div>
        <div className="mb-4">
            <p className="text-sm font-medium mb-2">Añadir Nuevo Contenido a este Paso:</p>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                {contentTypesMeta.map(ctm => (
                    <button 
                        key={ctm.type} 
                        type="button" 
                        onClick={() => addContentToStep(activeMarkerIndex, activeStepIndex, ctm.type)}
                        className="btn-outline text-sm p-2 flex flex-col items-center justify-center h-full"
                    >
                        <ctm.icon className="h-5 w-5 mb-1" />
                        {ctm.label}
                    </button>
                ))}
            </div>
        </div>
        <div className="flex justify-end">
            <button type="button" onClick={() => setCurrentEditorStep('marker-editor')} className="btn-secondary">
                <ArrowLeft className="mr-2 h-4 w-4" /> Volver al Marcador
            </button>
        </div>
      </div>
    );
  };

  return (
    <div className="bg-gray-50 min-h-screen pt-16">
      <div className="container mx-auto px-4 py-8">
        <div className="mb-6 flex items-center">
          <button
            onClick={() => navigate('/my-classes')}
            className="inline-flex items-center text-gray-600 hover:text-gray-900"
          >
            <ArrowLeft className="h-4 w-4 mr-1" />
            Volver a Mis Clases
          </button>
          
          {/* Botón de Volver General entre pasos del editor */}
          {currentEditorStep === 'marker-list' && (
             <button onClick={() => setCurrentEditorStep('class-details')} className="ml-4 btn-secondary text-sm"><ArrowLeft className="mr-1 h-4 w-4"/>Detalles de Clase</button>
          )}
          {currentEditorStep === 'marker-editor' && (
             <button onClick={() => setCurrentEditorStep('marker-list')} className="ml-4 btn-secondary text-sm"><ArrowLeft className="mr-1 h-4 w-4"/>Lista de Marcadores</button>
          )}
           {currentEditorStep === 'step-editor' && (
             <button onClick={() => setCurrentEditorStep('marker-editor')} className="ml-4 btn-secondary text-sm"><ArrowLeft className="mr-1 h-4 w-4"/>Editor de Marcador</button>
          )}
        </div>
        
        <form onSubmit={handleSubmit(onSubmit)}>
          {currentEditorStep === 'class-details' && renderClassDetailsForm()}
          {currentEditorStep === 'marker-list' && renderMarkerList()}
          {currentEditorStep === 'marker-editor' && renderMarkerEditor()}
          {currentEditorStep === 'step-editor' && renderStepEditor()}
        </form>
      </div>
      
      {/* El botón flotante de guardar solo aparece si no estamos en detalles de clase y hay marcadores */}
      {currentEditorStep !== 'class-details' && arClass.markerObjects.length > 0 && (
        <FloatingSubmitButton 
          onClick={handleSubmit(onSubmit)}
          isLoading={isLoading}
          showSuccess={saveSuccess}
          label="Guardar Clase y Generar QR"
        />
      )}
      
      {showQRModal && arClass && (
        <QRCodeModal 
          arClass={arClass} 
          onClose={() => setShowQRModal(false)} 
        />
      )}
    </div>
  );
};

// No olvides exportar ClassEditorPage si es necesario en tu App.tsx o router
export default ClassEditorPage;