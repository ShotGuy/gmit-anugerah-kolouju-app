import React, { useState, useEffect } from 'react';
import { Phone, MessageCircle, AlertCircle } from 'lucide-react';

import { formatPhoneForInput, formatPhoneToWhatsApp, validateIndonesianPhone, generateWhatsAppUrl } from '@/lib/phoneUtils';

const PhoneInput = ({
  value = '',
  onChange,
  onBlur,
  placeholder = 'Contoh: 081234567890',
  disabled = false,
  required = false,
  error = null,
  showWhatsAppButton = true,
  className = '',
  ...props
}) => {
  const [inputValue, setInputValue] = useState('');
  const [isValid, setIsValid] = useState(true);

  useEffect(() => {
    // Format the initial value for display
    if (value) {
      setInputValue(formatPhoneForInput(value));
      setIsValid(validateIndonesianPhone(value));
    } else {
      setInputValue('');
      setIsValid(true);
    }
  }, [value]);

  const handleInputChange = (e) => {
    let inputVal = e.target.value;

    // Handle +62 format input - allow user to type +62 directly
    if (inputVal.startsWith('+62')) {
      // Keep +62 and remove non-digits from the rest
      inputVal = '+62' + inputVal.substring(3).replace(/\D/g, '');

      // Show +62 format directly in input
      setInputValue(inputVal);

      // Limit length to reasonable Indonesian phone number length
      if (inputVal.length > 15) {
        inputVal = inputVal.substring(0, 15);
        setInputValue(inputVal);
      }
    } else {
      // Handle 0/8 format input - remove non-digits
      inputVal = inputVal.replace(/\D/g, '');

      // Limit length
      if (inputVal.length > 13) {
        inputVal = inputVal.substring(0, 13);
      }

      // Format for display (starting with 0 for user-friendly input)
      const displayValue = formatPhoneForInput(inputVal);
      setInputValue(displayValue);
    }

    // Validate the number
    const valid = !inputVal || validateIndonesianPhone(inputVal);
    setIsValid(valid);

    // Call parent onChange with WhatsApp format (+62)
    if (onChange) {
      const whatsappFormat = inputVal ? formatPhoneToWhatsApp(inputVal) : '';
      onChange({
        target: {
          name: e.target.name,
          value: whatsappFormat
        }
      });
    }
  };

  const handleBlur = (e) => {
    if (onBlur) {
      // Send WhatsApp format on blur
      const whatsappFormat = inputValue ? formatPhoneToWhatsApp(inputValue) : '';
      onBlur({
        target: {
          name: e.target.name,
          value: whatsappFormat
        }
      });
    }
  };

  const handleWhatsAppClick = () => {
    if (inputValue && isValid) {
      const url = generateWhatsAppUrl(inputValue);
      window.open(url, '_blank');
    }
  };

  const hasError = error || !isValid;

  return (
    <div className="space-y-1">
      <div className="relative">
        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
          <Phone className="h-4 w-4 text-gray-400" />
        </div>

        <input
          className={`
            w-full pl-10 ${showWhatsAppButton && isValid && inputValue ? 'pr-12' : 'pr-3'} py-2
            border border-gray-300 dark:border-gray-600 rounded-lg
            bg-white dark:bg-gray-800
            text-gray-900 dark:text-gray-100
            focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 focus:border-transparent
            disabled:bg-gray-50 dark:disabled:bg-gray-700 disabled:text-gray-500
            ${hasError ? 'border-red-500 dark:border-red-400' : ''}
            transition-colors duration-200
            ${className}
          `}
          disabled={disabled}
          placeholder={placeholder}
          required={required}
          type="tel"
          value={inputValue}
          onBlur={handleBlur}
          onChange={handleInputChange}
          {...props}
        />

        {showWhatsAppButton && isValid && inputValue && (
          <button
            className="absolute inset-y-0 right-0 pr-3 flex items-center text-green-600 hover:text-green-700 dark:text-green-400 dark:hover:text-green-300"
            title="Buka di WhatsApp"
            type="button"
            onClick={handleWhatsAppClick}
          >
            <MessageCircle className="h-4 w-4" />
          </button>
        )}
      </div>

      {/* Validation Messages */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          {!isValid && inputValue && (
            <div className="flex items-center text-red-600 dark:text-red-400 text-xs">
              <AlertCircle className="h-3 w-3 mr-1" />
              <span>Format nomor tidak valid</span>
            </div>
          )}

          {error && (
            <div className="flex items-center text-red-600 dark:text-red-400 text-xs">
              <AlertCircle className="h-3 w-3 mr-1" />
              <span>{error}</span>
            </div>
          )}
        </div>

        {/* Format Info */}
        {inputValue && isValid && (
          <div className="text-xs text-gray-500 dark:text-gray-400">
            WhatsApp: {formatPhoneToWhatsApp(inputValue)}
          </div>
        )}
      </div>

      {/* Help Text */}
      <div className="text-xs text-gray-500 dark:text-gray-400">
        Format: 081234567890 atau +6281234567890
      </div>
    </div>
  );
};

export default PhoneInput;