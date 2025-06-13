'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { PaperAirplaneIcon } from '@heroicons/react/24/solid';

// Separate InputForm component
const InputForm = ({ 
  onSubmit, 
  isLoading,
  hasMessages
}: { 
  onSubmit: (query: string) => void;
  isLoading: boolean;
  hasMessages: boolean;
}) => {
  const [inputValue, setInputValue] = useState('');
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Add debug logging for component mounting
  useEffect(() => {
    console.log('InputForm mounted');
  }, []);

  const adjustTextareaHeight = () => {
    const textarea = textareaRef.current;
    if (textarea) {
      textarea.style.height = 'auto';
      textarea.style.height = `${Math.min(textarea.scrollHeight, 200)}px`;
    }
  };

  useEffect(() => {
    adjustTextareaHeight();
  }, [inputValue]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log('Form submitted with value:', inputValue);
    if (!inputValue.trim()) return;
    onSubmit(inputValue);
    setInputValue('');
    // Reset textarea height
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
    }
  };

  // Direct button click handler
  const handleButtonClick = () => {
    console.log('Button clicked, current value:', inputValue);
    if (inputValue.trim()) {
      onSubmit(inputValue);
      setInputValue('');
      if (textareaRef.current) {
        textareaRef.current.style.height = 'auto';
      }
    }
  };

  return (
    <form onSubmit={handleSubmit} className="relative w-full max-w-4xl mx-auto">
      <textarea
        ref={textareaRef}
        value={inputValue}
        onChange={(e) => setInputValue(e.target.value)}
        placeholder={hasMessages ? "What else can I do for you?" : "Let's get you connected..."}
        className="w-full px-6 py-4 pr-20 text-lg rounded-xl border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors duration-200 font-sans bg-white shadow-lg resize-none min-h-[60px] max-h-[200px] overflow-y-auto"
        disabled={isLoading}
        rows={1}
        onKeyDown={(e) => {
          if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleButtonClick();
          }
        }}
      />
      <button
        type="button" // Changed from 'submit' to 'button'
        disabled={isLoading}
        onClick={handleButtonClick}
        className="absolute right-3 bottom-2 p-2 text-blue-600 hover:text-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 rounded-lg transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        <PaperAirplaneIcon className="w-6 h-6" />
      </button>
    </form>
  );
};

// Add Region Modal Component
const AddRegionModal = ({
  isOpen,
  onClose,
  onAdd,
  type
}: {
  isOpen: boolean;
  onClose: () => void;
  onAdd: (region: string) => void;
  type: 'larger' | 'smaller';
}) => {
  const [input, setInput] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (input.trim()) {
      onAdd(input.trim());
      setInput('');
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-md mx-4 min-h-[400px] flex flex-col">
        <h3 className="text-lg font-medium text-gray-900 mb-4">
          Add {type === 'larger' ? 'Larger' : 'Smaller'} Region
        </h3>
        <form onSubmit={handleSubmit} className="flex-1 flex flex-col">
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder={`Enter ${type === 'larger' ? 'larger' : 'smaller'} region name`}
            className="w-full px-4 py-3 min-h-[200px] border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none text-base flex-1"
            autoFocus
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                handleSubmit(e);
              }
            }}
          />
          <div className="mt-4 flex justify-end space-x-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-gray-700 hover:text-gray-900"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
            >
              Add Region
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

