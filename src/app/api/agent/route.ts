import { openai } from '@ai-sdk/openai';
import { generateObject, generateText } from 'ai';
import { z } from 'zod';
import { NextResponse } from 'next/server';

// Define the schema for query analysis
const queryAnalysisSchema = z.object({
  hasLocation: z.boolean(),
  hasProfession: z.boolean(),
  hasProduct: z.boolean(),
  location: z.string().optional(),
  profession: z.string().optional(),
  product: z.string().optional(),
  reasoning: z.string()
});

const profileAnalysisSchema = z.object({
  hasLocation: z.boolean(),
  hasProfession: z.boolean(),
  location: z.string().optional(),
  profession: z.string().optional(),
  reasoning: z.string()
});

// Define the schema for region analysis
const regionAnalysisSchema = z.object({
  largerRegions: z.array(z.string()),
  smallerRegions: z.array(z.string()),
  reasoning: z.string()
});

// Define the schema for profession/industry analysis
const professionIndustryAnalysisSchema = z.object({
  professions: z.array(z.string()),
  industries: z.array(z.string()),
  reasoning: z.string()
});

// Function to analyze the query using AI
async function analyzeQuery(query: string, userProfile: string) {
  const { object: analysis } = await generateObject({
    model: openai('gpt-4o'),
    schema: queryAnalysisSchema,
    prompt: `Analyze this query and determine if it contains location/region, profession/industry, and extract product/service information. THE PRODUCT/SERVICE INFORMATION IS MANDATORY AND WILL BE PRESENT IN THE QUERY:
    "${query}"
    
    Return an object with:
    - hasLocation: boolean indicating if a location is mentioned
    - hasProfession: boolean indicating if a profession/industry that the target audience might be in is mentioned
    - hasProduct: boolean indicating if a product/service is mentioned
    - location: the extracted location if present
    - profession: the extracted profession/industry if present, make sure it is one word, or some hyphenated words. If no profession is found, leave it empty and put "Unknown" in the reasoning.
    - product: a product/service that the user mentions,
    - reasoning: brief explanation of your analysis`
  });
  console.log(analysis)
  // If location or profession is missing, try to extract it from the user profile
  if (!analysis.hasLocation || !analysis.hasProfession) {
    const { object: profileAnalysis } = await generateObject({
      model: openai('gpt-4o'),
      schema: profileAnalysisSchema,
      prompt: `Extract location and profession information from this user profile:
      "${userProfile}"
      
      Return an object with:
      - hasLocation: boolean indicating if a location is mentioned
      - hasProfession: boolean indicating if a profession/industry is mentioned
      - location: the extracted location if present
      - profession: the extracted profession/industry if present
      - reasoning: brief explanation of your analysis
      
      IF THE USER PROFILE IS EMPTY INFER THE PROFESSION OF THE USER FROM THE QUERY
      Query: "${query}"
      
      DO NOT LEAVE PROFESSION AS UNKNOWN`
    });

    // Fill in missing information from profile
    if (!analysis.hasLocation && profileAnalysis.hasLocation && profileAnalysis.location) {
      analysis.hasLocation = true;
      analysis.location = profileAnalysis.location;
    }
    if (!analysis.hasProfession && profileAnalysis.hasProfession && profileAnalysis.profession) {
      analysis.hasProfession = true;
      analysis.profession = profileAnalysis.profession;
    }
    analysis.reasoning += " Trying profile data, here is what I found: " + profileAnalysis.reasoning;
    
  }
  console.log(analysis)
  return analysis;
}

// Function to analyze regions
async function analyzeRegions(location: string) {
  const { object: analysis } = await generateObject({
    model: openai('gpt-4o'),
    schema: regionAnalysisSchema,
    system: `You are a helpful assistant that analyzes regions and is an expert in geography.`,
    prompt: `Given a region "${location}", analyze and return:
    1. Larger regions that contain this region (e.g., if given "San Francisco", return ["Bay Area", "California", "Western US"])
    2. Smaller regions within this region (e.g., if given "Midwest", return ["Illinois", "Indiana", "Michigan", "Ohio", "Wisconsin", "Minnesota", "Iowa", "Missouri", "Kansas", "Nebraska", "North Dakota", "South Dakota"]). This can include major cities in these regions too.
    
    Return an object with:
    - largerRegions: array of larger regions that contain the given region
    - smallerRegions: array of smaller regions within the given region
    - reasoning: brief explanation of your analysis
    
    Make sure to:
    - Include both administrative divisions (states, counties) and common regional groupings
    - Consider both geographic and cultural/economic regions
    - Return empty arrays if no relevant regions are found
    - Keep region names consistent and clear
    - Not choose entire country as a region
    - Ensure that the list is comprehensive and includes a good mix of regions, including some cities, counties, states, etc. Use your discretion to determine what is and is not relevant`
    
  });

  return analysis;
}

