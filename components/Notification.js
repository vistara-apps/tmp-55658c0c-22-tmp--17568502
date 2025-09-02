'use client';

import { useState, useEffect } from 'react';

export default function Notification({ 
  message, 
  type = 'info', 
  duration = 5000, 
  onClose 
}) {
  const [visible, setVisible] = useState(true);
  
  useEffect(() => {
    if (duration > 0) {
      const timer = setTimeout(() => {
        setVisible(false);
        if (onClose) onClose();
      }, duration);
      
      return () => clearTimeout(timer);
    }
  }, [duration, onClose]);
  
  const handleClose = () => {
    setVisible(false);
    if (onClose) onClose();
  };
  
  if (!visible) return null;
  
  const bgColor = {
    info: 'bg-blue-50 border-blue-200',
    success: 'bg-green-50 border-green-200',
    warning: 'bg-yellow-50 border-yellow-200',
    error: 'bg-red-50 border-red-200',
  }[type];
  
  const textColor = {
    info: 'text-blue-800',
    success: 'text-green-800',
    warning: 'text-yellow-800',
    error: 'text-red-800',
  }[type];
  
  const icon = {
    info: 'ℹ️',
    success: '✅',
    warning: '⚠️',
    error: '❌',
  }[type];
  
  return (
    <div className={`fixed bottom-4 right-4 p-4 rounded-md shadow-md border ${bgColor} max-w-md z-50`}>
      <div className="flex items-start">
        <span className="mr-2">{icon}</span>
        <div className={`flex-1 ${textColor}`}>{message}</div>
        <button
          className="ml-4 text-gray-500 hover:text-gray-700"
          onClick={handleClose}
        >
          ✕
        </button>
      </div>
    </div>
  );
}

