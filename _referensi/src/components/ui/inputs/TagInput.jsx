import { useState } from "react";

export default function TagInput({
  value = [],
  onChange,
  placeholder = "Add tags...",
  className = "",
  ...props
}) {
  const [inputValue, setInputValue] = useState("");

  const handleAddTag = (e) => {
    if (e.key === "Enter" || e.key === ",") {
      e.preventDefault();
      const tag = inputValue.trim();

      if (tag && !value.includes(tag)) {
        onChange([...value, tag]);
        setInputValue("");
      }
    }
  };

  const removeTag = (tagToRemove) => {
    onChange(value.filter((tag) => tag !== tagToRemove));
  };

  return (
    <div className={`w-full ${className}`}>
      <div className="flex flex-wrap gap-2 p-3 border border-gray-300 rounded-lg focus-within:ring-2 focus-within:ring-blue-500 focus-within:border-transparent bg-white min-h-[42px]">
        {value.map((tag, index) => (
          <span
            key={index}
            className="inline-flex items-center px-2 py-1 text-sm bg-blue-100 text-blue-800 rounded-md"
          >
            {tag}
            <button
              className="ml-1 text-blue-600 hover:text-blue-800"
              type="button"
              onClick={() => removeTag(tag)}
            >
              ×
            </button>
          </span>
        ))}
        <input
          className="flex-1 outline-none min-w-[120px]"
          placeholder={value.length === 0 ? placeholder : ""}
          type="text"
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          onKeyDown={handleAddTag}
          {...props}
        />
      </div>
      <p className="text-xs text-gray-500 mt-1">
        Press Enter or comma to add tags
      </p>
    </div>
  );
}