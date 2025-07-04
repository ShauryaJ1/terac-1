'use client';

import { useEffect, useState, useRef } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { GatheringCard, PersonCard, PlatformCard, InfoExchangeCard, LicenseCard, CampaignCard } from '@/components/search';

type ResultTab = 'gatherings' | 'people' | 'platforms' | 'exchanges' | 'licenses' | 'campaign';

export default function SearchDetails() {
  const params = useParams();
  const router = useRouter();
  const [search, setSearch] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<ResultTab>('gatherings');
  const [isStartingCampaign, setIsStartingCampaign] = useState(false);
  const [campaignStatus, setCampaignStatus] = useState<string | null>(null);
  const [polling, setPolling] = useState(false);
  const [campaignRunning, setCampaignRunning] = useState(false);
  const pollingRef = useRef<NodeJS.Timeout | null>(null);
  
  // Campaign progress tracking
  const [campaignProgress, setCampaignProgress] = useState<{
    currentPerson: number;
    totalPeople: number;
    currentPersonName: string;
    currentStatus: 'navigating' | 'extracting_summary' | 'extracting_contacts' | 'completed' | 'failed';
    overallProgress: number;
  }>({
    currentPerson: 0,
    totalPeople: 0,
    currentPersonName: '',
    currentStatus: 'completed',
    overallProgress: 0
  });
  
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

  const startCampaign = async () => {
    if (!search || isStartingCampaign) return;

    setIsStartingCampaign(true);
    setCampaignRunning(true);
    setCampaignStatus('Starting campaign...');
    console.log('search', search);
    
    // Initialize campaign progress immediately
    const totalPeople = getTotalPeople(search);
    setCampaignProgress({
      currentPerson: 1,
      totalPeople,
      currentPersonName: search.search_data?.people?.[0]?.name || 'Unknown',
      currentStatus: 'navigating',
      overallProgress: 0
    });

    try {
      const response = await fetch(`/api/searches/${search.id}/campaign`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error('Failed to start campaign');
      }

      const result = await response.json();
      setCampaignStatus('Campaign completed successfully!');
      
      // Refresh the search data to get the updated campaign data
      const { data: updatedSearch, error } = await supabase
        .from('searches')
        .select('*')
        .eq('id', search.id)
        .eq('user_id', (await supabase.auth.getUser()).data.user?.id)
        .single();
      if (!error && updatedSearch) {
        setSearch(updatedSearch);
        setActiveTab('campaign');
      }

    } catch (err) {
      setCampaignStatus('Failed to start campaign. Please try again.');
      console.error('Error starting campaign:', err);
      // Reset campaign progress on error
      setCampaignProgress({
        currentPerson: 0,
        totalPeople: 0,
        currentPersonName: '',
        currentStatus: 'completed',
        overallProgress: 0
      });
      setCampaignRunning(false);
    } finally {
      setIsStartingCampaign(false);
    }
  };

  // Helper to get total people
  const getTotalPeople = (search: any) => search?.search_data?.people?.length || 0;

  // Poll for campaign updates
  useEffect(() => {
    if (!search) return;
    
    // Start polling if campaign is starting OR if campaign is in progress but not complete
    const totalPeople = getTotalPeople(search);
    const currentCampaignLength = search.campaign?.length || 0;
    const isCampaignInProgress = currentCampaignLength > 0 && currentCampaignLength < totalPeople;
    const shouldPoll = isStartingCampaign || campaignRunning || isCampaignInProgress;
    
    console.log('Polling check:', { 
      isStartingCampaign, 
      campaignRunning, 
      isCampaignInProgress, 
      currentCampaignLength, 
      totalPeople, 
      shouldPoll, 
      polling 
    });
    
    if (shouldPoll && !polling) {
      console.log('Starting polling...');
      setPolling(true);
      pollingRef.current = setInterval(async () => {
        console.log('Polling for updates...');
        const { data, error } = await supabase
          .from('searches')
          .select('*')
          .eq('id', params.id)
          .eq('user_id', (await supabase.auth.getUser()).data.user?.id)
          .single();
        if (!error && data) {
          console.log('Received update:', { 
            campaignLength: data.campaign?.length, 
            totalPeople: getTotalPeople(data),
            campaignProgress: data.campaign_progress 
          });
          setSearch(data);
          
          // Update campaign progress from campaign_progress field
          if (data.campaign_progress) {
            setCampaignProgress({
              currentPerson: data.campaign_progress.currentPerson,
              totalPeople: data.campaign_progress.totalPeople,
              currentPersonName: data.campaign_progress.currentPersonName,
              currentStatus: data.campaign_progress.status,
              overallProgress: data.campaign_progress.totalPeople > 0 ? (data.campaign?.length || 0) / data.campaign_progress.totalPeople : 0
            });
          } else {
            // Fallback to calculated progress if no progress field
            const totalPeople = getTotalPeople(data);
            const completedPeople = data.campaign?.length || 0;
            const currentPersonIndex = completedPeople;
            const currentPerson = data.search_data?.people?.[currentPersonIndex];
            
            setCampaignProgress({
              currentPerson: currentPersonIndex + 1,
              totalPeople,
              currentPersonName: currentPerson?.name || 'Unknown',
              currentStatus: completedPeople < totalPeople ? 'navigating' : 'completed',
              overallProgress: totalPeople > 0 ? completedPeople / totalPeople : 0
            });
          }
          
          // Check if campaign is complete and stop polling
          const updatedTotalPeople = getTotalPeople(data);
          const updatedCampaignLength = data.campaign?.length || 0;
          if (updatedCampaignLength >= updatedTotalPeople && updatedTotalPeople > 0) {
            console.log('Campaign complete, stopping polling');
            if (pollingRef.current) clearInterval(pollingRef.current);
            setPolling(false);
            setCampaignRunning(false);
            setCampaignProgress(prev => ({ ...prev, currentStatus: 'completed' }));
          }
        }
      }, 500); // Poll every 500ms for more responsive updates
    }
    
    // Cleanup on unmount
    return () => {
      if (pollingRef.current) clearInterval(pollingRef.current);
      setPolling(false);
    };
  }, [isStartingCampaign, campaignRunning, search?.id, params.id, supabase]);

  // Switch to campaign tab automatically when campaign starts
  useEffect(() => {
    if ((search && search.campaign && search.campaign.length > 0) || isStartingCampaign || campaignRunning) {
      setActiveTab('campaign');
    }
  }, [search?.campaign?.length, isStartingCampaign, campaignRunning]);

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
  const hasCampaign = hasPeople && (isStartingCampaign || campaignRunning || (search.campaign && search.campaign.length > 0));
  const totalPeople = getTotalPeople(search);
  const campaignProgressPercent = totalPeople > 0 ? (search.campaign?.length || 0) / totalPeople : 0;

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
          <div className="flex items-center space-x-4">
            {hasPeople && !hasCampaign && (
              <button
                onClick={startCampaign}
                disabled={isStartingCampaign}
                className="inline-flex items-center px-4 py-2 bg-green-600 text-white text-sm font-medium rounded-lg hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isStartingCampaign ? (
                  <>
                    <svg className="animate-spin -ml-1 mr-3 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Starting Campaign...
                  </>
                ) : (
                  <>
                    <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                    </svg>
                    Start Campaign
                  </>
                )}
              </button>
            )}
            <button
              onClick={() => router.push('/dashboard/searches')}
              className="text-sm text-gray-600 hover:text-gray-900"
            >
              Back to Searches
            </button>
          </div>
        </div>

        {campaignStatus && (
          <div className={`mb-4 p-4 rounded-lg ${
            campaignStatus.includes('Failed') 
              ? 'bg-red-50 border border-red-200 text-red-700' 
              : 'bg-green-50 border border-green-200 text-green-700'
          }`}>
            {campaignStatus}
          </div>
        )}

        {/* Tabs */}
        <div className="flex flex-wrap gap-2 mb-6">
          {hasGatherings && (
            <button
              onClick={() => setActiveTab('gatherings')}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                activeTab === 'gatherings'
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              Gatherings & Events ({search.search_data.gatherings.length})
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
          {hasCampaign && (
            <button
              onClick={() => setActiveTab('campaign')}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                activeTab === 'campaign'
                  ? 'bg-green-600 text-white'
                  : 'bg-green-100 text-green-700 hover:bg-green-200'
              }`}
            >
              Campaign Data ({search.campaign?.length || 0}/{totalPeople})
            </button>
          )}
        </div>

        {/* Results */}
        <div>
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
          {activeTab === 'campaign' && (
            <div className="w-full">
              {(isStartingCampaign || campaignRunning || (search.campaign && search.campaign.length > 0)) && (
                <div className="mb-6">
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-sm text-gray-700 font-medium">Campaign Progress</span>
                    <span className="text-xs text-gray-500">{search.campaign?.length || 0} of {totalPeople} processed</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-green-500 h-2 rounded-full transition-all duration-300"
                      style={{ width: `${campaignProgressPercent * 100}%` }}
                    />
                  </div>
                </div>
              )}
              
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 w-full">
                {search.campaign && search.campaign.map((entry: any, idx: number) => (
                  <div key={idx} className="w-full">
                    <CampaignCard campaignEntry={entry} />
                  </div>
                ))}
                {Array.from({ length: totalPeople - (search.campaign?.length || 0) }).map((_, idx) => (
                  <div key={`loading-${idx}`} className="w-full bg-gray-100 rounded-lg p-4 animate-pulse h-40 flex items-center justify-center text-gray-400">
                    Processing...
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Campaign Progress Overlay */}
        {(isStartingCampaign || campaignRunning || (search.campaign && search.campaign.length > 0 && search.campaign.length < totalPeople)) && (
          <div className="fixed top-4 right-4 bg-white shadow-lg rounded-lg p-4 w-80 z-50">
            <h3 className="text-sm font-medium text-gray-900 mb-3">Campaign Progress</h3>
            
            {/* Overall Progress */}
            <div className="mb-4">
              <div className="flex justify-between text-xs text-gray-600 mb-1">
                <span>Overall Progress</span>
                <span>{Math.round(campaignProgressPercent * 100)}%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div 
                  className="bg-green-600 h-2 rounded-full transition-all duration-300"
                  style={{ width: `${campaignProgressPercent * 100}%` }}
                />
              </div>
            </div>
            
            {/* Current Person */}
            {campaignProgress.currentPerson <= campaignProgress.totalPeople && campaignProgress.totalPeople > 0 && (
              <div className="mb-3">
                <div className="flex justify-between text-xs text-gray-600 mb-1">
                  <span>Current Person</span>
                  <span>{campaignProgress.currentPerson} of {campaignProgress.totalPeople}</span>
                </div>
                <div className="text-sm font-medium text-gray-900 truncate">
                  {campaignProgress.currentPersonName}
                </div>
                <div className="text-xs text-gray-500 mt-1">
                  {campaignProgress.currentStatus === 'navigating' && 'Navigating to page...'}
                  {campaignProgress.currentStatus === 'extracting_summary' && 'Extracting summary...'}
                  {campaignProgress.currentStatus === 'extracting_contacts' && 'Extracting contact info...'}
                  {campaignProgress.currentStatus === 'completed' && 'Completed'}
                  {campaignProgress.currentStatus === 'failed' && 'Failed'}
                </div>
              </div>
            )}
            
            {/* Status Indicator */}
            <div className="flex items-center text-xs text-gray-600">
              <div className={`w-2 h-2 rounded-full mr-2 ${
                campaignProgress.currentStatus === 'completed' ? 'bg-green-500' :
                campaignProgress.currentStatus === 'failed' ? 'bg-red-500' :
                'bg-blue-500 animate-pulse'
              }`} />
              <span className="capitalize">{campaignProgress.currentStatus.replace('_', ' ')}</span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
} 