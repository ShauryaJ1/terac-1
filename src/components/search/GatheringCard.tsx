'use client';

interface Gathering {
  name: string;
  description: string;
  date?: string;
  location?: string;
  url?: string;
  relevanceScore?: number;
}

interface GatheringCardProps {
  gathering: Gathering;
}

export default function GatheringCard({ gathering }: GatheringCardProps) {
  const handleClick = () => {
    if (gathering.url) {
      window.open(gathering.url, '_blank');
    }
  };
  // console.log(gathering);
  return (
    <div 
      className="bg-white rounded-lg shadow-md p-4 hover:shadow-lg transition-shadow cursor-pointer"
      onClick={handleClick}
    >
      <div className="flex justify-between items-start">
        <h3 className="text-lg font-semibold text-gray-900 mb-2">
          {gathering.name}
        </h3>
        {gathering.relevanceScore && (
          <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded">
            {Math.round(gathering.relevanceScore * 100)}% match
          </span>
        )}
      </div>
      
      <p className="text-gray-600 text-sm mb-3">
        {gathering.description}
      </p>
      
      <div className="flex flex-wrap gap-2 text-sm text-gray-500">
        {gathering.date && (
          <div className="flex items-center">
            <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
            {gathering.date}
          </div>
        )}
        {gathering.location && (
          <div className="flex items-center">
            <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
            {gathering.location}
          </div>
        )}
        {gathering.url && (
          <div className="flex items-center text-blue-600 group">
            <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
            </svg>
            {gathering.url}
          </div>
        )}
      </div>
    </div>
  );
} 