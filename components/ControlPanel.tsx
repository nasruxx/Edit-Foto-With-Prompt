
import React from 'react';
import { SpinnerIcon } from './icons';

interface ControlPanelProps {
  prompt: string;
  onPromptChange: (value: string) => void;
  onGenerate: () => void;
  isLoading: boolean;
  isReady: boolean;
  error: string | null;
}

export const ControlPanel: React.FC<ControlPanelProps> = ({ prompt, onPromptChange, onGenerate, isLoading, isReady, error }) => {
  const buttonDisabled = isLoading || !isReady;

  return (
    <footer className="bg-gray-900/80 backdrop-blur-sm border-t border-gray-700 sticky bottom-0 z-10 py-4">
      <div className="container mx-auto px-4">
        <div className="flex flex-col sm:flex-row items-center gap-4">
          <input
            type="text"
            value={prompt}
            onChange={(e) => onPromptChange(e.target.value)}
            placeholder={isReady ? "e.g., make the sky look like a galaxy" : "Upload an image first"}
            className="w-full flex-grow bg-gray-700 border border-gray-600 text-white placeholder-gray-400 rounded-md px-4 py-3 focus:ring-2 focus:ring-purple-500 focus:border-purple-500 outline-none transition duration-200"
            disabled={!isReady}
          />
          <button
            onClick={onGenerate}
            disabled={buttonDisabled}
            className="w-full sm:w-auto flex items-center justify-center px-6 py-3 border border-transparent text-base font-medium rounded-md text-white bg-purple-600 hover:bg-purple-700 disabled:bg-gray-600 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-900 focus:ring-purple-500 transition-all duration-200"
          >
            {isLoading ? (
              <>
                <SpinnerIcon className="w-5 h-5 mr-2" />
                Generating...
              </>
            ) : (
              'Generate'
            )}
          </button>
        </div>
        {error && <p className="text-red-400 text-sm mt-2 text-center sm:text-left">{error}</p>}
      </div>
    </footer>
  );
};
