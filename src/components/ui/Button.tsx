import React from 'react';
import { Loader } from './Loader';

type ButtonVariant = 'primary' | 'secondary' | 'ghost' | 'outline' | 'danger' | 'back';
type ButtonSize = 'xs' | 'sm' | 'md' | 'lg';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  icon?: React.ReactNode;
  iconPosition?: 'left' | 'right';
  isLoading?: boolean;
  children?: React.ReactNode;
}

const variantClasses: Record<ButtonVariant, string> = {
  primary: 'bg-blue-600 hover:bg-blue-700 text-white font-semibold shadow-sm hover:shadow-md',
  secondary: 'bg-slate-50 border border-slate-300 text-slate-700 hover:bg-slate-100 font-medium',
  ghost: 'bg-transparent hover:bg-slate-100 text-slate-600',
  outline: 'bg-transparent border border-slate-300 text-slate-700 hover:bg-slate-50',
  danger: 'bg-red-600 hover:bg-red-700 text-white font-semibold',
  back: 'bg-transparent border-none hover:bg-slate-100 text-slate-600 p-2 rounded-full',
};

const sizeClasses: Record<ButtonSize, string> = {
  xs: 'px-2.5 py-1 text-xs',
  sm: 'px-4 py-1.5 text-sm',
  md: 'px-6 py-2.5 text-sm',
  lg: 'px-8 py-3 text-base',
};

export const Button: React.FC<ButtonProps> = ({
  variant = 'primary',
  size = 'md',
  icon,
  iconPosition = 'left',
  isLoading = false,
  disabled,
  className = '',
  children,
  ...props
}) => {
  const isDisabled = disabled || isLoading;

  const loaderSize = size === 'lg' ? 'sm' : size === 'xs' ? 'xs' : 'sm';

  return (
    <button
      disabled={isDisabled}
      className={`
        btn cursor-pointer flex items-center gap-2 transition-all
        ${variant === 'back' ? '' : 'rounded-lg'}
        ${variant === 'back' ? '' : sizeClasses[size]}
        ${variantClasses[variant]}
        ${isDisabled ? 'opacity-70 cursor-not-allowed' : ''}
        ${className}
      `.trim().replace(/\s+/g, ' ')}
      {...props}
    >
      {isLoading ? (
        <Loader size={loaderSize} />
      ) : (
        <>
          {icon && iconPosition === 'left' && icon}
          {children}
          {icon && iconPosition === 'right' && icon}
        </>
      )}
    </button>
  );
};
