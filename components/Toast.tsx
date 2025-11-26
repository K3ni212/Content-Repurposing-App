import React, { useEffect } from 'react';
import { XCloseIcon } from './icons/XCloseIcon';

interface ToastProps {
  message: string;
  type: 'success' | 'error';
  onDismiss: () => void;
  onUndo?: () => void;
}

export const Toast: React.FC<ToastProps> = ({ message, type, onDismiss, onUndo }) => {
  useEffect(() => {
    const timer = setTimeout(onDismiss, 5000);
    return () => clearTimeout(timer);
  }, [onDismiss]);

  const baseClasses = 'fixed bottom-5 right-5 p-4 rounded-lg shadow-lg text-white text-sm z-50 animate-fade-in flex items-center justify-between min-w-[300px]';
  const typeClasses = {
    success: 'bg-emerald-500',
    error: 'bg-red-500',
  };

  const handleUndo = () => {
    if (onUndo) {
        onUndo();
    }
    onDismiss();
  };

  return (
    <div className={`${baseClasses} ${typeClasses[type]}`}>
      <span className="flex-grow">{message}</span>
      <div className="flex items-center">
        {onUndo && (
          <button 
            onClick={handleUndo} 
            className="font-bold text-sm underline hover:opacity-80 transition-opacity mx-4"
          >
            Undo
          </button>
        )}
        <button onClick={onDismiss} aria-label="Dismiss" className="-mr-1 p-1 rounded-full hover:bg-black/20 transition-colors">
          <XCloseIcon className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};