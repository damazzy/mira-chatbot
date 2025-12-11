// cypress/e2e/chat.cy.ts
// 聊天功能 E2E 测试

describe('聊天功能', () => {
  beforeEach(() => {
    // Mock 模型列表 API
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

    // Mock 聊天 API (流式响应)
    cy.intercept('POST', '/api/chat', {
      statusCode: 200,
      body: 'data: {"type":"text","content":"你好！有什么可以帮助你的？"}\n\n',
    }).as('postChat');
  });

  it('应该能够发送消息', () => {
    cy.visit('/');
    cy.wait('@getModels');

    // 在输入框输入内容
    cy.get('textarea').type('你好');

    // 点击发送按钮
    cy.get('button[type="submit"]').click();

    // 验证请求已发送
    cy.wait('@postChat');
  });

  it('应该能够通过 Enter 键发送消息', () => {
    cy.visit('/');
    cy.wait('@getModels');

    // 输入并按 Enter
    cy.get('textarea').type('测试消息{enter}');

    // 验证请求已发送
    cy.wait('@postChat');
  });
});
