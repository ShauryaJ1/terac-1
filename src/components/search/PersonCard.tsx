'use client';

interface Person {
  name: string;
  title?: string;
  company?: string;
  description?: string;
  source?: string;
  relevanceScore?: number;
  isLoading?: boolean;
}

interface PersonCardProps {
  person: Person;
  isLoading?: boolean;
}

export default function PersonCard({ person, isLoading }: PersonCardProps) {
  const handleClick = () => {
    if (person.source) {
      window.open(person.source, '_blank');
    }
  };

  if (isLoading || person.isLoading) {
    return (
      <div className="bg-white rounded-lg shadow-md p-4 animate-pulse">
        <div className="h-6 bg-gray-200 rounded w-3/4 mb-2"></div>
        <div className="h-4 bg-gray-200 rounded w-1/2 mb-3"></div>
        <div className="h-4 bg-gray-200 rounded w-full mb-2"></div>
        <div className="h-4 bg-gray-200 rounded w-2/3"></div>
      </div>
    );
  }

  return (
    <div 
      className="bg-white rounded-lg shadow-md p-4 hover:shadow-lg transition-shadow cursor-pointer"
      onClick={handleClick}
    >
      <div className="flex justify-between items-start">
        <div>
          <h3 className="text-lg font-semibold text-gray-900">
            {person.name}
          </h3>
          {(person.title || person.company) && (
            <p className="text-sm text-gray-600">
              {person.title}
              {person.title && person.company && ' at '}
              {person.company}
            </p>
          )}
        </div>
        {person.relevanceScore && (
          <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded">
            {Math.round(person.relevanceScore * 100)}% match
          </span>
        )}
      </div>
      
      {person.description && (
        <p className="text-gray-600 text-sm mt-3">
          {person.description}
        </p>
      )}
      {person.source && (
        <div className="flex items-center text-blue-600 text-sm group">
          <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
          </svg>
          {person.source}
        </div>
      )}
    </div>
  );
} 