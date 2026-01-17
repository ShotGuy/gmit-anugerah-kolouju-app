import React from "react";

const Drawer = ({
  isOpen,
  onClose,
  title,
  children,
  width = "w-96",
  position = "right",
}) => {
  if (!isOpen) return null;

  const positionClasses = {
    right: "right-0",
    left: "left-0",
  };

  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/25 backdrop-blur-sm transition-all duration-300"
        onClick={onClose}
      />

      {/* Drawer Panel */}
      <div
        className={`fixed ${positionClasses[position]} top-0 h-full ${width} bg-white dark:bg-gray-800 shadow-xl transform transition-transform duration-300 ease-in-out overflow-hidden flex flex-col`}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-200 bg-white dark:bg-gray-800">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white">{title}</h2>
          <button
            className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
            onClick={onClose}
          >
            ✕
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 p-4 overflow-y-auto">{children}</div>
      </div>
    </div>
  );
};

export default Drawer;
