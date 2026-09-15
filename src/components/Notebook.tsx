import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNotebookStore } from '../store/useNotebookStore';
import NotebookPage from './NotebookPage';
import { useIsMobile } from '../hooks/useIsMobile';
import { exportNotebookToPdf, exportScreenToPdf } from '../lib/exportPdf';

interface NotebookProps {
  onClose: () => void;
}

export default function Notebook({ onClose }: NotebookProps) {
  const {
    currentPageIndex, isFlipping, flipDirection,
    getFilteredPages, addPage, pages, sections, deskPostIts,
    activeSectionId, toggleSidebar, setShowSummary,
    setCurrentPageIndex, setFlipping,
  } = useNotebookStore();

  const isMobile = useIsMobile();
  const [exporting, setExporting] = useState(false);
  const [showExportMenu, setShowExportMenu] = useState(false);

  const handleExportFull = async () => {
    setExporting(true);
    setShowExportMenu(false);
    try {
      exportNotebookToPdf(pages, sections, deskPostIts);
    } finally {
      setExporting(false);
    }
  };

  const handleExportScreen = async () => {
    setExporting(true);
    setShowExportMenu(false);
    try {
      await exportScreenToPdf();
    } finally {
      setExporting(false);
    }
  };
  const filteredPages = getFilteredPages();

  // Mobile: 1 page at a time. Desktop: 2-page spread.
  const pagesPerView = isMobile ? 1 : 2;
  const spreadIndex = Math.floor(currentPageIndex / pagesPerView);
  const leftPageIndex = spreadIndex * pagesPerView;
  const rightPageIndex = leftPageIndex + 1;

  const leftPage = filteredPages[leftPageIndex] || null;
  const rightPage = !isMobile ? (filteredPages[rightPageIndex] || null) : null;

  const totalSpreads = Math.ceil(filteredPages.length / pagesPerView);
  const canGoPrev = spreadIndex > 0;
  const canGoNext = spreadIndex < totalSpreads - 1;

  const goNextSpread = () => {
    if (canGoNext) {
      setCurrentPageIndex((spreadIndex + 1) * pagesPerView);
      setFlipping(true, 'right');
      setTimeout(() => setFlipping(false, null), 600);
    }
  };

  const goPrevSpread = () => {
    if (canGoPrev) {
      setCurrentPageIndex((spreadIndex - 1) * pagesPerView);
      setFlipping(true, 'left');
      setTimeout(() => setFlipping(false, null), 600);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center h-full gap-2 sm:gap-3 px-2 sm:px-0">
      {/* Top bar */}
      <motion.div
        className="flex items-center gap-1.5 sm:gap-3 flex-wrap justify-center"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
      >
        <button
          onClick={onClose}
          className="px-3 py-1.5 sm:px-4 sm:py-2 bg-rose-500/70 backdrop-blur-sm text-white rounded-xl hover:bg-rose-600/70 transition-colors text-xs sm:text-sm font-medium"
        >
          Capa
        </button>
        <button
          onClick={toggleSidebar}
          className="px-3 py-1.5 sm:px-4 sm:py-2 bg-white/20 backdrop-blur-sm text-white rounded-xl hover:bg-white/30 transition-colors text-xs sm:text-sm font-medium"
        >
          Menu
        </button>
        <button
          onClick={() => addPage(activeSectionId || 'default')}
          className="px-3 py-1.5 sm:px-4 sm:py-2 bg-white/20 backdrop-blur-sm text-white rounded-xl hover:bg-white/30 transition-colors text-xs sm:text-sm font-medium"
        >
          + Pagina
        </button>
        <button
          onClick={() => setShowSummary(true)}
          className="px-3 py-1.5 sm:px-4 sm:py-2 bg-violet-500/80 backdrop-blur-sm text-white rounded-xl hover:bg-violet-600/80 transition-colors text-xs sm:text-sm font-medium"
        >
          Resumo
        </button>

        {/* Export PDF dropdown */}
        <div className="relative">
          <button
            onClick={() => setShowExportMenu(!showExportMenu)}
            disabled={exporting}
            className="px-3 py-1.5 sm:px-4 sm:py-2 bg-emerald-500/70 backdrop-blur-sm text-white rounded-xl hover:bg-emerald-600/70 transition-colors text-xs sm:text-sm font-medium disabled:opacity-50"
          >
            {exporting ? 'Exportando...' : 'PDF'}
          </button>
          <AnimatePresence>
            {showExportMenu && (
              <motion.div
                initial={{ opacity: 0, y: -5, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: -5, scale: 0.95 }}
                className="absolute top-full mt-1 right-0 bg-white rounded-xl shadow-xl overflow-hidden z-50 min-w-[180px]"
              >
                <button
                  onClick={handleExportFull}
                  className="w-full text-left px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 transition-colors border-b border-gray-100"
                >
                  <span className="font-medium">Caderno completo</span>
                  <br />
                  <span className="text-xs text-gray-400">Todas as paginas + post-its</span>
                </button>
                <button
                  onClick={handleExportScreen}
                  className="w-full text-left px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                >
                  <span className="font-medium">Screenshot da tela</span>
                  <br />
                  <span className="text-xs text-gray-400">Captura exata da tela atual</span>
                </button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </motion.div>

      {/* Notebook container */}
      <motion.div
        className={`relative flex notebook-shadow rounded-lg w-full ${
          isMobile
            ? 'max-w-[95vw] h-[70vh]'
            : 'max-w-[1100px] h-[540px]'
        }`}
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
      >
        {/* Spine / center binding (desktop only) */}
        {!isMobile && (
          <>
            <div className="absolute left-1/2 -translate-x-1/2 top-0 bottom-0 w-6 z-30 flex flex-col justify-evenly items-center">
              {Array.from({ length: 14 }).map((_, i) => (
                <div key={i} className="spiral-ring" style={{ width: 16, height: 16, borderWidth: 2 }} />
              ))}
            </div>
            <div className="absolute left-1/2 -translate-x-1/2 top-0 bottom-0 w-8 z-20 pointer-events-none"
              style={{
                background: 'linear-gradient(90deg, rgba(0,0,0,0.08) 0%, rgba(0,0,0,0.02) 30%, rgba(0,0,0,0) 50%, rgba(0,0,0,0.02) 70%, rgba(0,0,0,0.08) 100%)',
              }}
            />
          </>
        )}

        {/* Mobile: single page */}
        {isMobile ? (
          <AnimatePresence mode="wait">
            <motion.div
              key={`page-${leftPageIndex}`}
              className="w-full h-full relative"
              initial={isFlipping ? { rotateY: flipDirection === 'right' ? 90 : -90 } : { opacity: 0 }}
              animate={{ rotateY: 0, opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.4, ease: 'easeInOut' }}
              style={{ perspective: 1200 }}
            >
              <div className="absolute inset-0 translate-x-0.5 bg-gray-100 rounded-lg" />
              <div className="relative w-full h-full">
                {leftPage ? (
                  <NotebookPage
                    page={leftPage}
                    pageNumber={leftPageIndex + 1}
                    totalPages={filteredPages.length}
                    side="right"
                  />
                ) : (
                  <div className="w-full h-full bg-white rounded-lg flex flex-col items-center justify-center text-gray-300 gap-3">
                    <p className="font-caveat text-xl">Caderno vazio</p>
                    <button
                      onClick={() => addPage(activeSectionId || 'default')}
                      className="px-4 py-2 bg-pink-500 text-white rounded-lg hover:bg-pink-600 transition-colors text-sm font-medium"
                    >
                      + Adicionar pagina
                    </button>
                  </div>
                )}
              </div>
            </motion.div>
          </AnimatePresence>
        ) : (
          <>
            {/* Desktop: Left page */}
            <AnimatePresence mode="wait">
              <motion.div
                key={`left-${leftPageIndex}`}
                className="w-1/2 h-full relative"
                initial={isFlipping && flipDirection === 'left' ? { rotateY: -90 } : { opacity: 0 }}
                animate={{ rotateY: 0, opacity: 1 }}
                exit={flipDirection === 'right' ? { rotateY: 90, opacity: 0 } : { opacity: 0 }}
                transition={{ duration: 0.5, ease: 'easeInOut' }}
                style={{ transformOrigin: 'right center', perspective: 1200 }}
              >
                <div className="absolute inset-0 -translate-x-0.5 bg-gray-100 rounded-l-lg" />
                <div className="absolute inset-0 -translate-x-1 bg-gray-200 rounded-l-lg" />
                <div className="relative w-full h-full">
                  {leftPage ? (
                    <NotebookPage
                      page={leftPage}
                      pageNumber={leftPageIndex + 1}
                      totalPages={filteredPages.length}
                      side="left"
                    />
                  ) : (
                    <div className="w-full h-full bg-white rounded-l-lg flex items-center justify-center text-gray-300">
                      <p className="font-caveat text-xl">Caderno vazio</p>
                    </div>
                  )}
                </div>
              </motion.div>
            </AnimatePresence>

            {/* Desktop: Right page */}
            <AnimatePresence mode="wait">
              <motion.div
                key={`right-${rightPageIndex}`}
                className="w-1/2 h-full relative"
                initial={isFlipping && flipDirection === 'right' ? { rotateY: 90 } : { opacity: 0 }}
                animate={{ rotateY: 0, opacity: 1 }}
                exit={flipDirection === 'left' ? { rotateY: -90, opacity: 0 } : { opacity: 0 }}
                transition={{ duration: 0.5, ease: 'easeInOut' }}
                style={{ transformOrigin: 'left center', perspective: 1200 }}
              >
                <div className="absolute inset-0 translate-x-0.5 bg-gray-100 rounded-r-lg" />
                <div className="absolute inset-0 translate-x-1 bg-gray-200 rounded-r-lg" />
                <div className="relative w-full h-full">
                  {rightPage ? (
                    <NotebookPage
                      page={rightPage}
                      pageNumber={rightPageIndex + 1}
                      totalPages={filteredPages.length}
                      side="right"
                    />
                  ) : (
                    <div className="w-full h-full bg-white rounded-r-lg flex flex-col items-center justify-center text-gray-300 gap-3">
                      <p className="font-caveat text-xl">Pagina vazia</p>
                      <button
                        onClick={() => addPage(activeSectionId || 'default')}
                        className="px-4 py-2 bg-pink-500 text-white rounded-lg hover:bg-pink-600 transition-colors text-sm font-medium"
                      >
                        + Adicionar pagina
                      </button>
                    </div>
                  )}
                </div>
              </motion.div>
            </AnimatePresence>
          </>
        )}
      </motion.div>

      {/* Navigation */}
      <motion.div
        className="flex items-center gap-3 sm:gap-4"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
      >
        <button
          onClick={goPrevSpread}
          disabled={!canGoPrev}
          className="px-3 py-2 sm:px-5 sm:py-2.5 bg-white/20 backdrop-blur-sm text-white rounded-xl hover:bg-white/30 transition-all disabled:opacity-30 disabled:cursor-not-allowed font-medium text-sm"
        >
          &larr;
        </button>

        <div className="flex items-center gap-1.5 sm:gap-2 max-w-[200px] flex-wrap justify-center">
          {Array.from({ length: totalSpreads }).map((_, i) => (
            <button
              key={i}
              onClick={() => setCurrentPageIndex(i * pagesPerView)}
              className={`w-2 h-2 sm:w-2.5 sm:h-2.5 rounded-full transition-all ${
                i === spreadIndex
                  ? 'bg-white scale-125'
                  : 'bg-white/40 hover:bg-white/60'
              }`}
            />
          ))}
        </div>

        <button
          onClick={goNextSpread}
          disabled={!canGoNext}
          className="px-3 py-2 sm:px-5 sm:py-2.5 bg-white/20 backdrop-blur-sm text-white rounded-xl hover:bg-white/30 transition-all disabled:opacity-30 disabled:cursor-not-allowed font-medium text-sm"
        >
          &rarr;
        </button>
      </motion.div>
    </div>
  );
}
