'use client';

import { useState } from 'react';

interface MultiSelectDropdownProps {
  label: string;
  options: string[];
  selected: string[];
  onSelectionChange: (selected: string[]) => void;
  onAddNew: (value: string) => void;
  placeholder?: string;
  required?: boolean;
}

export default function MultiSelectDropdown({
  label,
  options,
  selected,
  onSelectionChange,
  onAddNew,
  placeholder = 'Select or type...',
  required = false,
}: MultiSelectDropdownProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [newValue, setNewValue] = useState('');
  const [searchTerm, setSearchTerm] = useState('');

  const filteredOptions = options.filter((opt) =>
    opt.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleToggle = (option: string) => {
    if (selected.includes(option)) {
      onSelectionChange(selected.filter((item) => item !== option));
    } else {
      onSelectionChange([...selected, option]);
    }
  };

  const handleAddNew = () => {
    if (newValue.trim() && !options.includes(newValue)) {
      onAddNew(newValue);
      onSelectionChange([...selected, newValue]);
      setNewValue('');
    }
  };

  return (
    <div>
      <label className="block text-sm font-medium text-gray-800 mb-2">
        {label}
        {required && <span className="text-red-500 ml-1">*</span>}
      </label>

      <div className="relative">
        {/* Selected items display */}
        <div className="w-full px-4 py-3 bg-white border-2 border-gray-200 rounded-lg focus-within:border-indigo-500 focus-within:ring-2 focus-within:ring-indigo-200 transition-all flex flex-wrap gap-2 items-center min-h-[45px]">
          {selected.length > 0 ? (
            selected.map((item) => (
              <span
                key={item}
                className="bg-indigo-100 text-indigo-800 px-3 py-1 rounded-lg text-sm font-medium flex items-center gap-2"
              >
                {item}
                <button
                  type="button"
                  onClick={() =>
                    onSelectionChange(selected.filter((i) => i !== item))
                  }
                  className="text-indigo-600 hover:text-indigo-900 font-bold"
                >
                  ×
                </button>
              </span>
            ))
          ) : (
            <span className="text-gray-400 text-sm">{placeholder}</span>
          )}
          <button
            type="button"
            onClick={() => setIsOpen(!isOpen)}
            className="ml-auto text-gray-500 hover:text-gray-700"
          >
            ▼
          </button>
        </div>

        {/* Dropdown menu */}
        {isOpen && (
          <div className="absolute top-full left-0 right-0 mt-2 bg-white border-2 border-gray-200 rounded-lg shadow-lg z-50">
            {/* Search input */}
            <input
              type="text"
              placeholder="Search or type new..."
              value={searchTerm || newValue}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                setNewValue(e.target.value);
              }}
              className="w-full px-4 py-2 border-b border-gray-200 focus:outline-none text-sm"
            />

            {/* Existing options */}
            <div className="max-h-48 overflow-y-auto">
              {filteredOptions.length > 0 ? (
                filteredOptions.map((option) => (
                  <label
                    key={option}
                    className="flex items-center gap-3 px-4 py-2 hover:bg-indigo-50 cursor-pointer"
                  >
                    <input
                      type="checkbox"
                      checked={selected.includes(option)}
                      onChange={() => handleToggle(option)}
                      className="w-4 h-4 text-indigo-600 rounded"
                    />
                    <span className="text-sm text-gray-700">{option}</span>
                  </label>
                ))
              ) : (
                <div className="px-4 py-2 text-sm text-gray-500">
                  No matches found
                </div>
              )}
            </div>

            {/* Add new option */}
            {newValue.trim() && !options.includes(newValue) && (
              <button
                type="button"
                onClick={handleAddNew}
                className="w-full px-4 py-2 text-left text-sm bg-indigo-50 hover:bg-indigo-100 text-indigo-700 font-medium border-t border-gray-200"
              >
                ✨ Add "{newValue}"
              </button>
            )}

            {/* Close button */}
            <button
              type="button"
              onClick={() => {
                setIsOpen(false);
                setSearchTerm('');
                setNewValue('');
              }}
              className="w-full px-4 py-2 text-sm text-gray-600 hover:text-gray-900 border-t border-gray-200"
            >
              Done
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
