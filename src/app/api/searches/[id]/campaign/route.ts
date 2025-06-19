import { NextResponse } from 'next/server';
import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import { Stagehand } from '@browserbasehq/stagehand';
import { z } from 'zod';
import 'dotenv/config';

// Schema for the campaign data
const campaignEntrySchema = z.object({
  originalPerson: z.object({
    name: z.string().optional(),
    title: z.string().optional(),
    company: z.string().optional(),
    location: z.string().optional(),
    source: z.string().optional(),
    description: z.string().optional(),
  }),
  summary: z.object({
    summary: z.string(),
    name: z.string(),
  }).optional(),
  contactInfo: z.object({
    contacts: z.array(z.object({
      name: z.string().nullable().optional(),
      phone: z.string().nullable().optional(),
      email: z.string().email().nullable().optional(),
      address: z.string().nullable().optional(),
      role: z.string().nullable().optional(),
    })),
  }).optional(),
});

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
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

    // Fetch the search
    const { data: search, error: searchError } = await supabase
      .from('searches')
      .select('*')
      .eq('id', id)
      .eq('user_id', userId)
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

    // Initialize Stagehand
    const stagehand = new Stagehand({
      env: "LOCAL",
      modelName: "gpt-4o-mini",
      modelClientOptions: {
        apiKey: process.env.OPENAI_API_KEY,
      },
    });

    try {
      await stagehand.init();
      const page = stagehand.page;

      // Process each person in the search data sequentially to avoid page conflicts
      const campaignData = [];
      for (const person of search.search_data.people || []) {
        const campaignEntry: any = {
          originalPerson: person,
        };

        // If person has a source URL, visit it and extract data
        if (person.source) {
          try {
            // Navigate to the URL with a timeout and better error handling
            try {
              await page.goto(person.source, { timeout: 60000 });
            } catch (navigationError) {
              console.error(`Failed to navigate to ${person.source}:`, navigationError);
              // Continue with the next person if navigation fails
              campaignData.push(campaignEntry);
              continue;
            }

            // Extract summary
            const summary = await page.extract({
              instruction: "Summarize the page in 150 words or less. Return the name of the organization and the summary.",
              schema: z.object({
                summary: z.string(),
                name: z.string(),
              }),
            });
            campaignEntry.summary = summary;

            // Extract contact information
            const contactInfo = await page.extract({
              instruction: "Extract all contact information entries from the page, including phone numbers, emails, and addresses. Return them as an array of contact entries.",
              schema: z.object({
                contacts: z.array(z.object({
                  name: z.string().nullable().optional(),
                  phone: z.string().nullable().optional(),
                  email: z.string().email().nullable().optional(),
                  address: z.string().nullable().optional(),
                  role: z.string().nullable().optional(),
                })),
              }),
            });
            campaignEntry.contactInfo = contactInfo;
            // console.log(campaignEntry);
          } catch (error) {
            console.error(`Error processing URL ${person.source}:`, error);
            // Continue with the next person even if this one fails
          }
        }

        campaignData.push(campaignEntry);
      }

      // Update the search with campaign data
      const { error: updateError } = await supabase
        .from('searches')
        .update({ campaign: campaignData })
        .eq('id', id)
        .eq('user_id', userId);

      if (updateError) {
        console.error('Error updating search with campaign data:', updateError);
        return NextResponse.json(
          { error: 'Failed to update search with campaign data' },
          { status: 500 }
        );
      }

      return NextResponse.json({ 
        message: 'Campaign started successfully',
        campaignData 
      });

    } finally {
      // Always close Stagehand
      await stagehand.close();
    }

  } catch (error) {
    console.error('Error in campaign route:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
} 