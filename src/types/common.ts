import type { PropsWithChildren } from 'react';

export type Locale = 'en-gb' | 'hu' | 'de';

// Recursive type for nested locale message objects
export type LocaleMessages = {
  [key: string]: string | string[] | LocaleMessages;
};

export type AllMessages = {
  [locale: string]: LocaleMessages;
};

export type ClientProvidersProps = PropsWithChildren & {
  messages: AllMessages;
  locale: string;
};

export interface CookiePolicyContent {
  title: string;
  lastUpdated: string;
  whatAreCookies: { title: string; content: string };
  howWeUse: {
    title: string;
    content: string;
    list: {
      necessaryTitle: string;
      necessaryContent: string;
      functionalityTitle: string;
      functionalityContent: string;
      performanceTitle: string;
      performanceContent: string;
    };
  };
  detailedUsage: {
    title: string;
    content: string;
    list: string[];
  };
  managing: { title: string; content: string };
}

export interface PrivacyPolicyContent {
  title: string;
  lastUpdated: string;
  introduction: { title: string; content: string };
  infoCollect: {
    title: string;
    content: string;
    list: {
      personalTitle: string;
      personalContent: string;
      usageTitle: string;
      usageContent: string;
    };
  };
  howUse: {
    title: string;
    content: string;
    list: string[];
  };
  contact: { title: string; content: string };
}

export interface LegalMessages {
  cookiePolicy: CookiePolicyContent;
  privacyPolicy: PrivacyPolicyContent;
}
