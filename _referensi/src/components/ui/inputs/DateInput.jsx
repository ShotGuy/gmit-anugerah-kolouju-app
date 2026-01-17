import React from 'react';
import { Calendar } from 'lucide-react';

/**
 * DateInput component for form date inputs with validation and error handling
 */
const DateInput = ({
  label,
  name,
  value = '',
  onChange,
  onBlur,
  error = null,
  required = false,
  disabled = false,
  placeholder = '',
  min = null,
  max = null,
  className = '',
  labelClassName = '',
  inputClassName = '',
  ...props
}) => {
  const handleChange = (e) => {
    const newValue = e.target.value;
    if (onChange) {
      onChange(newValue);
    }
  };

  const handleBlur = (e) => {
    if (onBlur) {
      onBlur(e);
    }
  };

  // Generate input ID based on name or random string
  const inputId = name || `date-input-${Math.random().toString(36).substr(2, 9)}`;

  return (
    <div className={`space-y-2 ${className}`}>
      {label && (
        <label
          className={`block text-sm font-medium text-gray-700 dark:text-gray-300 ${
            required ? "after:content-['*'] after:text-red-500 after:ml-1" : ''
          } ${labelClassName}`}
          htmlFor={inputId}
        >
          {label}
        </label>
      )}

      <div className="relative">
        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
          <Calendar className="h-4 w-4 text-gray-400" />
        </div>

        <input
          className={`
            block w-full pl-10 pr-3 py-2 border rounded-lg shadow-sm text-sm
            focus:ring-2 focus:ring-blue-500 focus:border-blue-500
            disabled:bg-gray-50 disabled:text-gray-500 disabled:cursor-not-allowed
            dark:bg-gray-800 dark:border-gray-600 dark:text-gray-100
            dark:focus:ring-blue-400 dark:focus:border-blue-400
            dark:disabled:bg-gray-700 dark:disabled:text-gray-400
            ${error
              ? 'border-red-300 focus:border-red-500 focus:ring-red-500 dark:border-red-600'
              : 'border-gray-300 dark:border-gray-600'
            }
            ${inputClassName}
          `}
          disabled={disabled}
          id={inputId}
          max={max}
          min={min}
          name={name}
          placeholder={placeholder}
          required={required}
          type="date"
          value={value || ''}
          onBlur={handleBlur}
          onChange={handleChange}
          {...props}
        />
      </div>

      {error && (
        <p className="text-sm text-red-600 dark:text-red-400">
          {error}
        </p>
      )}
    </div>
  );
};

export default DateInput;