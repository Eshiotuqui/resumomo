import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNotebookStore } from '../store/useNotebookStore';

export default function Sidebar() {
  const {
    sections, sidebarOpen, activeSectionId, pages,
    addSection, removeSection, renameSection, setSectionColor,
    setActiveSectionId, toggleSidebar, addPage,
    setCurrentPageIndex, setShowSummary,
  } = useNotebookStore();

  const [newSectionName, setNewSectionName] = useState('');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editName, setEditName] = useState('');

  const handleAddSection = () => {
    if (newSectionName.trim()) {
      addSection(newSectionName.trim());
      setNewSectionName('');
    }
  };

  const startEdit = (id: string, name: string) => {
    setEditingId(id);
    setEditName(name);
  };

  const saveEdit = (id: string) => {
    if (editName.trim()) {
      renameSection(id, editName.trim());
    }
    setEditingId(null);
  };

  const filteredPages = activeSectionId
    ? pages.filter((p) => p.sectionId === activeSectionId)
    : pages;

  const sectionColors = [
    '#f87171', '#fb923c', '#fbbf24', '#34d399',
    '#60a5fa', '#a78bfa', '#f472b6', '#94a3b8',
  ];

  return (
    <AnimatePresence>
      {sidebarOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            className="fixed inset-0 bg-black/30 z-40"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={toggleSidebar}
          />

          {/* Sidebar panel */}
          <motion.div
            className="fixed left-0 top-0 bottom-0 w-80 bg-white shadow-2xl z-50 flex flex-col"
            initial={{ x: -320 }}
            animate={{ x: 0 }}
            exit={{ x: -320 }}
            transition={{ type: 'spring', stiffness: 300, damping: 30 }}
          >
            {/* Header */}
            <div className="p-4 bg-gradient-to-r from-pink-500 to-rose-500 text-white">
              <div className="flex items-center justify-between">
                <h2 className="font-lettering text-2xl">Caderno do Momo</h2>
                <button
                  onClick={toggleSidebar}
                  className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center hover:bg-white/30 transition-colors"
                >
                  <span className="text-sm">&times;</span>
                </button>
              </div>
            </div>

            {/* All pages filter */}
            <div className="px-4 pt-3">
              <button
                onClick={() => setActiveSectionId(null)}
                className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-colors ${!activeSectionId ? 'bg-pink-100 text-pink-700 font-semibold' : 'text-gray-600 hover:bg-gray-100'}`}
              >
                Todas as paginas ({pages.length})
              </button>
            </div>

            {/* Sections */}
            <div className="flex-1 overflow-y-auto px-4 py-2">
              <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">Sessoes</h3>

              {sections.map((section) => {
                const sectionPageCount = pages.filter((p) => p.sectionId === section.id).length;
                return (
                  <motion.div
                    key={section.id}
                    layout
                    className={`mb-1 rounded-lg transition-colors ${activeSectionId === section.id ? 'bg-pink-50' : 'hover:bg-gray-50'}`}
                  >
                    <div className="flex items-center gap-2 px-3 py-2">
                      {/* Color indicator */}
                      <div className="relative group">
                        <div
                          className="w-3 h-3 rounded-full cursor-pointer"
                          style={{ backgroundColor: section.color }}
                        />
                        <div className="absolute left-0 top-6 hidden group-hover:flex bg-white rounded-lg shadow-lg p-1 gap-1 z-50">
                          {sectionColors.map((c) => (
                            <button
                              key={c}
                              className="w-4 h-4 rounded-full hover:scale-125 transition-transform"
                              style={{ backgroundColor: c }}
                              onClick={() => setSectionColor(section.id, c)}
                            />
                          ))}
                        </div>
                      </div>

                      {/* Name */}
                      {editingId === section.id ? (
                        <input
                          className="flex-1 text-sm outline-none bg-white border border-pink-300 rounded px-1"
                          value={editName}
                          onChange={(e) => setEditName(e.target.value)}
                          onBlur={() => saveEdit(section.id)}
                          onKeyDown={(e) => e.key === 'Enter' && saveEdit(section.id)}
                          autoFocus
                        />
                      ) : (
                        <button
                          className="flex-1 text-left text-sm text-gray-700 truncate"
                          onClick={() => setActiveSectionId(section.id)}
                          onDoubleClick={() => startEdit(section.id, section.name)}
                        >
                          {section.name}
                        </button>
                      )}

                      <span className="text-xs text-gray-400">{sectionPageCount}</span>

                      {/* Add page to section */}
                      <button
                        onClick={() => addPage(section.id)}
                        className="w-5 h-5 text-xs rounded bg-gray-100 hover:bg-gray-200 text-gray-500 flex items-center justify-center"
                        title="Nova pagina nessa sessao"
                      >
                        +
                      </button>

                      {/* Delete section */}
                      {section.id !== 'default' && (
                        <button
                          onClick={() => removeSection(section.id)}
                          className="w-5 h-5 text-xs rounded bg-red-50 hover:bg-red-100 text-red-400 flex items-center justify-center"
                          title="Excluir sessao"
                        >
                          &times;
                        </button>
                      )}
                    </div>
                  </motion.div>
                );
              })}

              {/* Add section */}
              <div className="mt-3 flex gap-1">
                <input
                  className="flex-1 text-sm border border-gray-200 rounded-lg px-3 py-1.5 outline-none focus:border-pink-400"
                  placeholder="Nova sessao..."
                  value={newSectionName}
                  onChange={(e) => setNewSectionName(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleAddSection()}
                />
                <button
                  onClick={handleAddSection}
                  className="px-3 py-1.5 text-sm bg-pink-500 text-white rounded-lg hover:bg-pink-600 transition-colors"
                >
                  +
                </button>
              </div>

              {/* Pages list */}
              <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mt-5 mb-2">
                Paginas {activeSectionId ? `- ${sections.find((s) => s.id === activeSectionId)?.name}` : ''}
              </h3>

              {filteredPages.map((page, index) => {
                const section = sections.find((s) => s.id === page.sectionId);
                return (
                  <button
                    key={page.id}
                    onClick={() => {
                      setCurrentPageIndex(index);
                      toggleSidebar();
                    }}
                    className="w-full text-left px-3 py-2 rounded-lg text-sm text-gray-600 hover:bg-gray-100 flex items-center gap-2 mb-0.5"
                  >
                    <span
                      className="w-2 h-2 rounded-full flex-shrink-0"
                      style={{ backgroundColor: section?.color || '#94a3b8' }}
                    />
                    <span className="truncate">
                      {page.title || `Pagina ${index + 1}`}
                    </span>
                  </button>
                );
              })}
            </div>

            {/* Summary button */}
            <div className="p-4 border-t border-gray-100">
              <button
                onClick={() => { setShowSummary(true); toggleSidebar(); }}
                className="w-full py-3 bg-gradient-to-r from-violet-500 to-purple-600 text-white rounded-xl font-semibold text-sm hover:from-violet-600 hover:to-purple-700 transition-all shadow-lg hover:shadow-xl"
              >
                Gerar Resumo / Mapa Mental
              </button>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
