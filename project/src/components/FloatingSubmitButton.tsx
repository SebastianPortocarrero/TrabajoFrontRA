import { useState, useEffect } from 'react';
import { Save, CheckCircle } from 'lucide-react';

interface FloatingSubmitButtonProps {
  onClick: () => void;
  isLoading?: boolean;
  showSuccess?: boolean;
  label?: string;
}

const FloatingSubmitButton: React.FC<FloatingSubmitButtonProps> = ({
  onClick,
  isLoading = false,
  showSuccess = false,
  label = 'Save & Generate QR',
}) => {
  const [isVisible, setIsVisible] = useState(true);
  const [lastScrollY, setLastScrollY] = useState(0);
  
  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY;
      
      if (currentScrollY > lastScrollY && currentScrollY > 100) {
        setIsVisible(false);
      } else {
        setIsVisible(true);
      }
      
      setLastScrollY(currentScrollY);
    };
    
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, [lastScrollY]);
  
  return (
    <div 
      className={`fixed bottom-6 right-6 z-40 transition-all duration-300 transform ${
        isVisible ? 'translate-y-0 opacity-100' : 'translate-y-16 opacity-0'
      }`}
    >
      <button
        onClick={onClick}
        disabled={isLoading}
        className={`flex items-center px-4 py-3 rounded-full shadow-lg transition-all ${
          showSuccess 
            ? 'bg-green-600 hover:bg-green-700' 
            : 'bg-primary-600 hover:bg-primary-700'
        } text-white`}
      >
        {isLoading ? (
          <>
            <svg className="animate-spin -ml-1 mr-2 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            Processing...
          </>
        ) : showSuccess ? (
          <>
            <CheckCircle className="mr-2 h-5 w-5" />
            Saved Successfully
          </>
        ) : (
          <>
            <Save className="mr-2 h-5 w-5" />
            {label}
          </>
        )}
      </button>
    </div>
  );
};

export default FloatingSubmitButton;