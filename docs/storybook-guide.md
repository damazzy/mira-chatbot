# Storybook 组件测试手册

## 1. 安装调试

### 1.1 启动 Storybook

```bash
pnpm storybook
```

启动后访问 `http://localhost:6006`

### 1.2 构建静态文档

```bash
pnpm build-storybook
```

### 1.3 常见问题

| 问题 | 解决方案 |
|------|---------|
| 端口被占用 | 修改端口：`pnpm storybook -- -p 6007` |
| 样式不生效 | 检查是否导入了 `../app/globals.css` |
| 组件找不到 | 检查导入路径是否正确 |

---

## 2. 写之前需要知道什么

### 2.1 Stories 文件是什么

- **Stories 文件** = 组件的"展示说明书"
- 一个 Story = 组件的一种状态/用法
- 文件命名：`组件名.stories.tsx`，放在 `stories/` 目录

### 2.2 核心概念

| 概念 | 说明 |
|------|------|
| `Meta` | 组件的基本配置（标题、参数控件等） |
| `Story` | 组件的一种状态展示 |
| `args` | 传给组件的 props |
| `argTypes` | 定义 Storybook 控制面板的控件类型 |
| `play` | 交互测试函数 |

### 2.3 需要导入的内容

```tsx
// 必须导入
import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import { 组件名 } from '../components/ui/组件名';
import '../app/globals.css';

// 如果有测试
import { expect, userEvent, within, fn } from 'storybook/test';
```

---

## 3. 写的过程中需要注意什么

### 3.1 argTypes 如何确定

1. **看组件的 props 类型**
2. **根据类型选择控件**：

| Props 类型 | control 值 |
|-----------|------------|
| 固定字符串选项 | `'select'` + `options: [...]` |
| 布尔值 | `'boolean'` |
| 字符串 | `'text'` |
| 数字 | `'number'` |
| 函数/回调 | 不配 control，用 `fn()` mock |

### 3.2 测试函数 play 的写法

```tsx
play: async ({ canvasElement, args }) => {
  // 1. 获取画布
  const canvas = within(canvasElement);
  
  // 2. 查找元素
  const element = canvas.getByRole('button');
  
  // 3. 模拟操作
  await userEvent.click(element);
  
  // 4. 断言验证
  await expect(element).toBeVisible();
  await expect(args.onClick).toHaveBeenCalled();
}
```

### 3.3 常用查找方法

```tsx
canvas.getByRole('button');        // 按角色
canvas.getByText('文字');           // 按文字
canvas.getByTestId('test-id');     // 按 data-testid
canvas.getByPlaceholderText('..'); // 按 placeholder
```

### 3.4 常用操作方法

```tsx
await userEvent.click(element);      // 点击
await userEvent.type(input, 'text'); // 输入
await userEvent.clear(input);        // 清空
await userEvent.keyboard('{Enter}'); // 按键
await userEvent.tab();               // Tab 键
```

### 3.5 常用断言方法

```tsx
await expect(el).toBeInTheDocument();   // 存在
await expect(el).toBeVisible();         // 可见
await expect(el).toBeDisabled();        // 禁用
await expect(el).toHaveFocus();         // 聚焦
await expect(el).toHaveValue('值');     // 有值
await expect(el).toHaveTextContent(''); // 有文字
await expect(el).toHaveAttribute('a', 'b'); // 有属性
await expect(fn).toHaveBeenCalled();    // 函数被调用
await expect(fn).toHaveBeenCalledTimes(2); // 调用次数
```

---

## 4. 写完后如何 Test

### 4.1 在 Storybook 界面测试

1. 运行 `pnpm storybook`
2. 在左侧菜单找到你的组件
3. 点击带 `Test_` 前缀的 Story
4. 查看右下角的测试结果（✅ 或 ❌）

### 4.2 命令行批量测试

```bash
# 需要先启动 Storybook
pnpm storybook

# 另开终端运行测试
pnpm test-storybook
```

---

## 5. 书写模板案例

### 5.1 完整模板

