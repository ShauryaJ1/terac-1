import { generateObject, tool } from 'ai';
import { openai } from '@ai-sdk/openai';
import { z } from 'zod';
import { NextResponse } from 'next/server';
import Exa from 'exa-js';

// Initialize Exa client
const exa = new Exa(process.env.EXA_API_KEY);

// Schema for person search results
const personSearchSchema = z.object({
  people: z.array(z.object({
    name: z.string().optional(),
    title: z.string().optional(),
    company: z.string().optional(),
    location: z.string().optional(),
    relevanceScore: z.number().min(0).max(1),
    source: z.string().optional(),
    description: z.string().optional(),
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
  description: 'Search the web for people matching specific criteria',
  parameters: z.object({
    query: z.string().min(1).max(100).describe('The search query'),
  }),
  execute: async ({ query }) => {
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
  },
});

// Define the person analysis tool
export const analyzePerson = tool({
  description: 'Analyze search results to extract and evaluate person information',
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
        title: z.string().optional(),
        company: z.string().optional(),
        location: z.string().optional(),
        relevanceScore: z.number().min(0).max(1),
        description: z.string(),
      }),
      prompt: `Extract and analyze information about a person from this search result:
      
      Title: ${searchResult.title}
      Content: ${searchResult.content}
      
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
      prompt: `Generate search queries to find ${validatedConfig.searchType === 'marketing' ? 'potential customers' : 'people who can help'} in ${validatedConfig.location} who are ${validatedConfig.profession}s.
      
      User's specific need: "${validatedConfig.query}"
      
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

    // Perform searches and collect results
    const allResults = await Promise.all(
      queries.queries.map(async (query) => {
        const searchResults = await webSearch.execute({ query }, {});
        return searchResults;
      })
    );

    // Process and analyze results
    const processedResults = await Promise.all(
      allResults.flat().map(async (result) => {
        return analyzePerson.execute({ searchResult: result, config: validatedConfig }, {});
      })
    );

    // Sort by relevance and remove duplicates
    const uniqueResults = Array.from(
      new Map(processedResults.map(p => [p.name, p])).values()
    ).sort((a, b) => b.relevanceScore - a.relevanceScore);

    return NextResponse.json({
      people: uniqueResults.slice(0, validatedConfig.numResults),
      reasoning: queries.reasoning
    });

  } catch (error) {
    console.error('Error in person search:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
} 