import { generateObject, tool } from 'ai';
import { openai } from '@ai-sdk/openai';
import { z } from 'zod';
import { NextResponse } from 'next/server';
import Exa from 'exa-js';

// Initialize Exa client
const exa = new Exa(process.env.EXA_API_KEY);

// Schema for information exchange search results
const infoExchangeSchema = z.object({
  exchanges: z.array(z.object({
    name: z.string().optional(),
    type: z.string().optional(),
    description: z.string().optional(),
    location: z.string().optional(),
    relevanceScore: z.number().min(0).max(1),
    source: z.string().optional(),
    features: z.array(z.string()).optional(),
    audience: z.string().optional(),
    frequency: z.string().optional(),
    contact: z.string().optional(),
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
  description: 'Search the web for local information exchanges matching specific criteria',
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

// Define the exchange analysis tool
export const analyzeExchange = tool({
  description: 'Analyze search results to extract and evaluate information exchange details',
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
        audience: z.string().optional(),
        frequency: z.string().optional(),
        contact: z.string().optional(),
      }),
      prompt: `Extract and analyze information about a local information exchange (newspaper, forum, magazine, etc.) from this search result:
      
      Title: ${searchResult.title}
      Content: ${searchResult.content}
      
      Original Query: "${config.query}"
      Location: ${config.location || 'any'}
      Profession: ${config.profession || 'any'}
      Search Type: ${config.searchType || 'any'}
      
      Return an object with:
      - name: exchange name
      - type: type of exchange (e.g., newspaper, forum, magazine, newsletter)
      - description: brief description
      - location: where it operates
      - relevanceScore: how relevant it is to the query (0-1)
      - features: array of key features
      - audience: target audience information
      - frequency: publication/update frequency
      - contact: contact information if available
      
      Consider:
      - How well it matches the search criteria
      - Its relevance to the profession
      - Geographic coverage
      - Audience demographics
      - Content focus and quality`
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
      prompt: `Generate search queries to find local information exchanges (newspapers, forums, magazines, etc.) that might be relevant for ${validatedConfig.profession || 'professionals'} in ${validatedConfig.location || 'various locations'}.
      
      User's specific need: "${validatedConfig.query}"
      
      Return an object with:
      - queries: array of search queries optimized for finding relevant exchanges
      - reasoning: brief explanation of the search strategy
      
      Make sure to:
      - Include exchange-specific keywords
      - Use different phrasings and search patterns
      - Focus on active and established exchanges
      - Consider both general and niche publications
      - Include terms related to local news, forums, and community media`
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
        return analyzeExchange.execute({ searchResult: result, config: validatedConfig });
      })
    );

    // Sort by relevance and remove duplicates
    const uniqueResults = Array.from(
      new Map(processedResults.map(p => [p.name, p])).values()
    ).sort((a, b) => b.relevanceScore - a.relevanceScore);

    return NextResponse.json({
      exchanges: uniqueResults.slice(0, validatedConfig.numResults),
      reasoning: queries.reasoning
    });

  } catch (error) {
    console.error('Error in information exchange search:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
} 