import { useEffect, useRef, useState } from 'react';
import { supabase, isSupabaseEnabled } from '../lib/supabase';
import { useNotebookStore } from '../store/useNotebookStore';

const ROW_ID = 'caderno-momo';
const TABLE = 'notebooks';

function debounce(fn: () => void, ms: number) {
  let timer: ReturnType<typeof setTimeout>;
  return () => {
    clearTimeout(timer);
    timer = setTimeout(fn, ms);
  };
}

export function useSupabaseSync() {
  const isRemoteUpdate = useRef(false);
  const lastSavedJson = useRef('');
  const [status, setStatus] = useState<'offline' | 'syncing' | 'synced' | 'error'>('offline');

  useEffect(() => {
    if (!isSupabaseEnabled || !supabase) return;
    const client = supabase;

    setStatus('syncing');

    // 1. Load initial data - compare local vs remote timestamps
    const loadInitial = async () => {
      try {
        const { data, error } = await client
          .from(TABLE)
          .select('*')
          .eq('id', ROW_ID)
          .single();

        if (error && error.code === 'PGRST116') {
          // Row doesn't exist - push local data to Supabase
          console.log('[Sync] No remote data found, pushing local...');
          const { sections, pages, deskPostIts } = useNotebookStore.getState();
          const { error: upsertError } = await client.from(TABLE).upsert({
            id: ROW_ID,
            sections,
            pages,
            desk_post_its: deskPostIts,
            updated_at: new Date().toISOString(),
          });
          if (upsertError) {
            console.error('[Sync] Upsert error:', upsertError);
            setStatus('error');
            return;
          }
          lastSavedJson.current = JSON.stringify({ sections, pages, deskPostIts });
          setStatus('synced');
          return;
        }

        if (error) {
          console.error('[Sync] Load error:', error);
          setStatus('error');
          return;
        }

        if (data) {
          // Remote data exists - use it (remote is source of truth)
          console.log('[Sync] Loaded remote data');
          isRemoteUpdate.current = true;

          useNotebookStore.setState({
            sections: data.sections ?? useNotebookStore.getState().sections,
            pages: data.pages ?? useNotebookStore.getState().pages,
            deskPostIts: data.desk_post_its ?? useNotebookStore.getState().deskPostIts,
          });

          lastSavedJson.current = JSON.stringify({
            sections: data.sections,
            pages: data.pages,
            deskPostIts: data.desk_post_its,
          });

          setTimeout(() => { isRemoteUpdate.current = false; }, 200);
          setStatus('synced');
        }
      } catch (err) {
        console.error('[Sync] Unexpected error:', err);
        setStatus('error');
      }
    };

    loadInitial();

    // 2. Listen for real-time changes
    const channel = client
      .channel('notebook-sync')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: TABLE,
          filter: `id=eq.${ROW_ID}`,
        },
        (payload) => {
          const data = payload.new as Record<string, unknown>;
          if (!data) return;

          const remoteJson = JSON.stringify({
            sections: data.sections,
            pages: data.pages,
            deskPostIts: data.desk_post_its,
          });

          // Skip if this is our own write
          if (remoteJson === lastSavedJson.current) return;

          console.log('[Sync] Received remote update');
          isRemoteUpdate.current = true;
          const store = useNotebookStore.getState();
          useNotebookStore.setState({
            sections: (data.sections as typeof store.sections) ?? store.sections,
            pages: (data.pages as typeof store.pages) ?? store.pages,
            deskPostIts: (data.desk_post_its as typeof store.deskPostIts) ?? store.deskPostIts,
          });
          lastSavedJson.current = remoteJson;
          setTimeout(() => { isRemoteUpdate.current = false; }, 200);
        }
      )
      .subscribe((status) => {
        console.log('[Sync] Realtime status:', status);
      });

    // 3. Push local changes to Supabase (debounced)
    const pushToSupabase = debounce(() => {
      if (isRemoteUpdate.current) return;

      const { sections, pages, deskPostIts } = useNotebookStore.getState();
      const localJson = JSON.stringify({ sections, pages, deskPostIts });

      if (localJson === lastSavedJson.current) return;
      lastSavedJson.current = localJson;

      console.log('[Sync] Pushing local changes...');
      client
        .from(TABLE)
        .upsert({
          id: ROW_ID,
          sections,
          pages,
          desk_post_its: deskPostIts,
          updated_at: new Date().toISOString(),
        })
        .then(({ error }) => {
          if (error) {
            console.error('[Sync] Push error:', error);
            setStatus('error');
          } else {
            setStatus('synced');
          }
        });
    }, 500);

    const unsubStore = useNotebookStore.subscribe(pushToSupabase);

    return () => {
      channel.unsubscribe();
      unsubStore();
    };
  }, []);

  return status;
}
