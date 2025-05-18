import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Plus, Edit, Trash2, BookOpen, Search, AlertTriangle } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { getClassesForUser, deleteClass } from '../utils/storage';
import { ARClass } from '../types';

const MyClassesPage = () => {
  const { user } = useAuth();
  const [classes, setClasses] = useState<ARClass[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [classToDelete, setClassToDelete] = useState<string | null>(null);
  
  useEffect(() => {
    if (user) {
      loadClasses();
    }
  }, [user]);
  
  const loadClasses = () => {
    if (!user) return;
    const userClasses = getClassesForUser(user.id);
    setClasses(userClasses);
  };
  
  const handleDeleteClick = (classId: string, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setClassToDelete(classId);
    setShowDeleteModal(true);
  };
  
  const confirmDelete = () => {
    if (classToDelete) {
      deleteClass(classToDelete);
      loadClasses();
      setShowDeleteModal(false);
      setClassToDelete(null);
    }
  };
  
  const filteredClasses = classes.filter(c => 
    c.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    c.description.toLowerCase().includes(searchTerm.toLowerCase())
  );
  
  return (
    <div className="bg-gray-50 min-h-screen pt-16">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-6xl mx-auto">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
            <div>
              <h1 className="text-2xl md:text-3xl font-bold text-gray-900">My AR Classes</h1>
              <p className="text-gray-600 mt-1">Manage all your augmented reality educational content</p>
            </div>
            
            <Link 
              to="/editor" 
              className="btn-primary flex items-center"
            >
              <Plus className="mr-2 h-5 w-5" />
              Create New Class
            </Link>
          </div>
          
          <div className="mb-6">
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Search className="h-5 w-5 text-gray-400" />
              </div>
              <input
                type="text"
                placeholder="Search your classes..."
                className="form-input pl-10"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>
          
          {filteredClasses.length === 0 ? (
            <div className="bg-white rounded-lg shadow-md p-8 text-center">
              {searchTerm ? (
                <div>
                  <SearchIcon className="mx-auto h-12 w-12 text-gray-400" />
                  <h3 className="mt-4 text-lg font-medium text-gray-900">No classes found</h3>
                  <p className="mt-2 text-gray-600">
                    We couldn't find any classes matching "{searchTerm}". Please try another search term.
                  </p>
                  <button 
                    className="mt-4 btn-secondary"
                    onClick={() => setSearchTerm('')}
                  >
                    Clear search
                  </button>
                </div>
              ) : (
                <div>
                  <BookOpen className="mx-auto h-12 w-12 text-gray-400" />
                  <h3 className="mt-4 text-lg font-medium text-gray-900">No classes yet</h3>
                  <p className="mt-2 text-gray-600">
                    You haven't created any AR classes yet. Get started by creating your first class.
                  </p>
                  <Link 
                    to="/editor" 
                    className="mt-4 btn-primary inline-flex items-center"
                  >
                    <Plus className="mr-2 h-5 w-5" />
                    Create Your First Class
                  </Link>
                </div>
              )}
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredClasses.map((arClass, index) => (
                <Link 
                  key={arClass.id} 
                  to={`/editor/${arClass.id}`}
                  className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow group"
                >
                  <div className="h-48 bg-gray-200 overflow-hidden relative">
                    {arClass.thumbnail ? (
                      <img 
                        src={arClass.thumbnail} 
                        alt={arClass.title} 
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center bg-primary-100">
                        <BookOpen className="h-16 w-16 text-primary-400" />
                      </div>
                    )}
                    <div className="absolute top-3 left-3 bg-white/90 backdrop-blur-sm rounded-full h-8 w-8 flex items-center justify-center text-sm font-semibold">
                      {index + 1}
                    </div>
                    <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors duration-300 flex items-center justify-center opacity-0 group-hover:opacity-100">
                      <div className="flex items-center space-x-2">
                        <button 
                          className="bg-white p-2 rounded-full shadow-lg"
                          onClick={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                          }}
                          aria-label="Edit class"
                        >
                          <Edit className="h-5 w-5 text-gray-700" />
                        </button>
                        <button 
                          className="bg-white p-2 rounded-full shadow-lg"
                          onClick={(e) => handleDeleteClick(arClass.id, e)}
                          aria-label="Delete class"
                        >
                          <Trash2 className="h-5 w-5 text-error-600" />
                        </button>
                      </div>
                    </div>
                  </div>
                  <div className="p-4">
                    <h3 className="font-semibold text-lg">{arClass.title}</h3>
                    <p className="text-gray-600 text-sm mt-1 line-clamp-2">{arClass.description}</p>
                    <div className="mt-4 flex items-center justify-between">
                      <div className="text-xs text-gray-500">
                        {arClass.markerObjects.length} {arClass.markerObjects.length === 1 ? 'marker' : 'markers'}
                      </div>
                      <div className="text-xs text-gray-500">
                        {new Date(arClass.updatedAt).toLocaleDateString()}
                      </div>
                    </div>
                  </div>
                </Link>
              ))}
              
              <Link 
                to="/editor" 
                className="border-2 border-dashed border-gray-300 rounded-lg p-6 h-full flex flex-col items-center justify-center text-gray-500 hover:border-primary-500 hover:text-primary-600 transition-colors min-h-[320px]"
              >
                <div className="bg-gray-100 rounded-full p-4">
                  <Plus className="h-8 w-8" />
                </div>
                <span className="mt-4 font-medium">Create New Class</span>
              </Link>
            </div>
          )}
        </div>
      </div>
      
      {/* Delete Confirmation Modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6 animate-scale-in">
            <div className="flex items-center text-error-600 mb-4">
              <AlertTriangle className="h-6 w-6 mr-2" />
              <h3 className="text-lg font-semibold">Delete AR Class</h3>
            </div>
            <p className="text-gray-600 mb-6">
              Are you sure you want to delete this AR class? This action cannot be undone, and all associated content will be permanently lost.
            </p>
            <div className="flex justify-end space-x-3">
              <button 
                className="btn-secondary"
                onClick={() => setShowDeleteModal(false)}
              >
                Cancel
              </button>
              <button 
                className="btn bg-error-600 text-white hover:bg-error-700"
                onClick={confirmDelete}
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// Extracted component for the search icon for the empty state
const SearchIcon = ({ className }: { className?: string }) => (
  <svg xmlns="http://www.w3.org/2000/svg" className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
  </svg>
);

export default MyClassesPage;