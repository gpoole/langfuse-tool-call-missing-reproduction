import { streamText, createDataStreamResponse, tool } from 'ai';
import { openai } from '@ai-sdk/openai';
import { z } from 'zod';

// Tool that does NOT have an execute function
// This will require client-side handling with setToolResult
const askForLocation = {
  name: 'askForLocation',
  description: 'Ask the user for their location',
  parameters: z.object({}),
};

// Tool with execute method that returns weather data
const showWeatherForLocation = tool({
  description: 'Show weather information for a specific location',
  parameters: z.object({
    location: z.string().describe('The location to show weather for'),
  }),
  execute: async ({ location }) => {
    console.log('=== showWeatherForLocation.execute called ===');
    console.log('Location:', location);
    
    // Return fake weather data
    const weatherData = {
      locationName: location,
      temperature: `${Math.floor(Math.random() * 15) + 15}°C`,
      conditions: ['sunny', 'partly cloudy', 'cloudy', 'rainy'][Math.floor(Math.random() * 4)],
    };
    
    console.log('Returning weather data:', weatherData);
    return weatherData;
  },
});

export async function POST(req: Request) {
  const { messages } = await req.json();

  return createDataStreamResponse({
    execute: async (dataStream) => {
      const stream = await streamText({
        model: openai('gpt-4o-mini'),
        messages,
        tools: {
          askForLocation: askForLocation,
          showWeatherForLocation: showWeatherForLocation,
        },
        maxSteps: 5,
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