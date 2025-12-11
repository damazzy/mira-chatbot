// e2e/tests/home.spec.ts
import { test, expect } from '@playwright/test';

test.describe('首页', () => {
  
  // 每个测试前都访问首页
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
  });

  test('页面能正常打开', async ({ page }) => {
    // 验证页面有内容
    await expect(page.locator('body')).toBeVisible();
  });

  test('点击 Get Started 跳转到 Dashboard', async ({ page }) => {
    // 点击按钮
    await page.getByRole('button', { name: /get started/i }).click();
    
    // 验证 URL 变成 /dashboard
    await expect(page).toHaveURL('/dashboard');
  });

});
