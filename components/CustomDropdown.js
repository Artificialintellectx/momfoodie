import React, { useState, useRef, useEffect } from 'react';

export default function CustomDropdown({ options, value, onChange, placeholder = 'Select...', label, disabled = false, zIndex = 10 }) {
  const [open, setOpen] = useState(false);
  const containerRef = useRef(null);
  const buttonRef = useRef(null);

  // Close dropdown on click outside
  useEffect(() => {
    function handleClickOutside(event) {
      if (containerRef.current && !containerRef.current.contains(event.target)) {
        setOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Keyboard accessibility
  function handleKeyDown(e) {
    if (disabled) return;
    if (e.key === 'Enter' || e.key === ' ') {
      setOpen((prev) => !prev);
    } else if (e.key === 'Escape') {
      setOpen(false);
    }
  }

  const selected = options.find((opt) => opt.value === value);

  // Ensure the dropdown properly reflects the selected state
  useEffect(() => {
    if (selected && open) {
      // If there's a selected value and dropdown is open, ensure proper rendering
      const dropdownElement = containerRef.current?.querySelector('.dropdown-options');
      if (dropdownElement) {
        dropdownElement.scrollTop = 0;
      }
    }
  }, [selected, open]);

  return (
    <div className={`w-full relative z-[${zIndex}]`} ref={containerRef}>
      {label && (
        <label className="block text-sm font-semibold text-gray-700 mb-3">{label}</label>
      )}
      <button
        ref={buttonRef}
        type="button"
        disabled={disabled}
        className={`w-full flex items-center justify-between px-4 py-3.5 sm:py-3 rounded-full border-2 focus:outline-none transition-all duration-200 bg-white/70 backdrop-blur-md shadow-md min-h-[48px] sm:min-h-[44px] ${
          disabled 
            ? 'border-gray-200 bg-gray-100 text-gray-400 cursor-not-allowed' 
            : open 
              ? 'border-orange-400 shadow-lg' 
              : selected
                ? 'border-orange-300 bg-orange-25'
                : 'border-gray-200 hover:border-orange-300'
        }`}
        aria-haspopup="listbox"
        aria-expanded={open}
        tabIndex={disabled ? -1 : 0}
        onClick={() => !disabled && setOpen((prev) => !prev)}
        onKeyDown={handleKeyDown}
      >
        <div className="flex items-center gap-3 min-w-0 flex-1">
          {selected ? (
            <span className="text-lg flex-shrink-0">{selected.icon}</span>
          ) : (
            <span className="text-lg text-gray-400 flex-shrink-0">🍽️</span>
          )}
          <span className={`min-w-0 break-words text-sm sm:text-base ${selected ? 'text-gray-900 font-medium' : 'text-gray-400'}`}>
            {selected ? selected.label : placeholder}
          </span>
        </div>
        <svg className={`w-5 h-5 text-gray-400 transition-transform duration-200 flex-shrink-0 ml-2 ${open ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>
      
      {/* Mobile Dropdown - Centered with proper z-index */}
      {open && !disabled && (
        <>
          {/* Backdrop with higher z-index */}
          <div 
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[9998]"
            onClick={() => setOpen(false)}
          />
          
          {/* Modal container with highest z-index */}
          <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 md:hidden">
            <div className="bg-white border-2 border-gray-200 rounded-2xl shadow-2xl py-4 w-full max-w-sm max-h-[70vh] overflow-y-auto overflow-x-hidden dropdown-options">
              <div className="px-4 pb-3 border-b border-gray-100">
                <h3 className="text-lg font-semibold text-gray-900 break-words">{label || 'Select Option'}</h3>
              </div>
              <div className="py-2">
                {options.map((option) => (
                  <button
                    key={option.value}
                    type="button"
                    className={`w-full flex items-start gap-3 px-4 py-4 text-left transition-colors duration-150 hover:bg-orange-50 focus:bg-orange-100 rounded-xl mx-2 min-h-[56px] ${
                      value === option.value ? 'bg-orange-100 text-orange-700 font-semibold' : 'text-gray-700'
                    }`}
                    onClick={() => {
                      onChange(option.value);
                      setOpen(false);
                    }}
                  >
                    <span className="text-lg flex-shrink-0 mt-0.5">{option.icon}</span>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="font-medium break-words leading-relaxed text-sm sm:text-base">{option.label}</span>
                        {option.popular && (
                          <span className="text-xs bg-orange-100 text-orange-600 px-2 py-0.5 rounded-full font-medium flex-shrink-0">
                            Popular
                          </span>
                        )}
                      </div>
                    </div>
                    {value === option.value && (
                      <svg className="w-5 h-5 text-orange-500 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                    )}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </>
      )}
      
      {/* Desktop Dropdown - Relative positioning */}
      {open && !disabled && (
        <div className={`hidden md:block absolute left-0 right-0 mt-2 z-[${zIndex + 1000}] isolate`}>
          <div className="bg-white border-2 border-gray-200 rounded-2xl shadow-2xl py-2 max-h-64 overflow-y-auto relative dropdown-options">
            {options.map((option) => (
              <button
                key={option.value}
                type="button"
                className={`w-full flex items-start gap-3 px-5 py-3 text-left transition-colors duration-150 hover:bg-orange-50 focus:bg-orange-100 rounded-xl relative ${
                  value === option.value ? 'bg-orange-100 text-orange-700 font-semibold' : 'text-gray-700'
                }`}
                onClick={() => {
                  onChange(option.value);
                  setOpen(false);
                }}
              >
                <span className="text-lg flex-shrink-0 mt-0.5">{option.icon}</span>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="font-medium break-words leading-relaxed">{option.label}</span>
                    {option.popular && (
                      <span className="text-xs bg-orange-100 text-orange-600 px-2 py-0.5 rounded-full font-medium flex-shrink-0">
                        Popular
                      </span>
                    )}
                  </div>
                </div>
                {value === option.value && (
                  <svg className="w-5 h-5 text-orange-500 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                )}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
} 