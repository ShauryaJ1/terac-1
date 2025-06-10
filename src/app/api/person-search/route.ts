import { generateObject } from 'ai';
import { openai } from '@ai-sdk/openai';
import { z } from 'zod';
import { NextResponse } from 'next/server';
import Exa from 'exa-js';

// Initialize Exa client
const exa = new Exa(process.env.EXA_API_KEY);

// Schema for person search results
const personSearchSchema = z.object({
  people: z.array(z.object({
    name: z.string(),
    title: z.string(),
    company: z.string().optional(),
    location: z.string(),
    relevanceScore: z.number().min(0).max(1),
    source: z.string(),
    description: z.string(),
  })),
  reasoning: z.string()
});

// Schema for search configuration
const searchConfigSchema = z.object({
  query: z.string(),
  location: z.string(),
  profession: z.string(),
  searchType: z.enum(['marketing', 'help']),
  numResults: z.number().min(1).max(10).default(5)
});

export async function POST(request: Request) {
  try {
    const config = await request.json();
    const validatedConfig = searchConfigSchema.parse(config);

    // Generate search queries based on the type of search
    const searchQueries = await generateSearchQueries(validatedConfig);
    
    // Perform searches and collect results
    const allResults = await Promise.all(
      searchQueries.map(query => performSearch(query))
    );

    // Process and analyze results
    const processedResults = await processSearchResults(allResults.flat(), validatedConfig);

    // Sort by relevance and remove duplicates
    const uniqueResults = Array.from(
      new Map(processedResults.map(p => [p.name, p])).values()
    ).sort((a, b) => b.relevanceScore - a.relevanceScore);

    return NextResponse.json({
      people: uniqueResults.slice(0, validatedConfig.numResults),
      reasoning: "Search completed successfully"
    });

  } catch (error) {
    console.error('Error in person search:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

async function generateSearchQueries(config: z.infer<typeof searchConfigSchema>) {
  const { object: queries } = await generateObject({
    model: openai('gpt-4o'),
    schema: z.object({
      queries: z.array(z.string()),
      reasoning: z.string()
    }),
    prompt: `Generate search queries to find ${config.searchType === 'marketing' ? 'potential customers' : 'people who can help'} in ${config.location} who are ${config.profession}s.
    
    User's specific need: "${config.query}"
    
    Return an object with:
    - queries: array of search queries optimized for finding relevant people
    - reasoning: brief explanation of the search strategy
    
    Make sure to:
    - Include location and profession in each query
    - Use different phrasings and keywords
    - Focus on finding active professionals
    - Include both direct and indirect search patterns
    - Consider industry-specific terminology`
  });

  return queries.queries;
}

async function performSearch(query: string) {
  const { results } = await exa.searchAndContents(query, {
    livecrawl: 'always',
    numResults: 5,
  });

  return results.map(result => ({
    title: result.title,
    url: result.url,
    content: result.text.slice(0, 1000),
    publishedDate: result.publishedDate,
  }));
}

async function processSearchResults(results: any[], config: z.infer<typeof searchConfigSchema>) {
  const processedResults = await Promise.all(
    results.map(async (result) => {
      const { object: analysis } = await generateObject({
        model: openai('gpt-4o'),
        schema: z.object({
          name: z.string(),
          title: z.string(),
          company: z.string().optional(),
          location: z.string(),
          relevanceScore: z.number().min(0).max(1),
          description: z.string(),
        }),
        prompt: `Extract and analyze information about a person from this search result:
        
        Title: ${result.title}
        Content: ${result.content}
        
        Original Query: "${config.query}"
        Location: ${config.location}
        Profession: ${config.profession}
        Search Type: ${config.searchType}
        
        Return an object with:
        - name: person's name
        - title: their current role/title
        - company: their company (if mentioned)
        - location: their location
        - relevanceScore: how relevant they are to the query (0-1)
        - description: brief description of their background
        
        Consider:
        - How well they match the search criteria
        - Their current role and experience
        - Their location relative to the target area
        - Their potential as a ${config.searchType === 'marketing' ? 'customer' : 'helper'}`
      });

      return {
        ...analysis,
        source: result.url
      };
    })
  );

  return processedResults;
} 