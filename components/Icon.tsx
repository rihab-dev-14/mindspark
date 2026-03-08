import React from 'react';

interface IconProps {
  name: string;
  className?: string;
  type?: 'solid' | 'brands' | 'regular';
}

// Wrapper for FontAwesome icons with support for brands
export const Icon: React.FC<IconProps> = ({ name, className = '', type = 'solid' }) => {
  return <i className={`fa-${type} fa-${name} ${className}`} />;
};