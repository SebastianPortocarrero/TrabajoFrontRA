import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { 
  Plus, Trash2, Copy, ArrowLeft, Link as LinkIcon, 
  Image, FileText, Video, Loader2, UploadCloud, AlertCircle
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
  content: {
    type: 'text',
    value: '',
  },
};

const ClassEditorPage = () => {
  const { classId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  
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
      } else {
        // Class not found, redirect to create new
        navigate('/editor');
      }
    }
  }, [classId, navigate, setValue]);
  
  const addMarkerObject = () => {
    setArClass(prev => ({
      ...prev,
      markerObjects: [
        ...prev.markerObjects,
        { ...defaultMarkerObject, id: `marker_${Date.now()}` },
      ],
    }));
    
    // Set the newly added marker as active
    setActiveMarkerIndex(arClass.markerObjects.length);
  };
  
  const removeMarkerObject = (index: number) => {
    // Don't allow removing the last marker
    if (arClass.markerObjects.length <= 1) {
      return;
    }
    
    setArClass(prev => ({
      ...prev,
      markerObjects: prev.markerObjects.filter((_, i) => i !== index),
    }));
    
    // Adjust active index if needed
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
    
    // Set the duplicated marker as active
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
    
    // If this is the first marker and there's no thumbnail yet, use it as the thumbnail
    if (index === 0 && !arClass.thumbnail) {
      setArClass(prev => ({
        ...prev,
        thumbnail: imageDataUrl,
      }));
    }
  };
  
  const handleContentTypeChange = (index: number, type: ContentType) => {
    const updatedMarkers = [...arClass.markerObjects];
    updatedMarkers[index] = {
      ...updatedMarkers[index],
      content: {
        ...updatedMarkers[index].content,
        type,
        value: '', // Reset value when changing type
      },
    };
    
    setArClass(prev => ({
      ...prev,
      markerObjects: updatedMarkers,
    }));
  };
  
  const handleContentValueChange = (index: number, value: string) => {
    const updatedMarkers = [...arClass.markerObjects];
    updatedMarkers[index] = {
      ...updatedMarkers[index],
      content: {
        ...updatedMarkers[index].content,
        value,
      },
    };
    
    setArClass(prev => ({
      ...prev,
      markerObjects: updatedMarkers,
    }));
  };
  
  const handleContentTitleChange = (index: number, title: string) => {
    const updatedMarkers = [...arClass.markerObjects];
    updatedMarkers[index] = {
      ...updatedMarkers[index],
      content: {
        ...updatedMarkers[index].content,
        title,
      },
    };
    
    setArClass(prev => ({
      ...prev,
      markerObjects: updatedMarkers,
    }));
  };
  
  const handleImageUpload = (index: number, e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      setError('Image is too large. Maximum size is 5MB.');
      return;
    }
    
    // Validate file type
    if (!file.type.startsWith('image/')) {
      setError('Invalid file type. Please upload an image.');
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
    
    // Validate that at least one marker has an image
    const hasMarkerImage = arClass.markerObjects.some(marker => marker.markerImage);
    if (!hasMarkerImage) {
      setError('At least one marker must have an image.');
      return;
    }
    
    // Validate that all markers with images have content
    const invalidMarker = arClass.markerObjects.findIndex(marker => 
      marker.markerImage && !marker.content.value
    );
    
    if (invalidMarker !== -1) {
      setError(`Marker ${invalidMarker + 1} has an image but no content. Please add content or remove the marker.`);
      setActiveMarkerIndex(invalidMarker);
      return;
    }
    
    setIsLoading(true);
    
    try {
      if (!user) {
        throw new Error('User not authenticated');
      }
      
      const updatedClass: ARClass = {
        ...arClass,
        title: data.title,
        description: data.description,
        updatedAt: Date.now(),
        // Filter out markers without images
        markerObjects: arClass.markerObjects.filter(marker => marker.markerImage),
      };
      
      // Save to local storage
      saveClass(user.id, updatedClass);
      
      setArClass(updatedClass);
      setSaveSuccess(true);
      
      // Reset success message after 2 seconds
      setTimeout(() => {
        setSaveSuccess(false);
        setShowQRModal(true);
      }, 2000);
    } catch (err) {
      console.error('Error saving class:', err);
      setError('Failed to save class. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };
  
  const activeMarker = arClass.markerObjects[activeMarkerIndex];
  
  return (
    <div className="bg-gray-50 min-h-screen pt-16">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-6xl mx-auto">
          <div className="mb-6">
            <button
              onClick={() => navigate('/my-classes')}
              className="inline-flex items-center text-gray-600 hover:text-gray-900"
            >
              <ArrowLeft className="h-4 w-4 mr-1" />
              Back to My Classes
            </button>
          </div>
          
          <form onSubmit={handleSubmit(onSubmit)}>
            <div className="bg-white shadow-md rounded-lg overflow-hidden mb-6">
              <div className="p-6">
                <h1 className="text-2xl font-bold mb-6">
                  {classId ? 'Edit AR Class' : 'Create AR Class'}
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
                      Class Title
                    </label>
                    <input
                      id="title"
                      type="text"
                      className={`form-input ${errors.title ? 'border-error-500 focus:ring-error-500' : ''}`}
                      placeholder="E.g., Solar System 3D Models"
                      {...register('title', { 
                        required: 'Title is required',
                        minLength: {
                          value: 3,
                          message: 'Title must be at least 3 characters'
                        }
                      })}
                    />
                    {errors.title && (
                      <p className="mt-1 text-sm text-error-600">{errors.title.message}</p>
                    )}
                  </div>
                  
                  <div>
                    <label htmlFor="description" className="form-label">
                      Description
                    </label>
                    <textarea
                      id="description"
                      rows={3}
                      className={`form-input ${errors.description ? 'border-error-500 focus:ring-error-500' : ''}`}
                      placeholder="Enter a description for your AR class"
                      {...register('description', { 
                        required: 'Description is required',
                        minLength: {
                          value: 10,
                          message: 'Description must be at least 10 characters'
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
                  <h2 className="text-lg font-semibold mr-4">Marker Objects</h2>
                  <span className="text-sm text-gray-500">
                    Add images that will trigger AR content when scanned
                  </span>
                  <button
                    type="button"
                    onClick={addMarkerObject}
                    className="ml-auto btn-secondary flex items-center text-sm"
                  >
                    <Plus className="h-4 w-4 mr-1" />
                    Add Marker
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
                      Marker {index + 1}
                      {marker.markerImage && '✓'}
                    </button>
                  ))}
                </div>
              </div>
              
              <div className="p-6">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                  {/* Left column - Marker Image */}
                  <div>
                    <h3 className="text-lg font-medium mb-4">Marker Image</h3>
                    <div className="border border-dashed border-gray-300 rounded-lg bg-gray-50 p-4 flex flex-col items-center justify-center">
                      {activeMarker.markerImage ? (
                        <div className="relative w-full">
                          <img
                            src={activeMarker.markerImage}
                            alt={`Marker ${activeMarkerIndex + 1}`}
                            className="max-h-80 max-w-full mx-auto rounded-lg"
                          />
                          <div className="absolute top-2 right-2 flex space-x-2">
                            <button
                              type="button"
                              onClick={() => handleMarkerImageChange(activeMarkerIndex, '')}
                              className="bg-white p-1.5 rounded-full shadow-md hover:bg-gray-100"
                              title="Remove image"
                            >
                              <Trash2 className="h-4 w-4 text-error-600" />
                            </button>
                          </div>
                        </div>
                      ) : (
                        <div className="text-center py-8">
                          <UploadCloud className="h-12 w-12 text-gray-400 mx-auto mb-3" />
                          <p className="text-gray-600 mb-4">Upload a marker image</p>
                          <p className="text-xs text-gray-500 mb-4 max-w-xs mx-auto">
                            This image will be used to trigger the AR content. Choose an image with clear details for better recognition.
                          </p>
                          <label className="btn-primary cursor-pointer">
                            <span>Select Image</span>
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
                          title={arClass.markerObjects.length <= 1 ? 'Cannot remove the last marker' : 'Remove marker'}
                        >
                          <Trash2 className="h-4 w-4 mr-1" />
                          Remove
                        </button>
                        
                        <button
                          type="button"
                          onClick={() => duplicateMarkerObject(activeMarkerIndex)}
                          className="btn-secondary text-sm"
                          title="Duplicate marker"
                        >
                          <Copy className="h-4 w-4 mr-1" />
                          Duplicate
                        </button>
                      </div>
                      
                      {activeMarker.markerImage && (
                        <label className="btn-secondary text-sm cursor-pointer">
                          Change Image
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
                  
                  {/* Right column - AR Content */}
                  <div>
                    <h3 className="text-lg font-medium mb-4">AR Content</h3>
                    
                    <div className="mb-4">
                      <label className="form-label">Content Type</label>
                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                        <button
                          type="button"
                          className={`flex items-center justify-center p-3 rounded-lg border ${
                            activeMarker.content.type === 'url'
                              ? 'bg-primary-50 border-primary-300 text-primary-700'
                              : 'border-gray-300 hover:bg-gray-50'
                          }`}
                          onClick={() => handleContentTypeChange(activeMarkerIndex, 'url')}
                        >
                          <LinkIcon className="h-5 w-5 mr-2" />
                          URL
                        </button>
                        
                        <button
                          type="button"
                          className={`flex items-center justify-center p-3 rounded-lg border ${
                            activeMarker.content.type === 'image'
                              ? 'bg-primary-50 border-primary-300 text-primary-700'
                              : 'border-gray-300 hover:bg-gray-50'
                          }`}
                          onClick={() => handleContentTypeChange(activeMarkerIndex, 'image')}
                        >
                          <Image className="h-5 w-5 mr-2" />
                          Image
                        </button>
                        
                        <button
                          type="button"
                          className={`flex items-center justify-center p-3 rounded-lg border ${
                            activeMarker.content.type === 'video'
                              ? 'bg-primary-50 border-primary-300 text-primary-700'
                              : 'border-gray-300 hover:bg-gray-50'
                          }`}
                          onClick={() => handleContentTypeChange(activeMarkerIndex, 'video')}
                        >
                          <Video className="h-5 w-5 mr-2" />
                          Video
                        </button>
                        
                        <button
                          type="button"
                          className={`flex items-center justify-center p-3 rounded-lg border ${
                            activeMarker.content.type === 'text'
                              ? 'bg-primary-50 border-primary-300 text-primary-700'
                              : 'border-gray-300 hover:bg-gray-50'
                          }`}
                          onClick={() => handleContentTypeChange(activeMarkerIndex, 'text')}
                        >
                          <FileText className="h-5 w-5 mr-2" />
                          Text
                        </button>
                      </div>
                    </div>
                    
                    <div className="mb-4">
                      <label className="form-label">
                        Content Title (Optional)
                      </label>
                      <input
                        type="text"
                        placeholder="Enter a title for this content"
                        className="form-input"
                        value={activeMarker.content.title || ''}
                        onChange={(e) => handleContentTitleChange(activeMarkerIndex, e.target.value)}
                      />
                    </div>
                    
                    <div>
                      <label className="form-label">
                        {activeMarker.content.type === 'url' && 'URL'}
                        {activeMarker.content.type === 'image' && 'Image URL'}
                        {activeMarker.content.type === 'video' && 'Video URL'}
                        {activeMarker.content.type === 'text' && 'Text Content'}
                      </label>
                      
                      {activeMarker.content.type === 'text' ? (
                        <textarea
                          placeholder="Enter the text content to display"
                          className="form-input"
                          rows={6}
                          value={activeMarker.content.value}
                          onChange={(e) => handleContentValueChange(activeMarkerIndex, e.target.value)}
                        />
                      ) : (
                        <input
                          type="text"
                          placeholder={`Enter ${activeMarker.content.type} URL`}
                          className="form-input"
                          value={activeMarker.content.value}
                          onChange={(e) => handleContentValueChange(activeMarkerIndex, e.target.value)}
                        />
                      )}
                      
                      {activeMarker.content.type === 'url' && (
                        <p className="mt-1 text-xs text-gray-500">
                          Enter a URL to a website or resource that will be displayed when the marker is scanned.
                        </p>
                      )}
                      
                      {activeMarker.content.type === 'image' && (
                        <p className="mt-1 text-xs text-gray-500">
                          Enter a URL to an image that will be displayed when the marker is scanned.
                        </p>
                      )}
                      
                      {activeMarker.content.type === 'video' && (
                        <p className="mt-1 text-xs text-gray-500">
                          Enter a URL to a video (YouTube, Vimeo, etc.) that will be played when the marker is scanned.
                        </p>
                      )}
                    </div>
                    
                    {activeMarker.content.type === 'image' && activeMarker.content.value && (
                      <div className="mt-4 p-2 border rounded-lg">
                        <img 
                          src={activeMarker.content.value} 
                          alt="Content preview" 
                          className="max-h-40 mx-auto"
                          onError={(e) => {
                            const target = e.target as HTMLImageElement;
                            target.src = 'https://placehold.co/400x300?text=Invalid+Image+URL';
                          }}
                        />
                      </div>
                    )}
                    
                    {activeMarker.content.type === 'video' && activeMarker.content.value && (
                      <div className="mt-4 p-2 border rounded-lg">
                        <p className="text-center text-gray-500 py-3">
                          <Video className="h-8 w-8 mx-auto mb-2" />
                          Video from URL: {activeMarker.content.value}
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </form>
        </div>
      </div>
      
      <FloatingSubmitButton 
        onClick={handleSubmit(onSubmit)}
        isLoading={isLoading}
        showSuccess={saveSuccess}
      />
      
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