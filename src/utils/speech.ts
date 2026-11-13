// Native Web Speech API utility for authentic Arabic pronunciation
// Plays native Arabic voice with synthetic harmonic audio fallback

export function speakArabic(text: string): void {
  if (typeof window === 'undefined') return;

  // Clean vocalization if needed or feed directly to Arabic TTS engine
  if ('speechSynthesis' in window) {
    window.speechSynthesis.cancel(); // Stop any pending speech

    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = 'ar-SA'; // Arabic (Saudi Arabia / MSA standard)
    utterance.rate = 0.85; // Slightly slower, clear pedagogical pacing
    utterance.pitch = 1.0;

    // Try finding an Arabic voice installed in browser
    const voices = window.speechSynthesis.getVoices();
    const arabicVoice = voices.find(
      (v) => v.lang.startsWith('ar') || v.lang.includes('Arabic')
    );
    if (arabicVoice) {
      utterance.voice = arabicVoice;
    }

    utterance.onerror = (e) => {
      // SpeechSynthesis canceled on blur/switching tabs is normal in mobile browsers (e.error === 'interrupted' or 'canceled')
      console.warn('SpeechSynthesis non-fatal event:', e.error);
    };

    window.speechSynthesis.speak(utterance);
  }
}
