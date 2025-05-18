import { Link } from 'react-router-dom';
import { Cpu, Users, BookOpen, QrCode, ArrowRight } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const LandingPage = () => {
  const { isAuthenticated } = useAuth();
  
  return (
    <div className="pt-16">
      {/* Hero Section */}
      <section className="bg-gradient-to-br from-primary-500 to-primary-700 text-white py-20 md:py-32">
        <div className="container mx-auto px-4 flex flex-col items-center text-center">
          <h1 className="text-4xl md:text-6xl font-bold mb-6 animate-slide-up">
            Revoluciona el Aprendizaje con Realidad Aumentada
          </h1>
          <p className="text-lg md:text-xl max-w-2xl mb-10 opacity-90 animate-slide-up" style={{ animationDelay: '100ms' }}>
            Crea experiencias educativas inmersivas que dan vida al aprendizaje. Diseña clases con RA que inspiren a tus estudiantes.
          </p>
          <div className="animate-slide-up" style={{ animationDelay: '200ms' }}>
            <Link 
              to={isAuthenticated ? "/dashboard" : "/register"} 
              className="btn-accent text-base md:text-lg px-6 py-3"
            >
              {isAuthenticated ? "Ir al Panel" : "Comienza Gratis"}
              <ArrowRight className="ml-2 h-5 w-5" />
            </Link>
          </div>
          
          <div className="mt-12 md:mt-16 w-full max-w-4xl rounded-lg shadow-2xl overflow-hidden animate-scale-in" style={{ animationDelay: '300ms' }}>
            <img 
              src="https://images.pexels.com/photos/7516363/pexels-photo-7516363.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2" 
              alt="Plataforma Educativa RA"
              className="w-full h-auto"
            />
          </div>
        </div>
      </section>
      
      {/* Features Section */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl md:text-4xl font-bold text-center mb-16">Cómo Funciona AREduca</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 md:gap-12">
            <div className="flex flex-col items-center text-center p-6 rounded-xl transition-all duration-300 hover:shadow-lg">
              <div className="bg-primary-100 p-4 rounded-full mb-6">
                <Cpu className="h-8 w-8 text-primary-600" />
              </div>
              <h3 className="text-xl font-semibold mb-3">Crea Clases RA</h3>
              <p className="text-gray-600">Diseña clases interactivas con nuestro editor intuitivo. No se requiere experiencia técnica.</p>
            </div>
            
            <div className="flex flex-col items-center text-center p-6 rounded-xl transition-all duration-300 hover:shadow-lg">
              <div className="bg-primary-100 p-4 rounded-full mb-6">
                <BookOpen className="h-8 w-8 text-primary-600" />
              </div>
              <h3 className="text-xl font-semibold mb-3">Añade Contenido</h3>
              <p className="text-gray-600">Agrega texto, imágenes, videos y más a tus clases. Crea experiencias educativas completas.</p>
            </div>
            
            <div className="flex flex-col items-center text-center p-6 rounded-xl transition-all duration-300 hover:shadow-lg">
              <div className="bg-primary-100 p-4 rounded-full mb-6">
                <QrCode className="h-8 w-8 text-primary-600" />
              </div>
              <h3 className="text-xl font-semibold mb-3">Genera Códigos QR</h3>
              <p className="text-gray-600">Comparte tu experiencia RA con códigos QR que los estudiantes pueden escanear para acceder al contenido.</p>
            </div>
            
            <div className="flex flex-col items-center text-center p-6 rounded-xl transition-all duration-300 hover:shadow-lg">
              <div className="bg-primary-100 p-4 rounded-full mb-6">
                <Users className="h-8 w-8 text-primary-600" />
              </div>
              <h3 className="text-xl font-semibold mb-3">Involucra Estudiantes</h3>
              <p className="text-gray-600">Ofrece experiencias de aprendizaje interactivas que aumentan el compromiso y mejoran la retención.</p>
            </div>
          </div>
        </div>
      </section>
      
      {/* CTA Section */}
      <section className="bg-accent-600 text-white py-16">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-6">¿Listo para Transformar la Educación?</h2>
          <p className="text-lg md:text-xl max-w-2xl mx-auto mb-8 opacity-90">
            Únete a miles de educadores que usan AREduca para crear experiencias de aprendizaje inmersivas.
          </p>
          <Link 
            to={isAuthenticated ? "/dashboard" : "/register"} 
            className="btn bg-white text-accent-700 hover:bg-gray-100 px-6 py-3 text-base md:text-lg"
          >
            {isAuthenticated ? "Ir al Panel" : "Comienza a Crear Clases RA"}
          </Link>
        </div>
      </section>
    </div>
  );
};

export default LandingPage;