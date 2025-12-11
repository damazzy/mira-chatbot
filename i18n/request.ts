import { getRequestConfig } from 'next-intl/server';
import { cookies } from 'next/headers';
import { i18n } from './config';

export default getRequestConfig(async () => {
  // 从 cookie 中获取语言设置
  const cookieStore = await cookies();
  let locale = cookieStore.get(i18n.cookieName)?.value || i18n.defaultLocale;

  // 验证语言是否在支持列表中
  if (!i18n.locales.includes(locale as any)) {
    locale = i18n.defaultLocale;
  }

  return {
    locale,
    messages: (await import(`../messages/${locale}.json`)).default,
    // 时间格式配置
    timeZone: 'Asia/Shanghai',
    now: new Date(),
  };
});

