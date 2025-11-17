
import React, { useState, useCallback } from 'react';
import { Header } from './components/Header';
import { ImageCard } from './components/ImageCard';
import { ControlPanel } from './components/ControlPanel';
import { fileToBase64, downloadImage } from './utils/fileUtils';
import { editImageWithGemini } from './services/geminiService';
import { UploadIcon } from './components/icons';
import { ImagePreviewModal } from './components/ImagePreviewModal';

const App: React.FC = () => {
  const [originalImages, setOriginalImages] = useState<string[]>([]);
  const [editedImages, setEditedImages] = useState<string[]>([]);
  const [prompt, setPrompt] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [previewImage, setPreviewImage] = useState<string | null>(null);

  const handleImageSelect = useCallback(async (files: File[]) => {
    setIsLoading(true);
    setError(null);
    try {
      const base64Promises = files.map(file => fileToBase64(file));
      const newImages = await Promise.all(base64Promises);
      setOriginalImages(prev => [...prev, ...newImages]);
    } catch (err) {
      setError('Failed to load images. Please try again.');
    } finally {
      setIsLoading(false);
    }
  }, []);
  
  const handleGenerate = useCallback(async () => {
    if (originalImages.length === 0 || !prompt) {
      setError('Please upload one or more images and enter a prompt.');
      return;
    }
    
    setIsLoading(true);
    setError(null);
    setEditedImages([]);

    try {
      const editPromises = originalImages.map(base64Image => 
        editImageWithGemini(base64Image, prompt)
      );
      const results = await Promise.all(editPromises);
      setEditedImages(results);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'An unexpected error occurred.';
      setError(`Generation failed: ${errorMessage}`);
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  }, [originalImages, prompt]);

  const handleClear = useCallback(() => {
    setOriginalImages([]);
    setEditedImages([]);
    setPrompt('');
    setError(null);
  }, []);

  const handleRemoveOriginalImage = useCallback((indexToRemove: number) => {
    setOriginalImages(prev => prev.filter((_, index) => index !== indexToRemove));
    // If removing the last original image, also clear edited images
    if (originalImages.length === 1) {
      setEditedImages([]);
    }
  }, [originalImages.length]);

  const handleReEdit = useCallback((indexToReEdit: number) => {
    if (editedImages[indexToReEdit]) {
      setOriginalImages([editedImages[indexToReEdit]]);
      setEditedImages([]);
      setError(null);
      // Optional: scroll to top or focus prompt
      window.scrollTo(0, 0);
    }
  }, [editedImages]);

  const handleDownload = useCallback((indexToDownload: number) => {
    if(editedImages[indexToDownload]){
        downloadImage(editedImages[indexToDownload], `edited-${Date.now()}.png`);
    }
  }, [editedImages]);

  const placeholderContent = (
    <div className="flex flex-col items-center justify-center text-gray-500 text-center h-full p-4">
      <UploadIcon className="w-16 h-16 mb-4" />
      <h3 className="font-semibold text-lg text-gray-400">Upload Image(s)</h3>
      <p className="text-sm">Click or drag & drop files to start editing.</p>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-900 text-white flex flex-col font-sans">
      <Header />
      <main className="flex-grow container mx-auto p-4 flex flex-col">
        <div className="flex-grow grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-8 mb-4">
          <ImageCard 
            title="Original" 
            imageSrcs={originalImages}
            onImageSelect={handleImageSelect}
            onClear={handleClear}
            placeholder={placeholderContent}
            onImageClick={setPreviewImage}
            onRemoveImage={handleRemoveOriginalImage}
          />
          <ImageCard 
            title="Edited" 
            imageSrcs={editedImages} 
            isLoading={isLoading && originalImages.length > 0}
            loadingPlaceholderCount={originalImages.length}
            onImageClick={setPreviewImage}
            onReEdit={handleReEdit}
            onDownload={handleDownload}
          />
        </div>
      </main>
      <ControlPanel
        prompt={prompt}
        onPromptChange={setPrompt}
        onGenerate={handleGenerate}
        isLoading={isLoading}
        isReady={originalImages.length > 0}
        error={error}
      />
      {previewImage && (
        <ImagePreviewModal 
          imageUrl={previewImage}
          onClose={() => setPreviewImage(null)}
        />
      )}
    </div>
  );
};

export default App;