// Function to analyze professions and industries
async function analyzeProfessionsAndIndustries(input: string, isProduct: boolean = false) {
  const { object: analysis } = await generateObject({
    model: openai('gpt-4o'),
    schema: professionIndustryAnalysisSchema,
    system: `You are a helpful assistant that analyzes ${isProduct ? 'products' : 'queries'} and identifies relevant professions and industries.`,
    prompt: `Given ${isProduct ? 'a product/service' : 'a query'}: "${input}", analyze and return:
    1. Professions that would be relevant to this ${isProduct ? 'product' : 'query'} (e.g., if given ${isProduct ? '"project management software"' : '"looking for marketing help in tech industry"'}, return ["Project Manager", "Team Lead", "Product Manager", "Scrum Master"])
    2. Industries that would be relevant to this ${isProduct ? 'product' : 'query'} (e.g., if given ${isProduct ? '"project management software"' : '"looking for marketing help in tech industry"'}, return ["Software Development", "Construction", "Healthcare", "Education", "Manufacturing"])
    
    Return an object with:
    - professions: array of relevant professions
    - industries: array of relevant industries
    - reasoning: brief explanation of your analysis
    
    Make sure to:
    - Include both direct users and decision-makers
    - Consider both primary and secondary use cases
    - Return empty arrays if no relevant professions/industries are found
    - Keep names consistent and clear
    - Focus on specific roles and industries rather than broad categories
    - Consider both traditional and emerging professions/industries
    - If the ${isProduct ? 'product' : 'query'} mentions specific professions or industries, prioritize those`
  });

  return analysis;
}

// Function to merge profession/industry analyses
function mergeProfessionIndustryAnalyses(analysis1: any, analysis2: any) {
  return {
    professions: [...new Set([...analysis1.professions, ...analysis2.professions])],
    industries: [...new Set([...analysis1.industries, ...analysis2.industries])],
    reasoning: `Combined analysis: ${analysis1.reasoning} ${analysis2.reasoning}`
  };
}

// Function to generate response based on analysis
async function generateResponse(queryAnalysis: any, regionAnalysis: any, professionIndustryAnalysis: any) {
  let response = {
    text: '',
    regions: null as { 
      baseRegion: string,
      larger: string[], 
      smaller: string[] 
    } | null,
    professions: null as { professions: string[], industries: string[] } | null
  };

  if (queryAnalysis.hasLocation && queryAnalysis.hasProfession && queryAnalysis.location && queryAnalysis.profession) {
    response.text = `I understand you're looking for ${queryAnalysis.profession} in ${queryAnalysis.location}.`;
    
    if (regionAnalysis.largerRegions.length > 0 || regionAnalysis.smallerRegions.length > 0) {
      response.text += " Determining Relevant Regions...";
      response.regions = {
        baseRegion: queryAnalysis.location,
        larger: regionAnalysis.largerRegions,
        smaller: regionAnalysis.smallerRegions
      };
    }
    if (professionIndustryAnalysis.professions.length > 0 || professionIndustryAnalysis.industries.length > 0) {
      response.text += " Here are some potential target audiences:";
      response.professions = professionIndustryAnalysis;
    }
  } else if (queryAnalysis.hasProduct && queryAnalysis.product) {
    response.text = `I'll help you with information about ${queryAnalysis.product}.`;
    
    if (professionIndustryAnalysis.professions.length > 0 || professionIndustryAnalysis.industries.length > 0) {
      response.text += " Here are some potential target audiences:";
      response.professions = professionIndustryAnalysis;
    }
  } else {
    response.text = "I'll help you with your general query. This is a placeholder response.";
  }

  return response;
}

export async function POST(request: Request) {
  try {
    const { query, userProfile } = await request.json();
    
    if (!query) {
      return NextResponse.json(
        { error: 'Query is required' },
        { status: 400 }
      );
    }

    if (!userProfile) {
      return NextResponse.json(
        { error: 'User profile is required' },
        { status: 400 }
      );
    }

    // Step 1: Analyze the query to determine location, profession, and product
    const queryAnalysis = await analyzeQuery(query, userProfile);
    
    // Step 2: If location is present, analyze regions
    let regionAnalysis: z.infer<typeof regionAnalysisSchema> = {
      largerRegions: [],
      smallerRegions: [],
      reasoning: ''
    };
    if (queryAnalysis.hasLocation && queryAnalysis.location) {
      regionAnalysis = await analyzeRegions(queryAnalysis.location);
    }

    // Step 3: Analyze professions and industries from both the query and product
    let professionIndustryAnalysis: z.infer<typeof professionIndustryAnalysisSchema> = {
      professions: [],
      industries: [],
      reasoning: ''
    };

    // Analyze from the base query
    const queryProfessionAnalysis = await analyzeProfessionsAndIndustries(query, false);
    
    // If product is present, analyze from it as well and merge the results
    if (queryAnalysis.hasProduct && queryAnalysis.product) {
      const productProfessionAnalysis = await analyzeProfessionsAndIndustries(queryAnalysis.product, true);
      professionIndustryAnalysis = mergeProfessionIndustryAnalyses(queryProfessionAnalysis, productProfessionAnalysis);
    } else {
      professionIndustryAnalysis = queryProfessionAnalysis;
    }

    // Step 4: Generate final response
    const response = await generateResponse(queryAnalysis, regionAnalysis, professionIndustryAnalysis);
    return NextResponse.json(response);
  } catch (error) {
    console.error('Error processing query:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
} 