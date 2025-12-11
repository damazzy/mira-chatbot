'use client';

import { useLocale, useTranslations } from 'next-intl';
import { useTransition } from 'react';
import { Languages, Loader2 } from 'lucide-react';
import { i18n, localeNames, type Locale } from '@/i18n/config';
import { cn } from '@/lib/utils';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

export function LanguageSwitcher() {
  const t = useTranslations('common');
  const locale = useLocale() as Locale;
  const [isPending, startTransition] = useTransition();

  const handleLanguageChange = (newLocale: string) => {
    if (newLocale === locale) return;

    startTransition(() => {
      // 设置 cookie 并刷新页面
      document.cookie = `${i18n.cookieName}=${newLocale}; path=/; max-age=${60 * 60 * 24 * 365}; SameSite=Lax`;
      window.location.reload();
    });
  };

  return (
    <div className="flex items-center gap-2">
      <Select
        value={locale}
        onValueChange={handleLanguageChange}
        disabled={isPending}
      >
        <SelectTrigger 
          className={cn(
            "w-[120px] h-9",
            "bg-white/80 dark:bg-neutral-900/80",
            "backdrop-blur-md backdrop-saturate-150",
            "border border-neutral-200/50 dark:border-neutral-700/50",
            "shadow-lg shadow-black/5 dark:shadow-black/20",
            "hover:bg-white/90 dark:hover:bg-neutral-900/90",
            "transition-all duration-200",
            "hover:shadow-xl hover:shadow-black/10 dark:hover:shadow-black/30",
            "hover:border-neutral-300/60 dark:hover:border-neutral-600/60"
          )}
        >
          <div className="flex items-center gap-2">
            {isPending ? (
              <Loader2 className="size-4 animate-spin text-neutral-600 dark:text-neutral-400" />
            ) : (
              <Languages className="size-4 text-neutral-600 dark:text-neutral-400" />
            )}
            <SelectValue placeholder={t('language')} />
          </div>
        </SelectTrigger>
        <SelectContent className="backdrop-blur-md bg-white/95 dark:bg-neutral-900/95 border-neutral-200/50 dark:border-neutral-700/50">
          {i18n.locales.map((loc) => (
            <SelectItem key={loc} value={loc}>
              {localeNames[loc]}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}

