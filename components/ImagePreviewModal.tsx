
import React, { useEffect } from 'react';
import { CloseIcon } from './icons';

interface ImagePreviewModalProps {
  imageUrl: string;
  onClose: () => void;
}

export const ImagePreviewModal: React.FC<ImagePreviewModalProps> = ({ imageUrl, onClose }) => {
  useEffect(() => {
    const handleEsc = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onClose();
      }
    };
    window.addEventListener('keydown', handleEsc);
    return () => {
      window.removeEventListener('keydown', handleEsc);
    };
  }, [onClose]);

  return (
    <div 
      className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-label="Image preview"
    >
      <div 
        className="relative max-w-4xl max-h-full"
        onClick={(e) => e.stopPropagation()}
      >
        <img src={imageUrl} alt="Preview" className="w-auto h-auto max-w-full max-h-[90vh] object-contain rounded-lg" />
        <button 
          onClick={onClose} 
          className="absolute -top-4 -right-4 text-white bg-gray-800 rounded-full p-2 hover:bg-gray-700 transition-colors"
          aria-label="Close preview"
        >
          <CloseIcon className="w-6 h-6" />
        </button>
      </div>
    </div>
  );
};
