import React, { useState } from 'react';
import { fileToBase64 } from '../utils/api';

interface ImageUploaderProps {
  onImageUploaded: (imageBase64: string) => void;
  className?: string;
  label?: string;
  showPreview?: boolean;
}

const ImageUploader: React.FC<ImageUploaderProps> = ({ 
  onImageUploaded, 
  className = '', 
  label = 'Subir imagen',
  showPreview = true
}) => {
  const [isLoading, setIsLoading] = useState(false);
  const [preview, setPreview] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Reset previous states
    setError(null);
    setIsLoading(true);

    try {
      // Convert to base64 for preview and storage
      const base64 = await fileToBase64(file);
      
      // Verificar que la imagen se cargó correctamente antes de configurar la vista previa
      const img = new Image();
      img.onload = () => {
        // La imagen se cargó correctamente
        setPreview(base64);
        
        // Ahora es seguro llamar al callback con los datos de la imagen
        onImageUploaded(base64);
        setIsLoading(false);
      };
      
      img.onerror = () => {
        setError('Error al cargar la imagen. Intenta con otra imagen.');
        setIsLoading(false);
      };
      
      // Iniciar la carga de la imagen
      img.src = base64;
    } catch (err: any) {
      setError(err.message || 'Error al procesar la imagen');
      console.error('Error in image upload:', err);
      setIsLoading(false);
    }
  };

  return (
    <div className={`w-full ${className}`}>
      <div className="flex flex-col items-center">
        {/* Preview de la imagen */}
        {showPreview && preview && (
          <div className="mb-4 w-full max-w-xs">
            <img src={preview} alt="Preview" className="w-full h-auto rounded-lg shadow" />
          </div>
        )}

        {/* Input para subir archivos */}
        <label className={`flex flex-col items-center px-4 py-2 ${isLoading ? 'bg-blue-400' : 'bg-blue-500 hover:bg-blue-600'} text-white rounded-lg shadow-lg tracking-wide cursor-pointer transition-colors ${isLoading ? 'cursor-wait' : 'cursor-pointer'}`}>
          {isLoading ? (
            <div className="flex items-center">
              <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              <span className="text-base">Procesando...</span>
            </div>
          ) : (
            <>
              <svg className="w-6 h-6" fill="currentColor" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20">
                <path d="M16.88 9.1A4 4 0 0 1 16 17H5a5 5 0 0 1-1-9.9V7a3 3 0 0 1 4.52-2.59A4.98 4.98 0 0 1 17 8c0 .38-.04.74-.12 1.1zM11 11h3l-4-4-4 4h3v3h2v-3z" />
              </svg>
              <span className="mt-2 text-base">{label}</span>
            </>
          )}
          <input 
            type="file" 
            accept="image/*" 
            className="hidden" 
            onChange={handleFileChange}
            disabled={isLoading} 
          />
        </label>

        {/* Mensaje de error */}
        {error && (
          <div className="mt-2 text-red-500 text-sm bg-red-50 p-2 rounded border border-red-200 w-full text-center">
            {error}
          </div>
        )}
      </div>
    </div>
  );
};

export default ImageUploader; 