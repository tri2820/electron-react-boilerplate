import type { Session, User } from '@supabase/supabase-js';
import { createClient } from '@supabase/supabase-js';

import { atom } from 'jotai';

// eslint-disable-next-line import/prefer-default-export
export const supabaseAtom = atom(
  createClient(window.env.SUPABASE_URL, window.env.SUPBASE_ANON_KEY),
);

export const sessionAtom = atom<Session | undefined>(undefined);
