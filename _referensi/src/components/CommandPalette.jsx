import { getRoleConfig } from "@/config/navigationItem";
import { Command, Search, X } from "lucide-react";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";

const animationStyles = `
  @keyframes slideDownFade {
    from {
      opacity: 0;
      transform: translateY(-20px);
    }
    to {
      opacity: 1;
      transform: translateY(0);
    }
  }

  @keyframes slideInLeft {
    from {
      opacity: 0;
      transform: translateX(-15px);
    }
    to {
      opacity: 1;
      transform: translateX(0);
    }
  }

  @keyframes fadeIn {
    from {
      opacity: 0;
    }
    to {
      opacity: 1;
    }
  }

  @keyframes staggerItem {
    from {
      opacity: 0;
      transform: translateX(-10px);
    }
    to {
      opacity: 1;
      transform: translateX(0);
    }
  }

  @keyframes pulseIn {
    0% {
      opacity: 0;
      transform: scale(0.98);
    }
    50% {
      opacity: 1;
    }
    100% {
      opacity: 1;
      transform: scale(1);
    }
  }

  .animate-kbar-backdrop {
    animation: fadeIn 0.25s ease-out;
  }

  .animate-kbar-modal {
    animation: slideDownFade 0.35s cubic-bezier(0.34, 1.56, 0.64, 1);
  }

  .animate-kbar-input {
    animation: slideInLeft 0.4s ease-out 0.1s both;
  }

  .animate-kbar-item {
    animation: staggerItem 0.3s ease-out both;
  }

  .animate-kbar-footer {
    animation: fadeIn 0.3s ease-out 0.2s both;
  }
`;

import { useUser } from "@/hooks/useUser";

// ... (existing helper function code)

