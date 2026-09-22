import React from 'react';
import { cn } from '@/lib/utils';

export interface KeenIconProps {
  /** Icon name (e.g., 'abstract-1', 'user', 'home') */
  name: string;
  /** Icon size */
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl' | '2xl' | '3xl';
  /** Additional CSS classes */
  className?: string;
  /** Primary color (affects the main icon part) */
  primaryColor?: string;
  /** Secondary color (affects the opacity overlay part) */
  secondaryColor?: string;
  /** Secondary opacity (default is 0.3) */
  secondaryOpacity?: number;
}

/**
 * KeenIcon component for displaying duotone icons
 * 
 * Usage:
 * <KeenIcon name="abstract-1" size="lg" />
 * <KeenIcon name="user" className="text-blue-500" />
 * <KeenIcon name="home" primaryColor="#000" secondaryColor="#666" />
 */
export const KeenIcon: React.FC<KeenIconProps> = ({
  name,
  size = 'md',
  className,
  primaryColor,
  secondaryColor,
  secondaryOpacity = 0.3,
  ...props
}) => {
  const iconClasses = cn(
    'ki-duotone',
    `ki-${name}`,
    size && `ki-${size}`,
    className
  );

  const style: React.CSSProperties & Record<string, any> = {};
  
  if (primaryColor || secondaryColor || secondaryOpacity !== 0.3) {
    if (primaryColor) {
      style['--ki-primary-color'] = primaryColor;
    }
    if (secondaryColor) {
      style['--ki-secondary-color'] = secondaryColor;
    }
    if (secondaryOpacity !== 0.3) {
      style['--ki-secondary-opacity'] = secondaryOpacity.toString();
    }
  }

  return (
    <i 
      className={iconClasses} 
      style={style}
      {...props}
    />
  );
};

// Export commonly used icon names for TypeScript autocomplete
export const IconNames = {
  // Abstract icons
  ABSTRACT_1: 'abstract-1',
  ABSTRACT_2: 'abstract-2',
  ABSTRACT_3: 'abstract-3',
  ABSTRACT_4: 'abstract-4',
  ABSTRACT_5: 'abstract-5',
  
  // Add more icon names here as needed
  // You can refer to the demo.html file to see all available icons
} as const;

export type IconName = typeof IconNames[keyof typeof IconNames];

export default KeenIcon;
