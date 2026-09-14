import { AnimatePresence } from 'framer-motion';
import type { Page } from '../types';
import { useNotebookStore } from '../store/useNotebookStore';
import PostItNote from './PostItNote';
import PageToolbar from './PageToolbar';

interface NotebookPageProps {
  page: Page;
  pageNumber: number;
  totalPages: number;
  side: 'left' | 'right';
}

export default function NotebookPage({ page, pageNumber, totalPages, side }: NotebookPageProps) {
  const {
    sections, setPageLineStyle, setPageTextColor, setPageFontSize,
    updatePageContent, updatePageTitle, addPostIt, removePostIt,
    updatePostIt, movePage, removePage,
  } = useNotebookStore();

  const lineClass = `lines-${page.lineStyle}`;
  const isLeft = side === 'left';

  return (
    <div className={`relative w-full h-full bg-white overflow-hidden flex flex-col ${lineClass} ${
      isLeft ? 'rounded-l-lg' : 'rounded-r-lg'
    }`}>
      {/* Spiral holes - only on inner edge */}
      {isLeft ? (
        <div className="absolute right-0 top-0 bottom-0 w-8 bg-gray-50/50 flex flex-col justify-evenly items-center border-l border-gray-200 z-10">
          {Array.from({ length: 14 }).map((_, i) => (
            <div key={i} className="w-3 h-3 rounded-full bg-gray-200 border border-gray-300" />
          ))}
        </div>
      ) : (
        <div className="absolute left-0 top-0 bottom-0 w-8 bg-gray-50/50 flex flex-col justify-evenly items-center border-r border-gray-200 z-10">
          {Array.from({ length: 14 }).map((_, i) => (
            <div key={i} className="w-3 h-3 rounded-full bg-gray-200 border border-gray-300" />
          ))}
        </div>
      )}

      {/* Red margin line */}
      {isLeft ? (
        <div className="absolute left-10 top-0 bottom-0 w-px bg-red-300/40" />
      ) : (
        <div className="absolute left-12 top-0 bottom-0 w-px bg-red-300/40" />
      )}

      {/* Toolbar */}
      <div className={`relative z-20 px-3 pt-2 pb-1.5 border-b border-gray-100 bg-white/90 backdrop-blur-sm ${
        isLeft ? 'pl-4 pr-10' : 'pl-14 pr-4'
      }`}>
        <PageToolbar
          page={page}
          sections={sections}
          onLineStyleChange={(s) => setPageLineStyle(page.id, s)}
          onTextColorChange={(c) => setPageTextColor(page.id, c)}
          onFontSizeChange={(s) => setPageFontSize(page.id, s)}
          onAddPostIt={() => addPostIt(page.id)}
          onMovePage={(sId) => movePage(page.id, sId)}
          onDeletePage={() => removePage(page.id)}
        />
      </div>

      {/* Title */}
      <div className={`relative z-10 px-3 pt-2 ${isLeft ? 'pl-12 pr-10' : 'pl-14 pr-4'}`}>
        <input
          className="w-full font-caveat text-xl font-bold outline-none bg-transparent placeholder-gray-300"
          style={{ color: page.textColor }}
          value={page.title}
          onChange={(e) => updatePageTitle(page.id, e.target.value)}
          placeholder="Titulo da pagina..."
        />
      </div>

      {/* Content area with lines */}
      <div className="relative flex-1 overflow-hidden">
        <div
          className="page-lines absolute inset-0 pointer-events-none"
          style={{
            top: '8px',
            left: isLeft ? '44px' : '48px',
            right: isLeft ? '32px' : '12px',
          }}
        />

        {/* Text editor */}
        <textarea
          className={`absolute inset-0 w-full h-full pt-2 pb-4 font-handwriting outline-none resize-none bg-transparent z-10 leading-[32px] ${
            isLeft ? 'pl-12 pr-10' : 'pl-14 pr-4'
          }`}
          style={{
            color: page.textColor,
            fontSize: `${page.fontSize}px`,
          }}
          value={page.content}
          onChange={(e) => updatePageContent(page.id, e.target.value)}
          placeholder="Comece a escrever..."
        />

        {/* Post-its */}
        <AnimatePresence>
          {page.postIts.map((postIt) => (
            <PostItNote
              key={postIt.id}
              postIt={postIt}
              onUpdate={(updates) => updatePostIt(page.id, postIt.id, updates)}
              onRemove={() => removePostIt(page.id, postIt.id)}
            />
          ))}
        </AnimatePresence>
      </div>

      {/* Page number footer */}
      <div className={`relative z-10 px-3 py-1.5 flex justify-between items-center text-xs text-gray-400 border-t border-gray-100 ${
        isLeft ? 'pl-12 pr-10' : 'pl-14 pr-4'
      }`}>
        <span className="font-caveat text-[11px]">
          {sections.find((s) => s.id === page.sectionId)?.name || 'Geral'}
        </span>
        <span className="font-caveat text-[11px]">{pageNumber} / {totalPages}</span>
      </div>
    </div>
  );
}