```tsx
// stories/UI组件名.stories.tsx

// ========== 固定部分 ==========
import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import { expect, userEvent, within, fn } from 'storybook/test';
import '../app/globals.css';

// ========== 动态部分：导入组件 ==========
import { 组件名 } from '../components/ui/组件名';

// ========== 固定结构，动态内容 ==========
const meta: Meta<typeof 组件名> = {
  title: 'Components/UI/组件名',    // 动态：Storybook 菜单路径
  component: 组件名,                // 动态：组件
  parameters: { layout: 'centered' }, // 固定
  tags: ['autodocs'],               // 固定
  
  // 动态：根据组件 props 配置
  argTypes: {
    propName: {
      control: 'select',
      options: ['option1', 'option2'],
      description: '描述',
    },
    disabled: {
      control: 'boolean',
      description: '是否禁用',
    },
  },
  
  // 固定：mock 回调函数
  args: {
    onChange: fn(),
    onClick: fn(),
  },
};

export default meta;
type Story = StoryObj<typeof meta>;

// ========== 📖 基础展示 Stories ==========

// 固定：每个组件都需要 Default
export const Default: Story = {
  args: {
    // 动态：组件的默认 props
  },
};

// 动态：根据组件特性添加
export const Disabled: Story = {
  args: {
    disabled: true,
  },
};

// ========== 🧪 渲染测试 Stories ==========

// 固定结构，动态断言
export const Test_渲染_基本结构: Story = {
  args: { /* 动态 */ },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const element = canvas.getByRole('button'); // 动态：查找方式
    
    // 动态：根据组件特性断言
    await expect(element).toBeInTheDocument();
    await expect(element).toHaveAttribute('data-slot', '组件名');
  },
};

export const Test_渲染_禁用状态: Story = {
  args: { disabled: true },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const element = canvas.getByRole('button'); // 动态
    
    await expect(element).toBeDisabled();
  },
};

// ========== 🎯 交互测试 Stories ==========

export const Test_交互_点击: Story = {
  args: { /* 动态 */ },
  play: async ({ canvasElement, args }) => {
    const canvas = within(canvasElement);
    const element = canvas.getByRole('button'); // 动态
    
    await userEvent.click(element);
    await expect(args.onClick).toHaveBeenCalled(); // 动态：回调名
  },
};

export const Test_交互_Tab导航: Story = {
  render: (args) => (
    <div>
      {/* 动态：多个组件用于测试导航 */}
      <组件名 {...args} data-testid="el-1" />
      <组件名 {...args} data-testid="el-2" disabled />
      <组件名 {...args} data-testid="el-3" />
    </div>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const el1 = canvas.getByTestId('el-1');
    const el3 = canvas.getByTestId('el-3');
    
    await userEvent.tab();
    await expect(el1).toHaveFocus();
    
    await userEvent.tab(); // 跳过禁用的
    await expect(el3).toHaveFocus();
  },
};
```

### 5.2 固定 vs 动态 速查

| 内容 | 固定/动态 | 说明 |
|------|----------|------|
| import 语句 | 固定结构 | 组件名动态 |
| Meta 结构 | 固定 | title/component/argTypes 内容动态 |
| `parameters: { layout: 'centered' }` | 固定 | |
| `tags: ['autodocs']` | 固定 | |
| `export default meta` | 固定 | |
| `type Story = StoryObj<typeof meta>` | 固定 | |
| Story 的 `args` | 动态 | 根据组件 props |
| Story 的 `play` 结构 | 固定 | 断言内容动态 |
| `within(canvasElement)` | 固定 | |
| 查找元素方式 | 动态 | 根据组件类型 |
| 断言内容 | 动态 | 根据测试目的 |

---

## 6. 通用书写原则

### 6.1 命名规范

```tsx
// 展示类
export const Default: Story = {};
export const AllVariants: Story = {};
export const Disabled: Story = {};

// 测试类
export const Test_渲染_xxx: Story = {};
export const Test_交互_xxx: Story = {};
```

### 6.2 必须包含的 Stories

| 类型 | 必要性 | 说明 |
|------|--------|------|
| Default | ⭐⭐⭐ 必须 | 默认状态 |
| Disabled | ⭐⭐ 推荐 | 如果组件有禁用状态 |
| Test_渲染_基本结构 | ⭐⭐⭐ 必须 | 验证渲染正确 |
| Test_渲染_禁用状态 | ⭐⭐ 推荐 | 验证禁用状态 |
| Test_交互_主要功能 | ⭐⭐⭐ 必须 | 验证核心交互 |
| Test_交互_Tab导航 | ⭐⭐ 推荐 | 验证键盘可访问性 |

### 6.3 测试原则

1. **测试用户能做什么**，而不是代码怎么写
2. **优先使用 `getByRole`**，这是用户视角
3. **每个测试只验证一个功能点**
4. **测试名用中文**，一眼看懂测什么

### 6.4 不要做的事

- ❌ 不要测试 CSS 具体数值
- ❌ 不要测试内部实现细节
- ❌ 不要写过于复杂的场景
- ❌ 不要为每个细节都写测试

### 6.5 文件结构建议

```
stories/
├── UI组件名.stories.tsx    # 组件测试文件
├── ...
```

组件文件：
```
components/ui/
├── 组件名.tsx
├── ...
```

---

## 附录：现有 Stories 文件参考

- `stories/UIButton.stories.tsx` - Button 组件
- `stories/UIInput.stories.tsx` - Input 组件  
- `stories/UICollapsible.stories.tsx` - Collapsible 组件
