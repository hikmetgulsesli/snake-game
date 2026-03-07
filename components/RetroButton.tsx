'use client';

import React from 'react';

interface RetroButtonProps {
  children: React.ReactNode;
  onClick?: () => void;
  variant?: 'primary' | 'secondary';
  size?: 'sm' | 'md' | 'lg';
  disabled?: boolean;
  className?: string;
  type?: 'button' | 'submit' | 'reset';
  'data-testid'?: string;
}

/**
 * RetroButton Component
 * 
 * A pixel-art styled button with neon glow effects.
 * Used consistently across the game for all interactive buttons.
 */
export function RetroButton({
  children,
  onClick,
  variant = 'primary',
  size = 'md',
  disabled = false,
  className = '',
  type = 'button',
  'data-testid': dataTestId,
}: RetroButtonProps) {
  const baseStyles = 'inline-flex items-center justify-center font-bold uppercase tracking-wider transition-all duration-200 rounded-full cursor-pointer';
  
  const variantStyles = {
    primary: disabled
      ? 'bg-gray-600 text-gray-400 cursor-not-allowed'
      : 'bg-[#39ff14] text-[#0a0a0a] hover:shadow-[0_0_20px_rgba(57,255,20,0.5)] active:scale-95',
    secondary: disabled
      ? 'bg-[#1e1e1e] border border-gray-600 text-gray-500 cursor-not-allowed'
      : 'bg-[#1e1e1e] border border-[#2a2a2a] text-white hover:border-[#39ff14] hover:text-[#39ff14] active:scale-95',
  };

  const sizeStyles = {
    sm: 'px-4 py-2 text-xs',
    md: 'px-6 py-3 text-sm',
    lg: 'px-8 py-4 text-base',
  };

  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      data-testid={dataTestId}
      className={`${baseStyles} ${variantStyles[variant]} ${sizeStyles[size]} ${className}`}
    >
      {children}
    </button>
  );
}

export default RetroButton;
