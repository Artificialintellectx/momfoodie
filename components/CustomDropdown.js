import React, { useState, useRef, useEffect } from 'react';

export default function CustomDropdown({ options, value, onChange, placeholder = 'Select...', label }) {
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
    if (e.key === 'Enter' || e.key === ' ') {
      setOpen((prev) => !prev);
    } else if (e.key === 'Escape') {
      setOpen(false);
    }
  }

  const selected = options.find((opt) => opt.value === value);

  return (
    <div className="w-full relative" ref={containerRef}>
      {label && (
        <label className="block text-sm font-semibold text-gray-700 mb-3">{label}</label>
      )}
      <button
        ref={buttonRef}
        type="button"
        className={`w-full flex items-center justify-between px-4 py-3 rounded-full border-2 focus:outline-none transition-all duration-200 bg-white/70 backdrop-blur-md shadow-md ${
          open ? 'border-orange-400' : 'border-gray-200'
        }`}
        aria-haspopup="listbox"
        aria-expanded={open}
        tabIndex={0}
        onClick={() => setOpen((prev) => !prev)}
        onKeyDown={handleKeyDown}
      >
        <div className="flex items-center gap-3 min-w-0 flex-1">
          {selected ? (
            <span className="text-lg flex-shrink-0">{selected.icon}</span>
          ) : (
            <span className="text-lg text-gray-400 flex-shrink-0">•</span>
          )}
          <span className={`truncate ${selected ? 'text-gray-900 font-medium' : 'text-gray-400'}`}>
            {selected ? selected.label : placeholder}
          </span>
        </div>
        <svg className="w-5 h-5 text-gray-400 transition-transform duration-200 flex-shrink-0 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>
      
      {/* Backdrop */}
      {open && (
        <div 
          className="fixed inset-0 bg-black/20 backdrop-blur-sm z-40"
          onClick={() => setOpen(false)}
        />
      )}
      
      {/* Mobile Dropdown - Centered */}
      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 md:hidden">
          <div className="bg-white/95 backdrop-blur-xl border-2 border-gray-100 rounded-2xl shadow-2xl py-4 w-full max-w-sm max-h-80 overflow-y-auto">
            <div className="px-4 pb-2 border-b border-gray-100">
              <h3 className="text-lg font-semibold text-gray-900">{label}</h3>
            </div>
            <div className="py-2">
              {options.map((option) => (
                <button
                  key={option.value}
                  type="button"
                  className={`w-full flex items-center gap-3 px-4 py-3 text-left transition-colors duration-150 hover:bg-orange-50 focus:bg-orange-100 rounded-xl mx-2 ${
                    value === option.value ? 'bg-orange-100 text-orange-700 font-semibold' : 'text-gray-700'
                  }`}
                  onClick={() => {
                    onChange(option.value);
                    setOpen(false);
                  }}
                >
                  <span className="text-lg flex-shrink-0">{option.icon}</span>
                  <span className="font-medium truncate flex-1">{option.label}</span>
                  {value === option.value && (
                    <svg className="w-5 h-5 text-orange-500 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                  )}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
      
      {/* Desktop Dropdown - Relative positioning */}
      {open && (
        <div className="hidden md:block absolute left-0 right-0 mt-2 z-50">
          <div className="bg-white/95 backdrop-blur-xl border-2 border-gray-100 rounded-2xl shadow-2xl py-2 max-h-64 overflow-y-auto">
            {options.map((option) => (
              <button
                key={option.value}
                type="button"
                className={`w-full flex items-center gap-3 px-5 py-3 text-left transition-colors duration-150 hover:bg-orange-50 focus:bg-orange-100 rounded-xl ${
                  value === option.value ? 'bg-orange-100 text-orange-700 font-semibold' : 'text-gray-700'
                }`}
                onClick={() => {
                  onChange(option.value);
                  setOpen(false);
                }}
              >
                <span className="text-lg flex-shrink-0">{option.icon}</span>
                <span className="font-medium truncate flex-1">{option.label}</span>
                {value === option.value && (
                  <svg className="w-5 h-5 text-orange-500 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
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