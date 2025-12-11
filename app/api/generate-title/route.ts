import { generateText } from 'ai';
import { NextResponse } from 'next/server';

export const maxDuration = 10;

interface Message {
  role: 'user' | 'assistant';
  content: string;
}

export async function POST(req: Request) {
  try {
    const { messages }: { messages: Message[] } = await req.json();

    if (!messages || messages.length === 0) {
      return NextResponse.json(
        { error: 'No messages provided' },
        { status: 400 }
      );
    }

    // 只取前几条消息来生成标题
    const contextMessages = messages.slice(0, 4);
    const conversationText = contextMessages
      .map((msg) => `${msg.role === 'user' ? '用户' : '助手'}: ${msg.content}`)
      .join('\n');

    // 根据消息数量调整提示词
    const isFirstMessage = messages.length === 1 && messages[0].role === 'user';
    const promptText = isFirstMessage
      ? `基于用户的第一条消息，生成一个简洁的对话标题（不超过20个字）。

要求：
- 只返回标题文本，不要有引号、冒号或其他标点符号
- 标题要准确概括用户的问题或需求
- 使用中文
- 简洁明了，直击主题

用户消息：
${messages[0].content}

标题：`
      : `基于以下对话内容，生成一个简洁的标题（不超过20个字）。

要求：
- 只返回标题文本，不要有引号、冒号或其他标点符号
- 标题要准确概括对话的主要话题
- 使用中文
- 简洁明了

对话内容：
${conversationText}

标题：`;

    const { text } = await generateText({
      model: 'deepseek/deepseek-chat',
      prompt: promptText,
    });

    // 清理生成的标题，移除可能的引号和多余空格
    const title = text
      .trim()
      .replace(/^["']|["']$/g, '')
      .slice(0, 30);

    return NextResponse.json({ title });
  } catch (error) {
    console.error('Generate title error:', error);
    return NextResponse.json(
      { error: 'Failed to generate title' },
      { status: 500 }
    );
  }
}

