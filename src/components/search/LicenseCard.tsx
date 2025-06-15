'use client';

interface License {
  name: string;
  description: string;
  url?: string;
  relevanceScore?: number;
  issuingBody?: string;
  requirements?: string[];
}

interface LicenseCardProps {
  license: License;
}

export default function LicenseCard({ license }: LicenseCardProps) {
  const handleClick = () => {
    if (license.url) {
      window.open(license.url, '_blank');
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
            {license.name}
          </h3>
          {license.issuingBody && (
            <p className="text-sm text-gray-600">
              Issued by {license.issuingBody}
            </p>
          )}
        </div>
        {license.relevanceScore && (
          <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded">
            {Math.round(license.relevanceScore * 100)}% match
          </span>
        )}
      </div>
      
      <p className="text-gray-600 text-sm mt-3">
        {license.description}
      </p>
      
      {license.requirements && license.requirements.length > 0 && (
        <div className="mt-3">
          <h4 className="text-sm font-medium text-gray-700 mb-2">Requirements:</h4>
          <ul className="list-disc list-inside text-sm text-gray-600 space-y-1">
            {license.requirements.map((requirement, index) => (
              <li key={index}>{requirement}</li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
} 