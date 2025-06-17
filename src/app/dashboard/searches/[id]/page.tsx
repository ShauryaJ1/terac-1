'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { GatheringCard, PersonCard, PlatformCard, InfoExchangeCard, LicenseCard } from '@/components/search';

type ResultTab = 'gatherings' | 'people' | 'platforms' | 'exchanges' | 'licenses';

export default function SearchDetails() {
  const params = useParams();
  const router = useRouter();
  const [search, setSearch] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<ResultTab>('gatherings');
  const supabase = createClient();

  useEffect(() => {
    const fetchSearch = async () => {
      try {
        const { data: { user }, error: userError } = await supabase.auth.getUser();
        
        if (userError) {
          throw userError;
        }
        
        if (!user) {
          router.push('/auth/signin');
          return;
        }

        const { data, error } = await supabase
          .from('searches')
          .select('*')
          .eq('id', params.id)
          .eq('user_id', user.id)
          .single();

        if (error) throw error;
        if (!data) {
          setError('Search not found');
          return;
        }

        setSearch(data);
        
        // Set initial active tab based on available results
        if (data.search_data?.gatherings?.length) setActiveTab('gatherings');
        else if (data.search_data?.people?.length) setActiveTab('people');
        else if (data.search_data?.platforms?.length) setActiveTab('platforms');
        else if (data.search_data?.exchanges?.length) setActiveTab('exchanges');
        else if (data.search_data?.licenses?.length) setActiveTab('licenses');
      } catch (err) {
        setError('Failed to load search details');
        console.error('Error fetching search:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchSearch();
  }, [params.id, router, supabase]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-red-500 text-xl">{error}</div>
      </div>
    );
  }

  if (!search) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-gray-500 text-xl">Search not found</div>
      </div>
    );
  }

  const hasGatherings = search.search_data?.gatherings?.length > 0;
  const hasPeople = search.search_data?.people?.length > 0;
  const hasPlatforms = search.search_data?.platforms?.length > 0;
  const hasExchanges = search.search_data?.exchanges?.length > 0;
  const hasLicenses = search.search_data?.licenses?.length > 0;

  return (
    <div className="container mx-auto px-4 py-8 max-w-7xl">
      <div className="bg-white rounded-lg shadow-lg p-6">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 mb-1">
              {search.query}
            </h1>
            <p className="text-sm text-gray-500">
              {new Date(search.created_at).toLocaleString()}
            </p>
          </div>
          <button
            onClick={() => router.push('/dashboard/searches')}
            className="text-sm text-gray-600 hover:text-gray-900"
          >
            Back to Searches
          </button>
        </div>

        {/* Tabs */}
        <div className="flex space-x-2 mb-6">
          {hasGatherings && (
            <button
              onClick={() => setActiveTab('gatherings')}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                activeTab === 'gatherings'
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              Gatherings ({search.search_data.gatherings.length})
            </button>
          )}
          {hasPeople && (
            <button
              onClick={() => setActiveTab('people')}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                activeTab === 'people'
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              People ({search.search_data.people.length})
            </button>
          )}
          {hasPlatforms && (
            <button
              onClick={() => setActiveTab('platforms')}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                activeTab === 'platforms'
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              Platforms ({search.search_data.platforms.length})
            </button>
          )}
          {hasExchanges && (
            <button
              onClick={() => setActiveTab('exchanges')}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                activeTab === 'exchanges'
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              Information Exchanges ({search.search_data.exchanges.length})
            </button>
          )}
          {hasLicenses && (
            <button
              onClick={() => setActiveTab('licenses')}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                activeTab === 'licenses'
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              Licenses & Registrations ({search.search_data.licenses.length})
            </button>
          )}
        </div>

        {/* Results */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {activeTab === 'gatherings' && search.search_data.gatherings?.map((gathering: any, index: number) => (
            <GatheringCard key={index} gathering={gathering} />
          ))}
          {activeTab === 'people' && search.search_data.people?.map((person: any, index: number) => (
            <PersonCard key={index} person={person} />
          ))}
          {activeTab === 'platforms' && search.search_data.platforms?.map((platform: any, index: number) => (
            <PlatformCard key={index} platform={platform} />
          ))}
          {activeTab === 'exchanges' && search.search_data.exchanges?.map((exchange: any, index: number) => (
            <InfoExchangeCard key={index} exchange={exchange} />
          ))}
          {activeTab === 'licenses' && search.search_data.licenses?.map((license: any, index: number) => (
            <LicenseCard key={index} license={license} />
          ))}
        </div>
      </div>
    </div>
  );
} 