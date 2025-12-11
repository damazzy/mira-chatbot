// playwright.config.ts（放在项目根目录）
import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  // 测试文件目录
  testDir: './e2e/tests',
  
  // 超时设置
  timeout: 30 * 1000,
  
  // 报告格式
  reporter: 'html',
  
  // 全局配置
  use: {
    // 应用地址
    baseURL: 'http://localhost:3000',
    
    // 失败时截图
    screenshot: 'only-on-failure',
  },

  // 浏览器配置
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
  ],

  // 自动启动开发服务器
  webServer: {
    command: 'pnpm dev',
    url: 'http://localhost:3000',
    reuseExistingServer: true,  // 如果已经启动就复用
  },
});