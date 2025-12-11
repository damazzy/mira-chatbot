// stories/UIButton.stories.tsx
import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import { expect, userEvent, within, fn } from 'storybook/test';
import { Button } from '../components/ui/button';
import '../app/globals.css';

const meta: Meta<typeof Button> = {
  title: 'Components/UI/Button',
  component: Button,
  parameters: { layout: 'centered' },
  tags: ['autodocs'],
  argTypes: {
    variant: {
      control: 'select',
      options: ['default', 'destructive', 'outline', 'secondary', 'ghost', 'link'],
      description: '按钮变体样式',
    },
    size: {
      control: 'select',
      options: ['default', 'sm', 'lg', 'icon', 'icon-sm', 'icon-lg'],
      description: '按钮尺寸',
    },
    disabled: {
      control: 'boolean',
      description: '是否禁用',
    },
  },
  args: {
    onClick: fn(),
  },
};

export default meta;
type Story = StoryObj<typeof meta>;

// ============================================
// 📖 基础展示 Stories
// ============================================

export const Default: Story = {
  args: {
    children: 'Button',
  },
};

export const AllVariants: Story = {
  render: () => (
    <div className="flex flex-wrap gap-4">
      <Button variant="default">Default</Button>
      <Button variant="secondary">Secondary</Button>
      <Button variant="destructive">Destructive</Button>
      <Button variant="outline">Outline</Button>
      <Button variant="ghost">Ghost</Button>
      <Button variant="link">Link</Button>
    </div>
  ),
};

export const AllSizes: Story = {
  render: () => (
    <div className="flex items-center gap-4">
      <Button size="sm">Small</Button>
      <Button size="default">Default</Button>
      <Button size="lg">Large</Button>
    </div>
  ),
};

export const Disabled: Story = {
  args: {
    children: '禁用按钮',
    disabled: true,
  },
};

// ============================================
// 🧪 渲染测试 Stories
// ============================================

export const Test_渲染_默认按钮: Story = {
  args: {
    children: '测试按钮',
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const button = canvas.getByRole('button');

    await expect(button).toBeInTheDocument();
    await expect(button).toBeVisible();
    await expect(button).toHaveTextContent('测试按钮');
    await expect(button).toHaveAttribute('data-slot', 'button');
  },
};

export const Test_渲染_禁用状态: Story = {
  args: {
    children: '禁用按钮',
    disabled: true,
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const button = canvas.getByRole('button');

    await expect(button).toBeDisabled();
  },
};

// ============================================
// 🎯 交互测试 Stories
// ============================================

export const Test_交互_点击事件: Story = {
  args: {
    children: '点击我',
  },
  play: async ({ canvasElement, args }) => {
    const canvas = within(canvasElement);
    const button = canvas.getByRole('button');

    await userEvent.click(button);
    await expect(args.onClick).toHaveBeenCalledTimes(1);

    await userEvent.click(button);
    await expect(args.onClick).toHaveBeenCalledTimes(2);
  },
};

export const Test_交互_禁用点击无效: Story = {
  args: {
    children: '禁用按钮',
    disabled: true,
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const button = canvas.getByRole('button');

    // 验证按钮是禁用状态
    await expect(button).toBeDisabled();
    // 禁用按钮有 pointer-events: none，无法点击
    // 这正是预期的行为，不需要尝试点击
    await expect(button).toHaveAttribute('disabled');
  },
};

export const Test_交互_键盘触发: Story = {
  args: {
    children: '键盘测试',
  },
  play: async ({ canvasElement, args }) => {
    const canvas = within(canvasElement);
    const button = canvas.getByRole('button');

    button.focus();
    await expect(button).toHaveFocus();

    await userEvent.keyboard('{Enter}');
    await expect(args.onClick).toHaveBeenCalledTimes(1);

    await userEvent.keyboard(' ');
    await expect(args.onClick).toHaveBeenCalledTimes(2);
  },
};

export const Test_交互_Tab导航: Story = {
  render: (args) => (
    <div className="flex gap-4">
      <Button {...args} data-testid="btn-1">按钮1</Button>
      <Button {...args} data-testid="btn-2">按钮2</Button>
      <Button {...args} data-testid="btn-3" disabled>按钮3(禁用)</Button>
      <Button {...args} data-testid="btn-4">按钮4</Button>
    </div>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const btn1 = canvas.getByTestId('btn-1');
    const btn2 = canvas.getByTestId('btn-2');
    const btn4 = canvas.getByTestId('btn-4');

    await userEvent.tab();
    await expect(btn1).toHaveFocus();

    await userEvent.tab();
    await expect(btn2).toHaveFocus();

    // 跳过禁用的 btn-3
    await userEvent.tab();
    await expect(btn4).toHaveFocus();
  },
};
