import { openai } from '@ai-sdk/openai';
import { generateObject, generateText } from 'ai';
import { z } from 'zod';
import { NextResponse } from 'next/server';

// Define the schema for region analysis
const regionAnalysisSchema = z.object({
  largerRegions: z.array(z.string()),
  smallerRegions: z.array(z.string()),
  reasoning: z.string()
});

// Function to analyze regions
async function analyzeRegions(region: string) {
  const { object: analysis } = await generateObject({
    model: openai('gpt-4o'),
    schema: regionAnalysisSchema,
    prompt: `Given a region "${region}", analyze and return:
    1. Larger regions that contain this region (e.g., if given "San Francisco", return ["Bay Area", "California", "Western US"])
    2. Smaller regions within this region (e.g., if given "Midwest", return ["Illinois", "Indiana", "Michigan", "Ohio", "Wisconsin", "Minnesota", "Iowa", "Missouri", "Kansas", "Nebraska", "North Dakota", "South Dakota"])
    
    Return an object with:
    - largerRegions: array of larger regions that contain the given region
    - smallerRegions: array of smaller regions within the given region
    - reasoning: brief explanation of your analysis
    
    Make sure to:
    - Include both administrative divisions (states, counties) and common regional groupings
    - Consider both geographic and cultural/economic regions
    - Return empty arrays if no relevant regions are found
    - Keep region names consistent and clear
    - Not choose entire country as a region`
  });

  return analysis;
}

export async function POST(request: Request) {
  try {
    const { region } = await request.json();
    
    if (!region) {
      return NextResponse.json(
        { error: 'Region is required' },
        { status: 400 }
      );
    }

    // Analyze the region
    const analysis = await analyzeRegions(region);
    
    return NextResponse.json(analysis);
  } catch (error) {
    console.error('Error processing region:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
} 