// stories/UICollapsible.stories.tsx
import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import { expect, userEvent, within, fn } from 'storybook/test';
import { Collapsible, CollapsibleTrigger, CollapsibleContent } from '../components/ui/collapsible';
import { ChevronDownIcon } from 'lucide-react';
import '../app/globals.css';

const meta: Meta<typeof Collapsible> = {
  title: 'Components/UI/Collapsible',
  component: Collapsible,
  parameters: { layout: 'centered' },
  tags: ['autodocs'],
  argTypes: {
    open: {
      control: 'boolean',
      description: '是否展开（受控模式）',
    },
    defaultOpen: {
      control: 'boolean',
      description: '默认是否展开（非受控模式）',
    },
    disabled: {
      control: 'boolean',
      description: '是否禁用',
    },
  },
  args: {
    onOpenChange: fn(),
  },
};

export default meta;
type Story = StoryObj<typeof meta>;

// ============================================
// 📖 基础展示 Stories
// ============================================

export const Default: Story = {
  render: (args) => (
    <Collapsible {...args} className="w-80 border rounded-lg p-4">
      <CollapsibleTrigger className="flex items-center justify-between w-full">
        <span className="font-medium">点击展开</span>
        <ChevronDownIcon className="h-4 w-4" />
      </CollapsibleTrigger>
      <CollapsibleContent className="pt-4">
        <p className="text-sm text-muted-foreground">
          这是可折叠的内容区域。
        </p>
      </CollapsibleContent>
    </Collapsible>
  ),
};

export const DefaultOpen: Story = {
  render: (args) => (
    <Collapsible {...args} defaultOpen className="w-80 border rounded-lg p-4">
      <CollapsibleTrigger className="flex items-center justify-between w-full">
        <span className="font-medium">已展开</span>
        <ChevronDownIcon className="h-4 w-4" />
      </CollapsibleTrigger>
      <CollapsibleContent className="pt-4">
        <p className="text-sm text-muted-foreground">
          这是默认展开的内容。
        </p>
      </CollapsibleContent>
    </Collapsible>
  ),
};

export const Disabled: Story = {
  render: (args) => (
    <Collapsible {...args} disabled className="w-80 border rounded-lg p-4 opacity-50">
      <CollapsibleTrigger className="flex items-center justify-between w-full cursor-not-allowed">
        <span className="font-medium">禁用状态</span>
        <ChevronDownIcon className="h-4 w-4" />
      </CollapsibleTrigger>
      <CollapsibleContent className="pt-4">
        <p className="text-sm">这段内容不会显示。</p>
      </CollapsibleContent>
    </Collapsible>
  ),
};

// ============================================
// 🧪 渲染测试 Stories
// ============================================

export const Test_渲染_基本结构: Story = {
  render: (args) => (
    <Collapsible {...args} data-testid="collapsible" className="w-80 border rounded-lg p-4">
      <CollapsibleTrigger data-testid="trigger">展开/收起</CollapsibleTrigger>
      <CollapsibleContent data-testid="content">
        <p>内容区域</p>
      </CollapsibleContent>
    </Collapsible>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    const collapsible = canvas.getByTestId('collapsible');
    await expect(collapsible).toBeInTheDocument();
    await expect(collapsible).toHaveAttribute('data-slot', 'collapsible');

    const trigger = canvas.getByTestId('trigger');
    await expect(trigger).toBeInTheDocument();
    await expect(trigger).toHaveAttribute('data-slot', 'collapsible-trigger');

    await expect(collapsible).toHaveAttribute('data-state', 'closed');
  },
};

export const Test_渲染_DefaultOpen: Story = {
  render: (args) => (
    <Collapsible {...args} defaultOpen data-testid="collapsible" className="w-80 border rounded-lg p-4">
      <CollapsibleTrigger data-testid="trigger">已展开</CollapsibleTrigger>
      <CollapsibleContent data-testid="content">
        <p>可见的内容</p>
      </CollapsibleContent>
    </Collapsible>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    const collapsible = canvas.getByTestId('collapsible');
    await expect(collapsible).toHaveAttribute('data-state', 'open');

    const content = canvas.getByTestId('content');
    await expect(content).toBeVisible();
  },
};

