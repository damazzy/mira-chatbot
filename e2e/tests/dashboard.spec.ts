// e2e/tests/dashboard.spec.ts
import { test, expect } from '@playwright/test';

// Mock 数据 - 根据 lib/api-client.ts 类型定义

// ModelsListResponse { models: ModelInfo[], default_model: string }
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
    {
      id: 'openai/gpt-4',
      name: 'GPT-4',
      provider: 'openai',
      description: 'OpenAI GPT-4 模型',
      context_window: 128000,
      supports_vision: true,
      supports_tools: true,
      is_default: false,
    },
  ],
  default_model: 'deepseek/deepseek-r1',
};

// SessionResponse 类型
const mockSession = {
  id: 'test-session-123',
  user_id: 'd544f6dd-aa49-4127-a424-f600b26e810b',
  title: '新对话',
  model: 'deepseek/deepseek-r1',
  temperature: 0.7,
  max_tokens: 4096,
  message_count: 0,
  created_at: new Date().toISOString(),
  updated_at: new Date().toISOString(),
  last_message_at: null,
};

test.describe('Dashboard 页面', () => {

  test.beforeEach(async ({ page }) => {
    // Mock 获取模型列表 API
    await page.route('**/api/chat/models', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify(mockModels),
      });
    });

    // Mock 创建会话 API
    await page.route('**/api/chat/sessions', async (route) => {
      if (route.request().method() === 'POST') {
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify(mockSession),
        });
      }
    });

    // 访问 Dashboard
    await page.goto('/dashboard');
  });

  test('页面正常加载，显示欢迎标题', async ({ page }) => {
    // 验证页面有欢迎文字
    await expect(page.getByRole('heading', { level: 1 })).toBeVisible();
  });

  test('显示聊天输入框', async ({ page }) => {
    // 验证输入框存在
    const textarea = page.locator('textarea');
    await expect(textarea).toBeVisible();
  });

  test('模型列表加载成功', async ({ page }) => {
    // 验证模型选择器存在并显示默认模型
    const modelSelector = page.getByRole('combobox');
    await expect(modelSelector).toBeVisible();
    await expect(modelSelector).toContainText('Deepseek R1');
  });

  test('可以切换模型', async ({ page }) => {
    // 点击模型选择器
    const modelSelector = page.getByRole('combobox');
    await modelSelector.click();
    
    // 验证下拉列表中有其他模型选项
    const gpt4Option = page.getByRole('option', { name: 'GPT-4' });
    await expect(gpt4Option).toBeVisible();
    
    // 选择 GPT-4
    await gpt4Option.click();
    
    // 验证选择器显示 GPT-4
    await expect(modelSelector).toContainText('GPT-4');
  });

  test('Search 按钮可以切换网页搜索', async ({ page }) => {
    // 找到 Search 按钮
    const searchButton = page.getByRole('button', { name: /search/i });
    await expect(searchButton).toBeVisible();
    
    // 默认状态：未激活（ghost 样式）
    // 点击激活
    await searchButton.click();
    
    // 再次点击关闭
    await searchButton.click();
  });

  test('发送消息后跳转到聊天页', async ({ page }) => {
    // 等待模型加载完成（确保组件完全就绪）
    const modelSelector = page.getByRole('combobox');
    await expect(modelSelector).toContainText('Deepseek R1');

    // 找到输入框并输入内容
    const textarea = page.locator('textarea');
    await expect(textarea).toBeVisible();
    await textarea.fill('你好，这是我的第一条消息');

    // 等待提交按钮启用
    const submitButton = page.locator('button[type="submit"]');
    await expect(submitButton).toBeEnabled({ timeout: 5000 });

    // 点击发送按钮
    await submitButton.click();

    // 验证跳转到聊天页
    await expect(page).toHaveURL(/\/chat\/test-session-123/, { timeout: 10000 });
  });

});

