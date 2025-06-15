import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import { logEvent } from '@/lib/logger';

export default function Home() {
  const [emailAddress, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [userId, setUserId] = useState<number | null>(null);
  const router = useRouter();

  const handleLogin = async () => {
    logEvent('Attempting login');

    try {
      const response = await fetch('http://localhost:8080/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ emailAddress, password, "role":"vendor" }),
      });

      if (!response.ok) throw new Error('Login failed');

      router.push('/dashboard');

    } 
    catch (error) {
      logEvent('Login error: ' + (error as Error).message);
      alert('Login failed.');
    }
  };

  
}
