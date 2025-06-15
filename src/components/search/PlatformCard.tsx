'use client';

interface Platform {
  name: string;
  description: string;
  url?: string;
  relevanceScore?: number;
  features?: string[];
}

interface PlatformCardProps {
  platform: Platform;
}

export default function PlatformCard({ platform }: PlatformCardProps) {
  const handleClick = () => {
    if (platform.url) {
      window.open(platform.url, '_blank');
    }
  };

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
    </div>
  );
} 