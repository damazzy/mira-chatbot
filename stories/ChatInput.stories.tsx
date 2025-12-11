// stories/ChatInput.stories.tsx
import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import { expect, userEvent, within, fn } from 'storybook/test';
import { http, HttpResponse, delay } from 'msw';
import { ChatInput } from '../components/chat-input';
import '../app/globals.css';

// Mock 数据
const mockModels = {
  models: [
    {
      id: 'deepseek/deepseek-r1',
      name: 'Deepseek R1',
      provider: 'deepseek',
      description: 'Deepseek R1 模型',
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

const meta: Meta<typeof ChatInput> = {
  title: 'Components/ChatInput',
  component: ChatInput,
  parameters: {
    layout: 'centered',
  },
  argTypes: {
    status: {
      control: 'select',
      options: ['ready', 'streaming', 'submitted', 'error'],
      description: '聊天状态',
    },
    initialWebSearch: {
      control: 'boolean',
      description: '是否默认开启网页搜索',
    },
  },
  args: {
    onSubmit: fn(),
  },
};

export default meta;
type Story = StoryObj<typeof meta>;

// ============================================
// 📖 基础展示 Stories
// ============================================

export const Default: Story = {
  parameters: {
    msw: {
      handlers: [
        http.get('*/api/chat/models', () => {
          return HttpResponse.json(mockModels);
        }),
      ],
    },
  },
};

export const WithWebSearch: Story = {
  args: {
    initialWebSearch: true,
  },
  parameters: {
    msw: {
      handlers: [
        http.get('*/api/chat/models', () => {
          return HttpResponse.json(mockModels);
        }),
      ],
    },
  },
};

export const Streaming: Story = {
  args: {
    status: 'streaming',
  },
  parameters: {
    msw: {
      handlers: [
        http.get('*/api/chat/models', () => {
          return HttpResponse.json(mockModels);
        }),
      ],
    },
  },
};

export const Loading: Story = {
  parameters: {
    msw: {
      handlers: [
        http.get('*/api/chat/models', async () => {
          await delay(5000); // 模拟加载中
          return HttpResponse.json(mockModels);
        }),
      ],
    },
  },
};

export const ApiError: Story = {
  parameters: {
    msw: {
      handlers: [
        http.get('*/api/chat/models', () => {
          return HttpResponse.json(
            { detail: 'API 请求失败' },
            { status: 500 }
          );
        }),
      ],
    },
  },
};

// ============================================
// 🧪 渲染测试 Stories
// ============================================

export const Test_渲染_基本结构: Story = {
  parameters: {
    msw: {
      handlers: [
        http.get('*/api/chat/models', () => {
          return HttpResponse.json(mockModels);
        }),
      ],
    },
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    // 等待组件加载
    await new Promise((r) => setTimeout(r, 500));

    // 验证输入框存在
    const textarea = canvas.getByPlaceholderText('输入消息...');
    await expect(textarea).toBeInTheDocument();
    await expect(textarea).toBeVisible();
  },
};

// ============================================
// 🎯 交互测试 Stories
// ============================================

export const Test_交互_输入文字: Story = {
  parameters: {
    msw: {
      handlers: [
        http.get('*/api/chat/models', () => {
          return HttpResponse.json(mockModels);
        }),
      ],
    },
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    await new Promise((r) => setTimeout(r, 500));

    const textarea = canvas.getByPlaceholderText('输入消息...');
    await userEvent.type(textarea, '你好，这是一条测试消息');

    await expect(textarea).toHaveValue('你好，这是一条测试消息');
  },
};

export const Test_交互_提交消息: Story = {
  parameters: {
    msw: {
      handlers: [
        http.get('*/api/chat/models', () => {
          return HttpResponse.json(mockModels);
        }),
      ],
    },
  },
  play: async ({ canvasElement, args }) => {
    const canvas = within(canvasElement);

    await new Promise((r) => setTimeout(r, 500));

    // 输入文字
    const textarea = canvas.getByPlaceholderText('输入消息...');
    await userEvent.type(textarea, '测试消息');

    // 找到提交按钮并点击（aria-label="Submit"）
    const submitButton = canvas.getByRole('button', { name: /submit/i });
    await userEvent.click(submitButton);

    // 验证 onSubmit 被调用
    await expect(args.onSubmit).toHaveBeenCalled();
  },
};

export const Test_交互_切换网页搜索: Story = {
  parameters: {
    msw: {
      handlers: [
        http.get('*/api/chat/models', () => {
          return HttpResponse.json(mockModels);
        }),
      ],
    },
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    await new Promise((r) => setTimeout(r, 500));

    // 找到 Search 按钮
    const searchButton = canvas.getByRole('button', { name: /search/i });
    await expect(searchButton).toBeInTheDocument();

    // 点击切换
    await userEvent.click(searchButton);
  },
};
