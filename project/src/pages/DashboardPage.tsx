import { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, BookOpen, Upload, Link as LinkIcon, QrCode } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { getClassesForUser } from '../utils/storage';

const DashboardPage = () => {
  const { user } = useAuth();
  const userClasses = user ? getClassesForUser(user.id) : [];
  
  return (
    <div className="bg-gray-50 min-h-screen pt-16">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          <div className="bg-white shadow-md rounded-lg overflow-hidden">
            <div className="bg-gradient-to-r from-primary-600 to-primary-800 px-6 py-8 text-white">
              <h1 className="text-2xl md:text-3xl font-bold">Welcome to AREduca, {user?.name}!</h1>
              <p className="mt-2 opacity-90">Your AR education journey starts here.</p>
            </div>
            
            <div className="p-6">
              <h2 className="text-xl font-semibold mb-6">Getting Started with AR Classes</h2>
              
              <div className="space-y-6">
                <div className="flex items-start">
                  <div className="flex-shrink-0 bg-primary-100 rounded-full p-3">
                    <BookOpen className="h-6 w-6 text-primary-600" />
                  </div>
                  <div className="ml-4">
                    <h3 className="text-lg font-medium">1. Create a new AR class</h3>
                    <p className="mt-1 text-gray-600">
                      Start by creating a new AR class. Give it a name and description that helps students understand the content.
                    </p>
                  </div>
                </div>
                
                <div className="flex items-start">
                  <div className="flex-shrink-0 bg-primary-100 rounded-full p-3">
                    <Upload className="h-6 w-6 text-primary-600" />
                  </div>
                  <div className="ml-4">
                    <h3 className="text-lg font-medium">2. Upload marker images</h3>
                    <p className="mt-1 text-gray-600">
                      Upload images that will serve as AR markers. These are the images students will scan to see your AR content.
                    </p>
                  </div>
                </div>
                
                <div className="flex items-start">
                  <div className="flex-shrink-0 bg-primary-100 rounded-full p-3">
                    <LinkIcon className="h-6 w-6 text-primary-600" />
                  </div>
                  <div className="ml-4">
                    <h3 className="text-lg font-medium">3. Add content to your markers</h3>
                    <p className="mt-1 text-gray-600">
                      Link each marker to content like videos, images, text or websites that will be displayed when scanned.
                    </p>
                  </div>
                </div>
                
                <div className="flex items-start">
                  <div className="flex-shrink-0 bg-primary-100 rounded-full p-3">
                    <QrCode className="h-6 w-6 text-primary-600" />
                  </div>
                  <div className="ml-4">
                    <h3 className="text-lg font-medium">4. Generate and share QR codes</h3>
                    <p className="mt-1 text-gray-600">
                      Generate a QR code for your class that students can scan to access your AR experience.
                    </p>
                  </div>
                </div>
              </div>
              
              <div className="mt-10 flex flex-col sm:flex-row items-center gap-4">
                <Link
                  to="/my-classes"
                  className="w-full sm:w-auto btn-primary py-3 px-6"
                >
                  Go to My Classes
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Link>
                
                <Link
                  to="/editor"
                  className="w-full sm:w-auto btn-secondary py-3 px-6"
                >
                  Create New Class
                </Link>
              </div>
            </div>
          </div>
          
          {userClasses.length > 0 && (
            <div className="mt-8">
              <h2 className="text-xl font-semibold mb-4">Your Recent Classes</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {userClasses.slice(0, 3).map((arClass) => (
                  <Link 
                    key={arClass.id} 
                    to={`/editor/${arClass.id}`}
                    className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow"
                  >
                    <div className="h-36 bg-gray-200 overflow-hidden">
                      {arClass.thumbnail ? (
                        <img 
                          src={arClass.thumbnail} 
                          alt={arClass.title} 
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center bg-primary-100">
                          <BookOpen className="h-10 w-10 text-primary-400" />
                        </div>
                      )}
                    </div>
                    <div className="p-4">
                      <h3 className="font-semibold text-lg truncate">{arClass.title}</h3>
                      <p className="text-gray-600 text-sm mt-1 line-clamp-2">{arClass.description}</p>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default DashboardPage;