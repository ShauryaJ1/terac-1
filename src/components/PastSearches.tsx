import { useState, useEffect } from 'react';
import { ChevronDownIcon } from '@heroicons/react/24/solid';

interface Search {
  id: string;
  query: string;
  created_at: string;
  search_data: {
    gatherings?: any[];
    people?: any[];
    platforms?: any[];
    exchanges?: any[];
    licenses?: any[];
  };
}

interface PastSearchesProps {
  onSelectSearch: (search: Search) => void;
}

export default function PastSearches({ onSelectSearch }: PastSearchesProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [searches, setSearches] = useState<Search[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchSearches();
  }, []);

  const fetchSearches = async () => {
    try {
      const response = await fetch('/api/searches');
      if (!response.ok) {
        throw new Error('Failed to fetch searches');
      }
      const data = await response.json();
      setSearches(data.searches || []);
    } catch (err) {
      setError('Failed to load past searches');
      console.error('Error fetching searches:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (isLoading) {
    return (
      <div className="relative">
        <button
          className="flex items-center space-x-2 px-4 py-2 text-gray-600 hover:text-gray-900"
          onClick={() => setIsOpen(!isOpen)}
        >
          <span>Past Searches</span>
          <ChevronDownIcon className="w-4 h-4" />
        </button>
      </div>
    );
  }

  if (error) {
    return (
      <div className="relative">
        <button
          className="flex items-center space-x-2 px-4 py-2 text-gray-600 hover:text-gray-900"
          onClick={() => setIsOpen(!isOpen)}
        >
          <span>Past Searches</span>
          <ChevronDownIcon className="w-4 h-4" />
        </button>
        {isOpen && (
          <div className="absolute right-0 mt-2 w-72 bg-white rounded-lg shadow-lg border border-gray-200 p-4">
            <p className="text-red-500 text-sm">{error}</p>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="relative">
      <button
        className="flex items-center space-x-2 px-4 py-2 text-gray-600 hover:text-gray-900"
        onClick={() => setIsOpen(!isOpen)}
      >
        <span>Past Searches</span>
        <ChevronDownIcon className="w-4 h-4" />
      </button>
      
      {isOpen && (
        <div className="absolute right-0 mt-2 w-96 bg-white rounded-lg shadow-lg border border-gray-200 z-50">
          {searches.length === 0 ? (
            <div className="p-4 text-center text-gray-500">
              No past searches found
            </div>
          ) : (
            <div className="max-h-96 overflow-y-auto">
              {searches.map((search, index) => (
                <button
                  key={search.id}
                  className="w-full px-4 py-3 text-left hover:bg-gray-50 border-b border-gray-100 last:border-b-0 group relative"
                  onClick={() => {
                    onSelectSearch(search);
                    setIsOpen(false);
                  }}
                >
                  <div className="font-medium text-gray-900 truncate group-hover:text-clip">
                    {search.query}
                  </div>
                  <div className="text-sm text-gray-500">
                    {formatDate(search.created_at)}
                  </div>
                  <div className={`absolute left-0 right-0 ${index === searches.length - 1 ? 'bottom-full mb-2' : 'top-full mt-2'} hidden group-hover:block z-50`}>
                    <div className="bg-gray-900 text-white text-sm rounded-lg py-2 px-3 max-w-full break-words shadow-lg">
                      {search.query}
                    </div>
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
} 