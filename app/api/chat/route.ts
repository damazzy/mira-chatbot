import { streamText, UIMessage, convertToModelMessages } from 'ai';

// Allow streaming responses up to 30 seconds
export const maxDuration = 30;

export async function POST(req: Request) {
  try {
    const {
      messages,
      model,
      webSearch,
    }: { 
      messages: UIMessage[]; 
      model: string; 
      webSearch: boolean;
    } = await req.json();

    // AI SDK 会自动读取环境变量中的 API keys
    // 如果使用 Vercel AI Gateway，设置 AI_GATEWAY_API_KEY 环境变量
    // 如果直接使用 OpenAI，设置 OPENAI_API_KEY 环境变量
    // 如果使用其他提供商，设置对应的 API key 环境变量
    
    const result = streamText({
      model: webSearch ? 'perplexity/sonar' : model,
      // model: model,
      messages: convertToModelMessages(messages),
      system:
        'You are a helpful assistant that can answer questions and help with tasks. Respond in a friendly and professional manner.',
    });

    // send sources and reasoning back to the client
    return result.toUIMessageStreamResponse({
      sendSources: true,
      sendReasoning: true,
    });
  } catch (error) {
    console.error('Chat API error:', error);
    return new Response(
      JSON.stringify({ error: 'Failed to process chat request' }),
      { 
        status: 500,
        headers: { 'Content-Type': 'application/json' },
      }
    );
  }
}