export const Test_渲染_Disabled: Story = {
  render: (args) => (
    <Collapsible {...args} disabled data-testid="collapsible" className="w-80 border rounded-lg p-4">
      <CollapsibleTrigger data-testid="trigger">禁用</CollapsibleTrigger>
      <CollapsibleContent data-testid="content">
        <p>内容</p>
      </CollapsibleContent>
    </Collapsible>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    const trigger = canvas.getByTestId('trigger');
    await expect(trigger).toHaveAttribute('data-disabled');
  },
};

// ============================================
// 🎯 交互测试 Stories
// ============================================

export const Test_交互_点击切换: Story = {
  render: (args) => (
    <Collapsible {...args} data-testid="collapsible" className="w-80 border rounded-lg p-4">
      <CollapsibleTrigger data-testid="trigger">点击切换</CollapsibleTrigger>
      <CollapsibleContent data-testid="content">
        <p>折叠内容</p>
      </CollapsibleContent>
    </Collapsible>
  ),
  play: async ({ canvasElement, args }) => {
    const canvas = within(canvasElement);
    const collapsible = canvas.getByTestId('collapsible');
    const trigger = canvas.getByTestId('trigger');

    await expect(collapsible).toHaveAttribute('data-state', 'closed');

    await userEvent.click(trigger);
    await expect(collapsible).toHaveAttribute('data-state', 'open');
    await expect(args.onOpenChange).toHaveBeenCalledWith(true);

    await userEvent.click(trigger);
    await expect(collapsible).toHaveAttribute('data-state', 'closed');
    await expect(args.onOpenChange).toHaveBeenCalledWith(false);
  },
};

export const Test_交互_禁用点击无效: Story = {
  render: (args) => (
    <Collapsible {...args} disabled data-testid="collapsible" className="w-80 border rounded-lg p-4">
      <CollapsibleTrigger data-testid="trigger">禁用</CollapsibleTrigger>
      <CollapsibleContent data-testid="content">
        <p>内容</p>
      </CollapsibleContent>
    </Collapsible>
  ),
  play: async ({ canvasElement, args }) => {
    const canvas = within(canvasElement);
    const collapsible = canvas.getByTestId('collapsible');
    const trigger = canvas.getByTestId('trigger');

    await expect(collapsible).toHaveAttribute('data-state', 'closed');
    await userEvent.click(trigger);
    await expect(collapsible).toHaveAttribute('data-state', 'closed');
    await expect(args.onOpenChange).not.toHaveBeenCalled();
  },
};

export const Test_交互_键盘触发: Story = {
  render: (args) => (
    <Collapsible {...args} data-testid="collapsible" className="w-80 border rounded-lg p-4">
      <CollapsibleTrigger data-testid="trigger">键盘测试</CollapsibleTrigger>
      <CollapsibleContent data-testid="content">
        <p>内容</p>
      </CollapsibleContent>
    </Collapsible>
  ),
  play: async ({ canvasElement, args }) => {
    const canvas = within(canvasElement);
    const collapsible = canvas.getByTestId('collapsible');
    const trigger = canvas.getByTestId('trigger');

    trigger.focus();
    await expect(trigger).toHaveFocus();

    await userEvent.keyboard('{Enter}');
    await expect(collapsible).toHaveAttribute('data-state', 'open');
    await expect(args.onOpenChange).toHaveBeenCalledWith(true);

    await userEvent.keyboard(' ');
    await expect(collapsible).toHaveAttribute('data-state', 'closed');
    await expect(args.onOpenChange).toHaveBeenCalledWith(false);
  },
};

export const Test_交互_Tab导航: Story = {
  render: (args) => (
    <div className="flex flex-col gap-4 w-80">
      <button data-testid="before-btn">前面的按钮</button>
      <Collapsible {...args} data-testid="collapsible" className="border rounded-lg p-4">
        <CollapsibleTrigger data-testid="trigger">Collapsible</CollapsibleTrigger>
        <CollapsibleContent>
          <p>内容</p>
        </CollapsibleContent>
      </Collapsible>
      <button data-testid="after-btn">后面的按钮</button>
    </div>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const beforeBtn = canvas.getByTestId('before-btn');
    const trigger = canvas.getByTestId('trigger');
    const afterBtn = canvas.getByTestId('after-btn');

    await userEvent.tab();
    await expect(beforeBtn).toHaveFocus();

    await userEvent.tab();
    await expect(trigger).toHaveFocus();

    await userEvent.tab();
    await expect(afterBtn).toHaveFocus();
  },
};
