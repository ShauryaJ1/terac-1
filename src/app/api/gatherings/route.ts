import { perplexity } from '@ai-sdk/perplexity';
import { generateObject, streamText } from 'ai';
import { z } from 'zod';
import { NextResponse } from 'next/server';
import { openai } from '@ai-sdk/openai';

// Schema for gathering information
const gatheringSchema = z.object({
  name: z.string(),
  description: z.string(),
  date: z.string().optional(),
  location: z.string(),
  url: z.string().optional(),
  type: z.enum(['conference', 'expo', 'fair', 'meetup', 'other']),
  contact_information: z.string().optional(),
  relevanceScore: z.number().min(0).max(1).optional(),
});

// Schema for gathering search results
const gatheringSearchSchema = z.object({
  gatherings: z.array(gatheringSchema),
  reasoning: z.string()
});

// Schema for relevance analysis
const relevanceAnalysisSchema = z.object({
  relevanceScore: z.number().min(0).max(1),
  reasoning: z.string()
});

// Function to search for gatherings using Perplexity
export async function searchGatherings(location: string, industry: string) {
  const { object: searchResults } = await generateObject({
    model: perplexity('sonar'),
    schema: gatheringSearchSchema,
    prompt: `Find professional gatherings (conferences, expos, fairs, meetups) in ${location} related to ${industry}.
    
    Return an object with:
    - gatherings: array of gathering objects, each containing:
      - name: name of the gathering
      - description: brief description of the gathering
      - date: date or date range if available
      - location: specific location within the region
      - url: official website URL if available
      - type: type of gathering (conference/expo/fair/meetup/other)
      - contact_information: contact information for the gathering
    - reasoning: brief explanation of your search process
    
    Make sure to:
    - Include both upcoming and recurring events
    - Focus on professional/business gatherings
    - Include a mix of event types
    - Verify URLs are valid
    - Include specific dates when available
    - Keep descriptions concise but informative`
  });

  return searchResults;
}

// Function to analyze relevance of a gathering
export async function analyzeRelevance(gathering: z.infer<typeof gatheringSchema>, baseQuery: string) {
  const { object: analysis } = await generateObject({
    model: openai('gpt-4o'),
    schema: relevanceAnalysisSchema,
    prompt: `Analyze the relevance of this gathering to the user's query:
    
    Gathering:
    Name: ${gathering.name}
    Description: ${gathering.description}
    Type: ${gathering.type}
    
    User's Query: "${baseQuery}"
    
    Return an object with:
    - relevanceScore: number between 0 and 1 indicating how relevant this gathering is
    - reasoning: explanation of why this gathering is or isn't relevant
    
    Consider:
    - How well the gathering matches the user's interests
    - The type of gathering and its format
    - The target audience of the gathering
    - The topics and themes covered`
  });

  return analysis;
}

export async function POST(request: Request) {
  try {
    const { query, location, industry } = await request.json();
    
    if (!query || !location || !industry) {
      return NextResponse.json(
        { error: 'Query, location, and industry are required' },
        { status: 400 }
      );
    }

    // Step 1: Search for gatherings
    const searchResults = await searchGatherings(location, industry);
    
    // Step 2: Analyze relevance of each gathering
    const relevantGatherings = await Promise.all(
      searchResults.gatherings.map(async (gathering) => {
        const relevanceAnalysis = await analyzeRelevance(gathering, query);
        return {
          ...gathering,
          relevanceScore: relevanceAnalysis.relevanceScore
        };
      })
    );

    // Step 3: Filter out low-relevance gatherings (score < 0.5)
    const filteredGatherings = relevantGatherings.filter(
      gathering => gathering.relevanceScore >= 0.5
    );

    // Step 4: Sort by relevance score
    filteredGatherings.sort((a, b) => 
      (b.relevanceScore || 0) - (a.relevanceScore || 0)
    );

    return NextResponse.json({
      gatherings: filteredGatherings,
      reasoning: searchResults.reasoning
    });
  } catch (error) {
    console.error('Error processing gathering search:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
} 