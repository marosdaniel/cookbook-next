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
export const getMetadata = async (
  locale: string,
  namespace: string,
  opts: {
    titleKey: string;
    descriptionKey: string;
    fallbackTitle: string;
    fallbackDescription: string;
    titleTemplate?: string; // Optional template like "%s | Cookbook"
    keywordsKey?: string;
    fallbackKeywords?: string;
    robots?: {
      index?: boolean;
      follow?: boolean;
    };
    openGraph?: {
      type?: 'website' | 'article';
    };
  },
): Promise<Metadata> => {
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

  const keywords =
    opts.keywordsKey && typeof data[opts.keywordsKey] === 'string'
      ? data[opts.keywordsKey]
      : opts.fallbackKeywords;

  return {
    title: finalTitle,
    description,
    ...(keywords === undefined ? {} : { keywords }),
    ...(opts.robots === undefined ? {} : { robots: opts.robots }),
    openGraph: {
      title: finalTitle,
      description,
      type: opts.openGraph?.type ?? 'website',
    },
    twitter: {
      card: 'summary',
      title: finalTitle,
      description,
    },
  };
};

/**
 * Helper to build SEO metadata for auth‑related pages.
 *
 * @param locale - locale string read from the cookie
 * @param opts   - keys to look up in the `auth` namespace and fallback values
 */
export const getAuthMetadata = async (
  locale: string,
  opts: {
    titleKey: keyof AuthMessages;
    descriptionKey: keyof AuthMessages;
    fallbackTitle: string;
    fallbackDescription: string;
  },
): Promise<Metadata> => {
  return getMetadata(locale, 'auth', {
    ...opts,
    titleKey: String(opts.titleKey),
    descriptionKey: String(opts.descriptionKey),
  });
};
