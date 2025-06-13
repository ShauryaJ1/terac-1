'use client';

import { createClient } from '@/lib/supabase/client'
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function Home() {
  const [userProfile, setUserProfile] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isFetching, setIsFetching] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();
  const supabase = createClient();

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const { data: { session }, error: sessionError } = await supabase.auth.getSession();
        
        if (sessionError) throw sessionError;
        if (!session) {
          setError('You must be logged in to view your profile');
          setIsFetching(false);
          return;
        }

        // First try to get existing profile
        const { data: profile, error: profileError } = await supabase
          .from('profiles')
          .select('profile_text')
          .eq('id', session.user.id)
          .single();

        if (profileError && profileError.code !== 'PGRST116') { // PGRST116 is the "no rows returned" error
          throw profileError;
        }

        // If no profile exists, create one
        if (!profile) {
          const { error: insertError } = await supabase
            .from('profiles')
            .insert({
              id: session.user.id,
              user_id: session.user.id,
              name: session.user.email?.split('@')[0] || 'User',
              email: session.user.email,
              profile_text: '',
              created_at: new Date().toISOString(),
              updated_at: new Date().toISOString()
            });

          if (insertError) throw insertError;
        }

        // Set the profile text if it exists, otherwise keep the default empty string
        setUserProfile(profile?.profile_text || '');
      } catch (err) {
        console.error('Error fetching profile:', err);
        setError(err instanceof Error ? err.message : 'An error occurred while fetching your profile');
      } finally {
        setIsFetching(false);
      }
    };

    fetchProfile();
  }, [supabase]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);
    
    try {
      // Get the current user's session
      const { data: { session }, error: sessionError } = await supabase.auth.getSession();
      
      if (sessionError) throw sessionError;
      if (!session) {
        setError('You must be logged in to save your profile');
        return;
      }

      // Update the profile in Supabase
      const { error: updateError } = await supabase
        .from('profiles')
        .upsert({
          id: session.user.id,
          user_id: session.user.id,
          name: session.user.email?.split('@')[0] || 'User',
          email: session.user.email,
          profile_text: userProfile,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        });

      if (updateError) {
        console.error('Update error:', updateError);
        throw updateError;
      }
      
      // Navigate to dashboard on success
      router.push('/dashboard');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred while saving your profile');
    } finally {
      setIsLoading(false);
    }
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
          
          {error && (
            <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-red-600 text-sm">{error}</p>
            </div>
          )}
          
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
                disabled={isLoading || isFetching}
              />
            </div>

            <div className="flex justify-end">
              <button
                type="submit"
                className="px-6 py-3 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors duration-200 font-sans disabled:opacity-50 disabled:cursor-not-allowed"
                disabled={isLoading || isFetching}
              >
                {isLoading ? 'Saving...' : isFetching ? 'Loading...' : 'Save Profile'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </main>
  );
}
