import { motion, AnimatePresence } from 'framer-motion';
import { useState } from 'react';
import type { LineStyle, Page, Section } from '../types';

interface PageToolbarProps {
  page: Page;
  sections: Section[];
  onLineStyleChange: (style: LineStyle) => void;
  onTextColorChange: (color: string) => void;
  onFontSizeChange: (size: number) => void;
  onAddPostIt: () => void;
  onMovePage: (sectionId: string) => void;
  onDeletePage: () => void;
}

const LINE_STYLES: { value: LineStyle; label: string; icon: string }[] = [
  { value: 'dark', label: 'Escura', icon: '━' },
  { value: 'light', label: 'Clara', icon: '─' },
  { value: 'dots', label: 'Pontos', icon: '···' },
  { value: 'none', label: 'Sem linha', icon: '▢' },
];

const TEXT_COLORS = [
  '#1e293b', '#0f172a', '#1e40af', '#047857',
  '#b91c1c', '#7c3aed', '#c2410c', '#64748b',
];

export default function PageToolbar({
  page, sections, onLineStyleChange, onTextColorChange,
  onFontSizeChange, onAddPostIt, onMovePage, onDeletePage,
}: PageToolbarProps) {
  const [showLines, setShowLines] = useState(false);
  const [showColors, setShowColors] = useState(false);
  const [showMove, setShowMove] = useState(false);

  const closeAll = () => { setShowLines(false); setShowColors(false); setShowMove(false); };

  return (
    <div className="flex items-center gap-1 flex-wrap">
      {/* Line style */}
      <div className="relative">
        <button
          onClick={() => { closeAll(); setShowLines(!showLines); }}
          className="px-2 py-1 text-xs rounded bg-gray-100 hover:bg-gray-200 text-gray-700 transition-colors"
          title="Estilo de linha"
        >
          Linhas
        </button>
        <AnimatePresence>
          {showLines && (
            <motion.div
              initial={{ opacity: 0, y: -5 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -5 }}
              className="absolute top-8 left-0 bg-white rounded-lg shadow-lg p-2 z-50 min-w-[120px]"
            >
              {LINE_STYLES.map((ls) => (
                <button
                  key={ls.value}
                  onClick={() => { onLineStyleChange(ls.value); setShowLines(false); }}
                  className={`w-full text-left px-2 py-1 rounded text-xs flex items-center gap-2 hover:bg-gray-100 ${page.lineStyle === ls.value ? 'bg-pink-100 text-pink-700' : 'text-gray-700'}`}
                >
                  <span className="w-6 text-center">{ls.icon}</span>
                  {ls.label}
                </button>
              ))}
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Text color */}
      <div className="relative">
        <button
          onClick={() => { closeAll(); setShowColors(!showColors); }}
          className="px-2 py-1 text-xs rounded bg-gray-100 hover:bg-gray-200 transition-colors flex items-center gap-1"
          title="Cor do texto"
        >
          <span className="w-3 h-3 rounded-full" style={{ backgroundColor: page.textColor }} />
          Cor
        </button>
        <AnimatePresence>
          {showColors && (
            <motion.div
              initial={{ opacity: 0, y: -5 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -5 }}
              className="absolute top-8 left-0 bg-white rounded-lg shadow-lg p-2 z-50 flex gap-1 flex-wrap w-[120px]"
            >
              {TEXT_COLORS.map((color) => (
                <button
                  key={color}
                  className={`w-6 h-6 rounded-full border-2 hover:scale-110 transition-transform ${page.textColor === color ? 'border-pink-500' : 'border-gray-200'}`}
                  style={{ backgroundColor: color }}
                  onClick={() => { onTextColorChange(color); setShowColors(false); }}
                />
              ))}
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Font size */}
      <div className="flex items-center gap-1">
        <button
          onClick={() => onFontSizeChange(Math.max(12, page.fontSize - 2))}
          className="w-6 h-6 text-xs rounded bg-gray-100 hover:bg-gray-200 text-gray-700 transition-colors"
        >
          A-
        </button>
        <span className="text-xs text-gray-500 w-6 text-center">{page.fontSize}</span>
        <button
          onClick={() => onFontSizeChange(Math.min(32, page.fontSize + 2))}
          className="w-6 h-6 text-xs rounded bg-gray-100 hover:bg-gray-200 text-gray-700 transition-colors"
        >
          A+
        </button>
      </div>

      {/* Post-it */}
      <button
        onClick={onAddPostIt}
        className="px-2 py-1 text-xs rounded bg-yellow-100 hover:bg-yellow-200 text-yellow-800 transition-colors"
        title="Adicionar post-it"
      >
        Post-it
      </button>

      {/* Move page */}
      <div className="relative">
        <button
          onClick={() => { closeAll(); setShowMove(!showMove); }}
          className="px-2 py-1 text-xs rounded bg-gray-100 hover:bg-gray-200 text-gray-700 transition-colors"
          title="Mover pagina"
        >
          Mover
        </button>
        <AnimatePresence>
          {showMove && (
            <motion.div
              initial={{ opacity: 0, y: -5 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -5 }}
              className="absolute top-8 right-0 bg-white rounded-lg shadow-lg p-2 z-50 min-w-[140px]"
            >
              {sections.map((s) => (
                <button
                  key={s.id}
                  onClick={() => { onMovePage(s.id); setShowMove(false); }}
                  className={`w-full text-left px-2 py-1 rounded text-xs flex items-center gap-2 hover:bg-gray-100 ${page.sectionId === s.id ? 'bg-pink-100' : ''}`}
                >
                  <span className="w-2 h-2 rounded-full" style={{ backgroundColor: s.color }} />
                  {s.name}
                </button>
              ))}
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Delete */}
      <button
        onClick={onDeletePage}
        className="px-2 py-1 text-xs rounded bg-red-50 hover:bg-red-100 text-red-600 transition-colors ml-auto"
        title="Excluir pagina"
      >
        Excluir
      </button>
    </div>
  );
}
