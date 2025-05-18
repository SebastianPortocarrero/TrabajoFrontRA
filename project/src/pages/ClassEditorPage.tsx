import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { 
  Plus, Trash2, Copy, ArrowLeft, Link as LinkIcon, 
  Image, FileText, Video, Music, Loader2, UploadCloud, AlertCircle, 
  ArrowRight, Layout, BookOpen, Check
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { getClassById, saveClass } from '../utils/storage';
import { ARClass, MarkerObject, ContentType, ARContent } from '../types';
import FloatingSubmitButton from '../components/FloatingSubmitButton';
import QRCodeModal from '../components/QRCodeModal';

interface FormData {
  title: string;
  description: string;
}

const defaultMarkerObject: MarkerObject = {
  id: `marker_${Date.now()}`,
  markerImage: '',
  content: [],
};

type Step = 'type-selection' | 'content-creation' | 'preview';

const ClassEditorPage = () => {
  const { classId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  
  const [currentStep, setCurrentStep] = useState<Step>('type-selection');
  const [selectedTypes, setSelectedTypes] = useState<ContentType[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [showQRModal, setShowQRModal] = useState(false);
  const [activeMarkerIndex, setActiveMarkerIndex] = useState(0);
  const [error, setError] = useState('');
  
  const [arClass, setArClass] = useState<ARClass>({
    id: classId || `class_${Date.now()}`,
    title: '',
    description: '',
    thumbnail: '',
    markerObjects: [{ ...defaultMarkerObject }],
    createdAt: Date.now(),
    updatedAt: Date.now(),
  });
  
  const { 
    register, 
    handleSubmit, 
    setValue,
    formState: { errors }, 
  } = useForm<FormData>();
  
  useEffect(() => {
    if (classId) {
      const existingClass = getClassById(classId);
      if (existingClass) {
        setArClass(existingClass);
        setValue('title', existingClass.title);
        setValue('description', existingClass.description);
        setCurrentStep('content-creation');
        // Extract unique content types from existing class
        const types = Array.from(new Set(
          existingClass.markerObjects.flatMap(marker => 
            marker.content.map(c => c.type)
          )
        ));
        setSelectedTypes(types as ContentType[]);
      } else {
        navigate('/editor');
      }
    }
  }, [classId, navigate, setValue]);

  const contentTypes = [
    { type: 'text', icon: FileText, label: 'Texto', description: 'Añade contenido textual a tu clase' },
    { type: 'image', icon: Image, label: 'Imagen', description: 'Incluye imágenes y fotografías' },
    { type: 'video', icon: Video, label: 'Video', description: 'Integra videos educativos' },
    { type: 'url', icon: LinkIcon, label: 'Enlace', description: 'Vincula a recursos externos' },
    { type: 'audio', icon: Music, label: 'Audio', description: 'Agrega contenido de audio' },
  ] as const;

  const toggleContentType = (type: ContentType) => {
    setSelectedTypes(prev => {
      if (prev.includes(type)) {
        return prev.filter(t => t !== type);
      }
      return [...prev, type];
    });
  };

  const handleContinue = () => {
    if (selectedTypes.length === 0) {
      setError('Por favor, selecciona al menos un tipo de contenido');
      return;
    }

    // Initialize marker with empty content for each selected type
    const initialContent = selectedTypes.map(type => ({
      type,
      value: '',
    }));

    setArClass(prev => ({
      ...prev,
      markerObjects: [{
        ...defaultMarkerObject,
        content: initialContent,
      }],
    }));

    setCurrentStep('content-creation');
    setError('');
  };

  const handleBack = () => {
    if (currentStep === 'content-creation') {
      setCurrentStep('type-selection');
    } else if (currentStep === 'preview') {
      setCurrentStep('content-creation');
    }
  };
  
  const addMarkerObject = () => {
    const initialContent = selectedTypes.map(type => ({
      type,
      value: '',
    }));

    setArClass(prev => ({
      ...prev,
      markerObjects: [
        ...prev.markerObjects,
        { 
          ...defaultMarkerObject, 
          id: `marker_${Date.now()}`,
          content: initialContent,
        },
      ],
    }));
    
    setActiveMarkerIndex(arClass.markerObjects.length);
  };
  
  const removeMarkerObject = (index: number) => {
    if (arClass.markerObjects.length <= 1) return;
    
    setArClass(prev => ({
      ...prev,
      markerObjects: prev.markerObjects.filter((_, i) => i !== index),
    }));
    
    if (activeMarkerIndex >= index && activeMarkerIndex > 0) {
      setActiveMarkerIndex(activeMarkerIndex - 1);
    }
  };
  
  const duplicateMarkerObject = (index: number) => {
    const markerToDuplicate = { 
      ...arClass.markerObjects[index],
      id: `marker_${Date.now()}`
    };
    
    const newMarkers = [...arClass.markerObjects];
    newMarkers.splice(index + 1, 0, markerToDuplicate);
    
    setArClass(prev => ({
      ...prev,
      markerObjects: newMarkers,
    }));
    
    setActiveMarkerIndex(index + 1);
  };
  
  const handleMarkerImageChange = (index: number, imageDataUrl: string) => {
    const updatedMarkers = [...arClass.markerObjects];
    updatedMarkers[index] = {
      ...updatedMarkers[index],
      markerImage: imageDataUrl,
    };
    
    setArClass(prev => ({
      ...prev,
      markerObjects: updatedMarkers,
    }));
    
    if (index === 0 && !arClass.thumbnail) {
      setArClass(prev => ({
        ...prev,
        thumbnail: imageDataUrl,
      }));
    }
  };
  
  const handleContentValueChange = (markerIndex: number, contentIndex: number, value: string) => {
    const updatedMarkers = [...arClass.markerObjects];
    const updatedContent = [...updatedMarkers[markerIndex].content];
    updatedContent[contentIndex] = {
      ...updatedContent[contentIndex],
      value,
    };
    
    updatedMarkers[markerIndex] = {
      ...updatedMarkers[markerIndex],
      content: updatedContent,
    };
    
    setArClass(prev => ({
      ...prev,
      markerObjects: updatedMarkers,
    }));
  };
  
  const handleContentTitleChange = (markerIndex: number, contentIndex: number, title: string) => {
    const updatedMarkers = [...arClass.markerObjects];
    const updatedContent = [...updatedMarkers[markerIndex].content];
    updatedContent[contentIndex] = {
      ...updatedContent[contentIndex],
      title,
    };
    
    updatedMarkers[markerIndex] = {
      ...updatedMarkers[markerIndex],
      content: updatedContent,
    };
    
    setArClass(prev => ({
      ...prev,
      markerObjects: updatedMarkers,
    }));
  };
  
  const handleImageUpload = (index: number, e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    if (file.size > 5 * 1024 * 1024) {
      setError('La imagen es demasiado grande. El tamaño máximo es 5MB.');
      return;
    }
    
    if (!file.type.startsWith('image/')) {
      setError('Tipo de archivo inválido. Por favor, sube una imagen.');
      return;
    }
    
    const reader = new FileReader();
    reader.onload = (event) => {
      if (event.target?.result) {
        handleMarkerImageChange(index, event.target.result as string);
        setError('');
      }
    };
    reader.readAsDataURL(file);
  };
  
  const onSubmit = (data: FormData) => {
    setError('');
    
    const hasMarkerImage = arClass.markerObjects.some(marker => marker.markerImage);
    if (!hasMarkerImage) {
      setError('Al menos un marcador debe tener una imagen.');
      return;
    }
    
    const invalidMarker = arClass.markerObjects.findIndex(marker => 
      marker.markerImage && marker.content.every(c => !c.value)
    );
    
    if (invalidMarker !== -1) {
      setError(`El marcador ${invalidMarker + 1} tiene una imagen pero no contenido. Por favor, añade contenido o elimina el marcador.`);
      setActiveMarkerIndex(invalidMarker);
      return;
    }
    
    setIsLoading(true);
    
    try {
      if (!user) {
        throw new Error('Usuario no autenticado');
      }
      
      const updatedClass: ARClass = {
        ...arClass,
        title: data.title,
        description: data.description,
        updatedAt: Date.now(),
        markerObjects: arClass.markerObjects.filter(marker => marker.markerImage),
      };
      
      saveClass(user.id, updatedClass);
      setArClass(updatedClass);
      setSaveSuccess(true);
      
      setTimeout(() => {
        setSaveSuccess(false);
        setShowQRModal(true);
      }, 2000);
    } catch (err) {
      console.error('Error al guardar la clase:', err);
      setError('Error al guardar la clase. Por favor, intenta de nuevo.');
    } finally {
      setIsLoading(false);
    }
  };
  
  const activeMarker = arClass.markerObjects[activeMarkerIndex];
  
  const renderTypeSelection = () => (
    <div className="max-w-4xl mx-auto">
      <h2 className="text-2xl font-bold mb-6">Selecciona los tipos de contenido</h2>
      <p className="text-gray-600 mb-8">Puedes seleccionar múltiples tipos de contenido para tu clase AR</p>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {contentTypes.map(({ type, icon: Icon, label, description }) => (
          <button
            key={type}
            onClick={() => toggleContentType(type as ContentType)}
            className={`p-6 rounded-xl transition-all relative ${
              selectedTypes.includes(type as ContentType)
                ? 'bg-primary-50 border-2 border-primary-500 shadow-md'
                : 'bg-white border-2 border-transparent shadow hover:shadow-lg'
            }`}
          >
            {selectedTypes.includes(type as ContentType) && (
              <div className="absolute top-2 right-2 bg-primary-500 text-white p-1 rounded-full">
                <Check className="h-4 w-4" />
              </div>
            )}
            <div className="flex items-center mb-4">
              <div className={`p-3 rounded-lg ${
                selectedTypes.includes(type as ContentType)
                  ? 'bg-primary-100'
                  : 'bg-gray-100'
              }`}>
                <Icon className={`h-6 w-6 ${
                  selectedTypes.includes(type as ContentType)
                    ? 'text-primary-600'
                    : 'text-gray-600'
                }`} />
              </div>
              <h3 className="text-lg font-semibold ml-4">{label}</h3>
            </div>
            <p className="text-gray-600">{description}</p>
          </button>
        ))}
      </div>
      
      {error && (
        <div className="mt-6 bg-error-50 border border-error-200 text-error-700 px-4 py-3 rounded flex items-start">
          <AlertCircle className="h-5 w-5 mr-2 flex-shrink-0 mt-0.5" />
          <p>{error}</p>
        </div>
      )}
      
      <div className="mt-8 flex justify-end">
        <button
          type="button"
          onClick={handleContinue}
          className="btn-primary py-2 px-6"
        >
          Continuar
          <ArrowRight className="ml-2 h-5 w-5" />
        </button>
      </div>
    </div>
  );

  const renderContentCreation = () => (
    <div className="max-w-6xl mx-auto">
      <div className="bg-white shadow-md rounded-lg overflow-hidden mb-6">
        <div className="p-6">
          <h1 className="text-2xl font-bold mb-6">
            {classId ? 'Editar Clase RA' : 'Crear Clase RA'}
          </h1>
          
          {error && (
            <div className="mb-6 bg-error-50 border border-error-200 text-error-700 px-4 py-3 rounded flex items-start">
              <AlertCircle className="h-5 w-5 mr-2 flex-shrink-0 mt-0.5" />
              <p>{error}</p>
            </div>
          )}
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label htmlFor="title" className="form-label">
                Título de la Clase
              </label>
              <input
                id="title"
                type="text"
                className={`form-input ${errors.title ? 'border-error-500 focus:ring-error-500' : ''}`}
                placeholder="Ej: Modelos 3D del Sistema Solar"
                {...register('title', { 
                  required: 'El título es requerido',
                  minLength: {
                    value: 3,
                    message: 'El título debe tener al menos 3 caracteres'
                  }
                })}
              />
              {errors.title && (
                <p className="mt-1 text-sm text-error-600">{errors.title.message}</p>
              )}
            </div>
            
            <div>
              <label htmlFor="description" className="form-label">
                Descripción
              </label>
              <textarea
                id="description"
                rows={3}
                className={`form-input ${errors.description ? 'border-error-500 focus:ring-error-500' : ''}`}
                placeholder="Describe tu clase RA"
                {...register('description', { 
                  required: 'La descripción es requerida',
                  minLength: {
                    value: 10,
                    message: 'La descripción debe tener al menos 10 caracteres'
                  }
                })}
              />
              {errors.description && (
                <p className="mt-1 text-sm text-error-600">{errors.description.message}</p>
              )}
            </div>
          </div>
        </div>
      </div>
      
      <div className="bg-white shadow-md rounded-lg overflow-hidden">
        <div className="border-b border-gray-200">
          <div className="px-6 py-4 flex flex-wrap items-center">
            <h2 className="text-lg font-semibold mr-4">Marcadores</h2>
            <span className="text-sm text-gray-500">
              Añade imágenes que activarán el contenido RA al ser escaneadas
            </span>
            <button
              type="button"
              onClick={addMarkerObject}
              className="ml-auto btn-secondary flex items-center text-sm"
            >
              <Plus className="h-4 w-4 mr-1" />
              Añadir Marcador
            </button>
          </div>
          
          <div className="flex overflow-x-auto pb-1 px-2 pt-2">
            {arClass.markerObjects.map((marker, index) => (
              <button
                key={marker.id}
                type="button"
                className={`flex-shrink-0 px-4 py-2 text-sm font-medium rounded-t-lg mr-1 ${
                  activeMarkerIndex === index
                    ? 'bg-primary-50 text-primary-700 border-t border-l border-r border-primary-200'
                    : 'bg-gray-50 text-gray-700 hover:bg-gray-100 border-t border-l border-r border-gray-200'
                }`}
                onClick={() => setActiveMarkerIndex(index)}
              >
                Marcador {index + 1}
                {marker.markerImage && '✓'}
              </button>
            ))}
          </div>
        </div>
        
        <div className="p-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <div>
              <h3 className="text-lg font-medium mb-4">Imagen del Marcador</h3>
              <div className="border border-dashed border-gray-300 rounded-lg bg-gray-50 p-4 flex flex-col items-center justify-center">
                {activeMarker.markerImage ? (
                  <div className="relative w-full">
                    <img
                      src={activeMarker.markerImage}
                      alt={`Marcador ${activeMarkerIndex + 1}`}
                      className="max-h-80 max-w-full mx-auto rounded-lg"
                    />
                    <div className="absolute top-2 right-2 flex space-x-2">
                      <button
                        type="button"
                        onClick={() => handleMarkerImageChange(activeMarkerIndex, '')}
                        className="bg-white p-1.5 rounded-full shadow-md hover:bg-gray-100"
                        title="Eliminar imagen"
                      >
                        <Trash2 className="h-4 w-4 text-error-600" />
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <UploadCloud className="h-12 w-12 text-gray-400 mx-auto mb-3" />
                    <p className="text-gray-600 mb-4">Sube una imagen de marcador</p>
                    <p className="text-xs text-gray-500 mb-4 max-w-xs mx-auto">
                      Esta imagen activará el contenido RA al ser escaneada. Elige una imagen con detalles claros para mejor reconocimiento.
                    </p>
                    <label className="btn-primary cursor-pointer">
                      <span>Seleccionar Imagen</span>
                      <input
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={(e) => handleImageUpload(activeMarkerIndex, e)}
                      />
                    </label>
                  </div>
                )}
              </div>
              
              <div className="mt-4 flex justify-between">
                <div className="flex">
                  <button
                    type="button"
                    onClick={() => removeMarkerObject(activeMarkerIndex)}
                    disabled={arClass.markerObjects.length <= 1}
                    className={`btn-secondary text-sm mr-2 ${
                      arClass.markerObjects.length <= 1 ? 'opacity-50 cursor-not-allowed' : ''
                    }`}
                    title={arClass.markerObjects.length <= 1 ? 'No se puede eliminar el último marcador' : 'Eliminar marcador'}
                  >
                    <Trash2 className="h-4 w-4 mr-1" />
                    Eliminar
                  </button>
                  
                  <button
                    type="button"
                    onClick={() => duplicateMarkerObject(activeMarkerIndex)}
                    className="btn-secondary text-sm"
                    title="Duplicar marcador"
                  >
                    <Copy className="h-4 w-4 mr-1" />
                    Duplicar
                  </button>
                </div>
                
                {activeMarker.markerImage && (
                  <label className="btn-secondary text-sm cursor-pointer">
                    Cambiar Imagen
                    <input
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={(e) => handleImageUpload(activeMarkerIndex, e)}
                    />
                  </label>
                )}
              </div>
            </div>
            
            <div>
              <h3 className="text-lg font-medium mb-4">Contenido RA</h3>
              
              <div className="space-y-6">
                {activeMarker.content.map((content, contentIndex) => (
                  <div key={`${content.type}-${contentIndex}`} className="bg-gray-50 p-4 rounded-lg">
                    <div className="flex items-center mb-4">
                      {content.type === 'text' && <FileText className="h-5 w-5 text-gray-600 mr-2" />}
                      {content.type === 'image' && <Image className="h-5 w-5 text-gray-600 mr-2" />}
                      {content.type === 'video' && <Video className="h-5 w-5 text-gray-600 mr-2" />}
                      {content.type === 'url' && <LinkIcon className="h-5 w-5 text-gray-600 mr-2" />}
                      {content.type === 'audio' && <Music className="h-5 w-5 text-gray-600 mr-2" />}
                      <h4 className="font-medium capitalize">{content.type}</h4>
                    </div>
                    
                    <div className="mb-4">
                      <label className="form-label">
                        Título (Opcional)
                      </label>
                      <input
                        type="text"
                        placeholder={`Título para el contenido de ${content.type}`}
                        className="form-input"
                        value={content.title || ''}
                        onChange={(e) => handleContentTitleChange(activeMarkerIndex, contentIndex, e.target.value)}
                      />
                    </div>
                    
                    <div>
                      <label className="form-label">
                        {content.type === 'text' ? 'Contenido' : 'URL'}
                      </label>
                      
                      {content.type === 'text' ? (
                        <textarea
                          placeholder="Ingresa el contenido de texto"
                          className="form-input"
                          rows={4}
                          value={content.value}
                          onChange={(e) => handleContentValueChange(activeMarkerIndex, contentIndex, e.target.value)}
                        />
                      ) : (
                        <input
                          type="text"
                          placeholder={`URL del ${content.type}`}
                          className="form-input"
                          value={content.value}
                          onChange={(e) => handleContentValueChange(activeMarkerIndex, contentIndex, e.target.value)}
                        />
                      )}
                      
                      {content.type === 'image' && content.value && (
                        <div className="mt-2">
                          <img
                            src={content.value}
                            alt="Vista previa"
                            className="max-h-40 rounded-lg"
                            onError={(e) => {
                              const target = e.target as HTMLImageElement;
                              target.src = 'https://placehold.co/400x300?text=URL+inválida';
                            }}
                          />
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

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
          
          {currentStep !== 'type-selection' && (
            <button
              onClick={handleBack}
              className="ml-4 inline-flex items-center text-gray-600 hover:text-gray-900"
            >
              <ArrowLeft className="h-4 w-4 mr-1" />
              Paso Anterior
            </button>
          )}
        </div>
        
        <form onSubmit={handleSubmit(onSubmit)}>
          {currentStep === 'type-selection' && renderTypeSelection()}
          {currentStep === 'content-creation' && renderContentCreation()}
        </form>
      </div>
      
      {currentStep === 'content-creation' && (
        <FloatingSubmitButton 
          onClick={handleSubmit(onSubmit)}
          isLoading={isLoading}
          showSuccess={saveSuccess}
          label="Guardar y Generar QR"
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

export default ClassEditorPage;