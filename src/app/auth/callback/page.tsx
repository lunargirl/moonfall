'use client';
import { useEffect } from 'react';
import { supabaseClient } from '@/lib/supabaseClient';
import { useRouter } from 'next/navigation';

export default function AuthCallback() {
  const router = useRouter();

  useEffect(() => {
    const finishLogin = async () => {
      await supabaseClient.auth.getSession();

      // redirect to previous page
      const redirectTo = localStorage.getItem('redirectAfterLogin') || '/';
      localStorage.removeItem('redirectAfterLogin');
      router.push(redirectTo);
    };

    finishLogin();
  }, []);

  return <div>Logging you in...</div>;
}
