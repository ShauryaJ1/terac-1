// app/api/chat/route.ts
import { perplexity } from '@ai-sdk/perplexity';
import { streamText } from 'ai';

// Allow streaming responses up to 30 seconds
export const maxDuration = 30;

export async function POST(req: Request) {
  // Extract the `messages` from the body of the request
  const { messages } = await req.json();

  // Call the language model
  const result = streamText({
    model: perplexity('sonar'),
    messages,
  });

  // Respond with the stream
  return result.toDataStreamResponse();
}
