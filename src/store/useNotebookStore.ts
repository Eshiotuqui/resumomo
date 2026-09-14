import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { v4 as uuidv4 } from 'uuid';
import type { NotebookState, LineStyle, PostIt } from '../types';

export const useNotebookStore = create<NotebookState>()(
  persist(
    (set, get) => ({
      sections: [
        { id: 'default', name: 'Geral', color: '#f87171', order: 0 },
      ],
      pages: [
        {
          id: uuidv4(),
          title: 'Minha primeira anotacao',
          content: '',
          lineStyle: 'light' as LineStyle,
          textColor: '#1e293b',
          fontSize: 18,
          sectionId: 'default',
          postIts: [],
          order: 0,
        },
      ],
      deskPostIts: [],
      currentPageIndex: 0,
      isFlipping: false,
      flipDirection: null,
      sidebarOpen: false,
      showSummary: false,
      activeSectionId: null,

      addSection: (name: string) => set((state) => ({
        sections: [...state.sections, {
          id: uuidv4(),
          name,
          color: `hsl(${Math.random() * 360}, 70%, 60%)`,
          order: state.sections.length,
        }],
      })),

      removeSection: (id: string) => set((state) => ({
        sections: state.sections.filter((s) => s.id !== id),
        pages: state.pages.map((p) =>
          p.sectionId === id ? { ...p, sectionId: 'default' } : p
        ),
      })),

      renameSection: (id: string, name: string) => set((state) => ({
        sections: state.sections.map((s) =>
          s.id === id ? { ...s, name } : s
        ),
      })),

      setSectionColor: (id: string, color: string) => set((state) => ({
        sections: state.sections.map((s) =>
          s.id === id ? { ...s, color } : s
        ),
      })),

      addPage: (sectionId: string) => set((state) => {
        const sectionPages = state.pages.filter((p) => p.sectionId === sectionId);
        const newPage = {
          id: uuidv4(),
          title: '',
          content: '',
          lineStyle: 'light' as LineStyle,
          textColor: '#1e293b',
          fontSize: 18,
          sectionId,
          postIts: [],
          order: sectionPages.length,
        };
        const newPages = [...state.pages, newPage];
        const filtered = state.activeSectionId
          ? newPages.filter((p) => p.sectionId === state.activeSectionId)
          : newPages;
        return {
          pages: newPages,
          currentPageIndex: filtered.length - 1,
        };
      }),

      removePage: (id: string) => set((state) => {
        const newPages = state.pages.filter((p) => p.id !== id);
        return {
          pages: newPages,
          currentPageIndex: Math.min(state.currentPageIndex, Math.max(0, newPages.length - 1)),
        };
      }),

      updatePageContent: (id: string, content: string) => set((state) => ({
        pages: state.pages.map((p) =>
          p.id === id ? { ...p, content } : p
        ),
      })),

      updatePageTitle: (id: string, title: string) => set((state) => ({
        pages: state.pages.map((p) =>
          p.id === id ? { ...p, title } : p
        ),
      })),

      setPageLineStyle: (id: string, style: LineStyle) => set((state) => ({
        pages: state.pages.map((p) =>
          p.id === id ? { ...p, lineStyle: style } : p
        ),
      })),

      setPageTextColor: (id: string, color: string) => set((state) => ({
        pages: state.pages.map((p) =>
          p.id === id ? { ...p, textColor: color } : p
        ),
      })),

      setPageFontSize: (id: string, size: number) => set((state) => ({
        pages: state.pages.map((p) =>
          p.id === id ? { ...p, fontSize: size } : p
        ),
      })),

      movePage: (pageId: string, targetSectionId: string) => set((state) => ({
        pages: state.pages.map((p) =>
          p.id === pageId ? { ...p, sectionId: targetSectionId } : p
        ),
      })),

      reorderPages: (sectionId: string, startIndex: number, endIndex: number) => set((state) => {
        const sectionPages = state.pages
          .filter((p) => p.sectionId === sectionId)
          .sort((a, b) => a.order - b.order);
        const otherPages = state.pages.filter((p) => p.sectionId !== sectionId);
        const [moved] = sectionPages.splice(startIndex, 1);
        sectionPages.splice(endIndex, 0, moved);
        const reordered = sectionPages.map((p, i) => ({ ...p, order: i }));
        return { pages: [...otherPages, ...reordered] };
      }),

      addPostIt: (pageId: string) => set((state) => ({
        pages: state.pages.map((p) =>
          p.id === pageId
            ? {
                ...p,
                postIts: [...p.postIts, {
                  id: uuidv4(),
                  content: '',
                  color: '#fef08a',
                  x: 50 + Math.random() * 100,
                  y: 50 + Math.random() * 100,
                  width: 150,
                  height: 120,
                }],
              }
            : p
        ),
      })),

      removePostIt: (pageId: string, postItId: string) => set((state) => ({
        pages: state.pages.map((p) =>
          p.id === pageId
            ? { ...p, postIts: p.postIts.filter((pi) => pi.id !== postItId) }
            : p
        ),
      })),

      updatePostIt: (pageId: string, postItId: string, updates: Partial<PostIt>) => set((state) => ({
        pages: state.pages.map((p) =>
          p.id === pageId
            ? {
                ...p,
                postIts: p.postIts.map((pi) =>
                  pi.id === postItId ? { ...pi, ...updates } : pi
                ),
              }
            : p
        ),
      })),

      addDeskPostIt: () => set((state) => ({
        deskPostIts: [...state.deskPostIts, {
          id: uuidv4(),
          content: '',
          color: '#fef08a',
          x: 80 + Math.random() * 200,
          y: 80 + Math.random() * 150,
          width: 170,
          height: 140,
        }],
      })),

      removeDeskPostIt: (id: string) => set((state) => ({
        deskPostIts: state.deskPostIts.filter((p) => p.id !== id),
      })),

      updateDeskPostIt: (id: string, updates: Partial<PostIt>) => set((state) => ({
        deskPostIts: state.deskPostIts.map((p) =>
          p.id === id ? { ...p, ...updates } : p
        ),
      })),

      setCurrentPageIndex: (index: number) => set({ currentPageIndex: index }),

      nextPage: () => {
        const state = get();
        const pages = state.getFilteredPages();
        if (state.currentPageIndex < pages.length - 1) {
          set({
            isFlipping: true,
            flipDirection: 'right',
            currentPageIndex: state.currentPageIndex + 1,
          });
          setTimeout(() => set({ isFlipping: false, flipDirection: null }), 600);
        }
      },

      prevPage: () => {
        const state = get();
        if (state.currentPageIndex > 0) {
          set({
            isFlipping: true,
            flipDirection: 'left',
            currentPageIndex: state.currentPageIndex - 1,
          });
          setTimeout(() => set({ isFlipping: false, flipDirection: null }), 600);
        }
      },

      setFlipping: (flipping, direction) => set({ isFlipping: flipping, flipDirection: direction }),
      toggleSidebar: () => set((state) => ({ sidebarOpen: !state.sidebarOpen })),
      setShowSummary: (show) => set({ showSummary: show }),
      setActiveSectionId: (id) => set({ activeSectionId: id, currentPageIndex: 0 }),

      getFilteredPages: () => {
        const state = get();
        const filtered = state.activeSectionId
          ? state.pages.filter((p) => p.sectionId === state.activeSectionId)
          : state.pages;
        return filtered.sort((a, b) => a.order - b.order);
      },
    }),
    {
      name: 'caderno-momo-storage',
    }
  )
);
