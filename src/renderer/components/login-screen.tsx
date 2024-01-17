import { useAtom, useAtomValue } from 'jotai';
import { useNavigate } from 'react-router-dom';
import { supabaseAtom, sessionAtom } from '../atom';

export default function LoginScreen() {
  const navigate = useNavigate();
  const supabase = useAtomValue(supabaseAtom);
  const [session, setSession] = useAtom(sessionAtom);
  console.log('login supabase', supabase);

  return (
    <div>
      <button
        onClick={() => {
          navigate(-1);
        }}
      >
        Go Back
      </button>
      <p>Hi</p>
      <button
        onClick={async () => {
          const { error } = await supabase.auth.signInWithOAuth({
            provider: 'google',
          });

          if (error) {
            console.error('Cannot login with google', error);
          }
        }}
      >
        Login
      </button>
    </div>
  );
}
