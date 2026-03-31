const HINDI_MONTHS = [
  'जनवरी', 'फरवरी', 'मार्च', 'अप्रैल', 'मई', 'जून',
  'जुलाई', 'अगस्त', 'सितंबर', 'अक्टूबर', 'नवंबर', 'दिसंबर',
];

const EN_MONTHS = [
  'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
  'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec',
];

/** "आज", "कल", "3 दिन पहले", or "12 मार्च" */
export function relativeDate(timestamp: number, lang: 'hi' | 'en' = 'hi'): string {
  const now = Date.now();
  const diff = now - timestamp;
  const days = Math.floor(diff / 86400000);

  if (lang === 'hi') {
    if (days === 0) return 'आज';
    if (days === 1) return 'कल';
    if (days < 7) return `${days} दिन पहले`;
    const d = new Date(timestamp);
    return `${d.getDate()} ${HINDI_MONTHS[d.getMonth()]}`;
  } else {
    if (days === 0) return 'Today';
    if (days === 1) return 'Yesterday';
    if (days < 7) return `${days} days ago`;
    const d = new Date(timestamp);
    return `${d.getDate()} ${EN_MONTHS[d.getMonth()]}`;
  }
}

/** Full date: "12 मार्च 2025" */
export function fullDate(timestamp: number, lang: 'hi' | 'en' = 'hi'): string {
  const d = new Date(timestamp);
  const months = lang === 'hi' ? HINDI_MONTHS : EN_MONTHS;
  return `${d.getDate()} ${months[d.getMonth()]} ${d.getFullYear()}`;
}

/** Group label for transaction list: "आज", "इस हफ्ते", month name */
export function groupLabel(timestamp: number, lang: 'hi' | 'en' = 'hi'): string {
  const now = Date.now();
  const diff = now - timestamp;
  const days = Math.floor(diff / 86400000);

  if (lang === 'hi') {
    if (days === 0) return 'आज';
    if (days < 7) return 'इस हफ्ते';
    const d = new Date(timestamp);
    return `${HINDI_MONTHS[d.getMonth()]} ${d.getFullYear()}`;
  } else {
    if (days === 0) return 'Today';
    if (days < 7) return 'This Week';
    const d = new Date(timestamp);
    return `${EN_MONTHS[d.getMonth()]} ${d.getFullYear()}`;
  }
}
