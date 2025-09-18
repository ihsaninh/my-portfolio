export function formatDateUTC(dateInput: string | number | Date, locale = 'en-US') {
  try {
    const date = new Date(dateInput);
    if (Number.isNaN(date.getTime())) return '';
    return new Intl.DateTimeFormat(locale, {
      year: 'numeric',
      month: 'short',
      day: '2-digit',
      timeZone: 'UTC',
    }).format(date);
  } catch {
    return '';
  }
}

