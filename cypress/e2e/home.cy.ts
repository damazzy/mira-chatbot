// cypress/e2e/home.cy.ts
// 首页 E2E 测试

describe('首页', () => {
  beforeEach(() => {
    // 拦截 API 请求，返回 mock 数据
    cy.intercept('GET', '/api/chat/models', {
      statusCode: 200,
      body: {
        models: [
          {
            id: 'deepseek/deepseek-r1',
            name: 'Deepseek R1',
            provider: 'deepseek',
            is_default: true,
          },
        ],
        default_model: 'deepseek/deepseek-r1',
      },
    }).as('getModels');

    // 访问首页
    cy.visit('/');
  });

  it('页面应该正常加载', () => {
    // 验证页面标题或主要元素
    cy.get('body').should('be.visible');
  });

  it('应该显示聊天输入框', () => {
    // 等待 API 请求完成
    cy.wait('@getModels');

    // 查找输入框
    cy.get('textarea').should('be.visible');
  });
});
