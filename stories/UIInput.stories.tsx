// ============================================
// stories/UIInput.stories.tsx
// Input 组件的 Storybook 文件
// ============================================

// --------------------------------------------
// 1. 导入部分
// --------------------------------------------

// 从 Storybook 导入类型定义
// - Meta: 用于定义组件的元数据配置
// - StoryObj: 用于定义单个 Story 的类型
import type { Meta, StoryObj } from '@storybook/nextjs-vite';

// 从 Storybook 导入测试工具
// - expect: 断言函数，用于验证测试结果
// - userEvent: 模拟用户操作（点击、输入、按键等）
// - within: 限定 DOM 查询范围
// - fn: 创建 mock 函数，用于监听函数是否被调用
import { expect, userEvent, within, fn } from 'storybook/test';

// 导入被测试的组件
import { Input } from '../components/ui/input';

// 导入全局样式，确保组件样式正常显示
import '../app/globals.css';

// --------------------------------------------
// 2. Meta 配置（组件的全局设置）
// --------------------------------------------

const meta: Meta<typeof Input> = {
  // title: 定义组件在 Storybook 左侧导航中的位置
  // 格式: '父目录/子目录/组件名'
  // 显示效果: Components > UI > Input
  title: 'Components/UI/Input',

  // component: 绑定要测试的组件
  // Storybook 会根据这个自动推断组件的 props
  component: Input,

  // parameters: 全局参数配置
  // layout: 'centered' 表示组件居中显示
  // 其他选项: 'fullscreen'(全屏) | 'padded'(带内边距，默认)
  parameters: { layout: 'centered' },

  // tags: 功能标签
  // 'autodocs' 会自动生成组件文档页面
  tags: ['autodocs'],

  // argTypes: 定义 Storybook 控制面板中的控件
  // 让用户可以在界面上交互式地修改组件 props
  argTypes: {
    // type 属性：输入框类型
    type: {
      control: 'select', // 显示为下拉选择框
      options: ['text', 'password', 'email', 'number', 'search'], // 可选值
      description: '输入框类型', // 控件描述文字
    },
    // placeholder 属性：占位提示文字
    placeholder: {
      control: 'text', // 显示为文本输入框
      description: '占位提示文字',
    },
    // disabled 属性：是否禁用
    disabled: {
      control: 'boolean', // 显示为开关
      description: '是否禁用',
    },
  },

  // args: 所有 Story 共享的默认 props
  // fn() 创建一个 mock 函数，可以追踪 onChange 是否被调用
  args: {
    onChange: fn(),
  },
};

// 导出 meta 配置，Storybook 通过 default export 读取配置
export default meta;

// 定义 Story 类型，用于 TypeScript 类型检查和自动补全
type Story = StoryObj<typeof meta>;

// ============================================
// 3. 基础展示 Stories
// 用于展示组件的各种状态和用法
// ============================================

/**
 * Default: 默认状态
 * 最基本的用法，只设置 placeholder
 */
export const Default: Story = {
  // args: 传给组件的 props
  args: {
    placeholder: '请输入内容...',
  },
};

/**
 * AllTypes: 展示所有输入类型
 * 使用 render 函数自定义渲染多个组件
 */
export const AllTypes: Story = {
  // render: 自定义渲染函数
  // 当需要渲染多个组件或自定义布局时使用
  render: () => (
    <div className="flex flex-col gap-4 w-80">
      <Input type="text" placeholder="文本 (text)" />
      <Input type="email" placeholder="邮箱 (email)" />
      <Input type="password" placeholder="密码 (password)" />
      <Input type="number" placeholder="数字 (number)" />
    </div>
  ),
};

/**
 * Disabled: 禁用状态
 */
export const Disabled: Story = {
  args: {
    placeholder: '禁用状态',
    disabled: true, // 设置禁用
  },
};

/**
 * WithDefaultValue: 带默认值
 */
export const WithDefaultValue: Story = {
  args: {
    defaultValue: '这是默认值', // 输入框的初始值
  },
};

// ============================================
// 4. 渲染测试 Stories
// 验证组件是否正确渲染
// ============================================

/**
 * Test_渲染_基本结构
 * 验证：元素存在、可见、有正确的属性
 */
