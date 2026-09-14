import { useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import NotebookCover from './components/NotebookCover';
import Notebook from './components/Notebook';
import Sidebar from './components/Sidebar';
import MindMap from './components/MindMap';
import DeskPostIt from './components/DeskPostIt';
import SyncStatus from './components/SyncStatus';
import { useNotebookStore } from './store/useNotebookStore';
import { useSupabaseSync } from './hooks/useSupabaseSync';

export default function App() {
  useSupabaseSync();
  const [isOpen, setIsOpen] = useState(false);
  const { deskPostIts, addDeskPostIt, removeDeskPostIt, updateDeskPostIt } = useNotebookStore();

  return (
    <div className="w-full h-full flex items-center justify-center relative overflow-hidden">
      {/* Animated background blobs */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <motion.div
          className="absolute -top-40 -left-40 w-96 h-96 bg-purple-400/20 rounded-full blur-3xl"
          animate={{ x: [0, 50, 0], y: [0, 30, 0] }}
          transition={{ duration: 15, repeat: Infinity, ease: 'easeInOut' }}
        />
        <motion.div
          className="absolute -bottom-40 -right-40 w-96 h-96 bg-pink-400/20 rounded-full blur-3xl"
          animate={{ x: [0, -50, 0], y: [0, -30, 0] }}
          transition={{ duration: 12, repeat: Infinity, ease: 'easeInOut' }}
        />
        <motion.div
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-indigo-400/10 rounded-full blur-3xl"
          animate={{ scale: [1, 1.2, 1] }}
          transition={{ duration: 10, repeat: Infinity, ease: 'easeInOut' }}
        />
      </div>

      {/* Desk post-its (always visible when notebook is open) */}
      <AnimatePresence>
        {isOpen && deskPostIts.map((postIt) => (
          <DeskPostIt
            key={postIt.id}
            postIt={postIt}
            onUpdate={(updates) => updateDeskPostIt(postIt.id, updates)}
            onRemove={() => removeDeskPostIt(postIt.id)}
          />
        ))}
      </AnimatePresence>

      {/* Floating desk post-it button */}
      {isOpen && (
        <motion.button
          onClick={addDeskPostIt}
          className="fixed bottom-4 right-4 sm:bottom-6 sm:right-6 w-12 h-12 sm:w-14 sm:h-14 bg-yellow-300 hover:bg-yellow-400 rounded-lg shadow-lg flex items-center justify-center text-2xl text-yellow-800 transition-colors z-50"
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          whileHover={{ scale: 1.1, rotate: 5 }}
          title="Novo post-it na bancada"
        >
          +
        </motion.button>
      )}

      {/* Main content */}
      <AnimatePresence mode="wait">
        {!isOpen ? (
          <motion.div
            key="cover"
            exit={{ opacity: 0, rotateY: -90, x: -100 }}
            transition={{ duration: 0.6 }}
          >
            <NotebookCover onOpen={() => setIsOpen(true)} />
          </motion.div>
        ) : (
          <motion.div
            key="notebook"
            className="w-full h-full"
            initial={{ opacity: 0, rotateY: 90 }}
            animate={{ opacity: 1, rotateY: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            <Notebook onClose={() => setIsOpen(false)} />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Sidebar overlay */}
      <Sidebar />

      {/* Mind map / summary modal */}
      <MindMap />

      {/* Sync status indicator */}
      <SyncStatus />
    </div>
  );
}
