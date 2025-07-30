'use client';

import { useChat } from '@ai-sdk/react';
import { useState } from 'react';

export default function Chat() {
  const [weatherData, setWeatherData] = useState<Record<string, any>>({});
  
  const { messages, input, handleInputChange, handleSubmit } = useChat({
    api: '/api/chat',
    onToolCall: async ({ toolCall }) => {
      console.log('=== Client onToolCall ===');
      console.log('Tool call received:', toolCall);
      
      if (toolCall.toolName === 'getWeather') {
        // Simulate weather data fetch
        const mockWeather = {
          location: toolCall.args.location,
          temperature: Math.floor(Math.random() * 30) + 10,
          unit: toolCall.args.unit,
          condition: ['sunny', 'cloudy', 'rainy'][Math.floor(Math.random() * 3)],
        };
        
        setWeatherData(prev => ({
          ...prev,
          [toolCall.toolCallId]: mockWeather,
        }));

        // Return the weather data to the model
        return JSON.stringify(mockWeather);
      }
    },
  });

  return (
    <div className="flex flex-col w-full max-w-2xl mx-auto p-4 space-y-4">
      <h1 className="text-2xl font-bold">Langfuse Tool Call Reproduction</h1>
      
      <div className="border rounded-lg p-4 bg-gray-50">
        <h2 className="font-semibold mb-2">Instructions:</h2>
        <ul className="list-disc list-inside space-y-1 text-sm">
          <li>Ask about weather in a location (e.g., &quot;What&apos;s the weather in London?&quot;)</li>
          <li>The model will call the getWeather tool</li>
          <li>Check console logs and Langfuse dashboard for telemetry</li>
          <li>Issue: When response ends with tool call, telemetry might be missing tool call details</li>
        </ul>
      </div>

      <div className="flex flex-col space-y-4 h-[400px] overflow-y-auto border rounded-lg p-4">
        {messages.map(m => (
          <div key={m.id} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
            <div className={`max-w-xs px-4 py-2 rounded-lg ${
              m.role === 'user' ? 'bg-blue-500 text-white' : 'bg-gray-200'
            }`}>
              <div className="font-semibold text-sm mb-1">{m.role}</div>
              <div>{m.content}</div>
              
              {/* Render tool calls */}
              {m.toolInvocations?.map((toolInvocation) => (
                <div key={toolInvocation.toolCallId} className="mt-2 p-2 bg-yellow-100 rounded text-black text-sm">
                  <div className="font-semibold">Tool: {toolInvocation.toolName}</div>
                  <div>Args: {JSON.stringify(toolInvocation.args, null, 2)}</div>
                  {weatherData[toolInvocation.toolCallId] && (
                    <div className="mt-1">
                      Result: {JSON.stringify(weatherData[toolInvocation.toolCallId], null, 2)}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>

      <form onSubmit={handleSubmit} className="flex space-x-2">
        <input
          className="flex-1 p-2 border rounded-lg"
          value={input}
          placeholder="Ask about the weather..."
          onChange={handleInputChange}
        />
        <button type="submit" className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600">
          Send
        </button>
      </form>
    </div>
  );
}
