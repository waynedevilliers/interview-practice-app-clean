import React from 'react';
import { clsx } from 'clsx';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  children: React.ReactNode;
  className?: string;
}

export function Button({ children, className, ...props }: ButtonProps) {
  return (
    <button
      className={clsx(
        'px-4 py-2 rounded-md font-medium transition-colors',
        'bg-blue-600 text-white hover:bg-blue-700',
        'disabled:bg-gray-400 disabled:cursor-not-allowed',
        className
      )}
      {...props}
    >
      {children}
    </button>
  );
}