import { openai } from '@ai-sdk/openai';
import { generateObject } from 'ai';
import { z } from 'zod';
import { NextResponse } from 'next/server';

// Schema for query expansion results
const queryExpansionSchema = z.object({
  queries: z.array(z.string()),
  reasoning: z.string()
});

// Function to generate alternative search queries
async function generateAlternativeQueries(query: string, numQueries: number = 5) {
  const { object: expansion } = await generateObject({
    model: openai('gpt-4o'),
    schema: queryExpansionSchema,
    prompt: `Given the following search query, generate ${numQueries} alternative search queries that could help find relevant information:
    
    Original Query: "${query}"
    
    Return an object with:
    - queries: array of ${numQueries} alternative search queries
    - reasoning: brief explanation of how you generated these alternatives
    
    Make sure to:
    - Keep each query concise and focused
    - Use different phrasings and keywords
    - Maintain the core intent of the original query
    - Include both broader and more specific variations
    - Use natural language that a user would type
    - Avoid duplicate or very similar queries
    - Consider different aspects of the original query
    - Include industry-specific terminology when relevant`
  });

  return expansion.queries;
}

export async function POST(request: Request) {
  try {
    const { query, numQueries } = await request.json();
    
    if (!query) {
      return NextResponse.json(
        { error: 'Query is required' },
        { status: 400 }
      );
    }

    const alternativeQueries = await generateAlternativeQueries(
      query,
      numQueries || 5
    );

    return NextResponse.json({
      queries: alternativeQueries
    });
  } catch (error) {
    console.error('Error generating alternative queries:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
} 