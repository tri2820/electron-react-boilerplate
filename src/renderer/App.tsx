import { MemoryRouter as Router, Routes, Route } from 'react-router-dom';
// import icon from '../../assets/icon.svg';

import 'tailwindcss/tailwind.css';
import { useEffect, useState } from 'react';
import { createClient } from '@supabase/supabase-js';
import { useAtom, useAtomValue } from 'jotai';
import MainScreen from './components/main-screen';
import LoginScreen from './components/login-screen';
import { sessionAtom, supabaseAtom } from './atom';

export default function App() {
  const supabase = useAtomValue(supabaseAtom);
  const [session, setSession] = useAtom(sessionAtom);

  useEffect(() => {
    (async () => {
      const { data, error: getSessionError } = await supabase.auth.getSession();
      console.log(data, getSessionError);
      if (getSessionError || !data.session) {
        console.error('Get session error', getSessionError, data);
        return;
      }

      setSession(data.session);
    })();
  }, [supabase, setSession]);

  return (
    <Router>
      <Routes>
        <Route path="/login" element={<LoginScreen />} />
        <Route path="/" element={<MainScreen />} />
      </Routes>
    </Router>
  );
}
