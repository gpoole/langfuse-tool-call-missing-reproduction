'use client';

import { useChat } from '@ai-sdk/react';
import { ToolInvocation } from 'ai';
import { useState } from 'react';

function AskForLocation({ toolInvocation, addToolResult }: { 
  toolInvocation: ToolInvocation; 
  addToolResult: (result: { toolCallId: string; result: string }) => void; 
}) {
  const [locationInput, setLocationInput] = useState('');
  
  const handleLocationSubmit = () => {
    if (locationInput) {
      console.log('=== Submitting location via addToolResult ===');
      console.log('Location:', locationInput);
      
      addToolResult({ 
        toolCallId: toolInvocation.toolCallId, 
        result: locationInput 
      });
    }
  };

  return (
    <div className="mt-2 p-2 bg-orange-50 rounded">
      <h4 className="font-semibold mb-2">What is your location?</h4>
      <div className="flex space-x-2">
        <input
          className="flex-1 p-2 border rounded-lg text-sm"
          value={locationInput}
          placeholder="City name"
          onChange={(e) => setLocationInput(e.target.value)}
          onKeyPress={(e) => e.key === 'Enter' && handleLocationSubmit()}
        />
        <button 
          onClick={handleLocationSubmit}
          className="px-3 py-1 bg-orange-500 text-white text-sm rounded-lg hover:bg-orange-600"
          disabled={!locationInput}
        >
          Submit
        </button>
      </div>
    </div>
  );
}

export default function Chat() {
  const { messages, input, handleInputChange, handleSubmit, addToolResult } = useChat({
    api: '/api/chat',
    onToolCall: async ({ toolCall }) => {
      console.log('=== Client onToolCall ===');
      console.log('Tool call received:', toolCall);
    },
  });

  return (
    <div className="flex flex-col w-full max-w-2xl mx-auto p-4 space-y-4">
      <h1 className="text-2xl font-bold">Langfuse Tool Call Reproduction</h1>
      
      <div className="border rounded-lg p-4 bg-gray-50">
        <h2 className="font-semibold mb-2">Instructions:</h2>
        <ul className="list-disc list-inside space-y-1 text-sm">
          <li>Ask about weather (e.g., &quot;What&apos;s the weather like?&quot;)</li>
          <li>The model will call askForLocation (client-side, no execute) to get your location</li>
          <li>After you provide location, it calls showWeatherForLocation (server-side with execute)</li>
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
              {m.parts?.filter(part => part.type === 'tool-invocation').map(({ toolInvocation }) => (
                <div key={toolInvocation.toolCallId} className="mt-2 p-2 bg-yellow-100 rounded text-black text-sm">
                  <div className="font-semibold">Tool: {toolInvocation.toolName}</div>
                  {Object.keys(toolInvocation.args).length > 0 && (
                    <div>Args: {JSON.stringify(toolInvocation.args, null, 2)}</div>
                  )}
                  <div className="mt-1">
                    {toolInvocation.toolName === 'askForLocation' ? (
                      'result' in toolInvocation ? (
                        <div>Location: {toolInvocation.result}</div>
                      ) : (
                        <AskForLocation toolInvocation={toolInvocation} addToolResult={addToolResult} />
                      )
                    ) : toolInvocation.toolName === 'showWeatherForLocation' && 'result' in toolInvocation ? (
                      <div className="mt-2 p-2 bg-white rounded">
                        <div><strong>{toolInvocation.result.locationName}</strong></div>
                        <div>Temperature: {toolInvocation.result.temperature}</div>
                        <div>Conditions: {toolInvocation.result.conditions}</div>
                      </div>
                    ) : (
                      <span className="text-gray-500">Processing...</span>
                    )}
                  </div>
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
