import type { Metadata } from 'next';

import { getLocaleMessages } from '@/lib/locale/locale';
import type { AuthMessages } from '../types/common';


/**
 * Helper to build SEO metadata for auth‑related pages.
 *
 * @param locale - locale string read from the cookie
 * @param opts   - keys to look up in the `auth` namespace and fallback values
 */
export async function getAuthMetadata(
  locale: string,
  opts: {
    titleKey: keyof AuthMessages;
    descriptionKey: keyof AuthMessages;
    fallbackTitle: string;
    fallbackDescription: string;
  },
): Promise<Metadata> {
  const messages = await getLocaleMessages(locale);
  const auth = (messages.auth ?? {}) as AuthMessages;

  const title =
    typeof auth[opts.titleKey] === 'string'
      ? (auth[opts.titleKey] as string)
      : opts.fallbackTitle;
  const description =
    typeof auth[opts.descriptionKey] === 'string'
      ? (auth[opts.descriptionKey] as string)
      : opts.fallbackDescription;

  return {
    title: `${title} | Cookbook`,
    description,
  };
}
