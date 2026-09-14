import { useEffect, useRef } from 'react';
import { supabase, isSupabaseEnabled } from '../lib/supabase';
import { useNotebookStore } from '../store/useNotebookStore';

const ROW_ID = 'caderno-momo';
const TABLE = 'notebooks';

function debounce<T extends (...args: unknown[]) => void>(fn: T, ms: number): T {
  let timer: ReturnType<typeof setTimeout>;
  return ((...args: unknown[]) => {
    clearTimeout(timer);
    timer = setTimeout(() => fn(...args), ms);
  }) as T;
}

export function useSupabaseSync() {
  const isRemoteUpdate = useRef(false);
  const lastSavedJson = useRef('');

  useEffect(() => {
    if (!isSupabaseEnabled || !supabase) return;
    const client = supabase;

    // 1. Load initial data from Supabase
    const loadInitial = async () => {
      const { data } = await client
        .from(TABLE)
        .select('*')
        .eq('id', ROW_ID)
        .single();

      if (data) {
        isRemoteUpdate.current = true;
        const store = useNotebookStore.getState();
        useNotebookStore.setState({
          sections: data.sections ?? store.sections,
          pages: data.pages ?? store.pages,
          deskPostIts: data.desk_post_its ?? store.deskPostIts,
        });
        lastSavedJson.current = JSON.stringify({
          sections: data.sections,
          pages: data.pages,
          deskPostIts: data.desk_post_its,
        });
        setTimeout(() => { isRemoteUpdate.current = false; }, 100);
      } else {
        // Create the row if it doesn't exist
        const { sections, pages, deskPostIts } = useNotebookStore.getState();
        await client.from(TABLE).upsert({
          id: ROW_ID,
          sections,
          pages,
          desk_post_its: deskPostIts,
          updated_at: new Date().toISOString(),
        });
      }
    };

    loadInitial();

    // 2. Listen for real-time changes from other devices
    const channel = client
      .channel('notebook-sync')
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: TABLE,
          filter: `id=eq.${ROW_ID}`,
        },
        (payload) => {
          const data = payload.new as Record<string, unknown>;
          const remoteJson = JSON.stringify({
            sections: data.sections,
            pages: data.pages,
            deskPostIts: data.desk_post_its,
          });

          if (remoteJson === lastSavedJson.current) return;

          isRemoteUpdate.current = true;
          const store = useNotebookStore.getState();
          useNotebookStore.setState({
            sections: (data.sections as typeof store.sections) ?? store.sections,
            pages: (data.pages as typeof store.pages) ?? store.pages,
            deskPostIts: (data.desk_post_its as typeof store.deskPostIts) ?? store.deskPostIts,
          });
          lastSavedJson.current = remoteJson;
          setTimeout(() => { isRemoteUpdate.current = false; }, 100);
        }
      )
      .subscribe();

    // 3. Push local changes to Supabase (debounced)
    const pushToSupabase = debounce(() => {
      if (isRemoteUpdate.current) return;

      const { sections, pages, deskPostIts } = useNotebookStore.getState();
      const localJson = JSON.stringify({ sections, pages, deskPostIts });

      if (localJson === lastSavedJson.current) return;
      lastSavedJson.current = localJson;

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
          if (error) console.error('Sync error:', error);
        });
    }, 800);

    const unsubStore = useNotebookStore.subscribe(pushToSupabase);

    return () => {
      channel.unsubscribe();
      unsubStore();
    };
  }, []);
}
