import React from 'react';

const Button = ({ children, type = 'button', onClick, disabled = false, className = '', variant = 'primary' }) => {
  // Determine color scheme based on variant
  const colorScheme = {
    primary: 'border-cyber-blue text-cyber-blue hover:border-cyber-yellow hover:text-cyber-yellow',
    secondary: 'border-cyber-pink text-cyber-pink hover:border-cyber-yellow hover:text-cyber-yellow',
    danger: 'border-red-500 text-red-500 hover:border-red-300 hover:text-red-300',
    success: 'border-green-500 text-green-500 hover:border-green-300 hover:text-green-300',
  }[variant] || 'border-cyber-blue text-cyber-blue hover:border-cyber-yellow hover:text-cyber-yellow';

  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={`relative py-3 px-6 bg-cyber-darker border-2 ${colorScheme} 
                 font-bold uppercase tracking-wider transition-colors duration-300 
                 focus:outline-none disabled:opacity-50 disabled:cursor-not-allowed 
                 font-mono hover:shadow-[0_0_10px_rgba(5,217,232,0.5)] ${className}`}
    >
      {disabled ? '[PROCESSING...]' : children}
    </button>
  );
};

export default Button;
