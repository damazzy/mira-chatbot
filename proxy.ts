import { NextRequest, NextResponse } from 'next/server';
import { i18n } from './i18n/config';

// 从 Accept-Language 头中解析浏览器语言偏好
function getPreferredLocale(acceptLanguage: string | null): string {
  if (!acceptLanguage) return i18n.defaultLocale;

  // 解析 Accept-Language 头
  // 例如: "zh-CN,zh;q=0.9,en;q=0.8,ja;q=0.7"
  const languages = acceptLanguage
    .split(',')
    .map(lang => {
      const [locale, qValue] = lang.trim().split(';');
      const quality = qValue ? parseFloat(qValue.split('=')[1]) : 1.0;
      // 提取主语言代码 (zh-CN -> zh, en-US -> en)
      const mainLocale = locale.split('-')[0].toLowerCase();
      return { locale: mainLocale, quality };
    })
    .sort((a, b) => b.quality - a.quality);

  // 找到第一个支持的语言
  for (const { locale } of languages) {
    if (i18n.locales.includes(locale as any)) {
      return locale;
    }
  }

  return i18n.defaultLocale;
}

// Next.js 16 Proxy 函数 - 在 Edge Runtime 中运行
// 参考: https://nextjs.org/docs/app/getting-started/proxy
export function proxy(request: NextRequest) {
  // 检查是否已经有语言 cookie
  const currentLocale = request.cookies.get(i18n.cookieName)?.value;

  // 如果没有 cookie，则自动检测浏览器语言
  if (!currentLocale) {
    const acceptLanguage = request.headers.get('accept-language');
    const preferredLocale = getPreferredLocale(acceptLanguage);

    // 创建响应并设置 cookie
    const response = NextResponse.next();
    response.cookies.set(i18n.cookieName, preferredLocale, {
      maxAge: 60 * 60 * 24 * 365, // 1 年
      path: '/',
      sameSite: 'lax',
    });

    return response;
  }

  // 验证现有 cookie 中的语言是否有效
  if (!i18n.locales.includes(currentLocale as any)) {
    const response = NextResponse.next();
    response.cookies.set(i18n.cookieName, i18n.defaultLocale, {
      maxAge: 60 * 60 * 24 * 365,
      path: '/',
      sameSite: 'lax',
    });
    return response;
  }

  return NextResponse.next();
}

// Proxy 配置 - 匹配路径规则
export const config = {
  // 匹配所有路径，除了静态文件、API 路由和内部 Next.js 路径
  matcher: [
    '/((?!api|_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico)).*)',
  ],
};

