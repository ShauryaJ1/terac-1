'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function Home() {
  const [userProfile, setUserProfile] = useState('');
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Store user profile in localStorage
    localStorage.setItem('userProfile', userProfile);
    
    // Navigate to dashboard
    router.push('/dashboard');
  };

  return (
    <main className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto">
        <div className="bg-white rounded-lg shadow-xl p-8">
          <h1 className="font-display text-4xl font-bold text-gray-900 mb-2 text-center tracking-tight">
            Tell Me About Yourself
          </h1>
          <p className="text-gray-600 text-center mb-8 font-sans">
            Share your expertise, interests, details about your company(location, industry, etc.), and what you might be looking for.
          </p>
          
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label 
                htmlFor="profile" 
                className="block text-sm font-medium text-gray-700 mb-2 font-sans"
              >
                Your Profile
              </label>
              <textarea
                id="profile"
                name="profile"
                rows={6}
                className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors duration-200 resize-none text-gray-700 placeholder-gray-400 font-sans"
                placeholder="Tell me about yourself..."
                value={userProfile}
                onChange={(e) => setUserProfile(e.target.value)}
                required
              />
            </div>

            <div className="flex justify-end">
              <button
                type="submit"
                className="px-6 py-3 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors duration-200 font-sans"
              >
                Save Profile
              </button>
            </div>
          </form>
        </div>
      </div>
    </main>
  );
}
