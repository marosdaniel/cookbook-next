const DISPLAY_TIME_ZONE = 'Europe/Budapest';

export const getInitials = (firstName: string, lastName: string): string =>
  `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase() || '?';

export const formatJoinedDate = (iso: string, locale: string): string =>
  new Intl.DateTimeFormat(locale, {
    dateStyle: 'medium',
    timeZone: DISPLAY_TIME_ZONE,
  }).format(new Date(iso));

export const formatDateTime = (iso: string, locale: string): string =>
  new Intl.DateTimeFormat(locale, {
    dateStyle: 'medium',
    timeStyle: 'short',
    timeZone: DISPLAY_TIME_ZONE,
  }).format(new Date(iso));
