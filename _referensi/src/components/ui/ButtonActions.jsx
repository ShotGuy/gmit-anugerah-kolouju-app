import { MoreVertical } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";

import { Button } from "./Button";

/**
 * Reusable ButtonActions Component
 * Supports both horizontal and vertical layouts with overflow handling
 */
export default function ButtonActions({
  actions = [],
  item,
  type = "vertical", // "vertical" | "horizontal"
  maxVisible = 3, // for horizontal type
  size = "sm",
  spacing = "gap-2",
  className = "",
  dropdownClassName = "",
}) {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [dropdownPosition, setDropdownPosition] = useState({ top: 0, left: 0 });
  const buttonRef = useRef(null);

  if (actions.length === 0) return null;

  // Filter actions based on their condition
  const availableActions = actions.filter((action) => {
    // Check if action has a condition function
    if (action.condition !== undefined) {
      if (typeof action.condition === "function") {
        return action.condition(item);
      }

      // If condition is a boolean value
      return action.condition;
    }

    // If no condition, show the action
    return true;
  });

  // Calculate dropdown position when opened
  useEffect(() => {
    if (isDropdownOpen && buttonRef.current) {
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
      const dropdownHeight = availableActions.length * 40 + 16; // Approximate height

      if (top + dropdownHeight > viewportHeight - 8) {
        top = buttonRect.top - dropdownHeight - 8;
      }

      setDropdownPosition({ top, left });
    }
  }, [isDropdownOpen, availableActions.length]);

  if (type === "horizontal") {
    const visibleActions = availableActions.slice(0, maxVisible);
    const hiddenActions = availableActions.slice(maxVisible);

    return (
      <div className={`flex items-center ${spacing} ${className}`}>
        {/* Visible Actions */}
        {visibleActions.map((action, index) => {
          const isDisabled =
            action.disabled && typeof action.disabled === "function"
              ? action.disabled(item)
              : action.disabled;

          // Handle href actions
          if (action.href && !isDisabled) {
            const href =
              typeof action.href === "function"
                ? action.href(item)
                : action.href;

            return (
              <Button
                key={index}
                asChild
                className={`
                  flex items-center
                  ${action.className || ""}
                  ${
                    action.variant === "destructive"
                      ? "text-red-600 hover:bg-red-50"
                      : ""
                  }
                  ${action.hideLabel ? "p-2" : ""}
                `}
                size={size}
                title={action.tooltip || action.label}
                variant={action.variant || "outline"}
              >
                <a href={href}>
                  {action.icon && (
                    <action.icon
                      className={`h-4 w-4 ${!action.hideLabel ? "sm:mr-1" : ""}`}
                    />
                  )}
                  {!action.hideLabel && (
                    <span className="hidden sm:inline">{action.label}</span>
                  )}
                </a>
              </Button>
            );
          }

          // Handle onClick actions (buttons)
          return (
            <Button
              key={index}
              className={`
                flex items-center
                ${action.className || ""}
                ${
                  action.variant === "destructive"
                    ? "text-red-600 hover:bg-red-50"
                    : ""
                }
                ${action.hideLabel ? "p-2" : ""}
              `}
              disabled={isDisabled}
              size={size}
              title={action.tooltip || action.label}
              variant={action.variant || "outline"}
              onClick={() => {
                if (!isDisabled && action.onClick) {
                  action.onClick(item);
                }
              }}
            >
              {action.icon && (
                <action.icon
                  className={`h-4 w-4 ${!action.hideLabel ? "sm:mr-1" : ""}`}
                />
              )}
              {!action.hideLabel && (
                <span className="hidden sm:inline">{action.label}</span>
              )}
            </Button>
          );
        })}

        {/* Overflow Dropdown */}
        {hiddenActions.length > 0 && (
          <ButtonActions
            actions={hiddenActions}
            className={dropdownClassName}
            item={item}
            size={size}
            type="vertical"
          />
        )}
      </div>
    );
  }

  // Vertical (Dropdown) Type
  return (
    <div className={`relative ${className}`}>
      <Button
        ref={buttonRef}
        className="p-2"
        size={size}
        title="More actions"
        variant="outline"
        onClick={() => setIsDropdownOpen(!isDropdownOpen)}
      >
        <MoreVertical className="h-4 w-4" />
      </Button>

      {isDropdownOpen &&
        createPortal(
          <>
            {/* Backdrop */}
            <div
              aria-hidden="true"
              className="fixed inset-0 z-40 bg-transparent"
              onClick={() => setIsDropdownOpen(false)}
            />

            {/* Dropdown Menu */}
            <div
              className={`
                fixed z-50 w-48 bg-white rounded-md shadow-lg 
                ring-1 ring-black ring-opacity-5 focus:outline-none
                ${dropdownClassName}
              `}
              style={{
                top: `${dropdownPosition.top}px`,
                left: `${dropdownPosition.left}px`,
              }}
            >
              <div className="py-1">
                {availableActions.map((action, index) => {
                  const isDisabled =
                    action.disabled && typeof action.disabled === "function"
                      ? action.disabled(item)
                      : action.disabled;

                  // Handle href actions
                  if (action.href && !isDisabled) {
                    const href =
                      typeof action.href === "function"
                        ? action.href(item)
                        : action.href;

                    return (
                      <a
                        key={index}
                        className={`
                          group flex items-center w-full px-4 py-2 text-sm transition-colors
                          ${
                            isDisabled
                              ? "text-gray-400 cursor-not-allowed"
                              : action.variant === "destructive"
                                ? "text-red-700 hover:bg-red-50"
                                : action.variant === "danger"
                                  ? "text-red-700 hover:bg-red-50"
                                  : "text-gray-700 hover:bg-gray-100"
                          }
                        `}
                        href={href}
                        onClick={() => setIsDropdownOpen(false)}
                      >
                        {action.icon && (
                          <action.icon
                            className={`mr-3 h-4 w-4 ${
                              isDisabled
                                ? "text-gray-400"
                                : action.variant === "destructive"
                                  ? "text-red-500"
                                  : action.variant === "danger"
                                    ? "text-red-500"
                                    : "text-gray-500"
                            }`}
                          />
                        )}
                        {action.label}
                      </a>
                    );
                  }

                  // Handle onClick actions (buttons)
                  return (
                    <button
                      key={index}
                      className={`
                        group flex items-center w-full px-4 py-2 text-sm transition-colors
                        ${
                          isDisabled
                            ? "text-gray-400 cursor-not-allowed"
                            : action.variant === "destructive"
                              ? "text-red-700 hover:bg-red-50"
                              : action.variant === "danger"
                                ? "text-red-700 hover:bg-red-50"
                                : "text-gray-700 hover:bg-gray-100"
                        }
                      `}
                      disabled={isDisabled}
                      onClick={() => {
                        if (!isDisabled && action.onClick) {
                          action.onClick(item);
                          setIsDropdownOpen(false);
                        }
                      }}
                    >
                      {action.icon && (
                        <action.icon
                          className={`mr-3 h-4 w-4 ${
                            isDisabled
                              ? "text-gray-400"
                              : action.variant === "destructive"
                                ? "text-red-500"
                                : action.variant === "danger"
                                  ? "text-red-500"
                                  : "text-gray-500"
                          }`}
                        />
                      )}
                      {action.label}
                    </button>
                  );
                })}
              </div>
            </div>
          </>,
          document.body
        )}
    </div>
  );
}
