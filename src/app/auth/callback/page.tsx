'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { supabaseClient } from '@/lib/supabaseClient';

export default function AuthCallback() {
  const router = useRouter();

  useEffect(() => {
    const finishLogin = async () => {
      // This reads the session from Supabase after OAuth redirect
      const { data: { session }, error } = await supabaseClient.auth.getSession();

      if (error) {
        console.error('Error getting session:', error.message);
        router.push('/'); // fallback
        return;
      }

      if (!session) {
        console.warn('No session found. Check redirect URLs in Supabase.');
        router.push('/');
        return;
      }

      // redirect to previous page
      const redirectTo = localStorage.getItem('redirectAfterLogin') || '/';
      localStorage.removeItem('redirectAfterLogin');
      router.push(redirectTo);
    };

    finishLogin();
  }, []);

  return <div>Logging you in...</div>;
}
