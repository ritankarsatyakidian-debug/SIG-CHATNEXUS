import React, { useState, useEffect } from 'react';

interface QuantumTextProps {
  text: string;
  speed?: number;
}

export const QuantumText: React.FC<QuantumTextProps> = ({ text, speed = 30 }) => {
  const [display, setDisplay] = useState('');
  const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789@#$%&*";

  useEffect(() => {
    let i = 0;
    const interval = setInterval(() => {
      setDisplay(prev => {
        if (i >= text.length) {
            clearInterval(interval);
            return text;
        }
        
        // Scramble the rest
        let scrambled = '';
        for(let j = i; j < text.length; j++) {
            scrambled += chars.charAt(Math.floor(Math.random() * chars.length));
        }
        
        const currentFixed = text.substring(0, i + 1);
        i++;
        return currentFixed + scrambled.substring(1);
      });
    }, speed);

    return () => clearInterval(interval);
  }, [text, speed]);

  return <span className="font-mono">{display}</span>;
};