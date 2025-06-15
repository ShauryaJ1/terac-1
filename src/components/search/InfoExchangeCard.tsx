'use client';

interface InfoExchange {
  name: string;
  description: string;
  url?: string;
  relevanceScore?: number;
  type?: string;
  memberCount?: number;
}

interface InfoExchangeCardProps {
  exchange: InfoExchange;
}

export default function InfoExchangeCard({ exchange }: InfoExchangeCardProps) {
  const handleClick = () => {
    if (exchange.url) {
      window.open(exchange.url, '_blank');
    }
  };

  return (
    <div 
      className="bg-white rounded-lg shadow-md p-4 hover:shadow-lg transition-shadow cursor-pointer"
      onClick={handleClick}
    >
      <div className="flex justify-between items-start">
        <div>
          <h3 className="text-lg font-semibold text-gray-900">
            {exchange.name}
          </h3>
          {exchange.type && (
            <p className="text-sm text-gray-600">
              {exchange.type}
            </p>
          )}
        </div>
        {exchange.relevanceScore && (
          <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded">
            {Math.round(exchange.relevanceScore * 100)}% match
          </span>
        )}
      </div>
      
      <p className="text-gray-600 text-sm mt-3">
        {exchange.description}
      </p>
      
      {exchange.memberCount && (
        <div className="mt-3 flex items-center text-sm text-gray-500">
          <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
          </svg>
          {exchange.memberCount.toLocaleString()} members
        </div>
      )}
    </div>
  );
} 