/**
 * Utilities for formatting and cleaning Hebrew grammar labels for Knowledge Packages and Questions
 */

export function cleanTenseLabel(tense: string): string {
  if (!tense) return '';
  const trimmed = tense.trim();
  if (trimmed.includes('עבר')) return 'עבר';
  if (trimmed.includes('עתיד')) return 'עתיד';
  if (trimmed.includes('ציווי')) return 'ציווי';
  if (trimmed.includes('בינוני פועל')) return 'בינוני פועל';
  if (trimmed.includes('בינוני פעול')) return 'בינוני פעול';
  return trimmed.replace(/[\u0600-\u06FF()]/g, '').trim() || trimmed;
}

export function cleanPersonLabel(person: string): string {
  if (!person) return '';
  const str = person.trim();

  // Exact pronoun mapping - strip Arabic, 'נסתר', 'נוכח', 'מדבר', and parentheses
  if (str.includes('אני') || str.includes('أَنَا') || (str.includes('מדבר') && !str.includes('מדברים'))) {
    return 'אני';
  }
  if (str.includes('אנחנו') || str.includes('نَحْنُ') || str.includes('מדברים')) {
    return 'אנחנו';
  }
  if (str.includes('אתה') || str.includes('أَنْتَ') || (str.includes('נוכח') && !str.includes('נוכחת') && !str.includes('נוכחים') && !str.includes('נוכחות'))) {
    return 'אתה';
  }
  if ((str.includes('את') && !str.includes('אתה') && !str.includes('אתם') && !str.includes('אתן')) || str.includes('أَنْتِ') || str.includes('נוכחת')) {
    return 'את';
  }
  if (str.includes('אתם') || str.includes('אַנְתֻם') || str.includes('أَنْتُمْ') || str.includes('נוכחים')) {
    return 'אתם';
  }
  if (str.includes('אתן') || str.includes('أَنْتُنَّ') || str.includes('נוכחות')) {
    return 'אתן';
  }
  if (str.includes('הוא') || str.includes('הֻוַ') || str.includes('هُوَ') || (str.includes('נסתר') && !str.includes('נסתרת') && !str.includes('נסתרים') && !str.includes('נסתרות'))) {
    return 'הוא';
  }
  if (str.includes('היא') || str.includes('הִיא') || str.includes('هِيَ') || str.includes('נסתרת')) {
    return 'היא';
  }
  if (str.includes('הם') || str.includes('הֻם') || str.includes('هُمْ') || str.includes('נסתרים')) {
    return 'הם';
  }
  if (str.includes('הן') || str.includes('הֻן') || str.includes('هُنَّ') || str.includes('נסתרות')) {
    return 'הן';
  }
  if (str.includes('זוגי') || str.includes('أَنْتُمَا') || str.includes('هُمَا')) {
    return 'שניים (זוגי)';
  }

  // Fallback cleanup
  const cleaned = str
    .replace(/[\u0600-\u06FF()\-]/g, '')
    .replace(/נסתרת|נסתרים|נסתרות|נסתר|נוכחת|נוכחים|נוכחות|נוכח|מדברים|מדבר/g, '')
    .trim();

  return cleaned || str;
}

export function formatDurationHebrew(seconds?: number): string {
  if (seconds === undefined || seconds === null || isNaN(seconds)) {
    return 'פחות מדקה';
  }
  const totalSec = Math.max(0, Math.round(seconds));
  if (totalSec < 45) {
    return `${totalSec} שניות`;
  }
  if (totalSec < 3600) {
    const mins = Math.round(totalSec / 60);
    if (mins === 1) return 'דקה אחת';
    if (mins === 2) return 'שתי דקות';
    return `${mins} דקות`;
  }
  const hours = Math.floor(totalSec / 3600);
  const remMins = Math.round((totalSec % 3600) / 60);
  if (hours === 1) {
    return remMins > 0 ? `שעה ו-${remMins} דק'` : 'שעה אחת';
  }
  if (hours === 2) {
    return remMins > 0 ? `שעתיים ו-${remMins} דק'` : 'שעתיים';
  }
  return remMins > 0 ? `${hours} שעות ו-${remMins} דק'` : `${hours} שעות`;
}
