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
          <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>
          {gathering.date || 'Date TBD'}
        </p>
        <p className="flex items-center">
          <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
          </svg>
          {gathering.location}
        </p>
        {gathering.url && (
          <p className="flex items-center text-blue-600">
            <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
            </svg>
            {gathering.url}
          </p>
        )}
        {gathering.contact_information && (
          <p className="flex items-center">
            <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
            </svg>
            {gathering.contact_information}
          </p>
        )}
      </div>
    </div>
  );
};

// Add PersonCard component before the Dashboard component
const PersonCard = ({ person }: { person: any }) => {
  const handleClick = () => {
    if (person.source) {
      window.open(person.source, '_blank');
    }
  };

  return (
    <div 
      onClick={handleClick}
      className={`p-4 rounded-lg border border-gray-200 bg-white shadow-sm hover:shadow-md transition-shadow cursor-pointer ${
        person.source ? 'hover:border-blue-500' : ''
      }`}
    >
      <div className="flex justify-between items-start">
        <h3 className="text-lg font-semibold text-gray-900">{person.name}</h3>
        <span className="px-2 py-1 text-sm font-medium text-green-600 bg-green-100 rounded-full">
          {person.title}
        </span>
      </div>
      {person.company && (
        <p className="mt-1 text-sm text-gray-600">{person.company}</p>
      )}
      <p className="mt-2 text-sm text-gray-600">{person.description}</p>
      <div className="mt-3 space-y-1 text-sm text-gray-500">
        <p className="flex items-center">
          <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
          </svg>
          {person.location}
        </p>
        {person.source && (
          <p className="flex items-center text-blue-600">
            <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
            </svg>
            Source
          </p>
        )}
      </div>
    </div>
  );
};

export default function Dashboard() {
  const [isLoading, setIsLoading] = useState(false);
  const [isSearching, setIsSearching] = useState(false);
  const [searchProgress, setSearchProgress] = useState<{
    currentRegion: string;
    currentIndustry: string;
    status: string;
    progress: number;
  } | null>(null);
  const [conversation, setConversation] = useState<Array<{ 
    role: 'user' | 'assistant', 
    content: string,
    regions?: { baseRegion: string, larger: string[], smaller: string[] },
    professions?: { professions: string[], industries: string[] },
    gatherings?: any[],
    people?: any[]
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
    originalQuery?: string
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

  const handleFinalize = async () => {
    setIsFinalized(true);
    setIsSearching(true);
    
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
      finalized: true
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

      // Call the gathering search endpoint
      const response = await fetch('/api/gathering-search', {
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

      if (!response.ok) {
        throw new Error('Failed to search for gatherings');
      }

      // Create a reader for the response stream
      const reader = response.body?.getReader();
      if (!reader) {
        throw new Error('Failed to create response reader');
      }

      // Process the stream
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        // Convert the chunk to text
        const chunk = new TextDecoder().decode(value);
        const lines = chunk.split('\n').filter(line => line.trim());

        // Process each line
        for (const line of lines) {
          try {
            const data = JSON.parse(line);
            if (data.progress) {
              setSearchProgress(data.progress);
            }
            if (data.gatherings) {
              // Add the search results to the conversation
              if (data.gatherings.length > 0) {
                setConversation(prev => [...prev, {
                  role: 'assistant',
                  content: `I found ${data.gatherings.length} relevant gatherings:`,
                  gatherings: data.gatherings
                }]);

                // After finding gatherings, search for relevant people
                for (const profession of selectedProfessions.professions) {
                  const personResponse = await fetch('/api/person-search', {
                    method: 'POST',
                    headers: {
                      'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({
                      query: originalQuery,
                      location: selectedRegions.baseRegion,
                      profession: profession,
                      searchType: 'help',
                      numResults: 3
                    }),
                  });

                  if (personResponse.ok) {
                    const personData = await personResponse.json();
                    if (personData.people && personData.people.length > 0) {
                      setConversation(prev => [...prev, {
                        role: 'assistant',
                        content: `Here are some ${profession}s who might be able to help:`,
                        people: personData.people
                      }]);
                    }
                  }
                }
              } else {
                setConversation(prev => [...prev, {
                  role: 'assistant',
                  content: "I couldn't find any relevant gatherings matching your criteria. Would you like to try different regions or industries?"
                }]);
              }
            }
          } catch (e) {
            console.error('Error parsing chunk:', e);
          }
        }
      }
    } catch (error) {
      console.error('Error searching for gatherings:', error);
      setConversation(prev => [...prev, {
        role: 'assistant',
        content: "I encountered an error while searching for gatherings. Please try again."
      }]);
    } finally {
      setIsSearching(false);
      setSearchProgress(null);
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

  const handleAddProfession = (type: ProfessionModalType) => {
    if (isFinalized) return;
    setProfessionModalState({ isOpen: true, type });
  };

  const handleProfessionAdd = (profession: string) => {
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

  if (!userProfile) {
    return null;
  }

  return (
    <main className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100 relative">
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
                    {message.gatherings && (
                      <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
                        {message.gatherings.map((gathering: any, idx: number) => (
                          <GatheringCard key={idx} gathering={gathering} />
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
                    {message.people && (
                      <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
                        {message.people.map((person: any, idx: number) => (
                          <PersonCard key={idx} person={person} />
                        ))}
                      </div>
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
                  onClick={handleFinalize}
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
        onAdd={handleProfessionAdd}
        type={professionModalState.type}
      />

      {/* Search Progress Indicator */}
      {isSearching && (
        <div className="fixed bottom-20 left-1/2 transform -translate-x-1/2 bg-white shadow-lg rounded-lg p-4 max-w-md w-full">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-gray-700">
              {searchProgress?.status || 'Searching...'}
            </span>
            <span className="text-sm text-gray-500">
              {searchProgress?.progress || 0}%
            </span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div
              className="bg-blue-600 h-2 rounded-full transition-all duration-300"
              style={{ width: `${searchProgress?.progress || 0}%` }}
            />
          </div>
        </div>
      )}
    </main>
  );
} 