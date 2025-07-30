# Langfuse Tool Call Missing Reproduction

This repository demonstrates an issue where OpenTelemetry traces are missing tool call details when a streamText response ends with a tool call (finishReason: 'tool-call').

## Setup

1. Clone this repository
2. Copy `.env.sample` to `.env.local` and fill in your API keys:
   ```bash
   cp .env.sample .env.local
   ```

3. Install dependencies:
   ```bash
   npm install
   ```

4. Run the development server:
   ```bash
   npm run dev
   ```

5. Open [http://localhost:3000](http://localhost:3000)

## Testing the Issue

1. Ask the chat about weather in any location (e.g., "What's the weather in London?")
2. Observe the console logs showing:
   - Server-side `onFinish` callback output
   - Client-side `onToolCall` callback output
3. Check your Langfuse dashboard for the telemetry data

## Expected vs Actual Behavior

**Expected**: When a response ends with a tool call, the OpenTelemetry span should include the `ai.response.toolCalls` attribute with the tool call details.

**Actual**: When the response ends with `finishReason: 'tool-call'`, the tool call details might be missing from the telemetry span.

## Key Files

- `instrumentation.ts` - Sets up OpenTelemetry with LangfuseExporter
- `app/api/chat/route.ts` - Chat endpoint using streamText with a tool that has no execute function
- `app/page.tsx` - Client component handling tool calls via onToolCall callback

## Notes

- The weather tool intentionally has no `execute` function to force client-side handling
- This simulates scenarios where tools need to be executed on the client (e.g., accessing local data, browser APIs)
- Check the server console for `onFinish` logs showing finishReason and toolCalls