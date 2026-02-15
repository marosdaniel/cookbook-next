import type { Metadata } from 'next';
import { getLocaleMessages } from '@/lib/locale/locale';
import type { AuthMessages } from '../../types/common';

/**
 * Helper to build SEO metadata for any page using localized messages.
 *
 * @param locale    - locale string read from the cookie
 * @param namespace - the key in the messages object (e.g. 'seo', 'auth', 'user')
 * @param opts      - keys to look up and fallback values
 */
export async function getMetadata(
  locale: string,
  namespace: string,
  opts: {
    titleKey: string;
    descriptionKey: string;
    fallbackTitle: string;
    fallbackDescription: string;
    titleTemplate?: string; // Optional template like "%s | Cookbook"
  },
): Promise<Metadata> {
  const messages = await getLocaleMessages(locale);
  const data = (messages[namespace] ?? {}) as Record<string, string>;

  const title =
    typeof data[opts.titleKey] === 'string'
      ? data[opts.titleKey]
      : opts.fallbackTitle;
  const description =
    typeof data[opts.descriptionKey] === 'string'
      ? data[opts.descriptionKey]
      : opts.fallbackDescription;

  const finalTitle = opts.titleTemplate
    ? opts.titleTemplate.replace('%s', title)
    : `${title} | Cookbook`;

  return {
    title: finalTitle,
    description,
  };
}

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
  return getMetadata(locale, 'auth', {
    ...opts,
    titleKey: String(opts.titleKey),
    descriptionKey: String(opts.descriptionKey),
  });
}
