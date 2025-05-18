// Definición de los tipos de contenido básicos que puede tener un paso
export type ContentType = 'text' | 'image' | 'video' | 'url' | 'audio' | 'button';

// Acción que puede realizar un botón
export type ButtonAction = 'nextStep' | 'prevStep' | 'openUrl' | 'custom';

// Interfaz para un bloque de contenido individual dentro de un paso
export interface ARContent {
  id: string; // ID único para este bloque de contenido
  type: ContentType;
  value: string; // Para texto, URL de imagen/video/audio, URL de enlace, texto del botón
  title?: string; // Título opcional para el contenido (ej. cabecera para un texto)
  action?: ButtonAction; // Si es un botón, qué acción realiza
  actionValue?: string; // Si la acción es openUrl, esta es la URL. Si es custom, es un identificador.
}

// Interfaz para un "paso" o "página" dentro de un marcador
export interface ARStep {
  id: string; // ID único para este paso
  contents: ARContent[]; // Array de bloques de contenido para este paso
}

// Interfaz para un objeto marcador (la imagen física y sus pasos de contenido virtual)
export interface MarkerObject {
  id: string; // ID único para este marcador
  markerImage: string; // URL (base64) de la imagen del marcador físico
  steps: ARStep[]; // Array de pasos/páginas de contenido para este marcador
}

// Interfaz para la clase de Realidad Aumentada completa
export interface ARClass {
  id: string;
  title: string;
  description: string;
  thumbnail?: string; // URL (base64) de la imagen miniatura para la clase
  markerObjects: MarkerObject[];
  createdAt: number;
  updatedAt: number;
  userId: string; // ID del usuario que creó la clase
}