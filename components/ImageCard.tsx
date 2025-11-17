
import React, { useRef } from 'react';
import { SpinnerIcon, CloseIcon, DownloadIcon, EditIcon, EyeIcon } from './icons';

interface ImageCardProps {
  title: string;
  imageSrcs: string[];
  isLoading?: boolean;
  onImageSelect?: (files: File[]) => void;
  onClear?: () => void;
  placeholder?: React.ReactNode;
  loadingPlaceholderCount?: number;
  onImageClick?: (src: string) => void;
  onRemoveImage?: (index: number) => void;
  onReEdit?: (index: number) => void;
  onDownload?: (index: number) => void;
}

const ImageThumbnail: React.FC<{
  src: string;
  index: number;
  title: string;
  onImageClick?: (src: string) => void;
  onRemoveImage?: (index: number) => void;
  onReEdit?: (index: number) => void;
  onDownload?: (index: number) => void;
}> = ({ src, index, title, onImageClick, onRemoveImage, onReEdit, onDownload }) => {
  return (
    <div className="group aspect-square rounded-md overflow-hidden bg-gray-700 relative">
      <img src={src} alt={`${title} ${index + 1}`} className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105" />
      <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center gap-2">
        {onImageClick && (
          <button onClick={() => onImageClick(src)} className="p-2 rounded-full bg-gray-800/70 hover:bg-gray-800 text-white" aria-label="Preview image">
            <EyeIcon className="w-5 h-5" />
          </button>
        )}
        {onDownload && (
           <button onClick={() => onDownload(index)} className="p-2 rounded-full bg-gray-800/70 hover:bg-gray-800 text-white" aria-label="Download image">
            <DownloadIcon className="w-5 h-5" />
          </button>
        )}
        {onReEdit && (
          <button onClick={() => onReEdit(index)} className="p-2 rounded-full bg-gray-800/70 hover:bg-gray-800 text-white" aria-label="Re-edit image">
            <EditIcon className="w-5 h-5" />
          </button>
        )}
      </div>
      {onRemoveImage && (
        <button 
          onClick={() => onRemoveImage(index)} 
          className="absolute top-1 right-1 p-1 rounded-full bg-gray-900/50 hover:bg-gray-900 text-white opacity-0 group-hover:opacity-100 transition-all"
          aria-label="Remove image"
        >
          <CloseIcon className="w-4 h-4" />
        </button>
      )}
    </div>
  );
};


export const ImageCard: React.FC<ImageCardProps> = ({ 
  title, 
  imageSrcs, 
  isLoading = false, 
  onImageSelect, 
  onClear,
  placeholder,
  loadingPlaceholderCount = 0,
  onImageClick,
  onRemoveImage,
  onReEdit,
  onDownload
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleCardClick = () => {
    if (onImageSelect && imageSrcs.length === 0) {
      fileInputRef.current?.click();
    }
  };

  const handleFiles = (files: FileList | null) => {
    if (!files || files.length === 0 || !onImageSelect) return;
    const imageFiles = Array.from(files).filter(file => file.type.startsWith('image/'));
    if (imageFiles.length > 0) {
      onImageSelect(imageFiles);
    }
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    handleFiles(event.target.files);
    if(event.target) event.target.value = '';
  };

  const handleDrop = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    event.stopPropagation();
    if(onImageSelect) handleFiles(event.dataTransfer.files);
  };

  const handleDragOver = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    event.stopPropagation();
  };
  
  const isInteractive = !!onImageSelect;

  const renderContent = () => {
    if (isLoading && loadingPlaceholderCount > 0) {
      return (
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {Array.from({ length: loadingPlaceholderCount }).map((_, index) => (
                  <div key={index} className="aspect-square bg-gray-700 rounded-md flex items-center justify-center">
                      <SpinnerIcon className="w-8 h-8 text-purple-400" />
                  </div>
              ))}
          </div>
      );
    }

    if (imageSrcs.length > 0) {
      return (
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
          {imageSrcs.map((src, index) => (
            <ImageThumbnail 
              key={index}
              src={src}
              index={index}
              title={title}
              onImageClick={onImageClick}
              onRemoveImage={onRemoveImage}
              onReEdit={onReEdit}
              onDownload={onDownload}
            />
          ))}
        </div>
      );
    }
    
    return (
        <div className="w-full h-full flex items-center justify-center cursor-pointer" onClick={handleCardClick}>
            {placeholder}
        </div>
    );
  }

  return (
    <div className="flex flex-col h-full">
      <div className="flex justify-center items-center relative mb-2 h-7">
        <h2 className="text-lg font-semibold text-gray-300">{title}</h2>
        {onClear && imageSrcs.length > 0 && !isLoading && (
          <button 
            onClick={onClear} 
            className="absolute right-0 text-sm text-gray-400 hover:text-white transition-colors flex items-center gap-1 rounded-md px-2 py-1 hover:bg-gray-700"
            aria-label="Clear all images"
          >
            <CloseIcon className="w-4 h-4" />
            Clear
          </button>
        )}
      </div>
      <div 
        className={`relative flex-grow bg-gray-800 border-2 border-dashed border-gray-600 rounded-lg overflow-hidden transition-all duration-300 ease-in-out ${isInteractive ? 'hover:border-purple-500 hover:bg-gray-700' : ''}`}
        onDrop={handleDrop}
        onDragOver={handleDragOver}
      >
        {isInteractive && <input type="file" ref={fileInputRef} onChange={handleFileChange} accept="image/*" className="hidden" multiple />}
        <div className="absolute inset-0 p-2 overflow-y-auto">
          {renderContent()}
        </div>
      </div>
    </div>
  );
};
