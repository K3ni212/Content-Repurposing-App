import React, { useEffect } from 'react';
import { XCloseIcon } from './icons/XCloseIcon';

interface ToastProps {
  message: string;
  type: 'success' | 'error';
  onDismiss: () => void;
}

export const Toast: React.FC<ToastProps> = ({ message, type, onDismiss }) => {
  useEffect(() => {
    const timer = setTimeout(onDismiss, 5000);
    return () => clearTimeout(timer);
  }, [onDismiss]);

  const baseClasses = 'fixed bottom-5 right-5 p-4 rounded-lg shadow-lg text-white text-sm z-50 animate-fade-in flex items-center justify-between';
  const typeClasses = {
    success: 'bg-emerald-500',
    error: 'bg-red-500',
  };

  return (
    <div className={`${baseClasses} ${typeClasses[type]}`}>
      <span>{message}</span>
      <button onClick={onDismiss} aria-label="Dismiss" className="ml-4 -mr-1 p-1 rounded-full hover:bg-black/20 transition-colors">
        <XCloseIcon className="w-4 h-4" />
      </button>
    </div>
  );
};