export const Test_渲染_基本结构: Story = {
  args: {
    placeholder: '测试输入框',
  },
  // play: 自动执行的测试函数
  // canvasElement: 当前 Story 渲染的根 DOM 元素
  play: async ({ canvasElement }) => {
    // within(canvasElement): 限定查询范围到当前 Story
    const canvas = within(canvasElement);

    // getByRole('textbox'): 通过无障碍角色查找输入框
    const input = canvas.getByRole('textbox');

    // expect(...).toBeInTheDocument(): 断言元素存在于 DOM 中
    await expect(input).toBeInTheDocument();

    // expect(...).toBeVisible(): 断言元素可见
    await expect(input).toBeVisible();

    // expect(...).toHaveAttribute(): 断言元素有特定属性
    await expect(input).toHaveAttribute('data-slot', 'input');
    await expect(input).toHaveAttribute('placeholder', '测试输入框');
  },
};

/**
 * Test_渲染_禁用状态
 * 验证：禁用属性生效
 */
export const Test_渲染_禁用状态: Story = {
  args: {
    placeholder: '禁用输入框',
    disabled: true,
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const input = canvas.getByRole('textbox');

    // expect(...).toBeDisabled(): 断言元素被禁用
    await expect(input).toBeDisabled();
  },
};

// ============================================
// 5. 交互测试 Stories
// 模拟用户操作，验证组件行为
// ============================================

/**
 * Test_交互_输入文字
 * 验证：用户输入后，值正确更新，onChange 被调用
 */
export const Test_交互_输入文字: Story = {
  args: {
    placeholder: '请输入...',
  },
  // args 参数包含传给组件的 props，可以验证回调函数
  play: async ({ canvasElement, args }) => {
    const canvas = within(canvasElement);
    const input = canvas.getByRole('textbox');

    // userEvent.type(): 模拟用户逐字输入
    await userEvent.type(input, 'Hello World');

    // expect(...).toHaveValue(): 断言输入框的值
    await expect(input).toHaveValue('Hello World');

    // expect(args.onChange).toHaveBeenCalled(): 断言 onChange 回调被调用
    await expect(args.onChange).toHaveBeenCalled();
  },
};

/**
 * Test_交互_清空输入
 * 验证：清空操作正常工作
 */
export const Test_交互_清空输入: Story = {
  args: {
    defaultValue: '初始值',
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const input = canvas.getByRole('textbox');

    // 验证初始值
    await expect(input).toHaveValue('初始值');

    // userEvent.clear(): 模拟清空输入框
    await userEvent.clear(input);

    // 验证清空后为空字符串
    await expect(input).toHaveValue('');
  },
};

/**
 * Test_交互_禁用无法输入
 * 验证：禁用状态下无法输入
 */
export const Test_交互_禁用无法输入: Story = {
  args: {
    placeholder: '禁用输入框',
    disabled: true,
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const input = canvas.getByRole('textbox');

    // 禁用的输入框无法接收输入
    await expect(input).toBeDisabled();
  },
};

/**
 * Test_交互_聚焦
 * 验证：点击后获得焦点
 */
export const Test_交互_聚焦: Story = {
  args: {
    placeholder: '点击聚焦',
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const input = canvas.getByRole('textbox');

    // userEvent.click(): 模拟鼠标点击
    await userEvent.click(input);

    // expect(...).toHaveFocus(): 断言元素获得焦点
    await expect(input).toHaveFocus();
  },
};

/**
 * Test_交互_Tab导航
 * 验证：Tab 键在多个输入框间正确导航，跳过禁用的
 */
export const Test_交互_Tab导航: Story = {
  // render 函数接收 args 参数，可以使用 {...args} 展开传递
  render: (args) => (
    <div className="flex flex-col gap-4 w-80">
      {/* data-testid: 用于测试时精确定位元素 */}
      <Input {...args} data-testid="input-1" placeholder="输入框 1" />
      <Input {...args} data-testid="input-2" placeholder="输入框 2" />
      <Input {...args} data-testid="input-3" placeholder="输入框 3" disabled />
      <Input {...args} data-testid="input-4" placeholder="输入框 4" />
    </div>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    // getByTestId(): 通过 data-testid 属性查找元素
    const input1 = canvas.getByTestId('input-1');
    const input2 = canvas.getByTestId('input-2');
    const input4 = canvas.getByTestId('input-4');

    // userEvent.tab(): 模拟按 Tab 键
    await userEvent.tab();
    await expect(input1).toHaveFocus(); // 焦点在第一个

    await userEvent.tab();
    await expect(input2).toHaveFocus(); // 焦点在第二个

    // Tab 会自动跳过禁用的 input-3
    await userEvent.tab();
    await expect(input4).toHaveFocus(); // 焦点在第四个
  },
};
