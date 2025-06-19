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
  campaign?: any[];
}

export default function SearchesPage() {
  const [searches, setSearches] = useState<Search[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [startingCampaigns, setStartingCampaigns] = useState<Set<string>>(new Set());
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

  const startCampaign = async (searchId: string) => {
    if (startingCampaigns.has(searchId)) return;

    setStartingCampaigns(prev => new Set(prev).add(searchId));

    try {
      const response = await fetch(`/api/searches/${searchId}/campaign`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error('Failed to start campaign');
      }

      // Refresh the searches to get updated campaign data
      await fetchSearches();

    } catch (err) {
      console.error('Error starting campaign:', err);
      alert('Failed to start campaign. Please try again.');
    } finally {
      setStartingCampaigns(prev => {
        const newSet = new Set(prev);
        newSet.delete(searchId);
        return newSet;
      });
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

  const hasPeople = (search: Search) => {
    return search.search_data.people && search.search_data.people.length > 0;
  };

  const hasCampaign = (search: Search) => {
    return search.campaign && search.campaign.length > 0;
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
                className="bg-white rounded-lg shadow hover:shadow-md transition-shadow"
              >
                <div className="p-4">
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <div 
                        className="cursor-pointer"
                        onClick={() => router.push(`/dashboard/searches/${search.id}`)}
                      >
                        <h2 className="text-lg font-medium text-gray-900 mb-1">
                          {search.query}
                        </h2>
                        <p className="text-sm text-gray-500">
                          {formatDate(search.created_at)}
                        </p>
                      </div>
                      <div className="flex items-center justify-between mt-3">
                        <div className="text-xs text-gray-400">
                          {getSearchCounts(search)}
                        </div>
                        <div className="flex items-center space-x-2">
                          {hasCampaign(search) && (
                            <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                              <svg className="w-3 h-3 mr-1" fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                              </svg>
                              Campaign Complete
                            </span>
                          )}
                          {hasPeople(search) && !hasCampaign(search) && (
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                startCampaign(search.id);
                              }}
                              disabled={startingCampaigns.has(search.id)}
                              className="inline-flex items-center px-3 py-1 bg-green-600 text-white text-xs font-medium rounded hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                              {startingCampaigns.has(search.id) ? (
                                <>
                                  <svg className="animate-spin -ml-1 mr-2 h-3 w-3 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                  </svg>
                                  Starting...
                                </>
                              ) : (
                                <>
                                  <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                                  </svg>
                                  Start Campaign
                                </>
                              )}
                            </button>
                          )}
                        </div>
                      </div>
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