export default function CommandPalette({ isOpen, onClose, userRole }) {
  const router = useRouter();
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [filteredItems, setFilteredItems] = useState([]);

  // Use hook to get full user object with permissions
  const { user } = useUser();

  // Get navigation items based on user role AND user permissions
  const config = getRoleConfig(userRole?.toLowerCase() || "admin", user);

  // Flatten and transform navigation items for search
  const getAllNavigationItems = () => {
    const items = [];
    const { navigation } = config;

    const processItems = (itemList, parentLabel = null, depth = 0) => {
      // Safety check: itemList might be undefined/filtered out completely
      if (!itemList) return;

      itemList.forEach((item) => {
        const hasChildren = item.children && item.children.length > 0;

        // Add parent item
        items.push({
          id: `${item.href}`,
          label: item.label,
          href: item.href,
          icon: item.icon,
          parentLabel: parentLabel,
          isParent: hasChildren,
          depth: depth,
          childrenCount: hasChildren ? item.children.length : 0,
        });

        // Add children if they exist
        if (hasChildren) {
          processItems(item.children, item.label, depth + 1);
        }
      });
    };

    processItems(navigation);
    return items;
  };

  const allItems = getAllNavigationItems();

  // Filter items based on search term
  useEffect(() => {
    if (!searchTerm.trim()) {
      setFilteredItems(allItems);
    } else {
      const term = searchTerm.toLowerCase();
      const filtered = allItems.filter(
        (item) =>
          item.label.toLowerCase().includes(term) ||
          (item.parentLabel && item.parentLabel.toLowerCase().includes(term))
      );
      setFilteredItems(filtered);
    }
    setSelectedIndex(0);
  }, [searchTerm]);

  // Handle keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (!isOpen) return;

      switch (e.key) {
        case "ArrowDown":
          e.preventDefault();
          let nextIndex = (selectedIndex + 1) % filteredItems.length;
          // Skip parent items
          while (filteredItems[nextIndex]?.isParent && nextIndex !== selectedIndex) {
            nextIndex = (nextIndex + 1) % filteredItems.length;
          }
          setSelectedIndex(nextIndex);
          break;
        case "ArrowUp":
          e.preventDefault();
          let prevIndex = selectedIndex === 0 ? filteredItems.length - 1 : selectedIndex - 1;
          // Skip parent items
          while (filteredItems[prevIndex]?.isParent && prevIndex !== selectedIndex) {
            prevIndex = prevIndex === 0 ? filteredItems.length - 1 : prevIndex - 1;
          }
          setSelectedIndex(prevIndex);
          break;
        case "Enter":
          e.preventDefault();
          if (filteredItems[selectedIndex] && !filteredItems[selectedIndex].isParent) {
            handleSelectItem(filteredItems[selectedIndex]);
          }
          break;
        case "Escape":
          e.preventDefault();
          onClose();
          break;
        default:
          break;
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, filteredItems, selectedIndex, onClose]);

  const handleSelectItem = (item) => {
    // Don't navigate if it's a parent item (has children)
    if (item.isParent) {
      return;
    }
    router.push(item.href);
    onClose();
    setSearchTerm("");
  };

  if (!isOpen) return null;

  return (
    <>
      <style>{animationStyles}</style>

      {/* Backdrop */}
      <div
        className="fixed inset-0 z-40 bg-black/50 backdrop-blur-sm animate-kbar-backdrop"
        onClick={onClose}
      />

      {/* Command Palette */}
      <div className="fixed inset-0 z-50 flex items-start justify-center pt-20 pointer-events-none">
        <div className="w-full max-w-2xl mx-4 pointer-events-auto">
          {/* Main Container */}
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-2xl border border-gray-200 dark:border-gray-700 overflow-hidden animate-kbar-modal">
            {/* Search Input */}
            <div className="relative p-4 border-b border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 animate-kbar-input">
              <div className="flex items-center">
                <Search className="w-5 h-5 text-gray-400 dark:text-gray-500 mr-3" />
                <input
                  autoFocus
                  className="flex-1 bg-transparent text-lg text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none"
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Cari menu atau halaman..."
                  type="text"
                  value={searchTerm}
                />
                <button
                  className="p-1 text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
                  onClick={onClose}
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
              {/* Keyboard hint */}
              <div className="mt-2 text-xs text-gray-500 dark:text-gray-400 flex items-center gap-2">
                <span className="inline-flex items-center gap-1">
                  <kbd className="px-2 py-1 text-xs font-semibold text-gray-900 dark:text-white bg-gray-100 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded">
                    ↑↓
                  </kbd>
                  Navigasi
                </span>
                <span className="inline-flex items-center gap-1">
                  <kbd className="px-2 py-1 text-xs font-semibold text-gray-900 dark:text-white bg-gray-100 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded">
                    Enter
                  </kbd>
                  Pilih
                </span>
                <span className="inline-flex items-center gap-1">
                  <kbd className="px-2 py-1 text-xs font-semibold text-gray-900 dark:text-white bg-gray-100 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded">
                    Esc
                  </kbd>
                  Tutup
                </span>
              </div>
            </div>

            {/* Results List */}
            <div className="max-h-96 overflow-y-auto custom-scrollbar bg-white dark:bg-gray-800">
              {filteredItems.length > 0 ? (
                <ul className="divide-y divide-gray-200 dark:divide-gray-700">
                  {filteredItems.map((item, index) => {
                    const IconComponent = item.icon;
                    const isSelected = index === selectedIndex;
                    // Stagger animation delay based on visible items (max 5 items visible at once)
                    const animationDelay = Math.min(index * 30, 150);

                    return (
                      <li
                        key={item.id}
                        className={`transition-colors duration-150 animate-kbar-item ${isSelected
                            ? "bg-blue-50 dark:bg-blue-900/30"
                            : "hover:bg-gray-50 dark:hover:bg-gray-700/50"
                          } ${item.isParent ? "bg-gray-50/50 dark:bg-gray-700/30" : ""}`}
                        style={{ animationDelay: `${animationDelay}ms` }}
                      >
                        <button
                          className={`w-full text-left flex items-center gap-3 focus:outline-none transition-all ${item.isParent
                              ? "px-4 py-3 cursor-default opacity-75"
                              : "px-4 py-3 cursor-pointer"
                            }`}
                          onClick={() => handleSelectItem(item)}
                          onMouseEnter={() => setSelectedIndex(index)}
                          disabled={item.isParent}
                        >
                          {/* Indentation and hierarchy indicator */}
                          {item.depth > 0 && (
                            <div
                              className={`flex-shrink-0 w-0.5 h-5 rounded-full ${isSelected
                                  ? "bg-blue-400 dark:bg-blue-300"
                                  : "bg-gray-300 dark:bg-gray-600"
                                }`}
                              style={{ marginLeft: `${item.depth * 8}px` }}
                            />
                          )}

                          {/* Icon */}
                          <div
                            className={`flex-shrink-0 p-2 rounded-lg transition-all ${item.isParent
                                ? "bg-gray-200 dark:bg-gray-600 text-gray-500 dark:text-gray-400"
                                : isSelected
                                  ? "bg-blue-100 dark:bg-blue-900/50 text-blue-600 dark:text-blue-300"
                                  : "bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400"
                              }`}
                          >
                            <IconComponent className="w-4 h-4" />
                          </div>

                          {/* Content */}
                          <div className="flex-1 min-w-0">
                            <div
                              className={`text-sm font-medium truncate ${item.isParent
                                  ? "text-gray-600 dark:text-gray-300 font-semibold"
                                  : isSelected
                                    ? "text-blue-700 dark:text-blue-200"
                                    : "text-gray-900 dark:text-white"
                                }`}
                            >
                              {item.label}
                            </div>
                            {item.parentLabel && !item.isParent && (
                              <div
                                className={`text-xs truncate ${isSelected
                                    ? "text-blue-600 dark:text-blue-300"
                                    : "text-gray-500 dark:text-gray-400"
                                  }`}
                              >
                                {item.parentLabel}
                              </div>
                            )}
                          </div>

                          {/* Badge for parent items */}
                          {item.isParent && (
                            <div className="flex items-center gap-1.5 flex-shrink-0">
                              <span
                                className={`text-xs px-2 py-1 rounded-md font-medium ${isSelected
                                    ? "bg-gray-300 dark:bg-gray-600 text-gray-700 dark:text-gray-200"
                                    : "bg-gray-200 dark:bg-gray-700 text-gray-600 dark:text-gray-300"
                                  }`}
                              >
                                {item.childrenCount} item
                              </span>
                              <svg
                                className={`w-3 h-3 transition-transform ${isSelected
                                    ? "text-gray-600 dark:text-gray-300"
                                    : "text-gray-400 dark:text-gray-500"
                                  }`}
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                              >
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  strokeWidth={2}
                                  d="M9 5l7 7-7 7"
                                />
                              </svg>
                            </div>
                          )}
                        </button>
                      </li>
                    );
                  })}
                </ul>
              ) : (
                <div className="p-8 text-center animate-kbar-footer">
                  <Search className="w-10 h-10 mx-auto mb-3 text-gray-300 dark:text-gray-600" />
                  <p className="text-gray-500 dark:text-gray-400 text-sm">
                    Tidak ada menu yang ditemukan
                  </p>
                  <p className="text-gray-400 dark:text-gray-500 text-xs mt-1">
                    Coba dengan kata kunci lain
                  </p>
                </div>
              )}
            </div>

            {/* Footer */}
            {filteredItems.length > 0 && (
              <div className="px-4 py-3 bg-gray-50 dark:bg-gray-900 border-t border-gray-200 dark:border-gray-700 flex items-center justify-between text-xs text-gray-500 dark:text-gray-400 animate-kbar-footer">
                <span>
                  {selectedIndex + 1} dari {filteredItems.length}
                </span>
                <div className="flex items-center gap-2">
                  <span className="inline-flex items-center gap-1">
                    <Command className="w-3 h-3" />K
                  </span>
                  untuk membuka
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
}
