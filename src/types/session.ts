import type { Language } from '@/lib/language';

export type Session = {
  id: string;
  title: string;
  languages: [Language, Language];
};

export type HostedSession = {
  session: {
    id: string;
    title: string;
    languages: [Language, Language];
  };
  participant: {
    id: string;
  };
};
