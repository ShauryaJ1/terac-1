import { NextResponse } from 'next/server';
import { supabase } from '@/utils/supabase/client';

// GET /api/searches/[id] - Get a specific search by ID
export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    // Get the session from the cookie
    const session = await supabase.auth.getSession();
    
    if (!session.data.session) {
      console.log('Unauthorized');
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }
    else {
      console.log('Authorized');
    }

    const userId = session.data.session.user.id;
    const searchId = params.id;

    // Query the searches table
    const { data: search, error } = await supabase
      .from('searches')
      .select('*')
      .eq('id', searchId)
      .eq('user_id', userId)
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        return NextResponse.json(
          { error: 'Search not found' },
          { status: 404 }
        );
      }
      console.error('Error fetching search:', error);
      return NextResponse.json(
        { error: 'Failed to fetch search' },
        { status: 500 }
      );
    }

    return NextResponse.json({ search });
  } catch (error) {
    console.error('Error in GET /api/searches/[id]:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
} 