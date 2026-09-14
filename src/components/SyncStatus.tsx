import { isSupabaseEnabled } from '../lib/supabase';

export default function SyncStatus() {
  return (
    <div className="fixed top-2 right-2 sm:top-4 sm:right-4 z-50">
      <div className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium backdrop-blur-sm shadow-sm ${
        isSupabaseEnabled
          ? 'bg-green-500/20 text-green-100'
          : 'bg-white/10 text-white/50'
      }`}>
        <div className={`w-1.5 h-1.5 rounded-full ${
          isSupabaseEnabled ? 'bg-green-400 animate-pulse' : 'bg-white/30'
        }`} />
        {isSupabaseEnabled ? 'Sincronizado' : 'Local'}
      </div>
    </div>
  );
}
