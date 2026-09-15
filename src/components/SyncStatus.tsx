import { isSupabaseEnabled } from '../lib/supabase';

interface SyncStatusProps {
  status: 'offline' | 'syncing' | 'synced' | 'error';
}

export default function SyncStatus({ status }: SyncStatusProps) {
  if (!isSupabaseEnabled) {
    return (
      <div className="fixed top-2 right-2 sm:top-4 sm:right-4 z-50">
        <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium backdrop-blur-sm shadow-sm bg-white/10 text-white/50">
          <div className="w-1.5 h-1.5 rounded-full bg-white/30" />
          Local
        </div>
      </div>
    );
  }

  const config = {
    synced: { bg: 'bg-green-500/20', text: 'text-green-100', dot: 'bg-green-400', label: 'Sincronizado', pulse: true },
    syncing: { bg: 'bg-yellow-500/20', text: 'text-yellow-100', dot: 'bg-yellow-400', label: 'Sincronizando...', pulse: true },
    error: { bg: 'bg-red-500/20', text: 'text-red-100', dot: 'bg-red-400', label: 'Erro de sync', pulse: false },
    offline: { bg: 'bg-white/10', text: 'text-white/50', dot: 'bg-white/30', label: 'Conectando...', pulse: true },
  }[status];

  return (
    <div className="fixed top-2 right-2 sm:top-4 sm:right-4 z-50">
      <div className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium backdrop-blur-sm shadow-sm ${config.bg} ${config.text}`}>
        <div className={`w-1.5 h-1.5 rounded-full ${config.dot} ${config.pulse ? 'animate-pulse' : ''}`} />
        {config.label}
      </div>
    </div>
  );
}
