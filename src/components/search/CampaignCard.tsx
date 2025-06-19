'use client';

import { useState } from 'react';

interface CampaignEntry {
  originalPerson: {
    name?: string;
    title?: string;
    company?: string;
    location?: string;
    source?: string;
    description?: string;
  };
  summary?: {
    summary: string;
    name: string;
  };
  contactInfo?: {
    contacts: Array<{
      name?: string | null;
      phone?: string | null;
      email?: string | null;
      address?: string | null;
      role?: string | null;
    }>;
  };
}

interface CampaignCardProps {
  campaignEntry: CampaignEntry;
}

export default function CampaignCard({ campaignEntry }: CampaignCardProps) {
  const [isExpanded, setIsExpanded] = useState(false);

  return (
    <div className="bg-white rounded-lg shadow-md p-4 hover:shadow-lg transition-shadow">
      <div className="flex justify-between items-start mb-3">
        <div>
          <h3 className="text-lg font-semibold text-gray-900">
            {campaignEntry.originalPerson.name || 'Unknown Person'}
          </h3>
          {(campaignEntry.originalPerson.title || campaignEntry.originalPerson.company) && (
            <p className="text-sm text-gray-600">
              {campaignEntry.originalPerson.title}
              {campaignEntry.originalPerson.title && campaignEntry.originalPerson.company && ' at '}
              {campaignEntry.originalPerson.company}
            </p>
          )}
          {campaignEntry.originalPerson.location && (
            <p className="text-sm text-gray-500 flex items-center mt-1">
              <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
              {campaignEntry.originalPerson.location}
            </p>
          )}
        </div>
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className="text-blue-600 hover:text-blue-800 text-sm font-medium"
        >
          {isExpanded ? 'Show Less' : 'Show More'}
        </button>
      </div>

      {campaignEntry.originalPerson.description && (
        <p className="text-gray-600 text-sm mb-3">
          {campaignEntry.originalPerson.description}
        </p>
      )}

      {isExpanded && (
        <div className="space-y-4 border-t pt-4">
          {campaignEntry.summary && (
            <div>
              <h4 className="text-sm font-medium text-gray-700 mb-2 flex items-center">
                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                Summary
              </h4>
              <p className="text-sm text-gray-600">{campaignEntry.summary.summary}</p>
            </div>
          )}

          {campaignEntry.contactInfo && campaignEntry.contactInfo.contacts && campaignEntry.contactInfo.contacts.length > 0 && (
            <div>
              <h4 className="text-sm font-medium text-gray-700 mb-2 flex items-center">
                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
                Contact Information
              </h4>
              <div className="space-y-3">
                {campaignEntry.contactInfo.contacts.map((contact, idx) => (
                  <div key={idx} className="bg-gray-50 rounded-lg p-3 space-y-2">
                    {contact.name && (
                      <div className="flex items-center text-sm">
                        <svg className="w-4 h-4 mr-2 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                        </svg>
                        <span className="font-medium text-gray-700">{contact.name}</span>
                      </div>
                    )}
                    {contact.phone && (
                      <div className="flex items-center text-sm">
                        <svg className="w-4 h-4 mr-2 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                        </svg>
                        <a href={`tel:${contact.phone}`} className="text-blue-600 hover:text-blue-800">
                          {contact.phone}
                        </a>
                      </div>
                    )}
                    {contact.email && (
                      <div className="flex items-center text-sm">
                        <svg className="w-4 h-4 mr-2 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                        </svg>
                        <a href={`mailto:${contact.email}`} className="text-blue-600 hover:text-blue-800">
                          {contact.email}
                        </a>
                      </div>
                    )}
                    {contact.address && (
                      <div className="flex items-start text-sm">
                        <svg className="w-4 h-4 mr-2 mt-0.5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                        </svg>
                        <span className="text-gray-600">{contact.address}</span>
                      </div>
                    )}
                    {contact.role && (
                      <div className="flex items-center text-sm">
                        <svg className="w-4 h-4 mr-2 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2-2v2m8 0V6a2 2 0 012 2v6a2 2 0 01-2 2H8a2 2 0 01-2-2V8a2 2 0 012-2V6" />
                        </svg>
                        <span className="text-gray-600">{contact.role}</span>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {campaignEntry.originalPerson.source && (
            <div>
              <h4 className="text-sm font-medium text-gray-700 mb-2 flex items-center">
                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                </svg>
                Source
              </h4>
              <a 
                href={campaignEntry.originalPerson.source} 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-blue-600 hover:text-blue-800 text-sm break-all"
              >
                {campaignEntry.originalPerson.source}
              </a>
            </div>
          )}
        </div>
      )}
    </div>
  );
} 