import { useEffect } from 'react';
import { supabase, isSupabaseConfigured } from './supabase';

/**
 * Custom React Hook for subscribing to Supabase Realtime table events.
 * 
 * @param {string} table - The PostgreSQL table name (e.g. 'user_positions', 'profiles', 'user_activity')
 * @param {function} onPayload - Callback function invoked on INSERT, UPDATE, or DELETE events
 * @param {string} event - Optional event filter ('*' | 'INSERT' | 'UPDATE' | 'DELETE')
 */
export function useRealtimeSubscription(table, onPayload, event = '*') {
  useEffect(() => {
    if (!isSupabaseConfigured || !supabase) {
      return;
    }

    const channelName = `realtime_${table}_${Math.random().toString(36).substring(2, 7)}`;
    const channel = supabase
      .channel(channelName)
      .on(
        'postgres_changes',
        {
          event: event,
          schema: 'public',
          table: table
        },
        (payload) => {
          if (typeof onPayload === 'function') {
            onPayload(payload);
          }
        }
      )
      .subscribe((status) => {
        if (status === 'SUBSCRIBED') {
          console.log(`[Supabase Realtime] Subscribed to ${table} channel successfully.`);
        }
      });

    return () => {
      supabase.removeChannel(channel);
    };
  }, [table, event, onPayload]);
}
