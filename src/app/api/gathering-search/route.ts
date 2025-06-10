import { openai } from '@ai-sdk/openai';
import { generateObject } from 'ai';
import { z } from 'zod';
import { NextResponse } from 'next/server';
import { searchGatherings, analyzeRelevance } from '../gatherings/route';

// Import types from gatherings route
type Gathering = {
  name: string;
  description: string;
  date?: string;
  location: string;
  url?: string;
  type: 'conference' | 'expo' | 'fair' | 'meetup' | 'other';
  contact_information?: string;
  relevanceScore?: number;
};

// Schema for gathering search results
const gatheringSearchSchema = z.object({
  gatherings: z.array(z.object({
    name: z.string(),
    description: z.string(),
    date: z.string().optional(),
    location: z.string(),
    url: z.string().url().optional(),
    type: z.enum(['conference', 'expo', 'fair', 'meetup', 'other']),
    contact_information: z.string().optional(),
    relevanceScore: z.number().min(0).max(1).optional(),
  })),
  reasoning: z.string()
});

// Schema for search configuration
const searchConfigSchema = z.object({
  regions: z.array(z.string()),
  industries: z.array(z.string()),
  professions: z.array(z.string()),
  numQueries: z.number().min(1).max(10).default(5),
  baseQuery: z.string()
});

// Schema for search progress
const searchProgressSchema = z.object({
  currentRegion: z.string(),
  currentIndustry: z.string(),
  status: z.string(),
  progress: z.number().min(0).max(100)
});

// Function to generate search queries
async function generateSearchQueries(baseQuery: string, numQueries: number) {
  const { object: expansion } = await generateObject({
    model: openai('gpt-4o'),
    schema: z.object({
      queries: z.array(z.string()),
      reasoning: z.string()
    }),
    prompt: `Given the following search query, generate ${numQueries} alternative search queries that could help find relevant information:
    
    Original Query: "${baseQuery}"
    
    Return an object with:
    - queries: array of ${numQueries} alternative search queries
    - reasoning: brief explanation of how you generated these alternatives
    
    Make sure to:
    - Keep each query concise and focused
    - Use different phrasings and keywords
    - Maintain the core intent of the original query
    - Include both broader and more specific variations
    - Use natural language that a user would type
    - Avoid duplicate or very similar queries`
  });

  return expansion.queries;
}

export async function POST(request: Request) {
  try {
    const config = await request.json();
    const validatedConfig = searchConfigSchema.parse(config);

    const allGatherings: (Gathering & { region: string; industry: string })[] = [];
    const totalSearches = validatedConfig.regions.length * validatedConfig.industries.length;
    let completedSearches = 0;

    // Create a TransformStream for streaming the response
    const stream = new TransformStream();
    const writer = stream.writable.getWriter();
    const encoder = new TextEncoder();

    // Function to send progress updates
    const sendProgress = async (progress: any) => {
      await writer.write(encoder.encode(JSON.stringify(progress) + '\n'));
    };

    // Search through each region and industry combination
    for (const region of validatedConfig.regions) {
      for (const industry of validatedConfig.industries) {
        // Update progress
        console.log(region, industry)
        const progress = {
          currentRegion: region,
          currentIndustry: industry,
          status: `Searching ${region} for ${industry}...`,
          progress: Math.round((completedSearches / totalSearches) * 100)
        };
        
        // Send progress update
        await sendProgress({ progress });

        // Search for gatherings using the imported function
        const searchResults = await searchGatherings(region, industry);
        
        // Analyze relevance for each gathering
        const relevantGatherings = await Promise.all(
          searchResults.gatherings.map(async (gathering: Gathering) => {
            const relevanceAnalysis = await analyzeRelevance(gathering, validatedConfig.baseQuery);
            return {
              ...gathering,
              relevanceScore: relevanceAnalysis.relevanceScore,
              region,
              industry
            };
          })
        );

        // Filter out low-relevance gatherings
        const filteredGatherings = relevantGatherings.filter(
          (gathering: Gathering & { relevanceScore: number }) => gathering.relevanceScore >= 0.5
        );

        allGatherings.push(...filteredGatherings);
        completedSearches++;
      }
    }

    // Sort all gatherings by relevance score
    allGatherings.sort((a, b) => 
      (b.relevanceScore || 0) - (a.relevanceScore || 0)
    );

    // Remove duplicates and keep only the most relevant ones
    const uniqueGatherings = Array.from(
      new Map(allGatherings.map(g => [`${g.name}-${g.location}`, g])).values()
    );

    // Send final results
    await sendProgress({ gatherings: uniqueGatherings });
    await writer.close();

    return new Response(stream.readable, {
      headers: {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        'Connection': 'keep-alive',
      },
    });
  } catch (error) {
    console.error('Error in gathering search:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
} 