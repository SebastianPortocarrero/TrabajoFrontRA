import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { FlexibleEditor } from '../components/FlexibleEditor';
import { ARClass, ContentBlock } from '../types';
import { getClass, saveClass } from '../utils/storage';
import { generateId } from '../utils/helpers';

export const EditorPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [arClass, setArClass] = useState<ARClass | null>(null);

  useEffect(() => {
    if (id) {
      const loadedClass = getClass(id);
      if (loadedClass) {
        setArClass(loadedClass);
      }
    } else {
      // Create new class
      setArClass({
        id: generateId(),
        title: '',
        description: '',
        markerObjects: [],
        contentBlocks: [],
        createdAt: Date.now(),
        updatedAt: Date.now(),
        userId: user?.id || '',
      });
    }
  }, [id, user]);

  const handleContentChange = (newBlocks: ContentBlock[]) => {
    if (arClass) {
      const updatedClass = {
        ...arClass,
        contentBlocks: newBlocks,
        updatedAt: Date.now(),
      };
      setArClass(updatedClass);
      saveClass(updatedClass);
    }
  };

  const handleTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (arClass) {
      const updatedClass = {
        ...arClass,
        title: e.target.value,
        updatedAt: Date.now(),
      };
      setArClass(updatedClass);
      saveClass(updatedClass);
    }
  };

  const handleDescriptionChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    if (arClass) {
      const updatedClass = {
        ...arClass,
        description: e.target.value,
        updatedAt: Date.now(),
      };
      setArClass(updatedClass);
      saveClass(updatedClass);
    }
  };

  if (!arClass) return null;

  return (
    <div className="min-h-screen bg-gray-50 pt-16">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
            <input
              type="text"
              value={arClass.title}
              onChange={handleTitleChange}
              placeholder="Enter class title..."
              className="text-2xl font-bold w-full border-none focus:ring-0 mb-4"
            />
            <textarea
              value={arClass.description}
              onChange={handleDescriptionChange}
              placeholder="Enter class description..."
              className="w-full border-none focus:ring-0 resize-none"
              rows={3}
            />
          </div>

          <div className="bg-white rounded-lg shadow-sm p-6">
            <h2 className="text-xl font-semibold mb-6">Editor de Contenido</h2>
            <FlexibleEditor
              initialContent={arClass.contentBlocks}
              onChange={handleContentChange}
            />
          </div>
        </div>
      </div>
    </div>
  );
}; 