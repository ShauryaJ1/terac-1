import { generateObject, tool } from 'ai';
import { openai } from '@ai-sdk/openai';
import { z } from 'zod';
import { NextResponse } from 'next/server';
import Exa from 'exa-js';

// Initialize Exa client
const exa = new Exa(process.env.EXA_API_KEY);

// Schema for license search results
const licenseSearchSchema = z.object({
  licenses: z.array(z.object({
    name: z.string().nullable(),
    type: z.string().nullable(),
    description: z.string().nullable(),
    databaseUrl: z.string().nullable(),
    jurisdiction: z.string().nullable(),
    requirements: z.array(z.string()).nullable(),
    relevanceScore: z.number().min(0).max(1),
    source: z.string().nullable()
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

// Define the web search tool
export const webSearch = tool({
  description: 'Search the web for licenses and permits matching specific criteria',
  parameters: z.object({
    query: z.string().min(1).max(100).describe('The search query'),
  }),
  execute: async ({ query }, { toolCallId, messages }) => {
    const { results } = await exa.searchAndContents(query, {
      livecrawl: 'always',
      numResults: 5,
    });
    return results.map(result => ({
      title: result.title || 'Untitled Result',
      url: result.url,
      content: result.text.slice(0, 1000),
      publishedDate: result.publishedDate,
    }));
  },
});

// Define the license analysis tool
export const analyzeLicense = tool({
  description: 'Analyze search results to extract and evaluate license information',
  parameters: z.object({
    searchResult: z.object({
      title: z.string(),
      content: z.string(),
      url: z.string(),
    }),
    config: searchConfigSchema,
  }),
  execute: async ({ searchResult, config }, { toolCallId, messages }) => {
    const { object: analysis } = await generateObject({
      model: openai('gpt-4o-mini'),
      schema: z.object({
        name: z.string().nullable(),
        type: z.string().nullable(),
        description: z.string().nullable(),
        databaseUrl: z.string().nullable(),
        jurisdiction: z.string().nullable(),
        requirements: z.array(z.string()).nullable(),
        relevanceScore: z.number().min(0).max(1),
        source: z.string().nullable()
      }),
      prompt: `Extract and analyze information about a license or permit from this search result:
      
      Title: ${searchResult.title}
      Content: ${searchResult.content}
      
      Original Query: "${config.query}"
      Location: ${config.location}
      Profession: ${config.profession}
      Search Type: ${config.searchType}
      
      Return an object with:
      - name: name of the license/permit
      - type: type of license/permit
      - description: brief description of what it covers
      - databaseUrl: URL to official database (if available)
      - jurisdiction: where it applies
      - requirements: array of key requirements
      - relevanceScore: how relevant it is to the query (0-1)
      - source: source URL
      
      Consider:
      - How well it matches the search criteria
      - Whether it's relevant to the profession
      - If it's required in the target location
      - Its importance for ${config.searchType === 'marketing' ? 'business operations' : 'compliance'}`
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
      prompt: `Generate search queries to find licenses and registrations in ${validatedConfig.location} for ${validatedConfig.profession}s.
      
      User's specific need: "${validatedConfig.query}"
      
      Return an object with:
      - queries: array of search queries optimized for finding relevant licenses
      - reasoning: brief explanation of the search strategy
      
      Make sure to:
      - Include location and profession in each query
      - Use different phrasings and keywords
      - Focus on finding active/current licenses
      - Include both direct and indirect search patterns
      - Consider industry-specific terminology`
    });

    // Perform searches and collect results
    const allResults = await Promise.all(
      queries.queries.map(async (query) => {
        const searchResults = await webSearch.execute({ query }, { toolCallId: 'web-search', messages: [] });
        return searchResults;
      })
    );

    // Process and analyze results
    const processedResults = await Promise.all(
      allResults.flat().map(async (result) => {
        return analyzeLicense.execute({ searchResult: result, config: validatedConfig }, { toolCallId: 'analyze-license', messages: [] });
      })
    );

    // Sort by relevance and remove duplicates
    const uniqueResults = Array.from(
      new Map(processedResults.map(p => [p.name, p])).values()
    ).sort((a, b) => b.relevanceScore - a.relevanceScore);

    return NextResponse.json({
      licenses: uniqueResults.slice(0, validatedConfig.numResults),
      reasoning: queries.reasoning
    });

  } catch (error) {
    console.error('Error in license search:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
} 