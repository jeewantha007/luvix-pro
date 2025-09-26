import React, { useState, useRef, useEffect } from 'react';
import { ChevronDown, Search, X } from 'lucide-react';
import { countries, immigrationCountries, Country } from '../../utils/countries';

interface CountrySelectProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  label?: string;
  required?: boolean;
  disabled?: boolean;
  className?: string;
  immigrationOnly?: boolean;
}

const CountrySelect: React.FC<CountrySelectProps> = ({
  value,
  onChange,
  placeholder = "Select country",
  label,
  required = false,
  disabled = false,
  className = "",
  immigrationOnly = false
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filteredCountries, setFilteredCountries] = useState<Country[]>([]);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Use immigration countries or all countries based on prop
  const availableCountries = immigrationOnly ? immigrationCountries : countries;

  // Get selected country object
  const selectedCountry = availableCountries.find(country => country.name === value);

  // Filter countries based on search term (only when showing all countries)
  useEffect(() => {
    if (immigrationOnly) {
      setFilteredCountries(availableCountries);
    } else {
      if (searchTerm.trim() === '') {
        setFilteredCountries(availableCountries);
      } else {
        const filtered = availableCountries.filter(country =>
          country.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          country.code.toLowerCase().includes(searchTerm.toLowerCase())
        );
        setFilteredCountries(filtered);
      }
    }
  }, [searchTerm, immigrationOnly, availableCountries]);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
        setSearchTerm('');
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSelect = (country: Country) => {
    onChange(country.name);
    setIsOpen(false);
    setSearchTerm('');
  };

  const handleClear = () => {
    onChange('');
  };

  return (
    <div className={`relative ${className}`} ref={dropdownRef}>
      {label && (
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
          {label} {required && <span className="text-red-500">*</span>}
        </label>
      )}
      
      <div className="relative">
        <button
          type="button"
          onClick={() => !disabled && setIsOpen(!isOpen)}
          disabled={disabled}
          className={`w-full px-3 py-2 text-left border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white ${
            disabled ? 'bg-gray-100 dark:bg-gray-600 cursor-not-allowed' : 'cursor-pointer hover:border-gray-400'
          }`}
        >
          <span className={selectedCountry ? 'text-gray-900 dark:text-white' : 'text-gray-500 dark:text-gray-400'}>
            {selectedCountry ? selectedCountry.name : placeholder}
          </span>
          <ChevronDown className={`absolute right-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400 transition-transform ${
            isOpen ? 'rotate-180' : ''
          }`} />
        </button>

        {selectedCountry && !disabled && (
          <button
            type="button"
            onClick={handleClear}
            className="absolute right-8 top-1/2 transform -translate-y-1/2 p-1 hover:bg-gray-100 dark:hover:bg-gray-600 rounded"
          >
            <X className="w-3 h-3 text-gray-400" />
          </button>
        )}
      </div>

      {isOpen && (
        <div className="absolute z-50 w-full mt-1 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg shadow-lg max-h-60 overflow-hidden">
          {/* Search Input - Only show when not immigration only */}
          {!immigrationOnly && (
            <div className="p-3 border-b border-gray-200 dark:border-gray-700">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search countries..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm"
                  autoFocus
                />
              </div>
            </div>
          )}

          {/* Countries List */}
          <div className="max-h-48 overflow-y-auto">
            {filteredCountries.length === 0 ? (
              <div className="p-3 text-center text-gray-500 dark:text-gray-400 text-sm">
                No countries found
              </div>
            ) : (
              <div className="py-1">
                {filteredCountries.map((country) => (
                  <button
                    key={country.code}
                    type="button"
                    onClick={() => handleSelect(country)}
                    className={`w-full px-3 py-2 text-left hover:bg-gray-100 dark:hover:bg-gray-700 text-sm ${
                      country.name === value ? 'bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-300' : 'text-gray-900 dark:text-white'
                    }`}
                  >
                    <span className="font-medium">{country.name}</span>
                    <span className="ml-2 text-xs text-gray-500 dark:text-gray-400">({country.code})</span>
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default CountrySelect;
