// e2e/tests/chat.spec.ts
import { test, expect } from '@playwright/test';

// Mock 数据
const chatId = 'test-session-123';

const mockModels = {
  models: [
    {
      id: 'deepseek/deepseek-r1',
      name: 'Deepseek R1',
      provider: 'deepseek',
      description: 'Deepseek R1 推理模型',
      context_window: 32000,
      supports_vision: false,
      supports_tools: true,
      is_default: true,
    },
  ],
  default_model: 'deepseek/deepseek-r1',
};

const mockSession = {
  id: chatId,
  user_id: 'd544f6dd-aa49-4127-a424-f600b26e810b',
  title: '测试对话',
  model: 'deepseek/deepseek-r1',
  temperature: 0.7,
  max_tokens: 4096,
  message_count: 2,
  created_at: new Date().toISOString(),
  updated_at: new Date().toISOString(),
  last_message_at: new Date().toISOString(),
};

const mockMessages = [
  {
    id: 'msg-1',
    session_id: chatId,
    user_id: 'd544f6dd-aa49-4127-a424-f600b26e810b',
    role: 'user',
    content: '你好，请介绍一下你自己',
    sequence_number: 1,
    input_tokens: 10,
    output_tokens: 0,
    total_tokens: 10,
    created_at: new Date().toISOString(),
  },
  {
    id: 'msg-2',
    session_id: chatId,
    user_id: 'd544f6dd-aa49-4127-a424-f600b26e810b',
    role: 'assistant',
    content: '你好！我是 AI 助手，很高兴为你服务。',
    sequence_number: 2,
    input_tokens: 10,
    output_tokens: 20,
    total_tokens: 30,
    created_at: new Date().toISOString(),
  },
];

// 模拟流式响应 - Vercel AI SDK UI Message Stream Response 格式
// 参考: https://sdk.vercel.ai/docs/ai-sdk-ui/stream-protocol
const mockStreamResponse = [
  '0:"这是 AI 的新回复！"',
  'd:{"finishReason":"stop","usage":{"promptTokens":10,"completionTokens":5}}',
].join('\n') + '\n';

test.describe('Chat 页面', () => {

  test.beforeEach(async ({ page }) => {
    // Mock 模型列表
    await page.route('**/api/chat/models', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify(mockModels),
      });
    });

    // Mock 会话详情
    await page.route(`**/api/chat/sessions/${chatId}`, async (route) => {
      if (route.request().method() === 'GET') {
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify(mockSession),
        });
      }
    });

    // Mock 消息历史
    await page.route(`**/api/chat/sessions/${chatId}/messages**`, async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify(mockMessages),
      });
    });

    // Mock 发送消息（流式响应）- 使用本地 API
    await page.route('**/api/chat', async (route) => {
      console.log('🎯 Intercepted:', route.request().method(), route.request().url());
      if (route.request().method() === 'POST') {
        console.log('✅ Returning mock stream response');
        await route.fulfill({
          status: 200,
          contentType: 'text/event-stream',
          body: mockStreamResponse,
        });
      } else {
        await route.continue();
      }
    });

    // 访问聊天页
    await page.goto(`/chat/${chatId}`);
  });

  test('页面正常加载', async ({ page }) => {
    // 验证输入框存在
    const textarea = page.locator('textarea');
    await expect(textarea).toBeVisible({ timeout: 10000 });
  });

  test('显示历史消息', async ({ page }) => {
    // 等待消息加载
    await expect(page.getByText('你好，请介绍一下你自己')).toBeVisible({ timeout: 10000 });
    await expect(page.getByText('你好！我是 AI 助手')).toBeVisible();
  });

  test('可以发送新消息', async ({ page }) => {
    // 等待页面加载完成
    const textarea = page.locator('textarea');
    await expect(textarea).toBeVisible({ timeout: 10000 });

    // 等待模型加载
    const modelSelector = page.getByRole('combobox');
    await expect(modelSelector).toContainText('Deepseek R1');

    // 输入新消息
    await textarea.fill('帮我写一首诗');

    // 等待按钮启用并点击
    const submitButton = page.locator('button[type="submit"]');
    await expect(submitButton).toBeEnabled({ timeout: 5000 });
    await submitButton.click();

    // 验证用户消息显示
    await expect(page.getByText('帮我写一首诗')).toBeVisible({ timeout: 10000 });
  });

  test('发送消息后用户消息显示', async ({ page }) => {
    // 等待页面加载
    const textarea = page.locator('textarea');
    await expect(textarea).toBeVisible({ timeout: 10000 });

    // 等待模型加载
    const modelSelector = page.getByRole('combobox');
    await expect(modelSelector).toContainText('Deepseek R1');

    // 发送消息
    await textarea.fill('测试发送消息');
    const submitButton = page.locator('button[type="submit"]');
    await expect(submitButton).toBeEnabled({ timeout: 5000 });
    await submitButton.click();

    // 验证用户消息显示在对话中
    await expect(page.getByText('测试发送消息')).toBeVisible({ timeout: 10000 });
    
    // 注意：AI 流式响应需要正确的 AI SDK 格式，建议用集成测试验证
    // E2E 测试重点验证用户交互流程
  });

});

