"use client"

import { useState, useRef, useEffect } from "react";
import { createPortal } from "react-dom";
import { MoreVertical } from "lucide-react";

import { Button } from "./Button";

export default function ActionsButtonVertical({
  actions = [],
  item,
  className = "",
  size = "sm",
}) {
  const [isOpen, setIsOpen] = useState(false);
  const [dropdownPosition, setDropdownPosition] = useState({ top: 0, left: 0 });
  const buttonRef = useRef(null);

  // Calculate dropdown position when opened
  useEffect(() => {
    if (isOpen && buttonRef.current) {
      const buttonRect = buttonRef.current.getBoundingClientRect();
      const dropdownWidth = 192; // w-48 = 12rem = 192px
      const viewportWidth = window.innerWidth;
      const viewportHeight = window.innerHeight;

      // Calculate horizontal position
      let left = buttonRect.right - dropdownWidth;

      if (left < 8) {
        left = buttonRect.left;
      }

      if (left + dropdownWidth > viewportWidth - 8) {
        left = viewportWidth - dropdownWidth - 8;
      }

      // Calculate vertical position
      let top = buttonRect.bottom + 8;
      const dropdownHeight = actions.length * 40 + 16; // Approximate height

      if (top + dropdownHeight > viewportHeight - 8) {
        top = buttonRect.top - dropdownHeight - 8;
      }

      setDropdownPosition({ top, left });
    }
  }, [isOpen, actions.length]);

  if (actions.length === 0) return null;

  return (
    <div className={`relative ${className}`}>
      <Button
        ref={buttonRef}
        className="p-2"
        size={size}
        variant="outline"
        onClick={() => setIsOpen(!isOpen)}
      >
        <MoreVertical className="h-4 w-4" />
      </Button>

      {isOpen &&
        createPortal(
          <>
            {/* Backdrop */}
            <div
              aria-hidden="true"
              className="fixed inset-0 z-40 bg-transparent"
              onClick={() => setIsOpen(false)}
            />

            {/* Dropdown Menu */}
            <div
              className="fixed z-50 w-48 bg-white rounded-md shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none"
              style={{
                top: `${dropdownPosition.top}px`,
                left: `${dropdownPosition.left}px`,
              }}
            >
              <div className="py-1">
                {actions.map((action, index) => (
                  <button
                    key={index}
                    className={`
                      group flex items-center w-full px-4 py-2 text-sm transition-colors
                      ${
                        action.disabled
                          ? "text-gray-400 cursor-not-allowed"
                          : action.variant === "destructive"
                            ? "text-red-700 hover:bg-red-50"
                            : "text-gray-700 hover:bg-gray-100"
                      }
                    `}
                    disabled={action.disabled}
                    onClick={() => {
                      action.onClick(item);
                      setIsOpen(false);
                    }}
                  >
                    {action.icon && (
                      <action.icon
                        className={`mr-3 h-4 w-4 ${
                          action.disabled
                            ? "text-gray-400"
                            : action.variant === "destructive"
                              ? "text-red-500"
                              : "text-gray-500"
                        }`}
                      />
                    )}
                    {action.label}
                  </button>
                ))}
              </div>
            </div>
          </>,
          document.body
        )}
    </div>
  );
}
