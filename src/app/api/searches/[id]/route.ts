import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';

// GET /api/searches/[id] - Get a specific search by ID
export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const cookieStore = cookies();
    const supabase = createRouteHandlerClient({ cookies: () => cookieStore });

    // Get the current user
    const { data: { user }, error: userError } = await supabase.auth.getUser();
    if (userError || !user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Fetch the search
    const { data: search, error: searchError } = await supabase
      .from('searches')
      .select('*')
      .eq('id', params.id)
      .eq('user_id', user.id)
      .single();

    if (searchError) {
      console.error('Error fetching search:', searchError);
      return NextResponse.json(
        { error: 'Failed to fetch search' },
        { status: 500 }
      );
    }

    if (!search) {
      return NextResponse.json(
        { error: 'Search not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({ search });
  } catch (error) {
    console.error('Error in search route:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
} 