'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';

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

export default function SearchesPage() {
  const [searches, setSearches] = useState<Search[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

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

  const getSearchCounts = (search: Search) => {
    const counts = {
      gatherings: search.search_data.gatherings?.length || 0,
      people: search.search_data.people?.length || 0,
      platforms: search.search_data.platforms?.length || 0,
      exchanges: search.search_data.exchanges?.length || 0,
      licenses: search.search_data.licenses?.length || 0
    };

    return Object.entries(counts)
      .filter(([_, count]) => count > 0)
      .map(([type, count]) => `${type}: ${count}`)
      .join(', ');
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 p-4">
        <div className="max-w-4xl mx-auto">
          <div className="animate-pulse space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="bg-white rounded-lg shadow p-4">
                <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                <div className="h-4 bg-gray-200 rounded w-1/2"></div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 p-4">
        <div className="max-w-4xl mx-auto">
          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
            <p className="text-red-600">{error}</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="max-w-4xl mx-auto">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-semibold text-gray-900">Past Searches</h1>
          <button
            onClick={() => router.push('/dashboard')}
            className="text-sm text-gray-600 hover:text-gray-900"
          >
            Back to Dashboard
          </button>
        </div>

        {searches.length === 0 ? (
          <div className="bg-white rounded-lg shadow p-8 text-center">
            <p className="text-gray-500">No past searches found</p>
          </div>
        ) : (
          <div className="space-y-4">
            {searches.map((search) => (
              <div
                key={search.id}
                className="bg-white rounded-lg shadow hover:shadow-md transition-shadow cursor-pointer"
                onClick={() => router.push(`/dashboard/searches/${search.id}`)}
              >
                <div className="p-4">
                  <div className="flex justify-between items-start">
                    <div>
                      <h2 className="text-lg font-medium text-gray-900 mb-1">
                        {search.query}
                      </h2>
                      <p className="text-sm text-gray-500">
                        {formatDate(search.created_at)}
                      </p>
                    </div>
                    <div className="text-xs text-gray-400">
                      {getSearchCounts(search)}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
} 