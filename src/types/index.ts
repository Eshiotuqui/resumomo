export type LineStyle = 'dark' | 'light' | 'dots' | 'none';

export interface PostIt {
  id: string;
  content: string;
  color: string;
  x: number;
  y: number;
  width: number;
  height: number;
}

export interface Page {
  id: string;
  title: string;
  content: string;
  lineStyle: LineStyle;
  textColor: string;
  fontSize: number;
  sectionId: string;
  postIts: PostIt[];
  order: number;
}

export interface Section {
  id: string;
  name: string;
  color: string;
  order: number;
}

export interface MindMapNode {
  id: string;
  label: string;
  x: number;
  y: number;
  color: string;
  size: 'root' | 'section' | 'topic' | 'keyword';
  children: string[];
}

export interface NotebookState {
  sections: Section[];
  pages: Page[];
  deskPostIts: PostIt[];
  currentPageIndex: number;
  isFlipping: boolean;
  flipDirection: 'left' | 'right' | null;
  sidebarOpen: boolean;
  showSummary: boolean;
  activeSectionId: string | null;

  // Actions
  addSection: (name: string) => void;
  removeSection: (id: string) => void;
  renameSection: (id: string, name: string) => void;
  setSectionColor: (id: string, color: string) => void;

  addPage: (sectionId: string) => void;
  removePage: (id: string) => void;
  updatePageContent: (id: string, content: string) => void;
  updatePageTitle: (id: string, title: string) => void;
  setPageLineStyle: (id: string, style: LineStyle) => void;
  setPageTextColor: (id: string, color: string) => void;
  setPageFontSize: (id: string, size: number) => void;
  movePage: (pageId: string, targetSectionId: string) => void;
  reorderPages: (sectionId: string, startIndex: number, endIndex: number) => void;

  addPostIt: (pageId: string) => void;
  removePostIt: (pageId: string, postItId: string) => void;
  updatePostIt: (pageId: string, postItId: string, updates: Partial<PostIt>) => void;

  addDeskPostIt: () => void;
  removeDeskPostIt: (id: string) => void;
  updateDeskPostIt: (id: string, updates: Partial<PostIt>) => void;

  setCurrentPageIndex: (index: number) => void;
  nextPage: () => void;
  prevPage: () => void;
  setFlipping: (flipping: boolean, direction: 'left' | 'right' | null) => void;
  toggleSidebar: () => void;
  setShowSummary: (show: boolean) => void;
  setActiveSectionId: (id: string | null) => void;

  getFilteredPages: () => Page[];
}
