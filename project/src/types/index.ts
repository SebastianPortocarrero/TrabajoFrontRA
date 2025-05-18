export interface ARClass {
  id: string;
  title: string;
  description: string;
  thumbnail: string;
  markerObjects: MarkerObject[];
  createdAt: number;
  updatedAt: number;
}

export interface MarkerObject {
  id: string;
  markerImage: string;
  content: ARContent;
}

export type ContentType = 'url' | 'video' | 'image' | 'text';

export interface ARContent {
  type: ContentType;
  value: string;
  title?: string;
}