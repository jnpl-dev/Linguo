export interface LanguageOption {
  label: string;
  mlkitCode: string;
  ttsCandidates: string[];
}

export const LANGUAGES: LanguageOption[] = [
  { label: 'English', mlkitCode: 'en', ttsCandidates: ['en-US', 'en-GB'] },
  { label: 'Tagalog', mlkitCode: 'tl', ttsCandidates: ['fil-PH', 'tl-PH'] },
  { label: 'Spanish', mlkitCode: 'es', ttsCandidates: ['es-ES', 'es-MX'] },
  { label: 'French', mlkitCode: 'fr', ttsCandidates: ['fr-FR'] },
  { label: 'German', mlkitCode: 'de', ttsCandidates: ['de-DE'] },
  { label: 'Indonesian', mlkitCode: 'id', ttsCandidates: ['id-ID'] },
];
