import { NextResponse } from 'next/server';
import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';

// GET /api/searches - Get all searches for the current user
export async function GET() {
  try {
    const cookieStore = await cookies();
    // Create a server-side Supabase client bound to the request cookies
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          get(name: string) {
            return cookieStore.get(name)?.value;
          },
          set(name: string, value: string, options: any) {
            // In a route handler, we can't set cookies directly
            // The middleware will handle this
          },
          remove(name: string, options: any) {
            // In a route handler, we can't remove cookies directly
            // The middleware will handle this
          },
        },
      }
    );

    const {
      data: { session },
    } = await supabase.auth.getSession();

    if (!session) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const userId = session.user.id;

    // Query the searches table
    const { data: searches, error } = await supabase
      .from('searches')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching searches:', error);
      return NextResponse.json(
        { error: 'Failed to fetch searches' },
        { status: 500 }
      );
    }

    return NextResponse.json({ searches });
  } catch (error) {
    console.error('Error in GET /api/searches:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// POST /api/searches - Save a new search
export async function POST(request: Request) {
  try {
    const cookieStore = await cookies();
    // Create a server-side Supabase client bound to the request cookies
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          get(name: string) {
            return cookieStore.get(name)?.value;
          },
          set(name: string, value: string, options: any) {
            // In a route handler, we can't set cookies directly
            // The middleware will handle this
          },
          remove(name: string, options: any) {
            // In a route handler, we can't remove cookies directly
            // The middleware will handle this
          },
        },
      }
    );

    const {
      data: { session },
    } = await supabase.auth.getUser();

    if (!session) {
      console.error('No session found');
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const userId = session.user.id;

    // Parse the request body
    const body = await request.json();
    const { query, searchData } = body;

    if (!query || !searchData) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Insert the search into the database
    const { data, error } = await supabase
      .from('searches')
      .insert([
        {
          user_id: userId,
          query,
          search_data: searchData,
        },
      ])
      .select()
      .single();

    if (error) {
      console.error('Error saving search:', error);
      return NextResponse.json(
        { error: 'Failed to save search' },
        { status: 500 }
      );
    }

    return NextResponse.json({ search: data });
  } catch (error) {
    console.error('Error in POST /api/searches:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
} 