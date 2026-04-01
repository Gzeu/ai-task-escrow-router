import React, { useState } from 'react';

export interface TabsProps {
  children: React.ReactNode;
  defaultValue?: string;
  className?: string;
}

export function Tabs({ children, defaultValue, className = '' }: TabsProps) {
  const [activeTab, setActiveTab] = useState(defaultValue || '');

  return (
    <div className={className}>
      {React.Children.map(children, (child, index) => {
        if (React.isValidElement(child)) {
          return React.cloneElement(child, {
            activeTab,
            onTabChange: setActiveTab,
            key: index
          });
        }
        return child;
      })}
    </div>
  );
}

export interface TabsListProps {
  children: React.ReactNode;
  className?: string;
}

export function TabsList({ children, className = '' }: TabsListProps) {
  return (
    <div className={`flex space-x-1 border-b border-gray-200 ${className}`}>
      {children}
    </div>
  );
}

export interface TabsTriggerProps {
  children: React.ReactNode;
  value: string;
  activeTab?: string;
  onTabChange?: (value: string) => void;
  className?: string;
}

export function TabsTrigger({ children, value, activeTab, onTabChange, className = '' }: TabsTriggerProps) {
  const isActive = activeTab === value;

  return (
    <button
      onClick={() => onTabChange?.(value)}
      className={`px-3 py-2 text-sm font-medium border-b-2 transition-colors ${
        isActive 
          ? 'border-blue-500 text-blue-600' 
          : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
      } ${className}`}
    >
      {children}
    </button>
  );
}

export interface TabsContentProps {
  children: React.ReactNode;
  value: string;
  activeTab?: string;
  className?: string;
}

export function TabsContent({ children, value, activeTab, className = '' }: TabsContentProps) {
  if (activeTab !== value) {
    return null;
  }

  return (
    <div className={`mt-4 ${className}`}>
      {children}
    </div>
  );
}
