export interface LanguageOption {
  label: string;
  mlkitCode: string;
  ttsCandidates: string[];
  /** BCP-47 primary subtags the language detector may return for this language. */
  detectTags: string[];
}

export const LANGUAGES: LanguageOption[] = [
  { label: 'English', mlkitCode: 'en', ttsCandidates: ['en-US', 'en-GB'], detectTags: ['en'] },
  { label: 'Tagalog', mlkitCode: 'tl', ttsCandidates: ['fil-PH', 'tl-PH'], detectTags: ['tl', 'fil'] },
  { label: 'Spanish', mlkitCode: 'es', ttsCandidates: ['es-ES', 'es-MX'], detectTags: ['es'] },
  { label: 'French', mlkitCode: 'fr', ttsCandidates: ['fr-FR'], detectTags: ['fr'] },
  { label: 'German', mlkitCode: 'de', ttsCandidates: ['de-DE'], detectTags: ['de'] },
  { label: 'Indonesian', mlkitCode: 'id', ttsCandidates: ['id-ID'], detectTags: ['id'] },
  { label: 'Japanese', mlkitCode: 'ja', ttsCandidates: ['ja-JP'], detectTags: ['ja'] },
  { label: 'Chinese', mlkitCode: 'zh', ttsCandidates: ['zh-CN', 'zh-TW'], detectTags: ['zh'] },
  { label: 'Korean', mlkitCode: 'ko', ttsCandidates: ['ko-KR'], detectTags: ['ko'] },
];