// Region Cards Component
const RegionCards = ({ 
  regions,
  onRegionRemove,
  onAddRegion
}: { 
  regions: { baseRegion: string, larger: string[], smaller: string[] },
  onRegionRemove: (region: string, type: 'larger' | 'smaller') => void,
  onAddRegion: (type: 'larger' | 'smaller') => void
}) => {
  return (
    <div className="mt-4 space-y-4">
      <div>
        <div className="flex justify-between items-center mb-2">
          <h3 className="text-sm font-medium text-gray-500">Larger Regions</h3>
          <button
            onClick={() => onAddRegion('larger')}
            className="text-sm text-blue-600 hover:text-blue-700 font-medium"
          >
            + Add Region
          </button>
        </div>
        <div className="flex flex-wrap gap-2">
          {regions.larger.map((region, index) => (
            <div
              key={`larger-${index}`}
              onClick={() => onRegionRemove(region, 'larger')}
              className="group px-3 py-1.5 bg-blue-100 text-blue-800 rounded-full text-sm font-medium hover:bg-blue-200 transition-colors cursor-pointer flex items-center gap-1"
            >
              {region}
              <span className="opacity-0 group-hover:opacity-100 transition-opacity text-blue-600">
                ×
              </span>
            </div>
          ))}
        </div>
      </div>
      <div>
        <div className="flex justify-between items-center mb-2">
          <h3 className="text-sm font-medium text-gray-500">Smaller Regions</h3>
          <button
            onClick={() => onAddRegion('smaller')}
            className="text-sm text-green-600 hover:text-green-700 font-medium"
          >
            + Add Region
          </button>
        </div>
        <div className="flex flex-wrap gap-2">
          {regions.smaller.map((region, index) => (
            <div
              key={`smaller-${index}`}
              onClick={() => onRegionRemove(region, 'smaller')}
              className="group px-3 py-1.5 bg-green-100 text-green-800 rounded-full text-sm font-medium hover:bg-green-200 transition-colors cursor-pointer flex items-center gap-1"
            >
              {region}
              <span className="opacity-0 group-hover:opacity-100 transition-opacity text-green-600">
                ×
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

// Add Profession Modal Component
const AddProfessionModal = ({
  isOpen,
  onClose,
  onAdd,
  type
}: {
  isOpen: boolean;
  onClose: () => void;
  onAdd: (profession: string) => void;
  type: 'professions' | 'industries';
}) => {
  const [input, setInput] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (input.trim()) {
      onAdd(input.trim());
      setInput('');
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-md mx-4 min-h-[400px] flex flex-col">
        <h3 className="text-lg font-medium text-gray-900 mb-4">
          Add {type === 'professions' ? 'Profession' : 'Industry'}
        </h3>
        <form onSubmit={handleSubmit} className="flex-1 flex flex-col">
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder={`Enter ${type === 'professions' ? 'profession' : 'industry'} name`}
            className="w-full px-4 py-3 min-h-[200px] border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none text-base flex-1"
            autoFocus
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                handleSubmit(e);
              }
            }}
          />
          <div className="mt-4 flex justify-end space-x-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-gray-700 hover:text-gray-900"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
            >
              Add {type === 'professions' ? 'Profession' : 'Industry'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

// Profession Cards Component
const ProfessionCards = ({ 
  professions,
  onProfessionRemove,
  onAddProfession
}: { 
  professions: { professions: string[], industries: string[] },
  onProfessionRemove: (profession: string, type: 'professions' | 'industries') => void,
  onAddProfession: (type: 'professions' | 'industries') => void
}) => {
  return (
    <div className="mt-4 space-y-4">
      <div>
        <div className="flex justify-between items-center mb-2">
          <h3 className="text-sm font-medium text-gray-500">Professions</h3>
          <button
            onClick={() => onAddProfession('professions')}
            className="text-sm text-purple-600 hover:text-purple-700 font-medium"
          >
            + Add Profession
          </button>
        </div>
        <div className="flex flex-wrap gap-2">
          {professions.professions.map((profession, index) => (
            <div
              key={`profession-${index}`}
              onClick={() => onProfessionRemove(profession, 'professions')}
              className="group px-3 py-1.5 bg-purple-100 text-purple-800 rounded-full text-sm font-medium hover:bg-purple-200 transition-colors cursor-pointer flex items-center gap-1"
            >
              {profession}
              <span className="opacity-0 group-hover:opacity-100 transition-opacity text-purple-600">
                ×
              </span>
            </div>
          ))}
        </div>
      </div>
      <div>
        <div className="flex justify-between items-center mb-2">
          <h3 className="text-sm font-medium text-gray-500">Industries</h3>
          <button
            onClick={() => onAddProfession('industries')}
            className="text-sm text-indigo-600 hover:text-indigo-700 font-medium"
          >
            + Add Industry
          </button>
        </div>
        <div className="flex flex-wrap gap-2">
          {professions.industries.map((industry, index) => (
            <div
              key={`industry-${index}`}
              onClick={() => onProfessionRemove(industry, 'industries')}
              className="group px-3 py-1.5 bg-indigo-100 text-indigo-800 rounded-full text-sm font-medium hover:bg-indigo-200 transition-colors cursor-pointer flex items-center gap-1"
            >
              {industry}
              <span className="opacity-0 group-hover:opacity-100 transition-opacity text-indigo-600">
                ×
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

// Add GatheringCard component before the Dashboard component
const GatheringCard = ({ gathering }: { gathering: any }) => {
  const handleClick = () => {
    if (gathering.url) {
      window.open(gathering.url, '_blank');
    }
  };

  return (
    <div 
      onClick={handleClick}
      className={`p-4 rounded-lg border border-gray-200 bg-white shadow-sm hover:shadow-md transition-shadow cursor-pointer ${
        gathering.url ? 'hover:border-blue-500' : ''
      }`}
    >
      <div className="flex justify-between items-start">
        <h3 className="text-lg font-semibold text-gray-900">{gathering.name}</h3>
        <span className="px-2 py-1 text-sm font-medium text-blue-600 bg-blue-100 rounded-full">
          {gathering.type}
        </span>
      </div>
      <p className="mt-2 text-sm text-gray-600">{gathering.description}</p>
      <div className="mt-3 space-y-1 text-sm text-gray-500">
        <p className="flex items-center">
          <svg className="w-4 h-4 mr-2 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>
          {gathering.date || 'Date TBD'}
        </p>
        <p className="flex items-center">
          <svg className="w-4 h-4 mr-2 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
          </svg>
          {gathering.location}
        </p>
        {gathering.url && (
          <p className="flex items-center text-blue-600 group">
            <svg className="w-4 h-4 mr-2 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
            </svg>
            <span className="truncate hover:text-blue-700" title={gathering.url}>
              {gathering.url}
            </span>
          </p>
        )}
        {gathering.contact_information && (
          <p className="flex items-center">
            <svg className="w-4 h-4 mr-2 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
            </svg>
            {gathering.contact_information}
          </p>
        )}
      </div>
    </div>
  );
};

// Update PersonCard component to support loading state
const PersonCard = ({ person, isLoading }: { person: any, isLoading?: boolean }) => {
  if (isLoading) {
    return (
      <div className="p-4 rounded-lg border border-gray-200 bg-white shadow-sm animate-pulse">
        <div className="flex justify-between items-start">
          <div className="space-y-2">
            <div className="h-4 bg-gray-200 rounded w-3/4"></div>
            <div className="h-3 bg-gray-200 rounded w-1/2"></div>
          </div>
          <div className="h-6 bg-gray-200 rounded-full w-16"></div>
        </div>
        <div className="mt-2 space-y-2">
          <div className="h-3 bg-gray-200 rounded w-full"></div>
          <div className="h-3 bg-gray-200 rounded w-5/6"></div>
        </div>
        <div className="mt-3 space-y-2">
          <div className="h-3 bg-gray-200 rounded w-1/3"></div>
          <div className="h-3 bg-gray-200 rounded w-1/4"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 rounded-lg border border-gray-200 bg-white shadow-sm hover:shadow-md transition-shadow">
      <div className="flex justify-between items-start">
        <div>
          <h3 className="text-lg font-semibold text-gray-900">{person.name}</h3>
          <p className="text-sm text-gray-600">{person.title}</p>
          {person.company && (
            <p className="text-sm text-gray-500">{person.company}</p>
          )}
        </div>
        <span className="px-2 py-1 text-sm font-medium text-green-600 bg-green-100 rounded-full">
          {Math.round(person.relevanceScore * 100)}% Match
        </span>
      </div>
      <p className="mt-2 text-sm text-gray-600">{person.description}</p>
      <div className="mt-3 space-y-1 text-sm text-gray-500">
        <p className="flex items-center">
          <svg className="w-4 h-4 mr-2 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
          </svg>
          {person.location}
        </p>
        {person.source && (
          <p className="flex items-center text-blue-600 group">
            <svg className="w-4 h-4 mr-2 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
            </svg>
            <span className="truncate hover:text-blue-700" title={person.source}>
              {person.source}
            </span>
          </p>
        )}
      </div>
    </div>
  );
};

// Add PlatformCard component before the Dashboard component
const PlatformCard = ({ platform }: { platform: any }) => {
  const handleClick = () => {
    if (platform.source) {
      window.open(platform.source, '_blank');
    }
  };

  return (
    <div 
      onClick={handleClick}
      className={`p-4 rounded-lg border border-gray-200 bg-white shadow-sm hover:shadow-md transition-shadow cursor-pointer ${
        platform.source ? 'hover:border-blue-500' : ''
      }`}
    >
      <div className="flex justify-between items-start">
        <h3 className="text-lg font-semibold text-gray-900">{platform.name}</h3>
        <span className="px-2 py-1 text-sm font-medium text-indigo-600 bg-indigo-100 rounded-full">
          {platform.type}
        </span>
      </div>
      <p className="mt-2 text-sm text-gray-600">{platform.description}</p>
      <div className="mt-3 space-y-1 text-sm text-gray-500">
        {platform.location && (
          <p className="flex items-center">
            <svg className="w-4 h-4 mr-2 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
            {platform.location}
          </p>
        )}
        {platform.features && platform.features.length > 0 && (
          <div className="flex flex-wrap gap-1 mt-2">
            {platform.features.map((feature: string, idx: number) => (
              <span key={idx} className="px-2 py-1 bg-gray-100 text-gray-700 rounded-full text-xs">
                {feature}
              </span>
            ))}
          </div>
        )}
        {platform.pricing && (
          <p className="flex items-center mt-2">
            <svg className="w-4 h-4 mr-2 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            {platform.pricing}
          </p>
        )}
        {platform.userBase && (
          <p className="flex items-center mt-2">
            <svg className="w-4 h-4 mr-2 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
            </svg>
            {platform.userBase}
          </p>
        )}
        {platform.source && (
          <p className="flex items-center text-blue-600 group mt-2">
            <svg className="w-4 h-4 mr-2 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
            </svg>
            <span className="truncate hover:text-blue-700" title={platform.source}>
              {platform.source}
            </span>
          </p>
        )}
      </div>
    </div>
  );
};

// Add InfoExchangeCard component before the Dashboard component
const InfoExchangeCard = ({ exchange }: { exchange: any }) => {
  const handleClick = () => {
    if (exchange.source) {
      window.open(exchange.source, '_blank');
    }
  };

  return (
    <div 
      onClick={handleClick}
      className={`p-4 rounded-lg border border-gray-200 bg-white shadow-sm hover:shadow-md transition-shadow cursor-pointer ${
        exchange.source ? 'hover:border-blue-500' : ''
      }`}
    >
      <div className="flex justify-between items-start">
        <h3 className="text-lg font-semibold text-gray-900">{exchange.name}</h3>
        <span className="px-2 py-1 text-sm font-medium text-yellow-600 bg-yellow-100 rounded-full">
          {exchange.type}
        </span>
      </div>
      <p className="mt-2 text-sm text-gray-600">{exchange.description}</p>
      <div className="mt-3 space-y-1 text-sm text-gray-500">
        {exchange.location && (
          <p className="flex items-center">
            <svg className="w-4 h-4 mr-2 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
            {exchange.location}
          </p>
        )}
        {exchange.audience && (
          <p className="flex items-center">
            <svg className="w-4 h-4 mr-2 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
            </svg>
            {exchange.audience}
          </p>
        )}
        {exchange.frequency && (
          <p className="flex items-center">
            <svg className="w-4 h-4 mr-2 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
            {exchange.frequency}
          </p>
        )}
        {exchange.features && exchange.features.length > 0 && (
          <div className="flex flex-wrap gap-1 mt-2">
            {exchange.features.map((feature: string, idx: number) => (
              <span key={idx} className="px-2 py-1 bg-gray-100 text-gray-700 rounded-full text-xs">
                {feature}
              </span>
            ))}
          </div>
        )}
        {exchange.contact && (
          <p className="flex items-center mt-2">
            <svg className="w-4 h-4 mr-2 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
            </svg>
            {exchange.contact}
          </p>
        )}
        {exchange.source && (
          <p className="flex items-center text-blue-600 group mt-2">
            <svg className="w-4 h-4 mr-2 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
            </svg>
            <span className="truncate hover:text-blue-700" title={exchange.source}>
              {exchange.source}
            </span>
          </p>
        )}
      </div>
    </div>
  );
};

// Add LicenseCard component before the Dashboard component
const LicenseCard = ({ license }: { license: any }) => {
  const handleClick = () => {
    if (license.databaseUrl) {
      window.open(license.databaseUrl, '_blank');
    }
  };

  return (
    <div 
      onClick={handleClick}
      className={`p-4 rounded-lg border border-gray-200 bg-white shadow-sm hover:shadow-md transition-shadow cursor-pointer ${
        license.databaseUrl ? 'hover:border-blue-500' : ''
      }`}
    >
      <div className="flex justify-between items-start">
        <h3 className="text-lg font-semibold text-gray-900">{license.name}</h3>
        <span className="px-2 py-1 text-sm font-medium text-orange-600 bg-orange-100 rounded-full">
          {license.type}
        </span>
      </div>
      <p className="mt-2 text-sm text-gray-600">{license.description}</p>
      <div className="mt-3 space-y-1 text-sm text-gray-500">
        <p className="flex items-center">
          <svg className="w-4 h-4 mr-2 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
          </svg>
          {license.jurisdiction}
        </p>
        {license.requirements && license.requirements.length > 0 && (
          <div className="mt-2">
            <p className="font-medium text-gray-700 mb-1">Requirements:</p>
            <ul className="list-disc list-inside space-y-1">
              {license.requirements.map((req: string, idx: number) => (
                <li key={idx} className="text-gray-600">{req}</li>
              ))}
            </ul>
          </div>
        )}
        {license.databaseUrl && (
          <p className="flex items-center text-blue-600 group mt-2">
            <svg className="w-4 h-4 mr-2 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
            </svg>
            <span className="truncate hover:text-blue-700" title={license.databaseUrl}>
              Search Database
            </span>
          </p>
        )}
        {license.source && (
          <p className="flex items-center text-gray-500 group mt-2">
            <svg className="w-4 h-4 mr-2 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span className="truncate" title={license.source}>
              Source
            </span>
          </p>
        )}
      </div>
    </div>
  );
};

// Update ResultTabs component
const ResultTabs = ({ 
  activeTab, 
  onTabChange,
  hasGatherings,
  hasPeople,
  hasPlatforms,
  hasExchanges,
  hasLicenses
}: { 
  activeTab: 'gatherings' | 'people' | 'platforms' | 'exchanges' | 'licenses';
  onTabChange: (tab: 'gatherings' | 'people' | 'platforms' | 'exchanges' | 'licenses') => void;
  hasGatherings: boolean;
  hasPeople: boolean;
  hasPlatforms: boolean;
  hasExchanges: boolean;
  hasLicenses: boolean;
}) => {
  return (
    <div className="flex space-x-2 mb-4">
      {hasGatherings && (
        <button
          onClick={() => onTabChange('gatherings')}
          className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
            activeTab === 'gatherings'
              ? 'bg-blue-600 text-white'
              : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
          }`}
        >
          Gatherings
        </button>
      )}
      {hasPeople && (
        <button
          onClick={() => onTabChange('people')}
          className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
            activeTab === 'people'
              ? 'bg-blue-600 text-white'
              : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
          }`}
        >
          People
        </button>
      )}
      {hasPlatforms && (
        <button
          onClick={() => onTabChange('platforms')}
          className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
            activeTab === 'platforms'
              ? 'bg-blue-600 text-white'
              : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
          }`}
        >
          Platforms
        </button>
      )}
      {hasExchanges && (
        <button
          onClick={() => onTabChange('exchanges')}
          className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
            activeTab === 'exchanges'
              ? 'bg-blue-600 text-white'
              : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
          }`}
        >
          Information Exchanges
        </button>
      )}
      {hasLicenses && (
        <button
          onClick={() => onTabChange('licenses')}
          className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
            activeTab === 'licenses'
              ? 'bg-blue-600 text-white'
              : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
          }`}
        >
          Licenses & Registrations
        </button>
      )}
    </div>
  );
};

// Add SearchSelection component before the Dashboard component
const SearchSelection = ({
  onFinalize,
  isLoading
}: {
  onFinalize: (selectedSearches: string[]) => void;
  isLoading: boolean;
}) => {
  const [selectedSearches, setSelectedSearches] = useState<string[]>([
    'gatherings',
    'people',
    'platforms',
    'exchanges',
    'licenses'
  ]);

  const searchOptions = [
    {
      id: 'gatherings',
      name: 'Gatherings & Events',
      description: 'Find relevant gatherings, conferences, and networking events',
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
        </svg>
      )
    },
    {
      id: 'people',
      name: 'People',
      description: 'Find relevant professionals and potential contacts',
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
        </svg>
      )
    },
    {
      id: 'platforms',
      name: 'Platforms',
      description: 'Find relevant platforms and tools',
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
        </svg>
      )
    },
    {
      id: 'exchanges',
      name: 'Information Exchanges',
      description: 'Find relevant information exchanges and communities',
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
        </svg>
      )
    },
    {
      id: 'licenses',
      name: 'Licenses & Registrations',
      description: 'Find relevant professional licenses and registrations',
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
        </svg>
      )
    }
  ];

  const toggleSearch = (searchId: string) => {
    setSelectedSearches(prev => {
      if (prev.includes(searchId)) {
        return prev.filter(id => id !== searchId);
      } else {
        return [...prev, searchId];
      }
    });
  };

  return (
    <div className="bg-white rounded-lg shadow-lg p-6 max-w-2xl mx-auto">
      <h3 className="text-lg font-medium text-gray-900 mb-4">
        Select which searches to perform
      </h3>
      <div className="space-y-3">
        {searchOptions.map(option => (
          <label
            key={option.id}
            className={`relative flex items-start p-4 rounded-lg border cursor-pointer transition-colors ${
              selectedSearches.includes(option.id)
                ? 'border-blue-500 bg-blue-50'
                : 'border-gray-200 hover:border-gray-300'
            }`}
          >
            <div className="min-w-0 flex-1">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <div className={`p-2 rounded-lg ${
                    selectedSearches.includes(option.id)
                      ? 'bg-blue-100 text-blue-600'
                      : 'bg-gray-100 text-gray-600'
                  }`}>
                    {option.icon}
                  </div>
                </div>
                <div className="ml-3">
                  <p className={`text-sm font-medium ${
                    selectedSearches.includes(option.id)
                      ? 'text-blue-900'
                      : 'text-gray-900'
                  }`}>
                    {option.name}
                  </p>
                  <p className={`text-sm ${
                    selectedSearches.includes(option.id)
                      ? 'text-blue-700'
                      : 'text-gray-500'
                  }`}>
                    {option.description}
                  </p>
                </div>
              </div>
            </div>
            <div className="ml-3 flex items-center h-5">
              <input
                type="checkbox"
                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                checked={selectedSearches.includes(option.id)}
                onChange={() => toggleSearch(option.id)}
                disabled={isLoading}
              />
            </div>
          </label>
        ))}
      </div>
      <div className="mt-6 flex justify-end">
        <button
          onClick={() => onFinalize(selectedSearches)}
          disabled={isLoading || selectedSearches.length === 0}
          className="inline-flex items-center px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <span>Start Search</span>
          <svg 
            className="ml-2 w-4 h-4" 
            fill="none" 
            stroke="currentColor" 
            viewBox="0 0 24 24"
          >
            <path 
              strokeLinecap="round" 
              strokeLinejoin="round" 
              strokeWidth={2} 
              d="M5 13l4 4L19 7" 
            />
          </svg>
        </button>
      </div>
    </div>
  );
};

// Add PastSearches import at the top with other imports
import PastSearches from '@/components/PastSearches';

export default function Dashboard() {
  const [isLoading, setIsLoading] = useState(false);
  const [isSearching, setIsSearching] = useState(false);
  const [searchProgress, setSearchProgress] = useState<{
    gatherings: number;
    people: number;
    platforms: number;
    exchanges: number;
    licenses: number;
  }>({
    gatherings: 0,
    people: 0,
    platforms: 0,
    exchanges: 0,
    licenses: 0
  });
  const [conversation, setConversation] = useState<Array<{ 
    role: 'user' | 'assistant', 
    content: string,
    regions?: { baseRegion: string, larger: string[], smaller: string[] },
    professions?: { professions: string[], industries: string[] },
    gatherings?: any[],
    people?: any[],
    platforms?: any[],
    exchanges?: any[],
    licenses?: any[]
  }>>([]);
  const [selectedRegions, setSelectedRegions] = useState<{ 
    baseRegion: string,
    larger: string[], 
    smaller: string[] 
  }>({
    baseRegion: '',
    larger: [],
    smaller: []
  });
  const [selectedProfessions, setSelectedProfessions] = useState<{ professions: string[], industries: string[] }>({
    professions: [],
    industries: []
  });
  const [isFinalized, setIsFinalized] = useState(false);
  const [userProfile, setUserProfile] = useState<string | null>(null);
  type RegionModalType = 'larger' | 'smaller';
  type ProfessionModalType = 'professions' | 'industries';
  
  const [regionModalState, setRegionModalState] = useState<{ 
    isOpen: boolean; 
    type: RegionModalType;
  }>({
    isOpen: false,
    type: 'larger'
  });

  const [professionModalState, setProfessionModalState] = useState<{ 
    isOpen: boolean; 
    type: ProfessionModalType;
  }>({
    isOpen: false,
    type: 'professions'
  });

  const router = useRouter();
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const [activeResultTab, setActiveResultTab] = useState<'gatherings' | 'people' | 'platforms' | 'exchanges' | 'licenses'>('gatherings');
  const [showSearchSelection, setShowSearchSelection] = useState(false);
  const [selectedSearches, setSelectedSearches] = useState<string[]>([]);

  // Add new state for handling past searches
  const [isLoadingPastSearch, setIsLoadingPastSearch] = useState(false);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [conversation]);

  useEffect(() => {
    // Check if user profile exists
    const profile = localStorage.getItem('userProfile');
    if (!profile) {
      router.push('/');
      return;
    }
    setUserProfile(profile);
  }, [router]);

  // Function to store all user choices in localStorage
  const storeUserChoices = (data: {
    regions?: { baseRegion: string, larger: string[], smaller: string[] },
    professions?: { professions: string[], industries: string[] },
    product?: string,
    finalized?: boolean,
    originalQuery?: string,
    selectedSearches?: string[]
  }) => {
    const existingData = localStorage.getItem('userChoices');
    const currentChoices = existingData ? JSON.parse(existingData) : {};
    
    const updatedChoices = {
      ...currentChoices,
      ...data,
      lastUpdated: new Date().toISOString()
    };
    
    localStorage.setItem('userChoices', JSON.stringify(updatedChoices));
  };

  const handleRegionRemove = (region: string, type: RegionModalType) => {
    if (isFinalized) return;
    setSelectedRegions(prev => {
      const newRegions = {
        ...prev,
        [type]: prev[type].filter(r => r !== region)
      };
      storeUserChoices({ regions: newRegions });
      return newRegions;
    });
  };

  const handleFinalize = async (searches: string[]) => {
    setIsFinalized(true);
    setIsSearching(true);
    setSelectedSearches(searches);
    setShowSearchSelection(false);
    
    // Reset search progress
    setSearchProgress({
      gatherings: 0,
      people: 0,
      platforms: 0,
      exchanges: 0,
      licenses: 0
    });
    
    // Create a summary of all selections
    const allRegions = [selectedRegions.baseRegion, ...selectedRegions.larger, ...selectedRegions.smaller];
    const allProfessions = [...selectedProfessions.professions, ...selectedProfessions.industries];
    
    let summary = "I'll focus on:";
    
    if (allRegions.length > 0) {
      summary += `\n• Base Region: ${selectedRegions.baseRegion}`;
      if (selectedRegions.larger.length > 0) {
        summary += `\n• Larger Regions: ${selectedRegions.larger.join(', ')}`;
      }
      if (selectedRegions.smaller.length > 0) {
        summary += `\n• Smaller Regions: ${selectedRegions.smaller.join(', ')}`;
      }
    }
    if (allProfessions.length > 0) {
      summary += `\n• Target Audience: ${allProfessions.join(', ')}`;
    }
    
    // Store the finalized choices
    storeUserChoices({
      regions: selectedRegions,
      professions: selectedProfessions,
      finalized: true,
      selectedSearches: searches
    });
    
    // Add a new message to the conversation with the finalized selections
    setConversation(prev => [...prev, {
      role: 'assistant',
      content: summary 
    }]);

    try {
      // Get the original query from stored choices
      const savedChoices = localStorage.getItem('userChoices');
      const choices = savedChoices ? JSON.parse(savedChoices) : {};
      const originalQuery = choices.originalQuery || '';

      // Initialize search data object
      const searchData: any = {};

      // Perform selected searches
      if (searches.includes('gatherings')) {
        setSearchProgress(prev => ({ ...prev, gatherings: 0 }));
        const gatheringResponse = await fetch('/api/gathering-search', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            regions: allRegions,
            industries: selectedProfessions.industries,
            professions: selectedProfessions.professions,
            numQueries: 5,
            baseQuery: originalQuery
          }),
        });

        if (!gatheringResponse.ok) {
          throw new Error('Failed to search for gatherings');
        }

        const gatheringData = await gatheringResponse.json();
        setSearchProgress(prev => ({ ...prev, gatherings: 1 }));
        searchData.gatherings = gatheringData.gatherings;
        
        if (gatheringData.gatherings && gatheringData.gatherings.length > 0) {
          setConversation(prev => [...prev, {
            role: 'assistant',
            content: `I found ${gatheringData.gatherings.length} relevant gatherings:`,
            gatherings: gatheringData.gatherings
          }]);
        } else {
          setConversation(prev => [...prev, {
            role: 'assistant',
            content: "I couldn't find any relevant gatherings matching your criteria."
          }]);
        }
      }

      if (searches.includes('people')) {
        setSearchProgress(prev => ({ ...prev, people: 0 }));
        // Now, search for people
        const allPeople: any[] = [];
        
        // Add initial message for people search
        setConversation(prev => [...prev, {
          role: 'assistant',
          content: "Searching for relevant people...",
          people: Array(3).fill(null).map(() => ({ isLoading: true }))
        }]);

        // Search for people in each region and profession combination
        const totalCombinations = allRegions.length * allProfessions.length;
        let completedCombinations = 0;

        for (const region of allRegions) {
          for (const profession of allProfessions) {
            const personResponse = await fetch('/api/person-search', {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
              },
              body: JSON.stringify({
                query: originalQuery,
                location: region,
                profession: profession,
                searchType: 'marketing',
                numResults: 5
              }),
            });

            if (!personResponse.ok) {
              console.error(`Failed to search for people in ${region} for ${profession}`);
              continue;
            }

            completedCombinations++;
            setSearchProgress(prev => ({ 
              ...prev, 
              people: completedCombinations / totalCombinations
            }));

            const personData = await personResponse.json();
            if (personData.people && personData.people.length > 0) {
              allPeople.push(...personData.people);
              
              // Update the conversation with new people as they come in
              setConversation(prev => {
                const lastMessage = prev[prev.length - 1];
                if (lastMessage.role === 'assistant' && lastMessage.people) {
                  return [
                    ...prev.slice(0, -1),
                    {
                      ...lastMessage,
                      content: `Found ${allPeople.length} relevant people so far...`,
                      people: [
                        ...allPeople,
                        ...Array(Math.max(0, 3 - allPeople.length)).fill(null).map(() => ({ isLoading: true }))
                      ]
                    }
                  ];
                }
                return prev;
              });
            }
          }
        }

        setSearchProgress(prev => ({ ...prev, people: 1 }));

        // Sort people by relevance score and remove duplicates
        const uniquePeople = Array.from(
          new Map(allPeople.map(p => [p.name, p])).values()
        ).sort((a, b) => b.relevanceScore - a.relevanceScore);

        // Update the final message with all unique people
        setConversation(prev => {
          const lastMessage = prev[prev.length - 1];
          if (lastMessage.role === 'assistant' && lastMessage.people) {
            searchData.people = uniquePeople;
            return [
              ...prev.slice(0, -1),
              {
                ...lastMessage,
                content: `I found ${uniquePeople.length} relevant people who might be interested:`,
                people: uniquePeople
              }
            ];
          }
          return prev;
        });
      }
      
      if (searches.includes('platforms')) {
        setSearchProgress(prev => ({ ...prev, platforms: 0 }));
        // Now, search for platforms
        const platformResponse = await fetch('/api/platform-search', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            query: originalQuery,
            location: selectedRegions.baseRegion,
            profession: selectedProfessions.professions[0] || selectedProfessions.industries[0],
            searchType: 'marketing',
            numResults: 5
          }),
        });

        if (!platformResponse.ok) {
          throw new Error('Failed to search for platforms');
        }

        const platformData = await platformResponse.json();
        setSearchProgress(prev => ({ ...prev, platforms: 1 }));
        searchData.platforms = platformData.platforms;
        
        if (platformData.platforms && platformData.platforms.length > 0) {
          setConversation(prev => [...prev, {
            role: 'assistant',
            content: `I found ${platformData.platforms.length} relevant platforms that might be useful:`,
            platforms: platformData.platforms
          }]);
        } else {
          setConversation(prev => [...prev, {
            role: 'assistant',
            content: "I couldn't find any relevant platforms matching your criteria."
          }]);
        }
      }

      if (searches.includes('exchanges')) {
        setSearchProgress(prev => ({ ...prev, exchanges: 0 }));
        // Search for information exchanges
        const allExchanges: any[] = [];
        
        // Add initial message for exchange search
        setConversation(prev => [...prev, {
          role: 'assistant',
          content: "Searching for relevant information exchanges...",
          exchanges: Array(3).fill(null).map(() => ({ isLoading: true }))
        }]);

        // Search for exchanges in each region
        const totalRegions = allRegions.length;
        let completedRegions = 0;

        for (const region of allRegions) {
          const exchangeResponse = await fetch('/api/info-exchange-search', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              query: originalQuery,
              location: region,
              profession: selectedProfessions.professions[0] || selectedProfessions.industries[0],
              searchType: 'marketing',
              numResults: 5
            }),
          });

          if (!exchangeResponse.ok) {
            console.error(`Failed to search for exchanges in ${region}`);
            continue;
          }

          completedRegions++;
          setSearchProgress(prev => ({ 
            ...prev, 
            exchanges: completedRegions / totalRegions
          }));

          const exchangeData = await exchangeResponse.json();
          if (exchangeData.exchanges && exchangeData.exchanges.length > 0) {
            allExchanges.push(...exchangeData.exchanges);
            
            // Update the conversation with new exchanges as they come in
            setConversation(prev => {
              const lastMessage = prev[prev.length - 1];
              if (lastMessage.role === 'assistant' && lastMessage.exchanges) {
                
                return [
                  ...prev.slice(0, -1),
                  {
                    ...lastMessage,
                    content: `Found ${allExchanges.length} relevant information exchanges so far...`,
                    exchanges: [
                      ...allExchanges,
                      ...Array(Math.max(0, 3 - allExchanges.length)).fill(null).map(() => ({ isLoading: true }))
                    ]
                  }
                ];
              }
              return prev;
            });
          }
        }

        setSearchProgress(prev => ({ ...prev, exchanges: 1 }));

        // Sort exchanges by relevance score and remove duplicates
        const uniqueExchanges = Array.from(
          new Map(allExchanges.map(e => [e.name, e])).values()
        ).sort((a, b) => b.relevanceScore - a.relevanceScore);

        // Update the final message with all unique exchanges
        setConversation(prev => {
          const lastMessage = prev[prev.length - 1];
          if (lastMessage.role === 'assistant' && lastMessage.exchanges) {
            searchData.exchanges = uniqueExchanges;
            return [
              ...prev.slice(0, -1),
              {
                ...lastMessage,
                content: `I found ${uniqueExchanges.length} relevant information exchanges that might be useful:`,
                exchanges: uniqueExchanges
              }
            ];
          }
          return prev;
        });
      }
      
      if (searches.includes('licenses')) {
        setSearchProgress(prev => ({ ...prev, licenses: 0 }));
        // Search for licenses
        const allLicenses: any[] = [];
        
        // Add initial message for license search
        setConversation(prev => [...prev, {
          role: 'assistant',
          content: "Searching for relevant licenses and registrations...",
          licenses: Array(3).fill(null).map(() => ({ isLoading: true }))
        }]);

        // Search for licenses in each region and profession combination
        const totalCombinations = allRegions.length * allProfessions.length;
        let completedCombinations = 0;

        for (const region of allRegions) {
          for (const profession of allProfessions) {
            const licenseResponse = await fetch('/api/license-search', {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
              },
              body: JSON.stringify({
                query: originalQuery,
                location: region,
                profession: profession,
                searchType: 'marketing',
                numResults: 5
              }),
            });

            if (!licenseResponse.ok) {
              console.error(`Failed to search for licenses in ${region} for ${profession}`);
              continue;
            }

            completedCombinations++;
            setSearchProgress(prev => ({ 
              ...prev, 
              licenses: completedCombinations / totalCombinations
            }));

            const licenseData = await licenseResponse.json();
            if (licenseData.licenses && licenseData.licenses.length > 0) {
              allLicenses.push(...licenseData.licenses);
              
              // Update the conversation with new licenses as they come in
              setConversation(prev => {
                const lastMessage = prev[prev.length - 1];
                if (lastMessage.role === 'assistant' && lastMessage.licenses) {
                  return [
                    ...prev.slice(0, -1),
                    {
                      ...lastMessage,
                      content: `Found ${allLicenses.length} relevant licenses and registrations so far...`,
                      licenses: [
                        ...allLicenses,
                        ...Array(Math.max(0, 3 - allLicenses.length)).fill(null).map(() => ({ isLoading: true }))
                      ]
                    }
                  ];
                }
                return prev;
              });
            }
          }
        }

        setSearchProgress(prev => ({ ...prev, licenses: 1 }));

        // Sort licenses by relevance score and remove duplicates
        const uniqueLicenses = Array.from(
          new Map(allLicenses.map(l => [l.name, l])).values()
        ).sort((a, b) => b.relevanceScore - a.relevanceScore);
        searchData.licenses = uniqueLicenses;
        // Update the final message with all unique licenses
        setConversation(prev => {
          const lastMessage = prev[prev.length - 1];
          if (lastMessage.role === 'assistant' && lastMessage.licenses) {
            
            return [
              ...prev.slice(0, -1),
              {
                ...lastMessage,
                content: `I found ${uniqueLicenses.length} relevant licenses and registrations that might be useful:`,
                licenses: uniqueLicenses
              }
            ];
          }
          return prev;
        });
      }
      console.log(searchData);
      // After all searches are complete, save the search
      const saveResponse = await fetch('/api/searches', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          query: originalQuery,
          searchData
        }),
      });

      if (!saveResponse.ok) {
        const errorData = await saveResponse.json();
        console.error('Failed to save search:', {
          status: saveResponse.status,
          error: errorData,
          searchData
        });
      }

    } catch (error) {
      console.error('Error in search:', error);
      setConversation(prev => [...prev, {
        role: 'assistant',
        content: "I encountered an error while searching. Please try again."
      }]);
    } finally {
      setIsSearching(false);
    }
  };

  const handleAddRegion = (type: RegionModalType) => {
    if (isFinalized) return;
    setRegionModalState({ isOpen: true, type });
  };

  const handleRegionAdd = (region: string) => {
    setSelectedRegions(prev => {
      const newRegions = {
        ...prev,
        [regionModalState.type]: [...prev[regionModalState.type], region]
      };
      storeUserChoices({ regions: newRegions });
      return newRegions;
    });
  };

  const handleProfessionRemove = (profession: string, type: ProfessionModalType) => {
    if (isFinalized) return;
    setSelectedProfessions(prev => {
      const newProfessions = {
        ...prev,
        [type]: prev[type].filter(p => p !== profession)
      };
      storeUserChoices({ professions: newProfessions });
      return newProfessions;
    });
  };

  const handleAddProfession = (profession: string) => {
    setSelectedProfessions(prev => {
      const newProfessions = {
        ...prev,
        [professionModalState.type]: [...prev[professionModalState.type], profession]
      };
      storeUserChoices({ professions: newProfessions });
      return newProfessions;
    });
  };

  const handleSubmit = async (query: string) => {
    console.log(query) 
    setIsLoading(true);
    // Add user message to conversation
    setConversation(prev => [...prev, { role: 'user', content: query }]);
    
    try {
      // Store the original query
      storeUserChoices({ originalQuery: query });

      // Call the API endpoint instead of using routeQuery directly
      const response = await fetch('/api/agent', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          query,
          userProfile 
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to get response from agent');
      }

      const data = await response.json();
      console.log(data);
      
      // Add assistant response to conversation
      setConversation(prev => [...prev, {
        role: 'assistant',
        content: data.text,
        regions: data.regions,
        professions: data.professions
      }]);

      // Initialize selected regions when new regions are received
      if (data.regions) {
        setSelectedRegions({
          baseRegion: data.regions.baseRegion,
          larger: data.regions.larger,
          smaller: data.regions.smaller
        });
        storeUserChoices({ regions: data.regions });
        setIsFinalized(false);
      }

      if (data.professions) {
        setSelectedProfessions({
          professions: data.professions.professions,
          industries: data.professions.industries
        });
        storeUserChoices({ professions: data.professions });
      }

      if (data.product) {
        storeUserChoices({ product: data.product });
      }
    } catch (error) {
      // Handle any errors
      setConversation(prev => [...prev, {
        role: 'assistant',
        content: "I apologize, but I encountered an error processing your request. Please try again."
      }]);
    } finally {
      setIsLoading(false);
    }
  };

  // Load saved choices on component mount
  useEffect(() => {
    const savedChoices = localStorage.getItem('userChoices');
    if (savedChoices) {
      const choices = JSON.parse(savedChoices);
      if (choices.regions) {
        setSelectedRegions(choices.regions);
      }
      if (choices.professions) {
        setSelectedProfessions(choices.professions);
      }
      if (choices.finalized) {
        setIsFinalized(true);
      }
    }
  }, []);

  // Add function to handle past search selection
  const handlePastSearchSelect = (search: any) => {
    setIsLoadingPastSearch(true);
    try {
      // Add the search query to the conversation
      setConversation(prev => [...prev, {
        role: 'user',
        content: search.query
      }]);

      // Add the search results to the conversation
      setConversation(prev => [...prev, {
        role: 'assistant',
        content: `Here are the results from your previous search:`,
        gatherings: search.search_data.gatherings,
        people: search.search_data.people,
        platforms: search.search_data.platforms,
        exchanges: search.search_data.exchanges,
        licenses: search.search_data.licenses
      }]);

      // Set the active tab to the first available result type
      if (search.search_data.gatherings?.length) setActiveResultTab('gatherings');
      else if (search.search_data.people?.length) setActiveResultTab('people');
      else if (search.search_data.platforms?.length) setActiveResultTab('platforms');
      else if (search.search_data.exchanges?.length) setActiveResultTab('exchanges');
      else if (search.search_data.licenses?.length) setActiveResultTab('licenses');
    } finally {
      setIsLoadingPastSearch(false);
    }
  };

  if (!userProfile) {
    return null;
  }

  return (
    <main className="flex-1 flex flex-col h-screen bg-gray-50">
      {/* Add PastSearches component in the header */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-4xl mx-auto px-4 py-2 flex justify-between items-center">
          <h1 className="text-xl font-semibold text-gray-900">Dashboard</h1>
          <div className="flex items-center space-x-4">
            <PastSearches onSelectSearch={handlePastSearchSelect} />
            {/* Add your sign out button here */}
          </div>
        </div>
      </div>

      {conversation.length === 0 ? (
        // Centered input when no messages
        <div className="min-h-screen flex items-center justify-center p-4">
          <div className="text-center space-y-4 w-full max-w-2xl mx-auto">
            <h1 className="font-display text-2xl text-gray-600 mb-8">
              How can I help you today?
            </h1>
            <InputForm onSubmit={handleSubmit} isLoading={isLoading} hasMessages={false} />
          </div>
        </div>
      ) : (
        // Messages with bottom input
        <div className="min-h-screen flex flex-col">
          <div className="flex-1 p-4 sm:p-6 lg:p-8 overflow-y-auto">
            <div className="max-w-4xl mx-auto space-y-4">
              {conversation.map((message, index) => (
                <div
                  key={index}
                  className={`flex ${
                    message.role === 'user' ? 'justify-end' : 'justify-start'
                  }`}
                >
                  <div
                    className={`max-w-[90%] rounded-lg p-4 ${
                      message.role === 'user'
                        ? 'bg-blue-600 text-white'
                        : 'bg-white shadow-lg text-gray-900'
                    }`}
                  >
                    <p className="font-sans whitespace-pre-wrap">{message.content}</p>
                    
                    {/* Show tabs if any results are available */}
                    {(message.gatherings || message.people || message.platforms || message.exchanges || message.licenses) && (
                      <ResultTabs
                        activeTab={activeResultTab}
                        onTabChange={setActiveResultTab}
                        hasGatherings={!!message.gatherings}
                        hasPeople={!!message.people}
                        hasPlatforms={!!message.platforms}
                        hasExchanges={!!message.exchanges}
                        hasLicenses={!!message.licenses}
                      />
                    )}

                    {/* Show content based on active tab */}
                    {message.gatherings && activeResultTab === 'gatherings' && (
                      <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
                        {message.gatherings.map((gathering: any, idx: number) => (
                          <GatheringCard key={idx} gathering={gathering} />
                        ))}
                      </div>
                    )}
                    
                    {message.people && activeResultTab === 'people' && (
                      <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
                        {message.people.map((person: any, idx: number) => (
                          <PersonCard key={idx} person={person} isLoading={person.isLoading} />
                        ))}
                      </div>
                    )}
                    
                    {message.platforms && activeResultTab === 'platforms' && (
                      <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
                        {message.platforms.map((platform: any, idx: number) => (
                          <PlatformCard key={idx} platform={platform} />
                        ))}
                      </div>
                    )}

                    {message.exchanges && activeResultTab === 'exchanges' && (
                      <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
                        {message.exchanges.map((exchange: any, idx: number) => (
                          <InfoExchangeCard key={idx} exchange={exchange} />
                        ))}
                      </div>
                    )}

                    {message.licenses && activeResultTab === 'licenses' && (
                      <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
                        {message.licenses.map((license: any, idx: number) => (
                          <LicenseCard key={idx} license={license} />
                        ))}
                      </div>
                    )}

                    {message.regions && !isFinalized && (
                      <RegionCards 
                        regions={selectedRegions} 
                        onRegionRemove={handleRegionRemove}
                        onAddRegion={handleAddRegion}
                      />
                    )}
                    {message.professions && !isFinalized && (
                      <ProfessionCards 
                        professions={selectedProfessions} 
                        onProfessionRemove={handleProfessionRemove}
                        onAddProfession={handleAddProfession}
                      />
                    )}
                  </div>
                </div>
              ))}
              {isLoading && (
                <div className="flex justify-start">
                  <div className="bg-white shadow-lg rounded-lg p-4">
                    <div className="flex space-x-2">
                      <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" />
                      <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce delay-100" />
                      <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce delay-200" />
                    </div>
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>
          </div>

          {/* Finalize Selection Button */}
          {!isFinalized && (selectedRegions.larger.length > 0 || selectedRegions.smaller.length > 0 || 
            selectedProfessions.professions.length > 0 || selectedProfessions.industries.length > 0) && (
            <div className="border-t border-gray-200 bg-white p-4">
              <div className="max-w-4xl mx-auto flex justify-end">
                <button
                  onClick={() => setShowSearchSelection(true)}
                  className="inline-flex items-center px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors"
                >
                  <span>Finalize Selection</span>
                  <svg 
                    className="ml-2 w-4 h-4" 
                    fill="none" 
                    stroke="currentColor" 
                    viewBox="0 0 24 24"
                  >
                    <path 
                      strokeLinecap="round" 
                      strokeLinejoin="round" 
                      strokeWidth={2} 
                      d="M5 13l4 4L19 7" 
                    />
                  </svg>
                </button>
              </div>
            </div>
          )}

          {/* Input Form at bottom */}
          <div className="border-t border-gray-200 bg-white p-4">
            <div className="max-w-4xl mx-auto">
              <InputForm onSubmit={handleSubmit} isLoading={isLoading} hasMessages={true} />
            </div>
          </div>
        </div>
      )}

      {/* Add Region Modal */}
      <AddRegionModal
        isOpen={regionModalState.isOpen}
        onClose={() => setRegionModalState({ isOpen: false, type: 'larger' })}
        onAdd={handleRegionAdd}
        type={regionModalState.type}
      />

      {/* Add Profession Modal */}
      <AddProfessionModal
        isOpen={professionModalState.isOpen}
        onClose={() => setProfessionModalState({ isOpen: false, type: 'professions' })}
        onAdd={handleAddProfession}
        type={professionModalState.type}
      />

      {/* Search Selection Modal */}
      {showSearchSelection && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="w-full max-w-2xl mx-4">
            <SearchSelection
              onFinalize={handleFinalize}
              isLoading={isSearching}
            />
          </div>
        </div>
      )}

      {/* Add progress bars when searching */}
      {isSearching && (
        <div className="fixed top-4 right-4 bg-white shadow-lg rounded-lg p-4 w-64 z-50">
          <h3 className="text-sm font-medium text-gray-900 mb-2">Search Progress</h3>
          {selectedSearches.includes('gatherings') && (
            <div className="mb-2">
              <div className="flex justify-between text-xs text-gray-600 mb-1">
                <span>Gatherings</span>
                <span>{Math.round(searchProgress.gatherings * 100)}%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div 
                  className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                  style={{ width: `${searchProgress.gatherings * 100}%` }}
                />
              </div>
            </div>
          )}
          {selectedSearches.includes('people') && (
            <div className="mb-2">
              <div className="flex justify-between text-xs text-gray-600 mb-1">
                <span>People</span>
                <span>{Math.round(searchProgress.people * 100)}%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div 
                  className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                  style={{ width: `${searchProgress.people * 100}%` }}
                />
              </div>
            </div>
          )}
          {selectedSearches.includes('platforms') && (
            <div className="mb-2">
              <div className="flex justify-between text-xs text-gray-600 mb-1">
                <span>Platforms</span>
                <span>{Math.round(searchProgress.platforms * 100)}%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div 
                  className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                  style={{ width: `${searchProgress.platforms * 100}%` }}
                />
              </div>
            </div>
          )}
          {selectedSearches.includes('exchanges') && (
            <div className="mb-2">
              <div className="flex justify-between text-xs text-gray-600 mb-1">
                <span>Exchanges</span>
                <span>{Math.round(searchProgress.exchanges * 100)}%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div 
                  className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                  style={{ width: `${searchProgress.exchanges * 100}%` }}
                />
              </div>
            </div>
          )}
          {selectedSearches.includes('licenses') && (
            <div className="mb-2">
              <div className="flex justify-between text-xs text-gray-600 mb-1">
                <span>Licenses</span>
                <span>{Math.round(searchProgress.licenses * 100)}%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div 
                  className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                  style={{ width: `${searchProgress.licenses * 100}%` }}
                />
              </div>
            </div>
          )}
        </div>
      )}
    </main>
  );
} 