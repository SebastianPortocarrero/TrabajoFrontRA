// API base URL - Cambia esto a la URL de tu backend
const API_BASE_URL = 'http://localhost:3001';

/**
 * Sube una imagen a Google Drive a través del backend
 * @param file El archivo de imagen a subir
 * @returns Objeto con el ID y la URL pública del archivo en Google Drive
 */
export const uploadImageToDrive = async (file: File): Promise<{ fileId: string, url: string }> => {
  try {
    const formData = new FormData();
    formData.append('file', file);

    const response = await fetch(`${API_BASE_URL}/drive/upload`, {
      method: 'POST',
      body: formData,
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || 'Error al subir imagen');
    }

    return await response.json();
  } catch (error) {
    console.error('Error uploading image to Drive:', error);
    throw error;
  }
};

/**
 * Convierte una imagen base64 a un objeto File para subirla
 * @param base64Data Base64 de la imagen
 * @param filename Nombre que tendrá el archivo
 * @returns File listo para ser subido
 */
export const base64ToFile = (base64Data: string, filename: string): File => {
  // Extraer la parte de datos después del prefijo (data:image/png;base64,)
  const base64WithoutPrefix = base64Data.split(',')[1];
  // Decidir el tipo MIME según el prefijo de la cadena base64
  const mimeType = base64Data.split(';')[0].split(':')[1] || 'image/png';
  
  // Convertir base64 a Blob
  const byteCharacters = atob(base64WithoutPrefix);
  const byteArrays = [];
  for (let i = 0; i < byteCharacters.length; i += 512) {
    const slice = byteCharacters.slice(i, i + 512);
    const byteNumbers = new Array(slice.length);
    for (let j = 0; j < slice.length; j++) {
      byteNumbers[j] = slice.charCodeAt(j);
    }
    const byteArray = new Uint8Array(byteNumbers);
    byteArrays.push(byteArray);
  }
  const blob = new Blob(byteArrays, { type: mimeType });
  
  // Crear un File desde el Blob
  return new File([blob], filename, { type: mimeType });
};

/**
 * Convierte un archivo a base64 para mostrar previsualizaciones
 * @param file El archivo a convertir
 * @returns Promise con el string base64 del archivo
 */
export const fileToBase64 = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = (error) => reject(error);
  });
}; 