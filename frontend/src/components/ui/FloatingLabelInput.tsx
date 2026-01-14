import React from 'react';

interface FloatingLabelInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label: string;
  id: string;
  error?: string;
}

const FloatingLabelInput: React.FC<FloatingLabelInputProps> = ({ label, id, error, className, ...props }) => {
  return (
    <div className="relative">
      <input
        type="text"
        id={id}
        className={`
          block w-full rounded-lg border-gray-200 bg-gray-50 px-4 pt-6 pb-2 text-gray-900 placeholder-transparent shadow-sm transition-all
          focus:border-black focus:bg-white focus:ring-1 focus:ring-black focus:outline-none 
          peer 
          ${error ? 'border-red-500 focus:border-red-500 focus:ring-red-500' : ''}
          ${className}
        `}
        placeholder={label}
        {...props}
      />
      <label
        htmlFor={id}
        className={`
          absolute left-4 top-1.5 text-xs text-gray-500 font-medium transition-all 
          peer-placeholder-shown:top-4 peer-placeholder-shown:text-sm peer-placeholder-shown:text-gray-400 
          peer-focus:top-1.5 peer-focus:text-xs peer-focus:text-black
          ${error ? 'text-red-500 peer-focus:text-red-500' : ''}
        `}
      >
        {label} {props.required && <span className="text-red-500">*</span>}
      </label>
      {error && <p className="mt-1 text-xs text-red-500">{error}</p>}
    </div>
  );
};

export default FloatingLabelInput;
