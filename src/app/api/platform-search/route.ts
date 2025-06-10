import { generateObject, tool } from 'ai';
import { openai } from '@ai-sdk/openai';
import { z } from 'zod';
import { NextResponse } from 'next/server';
import Exa from 'exa-js';

// Initialize Exa client
const exa = new Exa(process.env.EXA_API_KEY);

// Schema for platform search results
const platformSearchSchema = z.object({
  platforms: z.array(z.object({
    name: z.string().optional(),
    type: z.string().optional(),
    description: z.string().optional(),
    location: z.string().optional(),
    relevanceScore: z.number().min(0).max(1),
    source: z.string().optional(),
    features: z.array(z.string()).optional(),
    pricing: z.string().optional(),
    userBase: z.string().optional(),
  })),
  reasoning: z.string()
});

// Schema for search configuration
const searchConfigSchema = z.object({
  query: z.string(),
  location: z.string().optional(),
  profession: z.string().optional(),
  searchType: z.enum(['marketing', 'help']).optional(),
  numResults: z.number().min(1).max(10).default(5)
});

// Define the web search tool
export const webSearch = tool({
  description: 'Search the web for peer-to-peer platforms matching specific criteria',
  parameters: z.object({
    query: z.string().min(1).max(100).describe('The search query'),
  }),
  execute: async ({ query }) => {
    const { results } = await exa.searchAndContents(query, {
      livecrawl: 'always',
      numResults: 5,
    });
    return results.map(result => ({
      title: result.title || '',
      url: result.url,
      content: result.text.slice(0, 1000),
      publishedDate: result.publishedDate,
    }));
  },
});

// Define the platform analysis tool
export const analyzePlatform = tool({
  description: 'Analyze search results to extract and evaluate platform information',
  parameters: z.object({
    searchResult: z.object({
      title: z.string(),
      content: z.string(),
      url: z.string(),
    }),
    config: searchConfigSchema,
  }),
  execute: async ({ searchResult, config }) => {
    const { object: analysis } = await generateObject({
      model: openai('gpt-4o-mini'),
      schema: z.object({
        name: z.string().optional(),
        type: z.string().optional(),
        description: z.string().optional(),
        location: z.string().optional(),
        relevanceScore: z.number().min(0).max(1),
        features: z.array(z.string()).optional(),
        pricing: z.string().optional(),
        userBase: z.string().optional(),
      }),
      prompt: `Extract and analyze information about a peer-to-peer platform from this search result:
      
      Title: ${searchResult.title}
      Content: ${searchResult.content}
      
      Original Query: "${config.query}"
      Location: ${config.location || 'any'}
      Profession: ${config.profession || 'any'}
      Search Type: ${config.searchType || 'any'}
      
      Return an object with:
      - name: platform name
      - type: type of platform (e.g., marketplace, community, service)
      - description: brief description of the platform
      - location: where it operates
      - relevanceScore: how relevant it is to the query (0-1)
      - features: array of key features
      - pricing: pricing model if mentioned
      - userBase: information about the user base if available
      
      Consider:
      - How well it matches the search criteria
      - Its relevance to the profession
      - Geographic coverage
      - Platform maturity and user base
      - Features that would be valuable for the user's needs`
    });

    return {
      ...analysis,
      source: searchResult.url
    };
  },
});

export async function POST(request: Request) {
  try {
    const config = await request.json();
    const validatedConfig = searchConfigSchema.parse(config);

    // Generate search queries
    const { object: queries } = await generateObject({
      model: openai('gpt-4o-mini'),
      schema: z.object({
        queries: z.array(z.string()),
        reasoning: z.string()
      }),
      prompt: `Generate search queries to find peer-to-peer platforms that might be relevant for ${validatedConfig.profession || 'professionals'} in ${validatedConfig.location || 'various locations'}.
      
      User's specific need: "${validatedConfig.query}"
      
      Return an object with:
      - queries: array of search queries optimized for finding relevant platforms
      - reasoning: brief explanation of the search strategy
      
      Make sure to:
      - Include platform-specific keywords
      - Use different phrasings and search patterns
      - Focus on active and established platforms
      - Consider both general and niche platforms
      - Include terms related to peer-to-peer, marketplace, and community aspects`
    });

    // Perform searches and collect results
    const allResults = await Promise.all(
      queries.queries.map(async (query) => {
        const searchResults = await webSearch.execute({ query });
        return searchResults;
      })
    );

    // Process and analyze results
    const processedResults = await Promise.all(
      allResults.flat().map(async (result) => {
        return analyzePlatform.execute({ searchResult: result, config: validatedConfig });
      })
    );

    // Sort by relevance and remove duplicates
    const uniqueResults = Array.from(
      new Map(processedResults.map(p => [p.name, p])).values()
    ).sort((a, b) => b.relevanceScore - a.relevanceScore);

    return NextResponse.json({
      platforms: uniqueResults.slice(0, validatedConfig.numResults),
      reasoning: queries.reasoning
    });

  } catch (error) {
    console.error('Error in platform search:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
} 