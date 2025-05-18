import { useState } from 'react';
import { X, Download, ExternalLink } from 'lucide-react';
import { QRCodeSVG } from 'qrcode.react';
import { ARClass } from '../types';

interface QRCodeModalProps {
  arClass: ARClass;
  onClose: () => void;
}

const QRCodeModal: React.FC<QRCodeModalProps> = ({ arClass, onClose }) => {
  const [activeTab, setActiveTab] = useState<'qrcode' | 'share'>('qrcode');
  
  // Generate a fake AR experience URL - in a real app, this would be a real URL
  const experienceUrl = `https://areduca.example.com/view/${arClass.id}`;
  
  const downloadQRCode = () => {
    const canvas = document.getElementById('qr-code-canvas') as HTMLCanvasElement;
    if (!canvas) return;
    
    const pngUrl = canvas
      .toDataURL('image/png')
      .replace('image/png', 'image/octet-stream');
    
    const downloadLink = document.createElement('a');
    downloadLink.href = pngUrl;
    downloadLink.download = `${arClass.title.replace(/\s+/g, '-')}-qrcode.png`;
    document.body.appendChild(downloadLink);
    downloadLink.click();
    document.body.removeChild(downloadLink);
  };
  
  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex min-h-screen items-center justify-center p-4 text-center">
        <div className="fixed inset-0 bg-black/50 transition-opacity" onClick={onClose} />
        
        <div className="w-full max-w-md transform overflow-hidden rounded-2xl bg-white p-6 text-left align-middle shadow-xl transition-all animate-scale-in">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">{arClass.title}</h3>
            <button
              className="text-gray-500 hover:text-gray-700 transition-colors"
              onClick={onClose}
            >
              <X className="h-5 w-5" />
            </button>
          </div>
          
          <div className="flex border-b border-gray-200 mb-6">
            <button
              className={`px-4 py-2 text-sm font-medium ${
                activeTab === 'qrcode'
                  ? 'text-primary-600 border-b-2 border-primary-600'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
              onClick={() => setActiveTab('qrcode')}
            >
              QR Code
            </button>
            <button
              className={`px-4 py-2 text-sm font-medium ${
                activeTab === 'share'
                  ? 'text-primary-600 border-b-2 border-primary-600'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
              onClick={() => setActiveTab('share')}
            >
              Share
            </button>
          </div>
          
          {activeTab === 'qrcode' && (
            <div className="flex flex-col items-center">
              <div className="bg-white p-3 rounded-lg shadow-sm">
                <QRCodeSVG
                  id="qr-code-canvas"
                  value={experienceUrl}
                  size={200}
                  bgColor="#FFFFFF"
                  fgColor="#000000"
                  level="M"
                  includeMargin={true}
                />
              </div>
              
              <p className="text-sm text-gray-600 mt-4 text-center">
                Scan this QR code to access the AR experience for "{arClass.title}"
              </p>
              
              <button
                className="mt-6 btn-primary"
                onClick={downloadQRCode}
              >
                <Download className="h-4 w-4 mr-2" />
                Download QR Code
              </button>
              
              <div className="mt-4 w-full pt-4 border-t border-gray-200">
                <p className="text-xs text-gray-500 text-center mb-2">Experience URL:</p>
                <div className="flex items-center">
                  <input
                    type="text"
                    value={experienceUrl}
                    readOnly
                    className="form-input text-sm py-1.5 flex-grow"
                  />
                  <button
                    className="ml-2 p-1.5 bg-gray-100 rounded-md hover:bg-gray-200 transition-colors"
                    onClick={() => navigator.clipboard.writeText(experienceUrl)}
                    title="Copy URL"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 5H6a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2v-1M8 5a2 2 0 002 2h2a2 2 0 002-2M8 5a2 2 0 012-2h2a2 2 0 012 2" />
                    </svg>
                  </button>
                </div>
              </div>
            </div>
          )}
          
          {activeTab === 'share' && (
            <div>
              <p className="text-sm text-gray-600 mb-4">
                Share this AR experience with your students or colleagues:
              </p>
              
              <div className="space-y-4">
                <button className="w-full btn bg-blue-600 hover:bg-blue-700 text-white flex items-center justify-center">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
                  </svg>
                  Share on Facebook
                </button>
                
                <button className="w-full btn bg-sky-500 hover:bg-sky-600 text-white flex items-center justify-center">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M23.953 4.57a10 10 0 01-2.825.775 4.958 4.958 0 002.163-2.723 10.037 10.037 0 01-3.127 1.195 4.92 4.92 0 00-8.384 4.482C7.69 8.095 4.067 6.13 1.64 3.162a4.822 4.822 0 00-.666 2.475c0 1.71.87 3.213 2.188 4.096a4.904 4.904 0 01-2.228-.616v.06a4.923 4.923 0 003.946 4.827 4.996 4.996 0 01-2.212.085 4.936 4.936 0 004.604 3.417 9.867 9.867 0 01-6.102 2.105c-.39 0-.779-.023-1.17-.067a13.995 13.995 0 007.557 2.209c9.053 0 14-7.496 14-13.986 0-.21 0-.42-.015-.63A9.935 9.935 0 0024 4.59z" />
                  </svg>
                  Share on Twitter
                </button>
                
                <button className="w-full btn bg-green-600 hover:bg-green-700 text-white flex items-center justify-center">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946.003-6.556 5.338-11.891 11.893-11.891 3.181.001 6.167 1.24 8.413 3.488 2.245 2.248 3.481 5.236 3.48 8.414-.003 6.557-5.338 11.892-11.893
                    11.892-1.99-.001-3.951-.5-5.688-1.448l-6.305 1.654zm6.597-3.807c1.676.995 3.276 1.591 5.392 1.592 5.448 0 9.886-4.434 9.889-9.885.002-5.462-4.415-9.89-9.881-9.892-5.452 0-9.887 4.434-9.889 9.884-.001 2.225.651 3.891 1.746 5.634l-.999 3.648 3.742-.981zm11.387-5.464c-.074-.124-.272-.198-.57-.347-.297-.149-1.758-.868-2.031-.967-.272-.099-.47-.149-.669.149-.198.297-.768.967-.941 1.165-.173.198-.347.223-.644.074-.297-.149-1.255-.462-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.297-.347.446-.521.151-.172.2-.296.3-.495.099-.198.05-.372-.025-.521-.075-.148-.669-1.611-.916-2.206-.242-.579-.487-.501-.669-.51l-.57-.01c-.198 0-.52.074-.792.372s-1.04 1.016-1.04 2.479 1.065 2.876 1.213 3.074c.149.198 2.095 3.2 5.076 4.487.709.306 1.263.489 1.694.626.712.226 1.36.194 1.872.118.571-.085 1.758-.719 2.006-1.413.248-.695.248-1.29.173-1.414z" />
                  </svg>
                  Share on WhatsApp
                </button>
                
                <button 
                  className="w-full btn-secondary flex items-center justify-center"
                  onClick={() => navigator.clipboard.writeText(experienceUrl)}
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 5H6a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2v-1M8 5a2 2 0 002 2h2a2 2 0 002-2M8 5a2 2 0 012-2h2a2 2 0 012 2" />
                  </svg>
                  Copy Link
                </button>
                
                <a 
                  href={`mailto:?subject=${encodeURIComponent(`AR Educational Experience: ${arClass.title}`)}&body=${encodeURIComponent(`Check out this AR educational experience: ${experienceUrl}`)}`}
                  className="w-full btn-secondary flex items-center justify-center"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                  Email Link
                </a>
              </div>
              
              <p className="mt-6 text-xs text-gray-500 text-center">
                <ExternalLink className="inline h-3 w-3 mr-1" />
                Recipients will need the AREduca app to view the experience
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default QRCodeModal;