import { streamText, createDataStreamResponse } from 'ai';
import { openai } from '@ai-sdk/openai';
import { z } from 'zod';

// Tool that does NOT have an execute function
// This will require client-side handling
const weatherTool = {
  name: 'getWeather',
  description: 'Get the current weather for a location',
  parameters: z.object({
    location: z.string().describe('The location to get weather for'),
    unit: z.enum(['celsius', 'fahrenheit']).optional().default('celsius'),
  }),
};

export async function POST(req: Request) {
  const { messages } = await req.json();

  return createDataStreamResponse({
    execute: async (dataStream) => {
      const stream = await streamText({
        model: openai('gpt-4o-mini'),
        messages,
        tools: {
          getWeather: weatherTool,
        },
        toolChoice: 'auto',
        experimental_telemetry: {
          isEnabled: true,
          functionId: 'stream-text-with-tools',
          metadata: {
            userId: 'test-user',
            sessionId: 'test-session',
          },
        },
        onFinish: async ({ text, toolCalls, toolResults, finishReason, usage }) => {
          console.log('=== streamText onFinish ===');
          console.log('Finish reason:', finishReason);
          console.log('Tool calls:', toolCalls);
          console.log('Tool results:', toolResults);
          console.log('Text:', text);
          console.log('Usage:', usage);
          console.log('========================');
        },
      });

      stream.mergeIntoDataStream(dataStream);
    },
  });
}