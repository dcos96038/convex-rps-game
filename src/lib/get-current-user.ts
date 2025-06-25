// src/hooks/useServerAuth.ts
import { convexAuthNextjsToken } from '@convex-dev/auth/nextjs/server';
import { fetchQuery } from 'convex/nextjs';
import { api } from '../../convex/_generated/api';

export async function getCurrentUser() {
  try {
    const token = await convexAuthNextjsToken();

    if (!token) {
      return { token: null, isAuthenticated: false };
    }

    const user = await fetchQuery(api.auth.getCurrentUser, {}, { token });

    return {
      token,
      isAuthenticated: Boolean(user),
      user,
    };
  } catch (error) {
    console.error('Auth error:', error);
    return { token: null, isAuthenticated: false };
  }
}
