import type { Preview } from '@storybook/nextjs-vite';
import { initialize, mswLoader } from 'msw-storybook-addon';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { NextIntlClientProvider } from 'next-intl';
import React from 'react';
import '../app/globals.css';

// 初始化 MSW
initialize();

// 创建 QueryClient
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: false,
      refetchOnWindowFocus: false,
    },
  },
});

// 中文翻译
const messages = {
  chatbot: {
    placeholder: '输入消息...',
  },
};

const preview: Preview = {
  parameters: {
    controls: {
      matchers: {
        color: /(background|color)$/i,
        date: /Date$/i,
      },
    },
    a11y: {
      test: 'todo',
    },
  },
  loaders: [mswLoader],
  decorators: [
    (Story) => (
      <QueryClientProvider client={queryClient}>
        <NextIntlClientProvider locale="zh" messages={messages}>
          <Story />
        </NextIntlClientProvider>
      </QueryClientProvider>
    ),
  ],
};

export default preview;
