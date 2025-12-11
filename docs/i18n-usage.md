# 国际化使用指南

本项目使用 **next-intl** 实现国际化，采用基于 Cookie 的语言切换方案，支持自动检测浏览器语言。

## 📋 特性

✅ **自动语言检测** - 首次访问时自动检测浏览器语言偏好  
✅ **Cookie 持久化** - 语言选择保存在 Cookie 中（有效期 1 年）  
✅ **简洁 URL** - URL 不包含语言前缀（如 `/dashboard` 而非 `/zh/dashboard`）  
✅ **支持 SSR/SSG** - 完整的服务端渲染支持  
✅ **TypeScript 支持** - 完整的类型安全  

## 🌍 支持的语言

- 🇨🇳 中文 (zh) - 默认语言
- 🇺🇸 英文 (en)

## 📁 项目结构

```
mira-chatbot/
├── i18n/
│   ├── config.ts         # 语言配置
│   └── request.ts        # 请求配置
├── messages/
│   ├── zh.json          # 中文翻译
│   └── en.json          # 英文翻译
├── middleware.ts        # 自动检测浏览器语言
└── components/
    └── language-switcher.tsx  # 语言切换组件
```

## 🔧 使用方法

### 1. 在服务端组件中使用

```typescript
import { useTranslations } from 'next-intl';

export default function MyPage() {
  const t = useTranslations('dashboard');
  
  return (
    <div>
      <h1>{t('title')}</h1>
      <p>{t('welcome')}</p>
    </div>
  );
}
```

### 2. 在客户端组件中使用

```typescript
'use client';

import { useTranslations } from 'next-intl';

export default function MyClientComponent() {
  const t = useTranslations('chatbot');
  
  return (
    <div>
      <input placeholder={t('placeholder')} />
      <button>{t('sendMessage')}</button>
    </div>
  );
}
```

### 3. 使用语言切换组件

```typescript
import { LanguageSwitcher } from '@/components/language-switcher';

export default function Header() {
  return (
    <header>
      <LanguageSwitcher />
    </header>
  );
}
```

### 4. 获取当前语言

```typescript
'use client';

import { useLocale } from 'next-intl';

export default function MyComponent() {
  const locale = useLocale(); // 'zh' | 'en'
  
  return <div>Current language: {locale}</div>;
}
```

## 📝 添加新翻译

### 步骤 1: 在翻译文件中添加键值对

**messages/zh.json**
```json
{
  "myFeature": {
    "title": "我的功能",
    "description": "这是描述"
  }
}
```

**messages/en.json**
```json
{
  "myFeature": {
    "title": "My Feature",
    "description": "This is description"
  }
}
```

### 步骤 2: 在组件中使用

```typescript
const t = useTranslations('myFeature');

<h1>{t('title')}</h1>
<p>{t('description')}</p>
```

## 🌐 添加新语言

### 步骤 1: 更新配置文件

**i18n/config.ts**
```typescript
export const i18n = {
  locales: ['zh', 'en', 'ko'], // 添加 'ko'
  defaultLocale: 'zh',
  cookieName: 'NEXT_LOCALE',
} as const;

export const localeNames: Record<Locale, string> = {
  zh: '中文',
  en: 'English',
  ko: '한국어', // 添加韩语
};
```

### 步骤 2: 创建翻译文件

创建 `messages/ko.json` 并添加所有必需的翻译。

### 步骤 3: 更新中间件

中间件会自动识别新添加的语言，无需额外配置。

## 🔄 工作原理

### 1. 首次访问流程

```
用户访问网站
    ↓
中间件检测到无 Cookie
    ↓
读取 Accept-Language 请求头
    ↓
解析浏览器语言偏好 (zh-CN, en-US, etc.)
    ↓
匹配支持的语言
    ↓
设置 Cookie (NEXT_LOCALE=zh)
    ↓
加载对应语言的翻译文件
```

### 2. 语言切换流程

```
用户点击语言切换器
    ↓
更新 Cookie (NEXT_LOCALE=en)
    ↓
页面刷新
    ↓
中间件读取新的 Cookie
    ↓
加载对应语言的翻译文件
```

### 3. Cookie 详情

- **名称**: `NEXT_LOCALE`
- **有效期**: 365 天
- **路径**: `/`
- **SameSite**: `Lax`

## 🎯 最佳实践

### 1. 翻译键命名规范

```json
{
  "命名空间": {
    "功能描述": "翻译文本",
    "嵌套功能": {
      "子功能": "翻译文本"
    }
  }
}
```

示例：
```json
{
  "dashboard": {
    "title": "Dashboard",
    "user": {
      "profile": "用户资料",
      "settings": "设置"
    }
  }
}
```

### 2. 组织翻译文件

- 按功能模块组织命名空间
- 保持所有语言文件的结构一致
- 使用有意义的键名

### 3. 动态翻译

```typescript
// 带参数的翻译
const t = useTranslations('messages');

// messages/zh.json
{
  "greeting": "你好，{name}！"
}

// 使用
<p>{t('greeting', { name: '张三' })}</p>
// 输出: 你好，张三！
```

### 4. 复数形式

```json
{
  "items": {
    "zero": "没有物品",
    "one": "{count} 个物品",
    "other": "{count} 个物品"
  }
}
```

```typescript
<p>{t('items', { count: 0 })}</p>  // 没有物品
<p>{t('items', { count: 1 })}</p>  // 1 个物品
<p>{t('items', { count: 5 })}</p>  // 5 个物品
```

## 🐛 常见问题

### Q: 如何在 Server Action 中使用翻译？

```typescript
import { getTranslations } from 'next-intl/server';

export async function myServerAction() {
  'use server';
  
  const t = await getTranslations('namespace');
  const message = t('key');
  
  // 使用 message...
}
```

### Q: 如何在 API 路由中使用翻译？

```typescript
import { cookies } from 'next/headers';
import { i18n } from '@/i18n/config';

export async function GET() {
  const cookieStore = await cookies();
  const locale = cookieStore.get(i18n.cookieName)?.value || i18n.defaultLocale;
  
  // 动态导入翻译
  const messages = await import(`@/messages/${locale}.json`);
  
  return Response.json({ 
    message: messages.default.someKey 
  });
}
```

### Q: 语言切换后页面没有更新？

语言切换组件会自动刷新页面。如果没有刷新，检查：
1. Cookie 是否正确设置
2. 中间件是否正常工作
3. 浏览器控制台是否有错误

## 📚 更多资源

- [next-intl 官方文档](https://next-intl-docs.vercel.app/)
- [Next.js 国际化指南](https://nextjs.org/docs/app/building-your-application/routing/internationalization)

