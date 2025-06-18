import React from 'react';

const GlitchText = ({ children, className = '' }) => {
  return (
    <div className={`font-mono relative ${className} border-glitch`}>
      {/* Main text - fully readable */}
      <span className="relative z-20 inline-block text-cyber-blue font-bold px-4 py-2">
        {children}
      </span>
      
      <style jsx>{`
        .border-glitch {
          position: relative;
          display: inline-block;
        }
        
        .border-glitch::before, .border-glitch::after {
          content: '';
          position: absolute;
          inset: -3px;
          background: transparent;
          border: 1px solid #05d9e8;
          pointer-events: none;
          z-index: 1;
        }
        
        .border-glitch::before {
          animation: borderGlitch 6s infinite linear;
          filter: drop-shadow(0 0 2px #05d9e8);
        }
        
        .border-glitch::after {
          border-color: #ff2a6d;
          animation: borderGlitch 4s infinite linear reverse;
          filter: drop-shadow(0 0 2px #ff2a6d);
        }
        
        @keyframes borderGlitch {
          0%, 97%, 100% { transform: translate(0); opacity: 0.7; }
          97.5% { transform: translate(-2px, 1px); opacity: 0.9; }
          98% { transform: translate(2px, -1px); opacity: 0.8; }
          98.5% { transform: translate(-1px, -1px); opacity: 0.9; }
          99% { transform: translate(1px, 1px); opacity: 0.7; }
        }
      `}</style>
    </div>
  );
};

export default GlitchText;
