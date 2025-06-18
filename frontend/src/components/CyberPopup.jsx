import React, { useEffect } from 'react';
import Button from './Button';
import GlitchText from './GlitchText';

const CyberPopup = ({ 
  isOpen, 
  onClose, 
  title = 'SYSTEM_ALERT', 
  message,
  type = 'info',  // 'info', 'success', 'error', 'confirm'
  onConfirm = null,
  confirmText = 'CONFIRM',
  cancelText = 'CANCEL'
}) => {
  useEffect(() => {
    if (isOpen) {
      // Prevent scrolling when popup is open
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'auto';
    }
    
    return () => {
      document.body.style.overflow = 'auto';
    };
  }, [isOpen]);
  
  if (!isOpen) return null;
  
  // Color schemes based on type
  const colorSchemes = {
    info: 'border-cyber-blue',
    success: 'border-green-500',
    error: 'border-cyber-pink',
    confirm: 'border-cyber-yellow'
  };
  
  const borderColor = colorSchemes[type] || colorSchemes.info;
  
  return (
    <div className="fixed inset-0 flex items-center justify-center z-50">
      {/* Backdrop with scanline effect */}
      <div 
        className="absolute inset-0 bg-cyber-darker bg-opacity-80 backdrop-blur-sm"
        onClick={onClose}
      >
        <div className="h-full w-full" style={{
          backgroundImage: 'repeating-linear-gradient(0deg, rgba(5, 217, 232, 0.1), rgba(5, 217, 232, 0.1) 1px, transparent 1px, transparent 2px)',
          backgroundSize: '100% 2px',
        }}></div>
      </div>
      
      {/* Popup Window */}
      <div 
        className={`cyber-popup w-full max-w-md z-10 ${borderColor} border-2 bg-cyber-darker p-0 
                   shadow-xl transform transition-all duration-300 ease-out`}
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className={`p-4 border-b ${borderColor} flex items-center justify-between`}>
          <GlitchText className="text-xl">{title}</GlitchText>
          <button 
            onClick={onClose}
            className="text-cyber-blue hover:text-cyber-pink focus:outline-none font-mono"
          >
            [X]
          </button>
        </div>
        
        {/* Body */}
        <div className="p-6 font-mono text-cyber-blue">
          <div className="mb-2 text-xs opacity-60">[SYSTEM_MESSAGE]:</div>
          <div className="text-base">{message}</div>
        </div>
        
        {/* Footer */}
        <div className="p-4 border-t border-cyber-darker flex justify-end space-x-4">
          {type === 'confirm' && (
            <Button variant="secondary" onClick={onClose}>
              {cancelText}
            </Button>
          )}
          <Button 
            variant={type === 'error' ? 'danger' : type === 'success' ? 'success' : 'primary'} 
            onClick={type === 'confirm' ? onConfirm : onClose}
          >
            {type === 'confirm' ? confirmText : 'ACKNOWLEDGE'}
          </Button>
        </div>
      </div>
      
      <style jsx>{`
        .cyber-popup {
          clip-path: polygon(
            0 20px, 20px 0, 
            calc(100% - 20px) 0, 100% 20px, 
            100% calc(100% - 20px), calc(100% - 20px) 100%, 
            20px 100%, 0 calc(100% - 20px)
          );
        }
      `}</style>
    </div>
  );
};

export default CyberPopup;
