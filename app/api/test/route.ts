import { generateText, stepCountIs, streamObject, tool } from 'ai';
import { z } from 'zod';
import { NextResponse } from 'next/server';

export const maxDuration = 60;

export async function GET() {
  try {
    const { partialObjectStream, object } = await streamObject({
      // model: huggingface.responses('deepseek-ai/DeepSeek-V3-0324'),
      model: 'openai/gpt-4o',
      schema: z.object({
        recipe: z.object({
          name: z.string(),
          ingredients: z.array(z.object({ name: z.string(), amount: z.string() })),
          steps: z.array(z.string()),
        }),
      }),
      prompt:
        'What is the weather in New York? Use the getWeather tool and tell me the results.',

    });
    console.log(object);
    for await (const partialObject of partialObjectStream) {
      console.log('partialObject:', partialObject);
    }

    return new Response(JSON.stringify(object));
  } catch (error) {
    console.error('Error in test route:', error);
    return NextResponse.json(
      { success: false, error: String(error) },
      { status: 500 }
    );
  }
}
