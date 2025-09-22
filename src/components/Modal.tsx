"use client";

import { useEffect, useRef } from 'react';
import { X } from 'lucide-react';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  children: React.ReactNode;
  className?: string;
  showCloseButton?: boolean;
  size?: 'sm' | 'md' | 'lg' | 'xl' | 'full';
  preventCloseOnClickOutside?: boolean;
  showConfirmationOnClose?: boolean;
  confirmationMessage?: string;
}

export default function Modal({ 
  isOpen, 
  onClose, 
  title, 
  children, 
  className = '',
  showCloseButton = true,
  size = 'md',
  preventCloseOnClickOutside = false,
  showConfirmationOnClose = false,
  confirmationMessage = 'Voulez-vous vraiment fermer ? Les données non sauvegardées seront perdues.'
}: ModalProps) {
  const modalRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (modalRef.current && !modalRef.current.contains(event.target as Node)) {
        if (!preventCloseOnClickOutside) {
          if (showConfirmationOnClose) {
            if (window.confirm(confirmationMessage)) {
              onClose();
            }
          } else {
            onClose();
          }
        }
      }
    };

    const handleEscKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      document.addEventListener('keydown', handleEscKey);
      document.body.style.overflow = 'hidden';
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleEscKey);
      document.body.style.overflow = 'unset';
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const sizeClasses = {
    'sm': 'max-w-md',
    'md': 'max-w-2xl',
    'lg': 'max-w-4xl',
    'xl': 'max-w-6xl',
    'full': 'max-w-[95vw]'
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
      <div 
        ref={modalRef}
        className={`bg-white rounded-2xl shadow-xl w-full ${sizeClasses[size]} max-h-[90vh] overflow-hidden flex flex-col ${className}`}
      >
        {(title || showCloseButton) && (
          <div className="flex items-center justify-between p-6 border-b border-gray-200">
            {title && (
              <h2 className="text-xl font-semibold text-[#2c3e50]">{title}</h2>
            )}
            {showCloseButton && (
              <button
                onClick={() => {
                  if (showConfirmationOnClose) {
                    if (window.confirm(confirmationMessage)) {
                      onClose();
                    }
                  } else {
                    onClose();
                  }
                }}
                className="ml-auto p-2 hover:bg-gray-100 rounded-full transition-colors"
                aria-label="Fermer"
              >
                <X className="w-5 h-5 text-gray-500" />
              </button>
            )}
          </div>
        )}
        <div className="flex-1 overflow-y-auto">
          {children}
        </div>
      </div>
    </div>
  );
}