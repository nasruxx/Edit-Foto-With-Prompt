
import React from 'react';
import { SparklesIcon } from './icons';

export const Header: React.FC = () => {
  return (
    <header className="bg-gray-900/80 backdrop-blur-sm border-b border-gray-700 sticky top-0 z-10">
      <div className="container mx-auto px-4 py-3 flex items-center justify-center text-center">
        <SparklesIcon className="w-8 h-8 mr-3 text-purple-400" />
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-white">
            Gemini Image Editor
          </h1>
          <p className="text-sm text-gray-400">Edit images with text prompts using Gemini Nano Banana</p>
        </div>
      </div>
    </header>
  );
};
