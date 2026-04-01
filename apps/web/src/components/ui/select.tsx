import React, { useState } from 'react';

export interface SelectProps {
  children: React.ReactNode;
  value?: string;
  onValueChange?: (value: string) => void;
  placeholder?: string;
  className?: string;
}

export function Select({ children, value, onValueChange, placeholder, className = '' }: SelectProps) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className={`relative ${className}`}>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 bg-white"
      >
        {value || placeholder}
        <svg className="absolute right-2 top-3 h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>
      
      {isOpen && (
        <div className="absolute z-10 mt-1 w-full bg-white border border-gray-300 rounded-md shadow-lg">
          <div className="py-1">
            {children}
          </div>
        </div>
      )}
    </div>
  );
}

export interface SelectItemProps {
  children: React.ReactNode;
  value: string;
  onSelect?: (value: string) => void;
  className?: string;
}

export function SelectItem({ children, value, onSelect, className = '' }: SelectItemProps) {
  return (
    <div
      onClick={() => onSelect?.(value)}
      className={`px-3 py-2 cursor-pointer hover:bg-gray-100 ${className}`}
    >
      {children}
    </div>
  );
}

export interface SelectContentProps {
  children: React.ReactNode;
  className?: string;
}

export function SelectContent({ children, className = '' }: SelectContentProps) {
  return (
    <div className={`py-1 ${className}`}>
      {children}
    </div>
  );
}

export interface SelectTriggerProps {
  children: React.ReactNode;
  onClick?: () => void;
  className?: string;
}

export function SelectTrigger({ children, onClick, className = '' }: SelectTriggerProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 bg-white ${className}`}
    >
      {children}
    </button>
  );
}

export interface SelectValueProps {
  placeholder?: string;
  value?: string;
  className?: string;
}

export function SelectValue({ placeholder, value, className = '' }: SelectValueProps) {
  return (
    <span className={className}>
      {value || placeholder}
    </span>
  );
}
