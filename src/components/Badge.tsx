'use client';

import { TrendingUp, TrendingDown } from 'lucide-react';
import React from 'react';

interface BadgeProps {
  children: React.ReactNode;
  isUp: boolean;
}

const Badge: React.FC<BadgeProps> = ({ children, isUp }) => {
  return (
    <div className={`flex items-center px-2 py-1 rounded-full text-xs font-medium ${
      isUp ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
    }`}>
      {isUp ? 
        <TrendingUp className="h-3 w-3 mr-1" /> : 
        <TrendingDown className="h-3 w-3 mr-1" />
      }
      {children}
    </div>
  );
};

export default Badge; 