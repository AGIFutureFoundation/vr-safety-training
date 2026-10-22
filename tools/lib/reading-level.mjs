// A small, dependency-free reading-level estimate for K-12 text
// (tools/check_k12.mjs). Flesch–Kincaid grade from words per sentence and
// syllables per word, with a vowel-group syllable counter. It is a rough
// yardstick for keeping lessons within bounds, not a verdict on any text.
export function syllables(word) {
  const w = word.toLowerCase().replace(/[^a-z]/g, "");
  if (!w) return 0;
  if (w.length <= 3) return 1;
  const trimmed = w.replace(/(?:[^laeiouy]es|ed|[^laeiouy]e)$/, "").replace(/^y/, "");
  const groups = trimmed.match(/[aeiouy]{1,2}/g);
  return Math.max(1, groups ? groups.length : 1);
}

export function readingStats(text) {
  const sentences = String(text).split(/[.!?]+(?:\s|$)/).map((s) => s.trim()).filter((s) => /[a-z]/i.test(s));
  const words = String(text).split(/\s+/).map((w) => w.replace(/[^A-Za-z'-]/g, "")).filter(Boolean);
  const syl = words.reduce((n, w) => n + syllables(w), 0);
  const wps = words.length / Math.max(1, sentences.length);
  const spw = syl / Math.max(1, words.length);
  return { sentences: sentences.length, words: words.length, wordsPerSentence: wps, grade: 0.39 * wps + 11.8 * spw - 15.59 };
}
