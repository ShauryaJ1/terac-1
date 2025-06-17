'use client';

interface Platform {
  name: string;
  description: string;
  source?: string;
  relevanceScore?: number;
  features?: string[];
}

interface PlatformCardProps {
  platform: Platform;
}

export default function PlatformCard({ platform }: PlatformCardProps) {
  const handleClick = () => {
    if (platform.source) {
      window.open(platform.source, '_blank');
    }
  };
  // console.log(platform);
  return (
    <div 
      className="bg-white rounded-lg shadow-md p-4 hover:shadow-lg transition-shadow cursor-pointer"
      onClick={handleClick}
    >
      <div className="flex justify-between items-start">
        <h3 className="text-lg font-semibold text-gray-900 mb-2">
          {platform.name}
        </h3>
        {platform.relevanceScore && (
          <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded">
            {Math.round(platform.relevanceScore * 100)}% match
          </span>
        )}
      </div>
      
      <p className="text-gray-600 text-sm mb-3">
        {platform.description}
      </p>
      {/* <p className="text-gray-600 text-sm mb-3">
        {platform.source}
      </p>
       */}
      {platform.features && platform.features.length > 0 && (
        <div className="mt-3">
          <h4 className="text-sm font-medium text-gray-700 mb-2">Key Features:</h4>
          <ul className="list-disc list-inside text-sm text-gray-600 space-y-1">
            {platform.features.map((feature, index) => (
              <li key={index}>{feature}</li>
            ))}
          </ul>
        </div>
      )}
      {platform.source && (
          <div className="flex items-center text-blue-600 text-sm group">
            <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
            </svg>
            {platform.source}
          </div>
        )}
      
    </div>
  );
} 