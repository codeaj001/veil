// VEIL Session Cookie & Security Timeout Manager
import { supabase, isSupabaseConfigured } from './supabase';

const SESSION_COOKIE_NAME = 'veil_session_token';
const DEFAULT_SESSION_DURATION_MINUTES = 30;

/**
 * Generates a unique display name based on user email or random hash.
 */
export function generateUniqueDisplayName(email = '') {
  if (email && email.includes('@')) {
    const prefix = email.split('@')[0];
    // Capitalize first letter of email username prefix
    const formatted = prefix.charAt(0).toUpperCase() + prefix.slice(1);
    return formatted;
  }
  const randomSuffix = Math.floor(1000 + Math.random() * 9000);
  return `Forecaster_${randomSuffix}`;
}

/**
 * Retrieves the current logged in user's profile details.
 */
export function getUserProfile() {
  const email = localStorage.getItem('veil_user_email') || 'hello@gmail.com';
  let displayName = localStorage.getItem('veil_display_name');

  if (!displayName) {
    displayName = generateUniqueDisplayName(email);
    localStorage.setItem('veil_display_name', displayName);
  }

  return {
    email,
    displayName,
    username: displayName.toLowerCase().replace(/[^a-z0-9_]/g, '')
  };
}

/**
 * Updates and saves user profile to local state and Supabase profiles table.
 */
export async function saveUserProfile({ email, displayName }) {
  if (email) localStorage.setItem('veil_user_email', email);
  if (displayName) localStorage.setItem('veil_display_name', displayName);

  if (isSupabaseConfigured && supabase) {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        await supabase.from('profiles').upsert({
          id: user.id,
          email: email,
          username: displayName,
          updated_at: new Date().toISOString()
        });
      }
    } catch (err) {
      console.warn('[Session Manager] Profile update notice:', err.message);
    }
  }
}

/**
 * Sets a secure session cookie and stores expiration timestamp.
 */
export function setSessionCookie(email, durationMinutes = DEFAULT_SESSION_DURATION_MINUTES) {
  const expiresAt = Date.now() + durationMinutes * 60 * 1000;
  const tokenPayload = btoa(JSON.stringify({ email, expiresAt, created: Date.now() }));

  // Set browser cookie with SameSite=Lax
  const maxAge = durationMinutes * 60;
  document.cookie = `${SESSION_COOKIE_NAME}=${tokenPayload}; path=/; max-age=${maxAge}; SameSite=Lax`;

  localStorage.setItem('veil_user_email', email);

  // Auto-generate and store unique display name if not present
  if (!localStorage.getItem('veil_display_name')) {
    const uniqueName = generateUniqueDisplayName(email);
    localStorage.setItem('veil_display_name', uniqueName);
  }

  localStorage.setItem('veil_session_expiry', expiresAt.toString());
  localStorage.setItem('veil_last_activity', Date.now().toString());

  return tokenPayload;
}

/**
 * Checks if active session cookie/token is valid and not expired.
 */
export function isSessionValid() {
  const expiry = localStorage.getItem('veil_session_expiry');
  if (!expiry) return false;

  const expTime = parseInt(expiry, 10);
  if (isNaN(expTime) || Date.now() > expTime) {
    clearSession();
    return false;
  }

  return true;
}

/**
 * Updates the last activity timestamp to prevent premature idle timeout.
 */
export function touchActivityTimestamp() {
  if (isSessionValid()) {
    localStorage.setItem('veil_last_activity', Date.now().toString());
  }
}

/**
 * Clears session cookies, local storage items, and Supabase auth session.
 */
export async function clearSession() {
  // Expire session cookie
  document.cookie = `${SESSION_COOKIE_NAME}=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT; SameSite=Lax`;

  localStorage.removeItem('veil_user_email');
  localStorage.removeItem('veil_display_name');
  localStorage.removeItem('veil_session_expiry');
  localStorage.removeItem('veil_last_activity');

  try {
    if (supabase && supabase.auth && typeof supabase.auth.signOut === 'function') {
      await supabase.auth.signOut();
    }
  } catch (err) {
    console.warn('[Session Manager] Supabase sign out notice:', err.message);
  }
}
