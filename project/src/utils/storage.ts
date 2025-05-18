import { ARClass } from '../types';

// Local Storage Keys
const CLASSES_KEY = 'arEd_classes';

// Get all classes for the current user
export const getClassesForUser = (userId: string): ARClass[] => {
  try {
    const classesString = localStorage.getItem(CLASSES_KEY);
    if (!classesString) return [];
    
    const allClasses = JSON.parse(classesString);
    return allClasses.filter((classItem: ARClass & { userId: string }) => classItem.userId === userId);
  } catch (error) {
    console.error('Error getting classes:', error);
    return [];
  }
};

// Save a class
export const saveClass = (userId: string, arClass: ARClass): ARClass => {
  try {
    const allClasses = getAllClasses();
    const existingIndex = allClasses.findIndex(c => c.id === arClass.id);
    
    const classWithUser = { ...arClass, userId };
    
    if (existingIndex >= 0) {
      // Update existing class
      allClasses[existingIndex] = classWithUser;
    } else {
      // Add new class
      allClasses.push(classWithUser);
    }
    
    localStorage.setItem(CLASSES_KEY, JSON.stringify(allClasses));
    return arClass;
  } catch (error) {
    console.error('Error saving class:', error);
    throw error;
  }
};

// Get a single class by ID
export const getClassById = (classId: string): ARClass | null => {
  try {
    const allClasses = getAllClasses();
    const foundClass = allClasses.find(c => c.id === classId);
    
    if (!foundClass) return null;
    
    // Remove userId from returned class
    const { userId, ...classWithoutUserId } = foundClass;
    return classWithoutUserId as ARClass;
  } catch (error) {
    console.error('Error getting class by ID:', error);
    return null;
  }
};

// Delete a class
export const deleteClass = (classId: string): boolean => {
  try {
    const allClasses = getAllClasses();
    const filteredClasses = allClasses.filter(c => c.id !== classId);
    
    if (filteredClasses.length === allClasses.length) {
      // Class not found
      return false;
    }
    
    localStorage.setItem(CLASSES_KEY, JSON.stringify(filteredClasses));
    return true;
  } catch (error) {
    console.error('Error deleting class:', error);
    return false;
  }
};

// Helper function to get all classes
const getAllClasses = (): (ARClass & { userId: string })[] => {
  try {
    const classesString = localStorage.getItem(CLASSES_KEY);
    return classesString ? JSON.parse(classesString) : [];
  } catch {
    return [];
  }
};