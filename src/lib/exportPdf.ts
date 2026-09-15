import html2canvas from 'html2canvas';
import { jsPDF } from 'jspdf';
import type { Page, Section, PostIt } from '../types';

const PAGE_WIDTH = 595; // A4 width in points
const PAGE_HEIGHT = 842; // A4 height in points
const MARGIN = 30;
const LINE_HEIGHT = 22;

function hexToRgb(hex: string): [number, number, number] {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return result
    ? [parseInt(result[1], 16), parseInt(result[2], 16), parseInt(result[3], 16)]
    : [30, 41, 59];
}

function drawPageLines(pdf: jsPDF, lineStyle: string, startY: number) {
  const contentWidth = PAGE_WIDTH - MARGIN * 2;

  if (lineStyle === 'none') return;

  if (lineStyle === 'dots') {
    pdf.setFillColor(200, 200, 200);
    for (let y = startY; y < PAGE_HEIGHT - MARGIN; y += 20) {
      for (let x = MARGIN; x < PAGE_WIDTH - MARGIN; x += 20) {
        pdf.circle(x, y, 0.5, 'F');
      }
    }
    return;
  }

  const gray = lineStyle === 'dark' ? 150 : 220;
  pdf.setDrawColor(gray, gray, gray);
  pdf.setLineWidth(0.3);
  for (let y = startY; y < PAGE_HEIGHT - MARGIN; y += LINE_HEIGHT) {
    pdf.line(MARGIN, y, MARGIN + contentWidth, y);
  }
}

function drawPostIt(pdf: jsPDF, postIt: PostIt, offsetX: number, offsetY: number) {
  const rgb = hexToRgb(postIt.color);
  const w = Math.min(postIt.width * 0.4, 120);
  const h = Math.min(postIt.height * 0.4, 100);
  const x = offsetX + postIt.x * 0.35;
  const y = offsetY + postIt.y * 0.25;

  // Shadow
  pdf.setFillColor(180, 180, 180);
  pdf.rect(x + 2, y + 2, w, h, 'F');

  // Post-it body
  pdf.setFillColor(rgb[0], rgb[1], rgb[2]);
  pdf.rect(x, y, w, h, 'F');

  // Border
  pdf.setDrawColor(rgb[0] * 0.8, rgb[1] * 0.8, rgb[2] * 0.8);
  pdf.setLineWidth(0.3);
  pdf.rect(x, y, w, h, 'S');

  // Text
  if (postIt.content.trim()) {
    pdf.setFontSize(8);
    pdf.setTextColor(60, 60, 60);
    const lines = pdf.splitTextToSize(postIt.content, w - 8);
    pdf.text(lines.slice(0, 8), x + 4, y + 10);
  }
}

function drawRedMargin(pdf: jsPDF) {
  pdf.setDrawColor(255, 150, 150);
  pdf.setLineWidth(0.5);
  pdf.line(MARGIN + 40, MARGIN, MARGIN + 40, PAGE_HEIGHT - MARGIN);
}

export function exportNotebookToPdf(
  pages: Page[],
  sections: Section[],
  deskPostIts: PostIt[]
) {
  const pdf = new jsPDF({ orientation: 'portrait', unit: 'pt', format: 'a4' });

  // === COVER PAGE ===
  // Pink gradient background
  pdf.setFillColor(236, 72, 153);
  pdf.rect(0, 0, PAGE_WIDTH, PAGE_HEIGHT, 'F');

  // Darker spine
  pdf.setFillColor(190, 50, 120);
  pdf.rect(0, 0, 40, PAGE_HEIGHT, 'F');

  // Spiral holes
  pdf.setFillColor(150, 150, 150);
  for (let i = 0; i < 14; i++) {
    const y = 50 + i * ((PAGE_HEIGHT - 100) / 13);
    pdf.circle(20, y, 6, 'F');
    pdf.setFillColor(200, 200, 200);
    pdf.circle(20, y, 4, 'F');
    pdf.setFillColor(150, 150, 150);
  }

  // Decorative lines
  pdf.setDrawColor(255, 255, 255);
  pdf.setLineWidth(1);
  const cx = PAGE_WIDTH / 2 + 10;
  pdf.line(cx - 80, 320, cx + 80, 320);
  pdf.line(cx - 80, 470, cx + 80, 470);

  // Title
  pdf.setTextColor(255, 255, 255);
  pdf.setFontSize(48);
  pdf.setFont('helvetica', 'italic');
  pdf.text('Resumo', cx, 380, { align: 'center' });
  pdf.setFontSize(36);
  pdf.text('do Momo', cx, 430, { align: 'center' });

  // Corner decorations
  pdf.setDrawColor(255, 255, 255);
  pdf.setLineWidth(1.5);
  // Top-right
  pdf.line(PAGE_WIDTH - 50, 40, PAGE_WIDTH - 50, 75);
  pdf.line(PAGE_WIDTH - 85, 40, PAGE_WIDTH - 50, 40);
  // Bottom-right
  pdf.line(PAGE_WIDTH - 50, PAGE_HEIGHT - 40, PAGE_WIDTH - 50, PAGE_HEIGHT - 75);
  pdf.line(PAGE_WIDTH - 85, PAGE_HEIGHT - 40, PAGE_WIDTH - 50, PAGE_HEIGHT - 40);

  // === CONTENT PAGES ===
  pages.forEach((page) => {
    pdf.addPage();

    // White background
    pdf.setFillColor(255, 255, 255);
    pdf.rect(0, 0, PAGE_WIDTH, PAGE_HEIGHT, 'F');

    // Spiral holes column
    pdf.setFillColor(245, 245, 245);
    pdf.rect(0, 0, MARGIN + 10, PAGE_HEIGHT, 'F');
    pdf.setDrawColor(220, 220, 220);
    pdf.line(MARGIN + 10, 0, MARGIN + 10, PAGE_HEIGHT);

    for (let i = 0; i < 14; i++) {
      const y = 40 + i * ((PAGE_HEIGHT - 80) / 13);
      pdf.setFillColor(220, 220, 220);
      pdf.circle(15, y, 5, 'F');
      pdf.setFillColor(245, 245, 245);
      pdf.circle(15, y, 3, 'F');
    }

    // Red margin
    drawRedMargin(pdf);

    // Page lines
    const contentStartY = MARGIN + 50;
    drawPageLines(pdf, page.lineStyle, contentStartY);

    // Section badge
    const section = sections.find((s) => s.id === page.sectionId);
    if (section) {
      const sectionColor = hexToRgb(section.color);
      pdf.setFillColor(sectionColor[0], sectionColor[1], sectionColor[2]);
      pdf.roundedRect(MARGIN + 45, MARGIN - 5, pdf.getTextWidth(section.name) * 0.9 + 16, 18, 9, 9, 'F');
      pdf.setFontSize(9);
      pdf.setTextColor(255, 255, 255);
      pdf.setFont('helvetica', 'bold');
      pdf.text(section.name, MARGIN + 53, MARGIN + 8);
    }

    // Title
    const titleColor = hexToRgb(page.textColor);
    pdf.setTextColor(titleColor[0], titleColor[1], titleColor[2]);
    pdf.setFontSize(20);
    pdf.setFont('helvetica', 'bold');
    pdf.text(page.title || 'Sem titulo', MARGIN + 45, MARGIN + 35);

    // Content
    pdf.setFontSize(Math.min(page.fontSize * 0.7, 14));
    pdf.setFont('helvetica', 'normal');
    pdf.setTextColor(titleColor[0], titleColor[1], titleColor[2]);

    const textWidth = PAGE_WIDTH - MARGIN * 2 - 50;
    const lines = pdf.splitTextToSize(page.content || '', textWidth);

    let curY = contentStartY;
    for (const line of lines) {
      if (curY > PAGE_HEIGHT - MARGIN - 30) {
        // Overflow - add continuation page
        pdf.addPage();
        pdf.setFillColor(255, 255, 255);
        pdf.rect(0, 0, PAGE_WIDTH, PAGE_HEIGHT, 'F');
        drawPageLines(pdf, page.lineStyle, MARGIN + 10);
        drawRedMargin(pdf);
        curY = MARGIN + 10;
      }
      pdf.text(line, MARGIN + 45, curY);
      curY += LINE_HEIGHT;
    }

    // Post-its on this page
    page.postIts.forEach((postIt) => {
      drawPostIt(pdf, postIt, MARGIN + 45, contentStartY);
    });

    // Page number
    pdf.setFontSize(9);
    pdf.setTextColor(180, 180, 180);
    pdf.setFont('helvetica', 'italic');
    const pageNum = pages.indexOf(page) + 1;
    pdf.text(
      `${pageNum} / ${pages.length}`,
      PAGE_WIDTH - MARGIN,
      PAGE_HEIGHT - 15,
      { align: 'right' }
    );
  });

  // === DESK POST-ITS PAGE ===
  if (deskPostIts.length > 0) {
    pdf.addPage();

    // Background
    pdf.setFillColor(248, 248, 255);
    pdf.rect(0, 0, PAGE_WIDTH, PAGE_HEIGHT, 'F');

    // Title
    pdf.setFontSize(24);
    pdf.setFont('helvetica', 'italic');
    pdf.setTextColor(100, 100, 140);
    pdf.text('Bancada de Estudo', PAGE_WIDTH / 2, 50, { align: 'center' });

    // Subtitle
    pdf.setFontSize(11);
    pdf.setTextColor(160, 160, 180);
    pdf.text('Post-its da bancada', PAGE_WIDTH / 2, 70, { align: 'center' });

    // Grid layout for desk post-its
    const cols = 3;
    const cellW = (PAGE_WIDTH - MARGIN * 2) / cols;
    const cellH = 140;

    deskPostIts.forEach((postIt, i) => {
      const col = i % cols;
      const row = Math.floor(i / cols);
      const x = MARGIN + col * cellW + 10;
      const y = 90 + row * (cellH + 15);

      if (y + cellH > PAGE_HEIGHT - MARGIN) {
        pdf.addPage();
        pdf.setFillColor(248, 248, 255);
        pdf.rect(0, 0, PAGE_WIDTH, PAGE_HEIGHT, 'F');
      }

      const finalY = y > PAGE_HEIGHT - MARGIN - cellH ? 50 : y;

      // Shadow
      const rgb = hexToRgb(postIt.color);
      pdf.setFillColor(190, 190, 190);
      pdf.rect(x + 2, finalY + 2, cellW - 20, cellH - 10, 'F');

      // Body
      pdf.setFillColor(rgb[0], rgb[1], rgb[2]);
      pdf.rect(x, finalY, cellW - 20, cellH - 10, 'F');

      // Border
      pdf.setDrawColor(rgb[0] * 0.85, rgb[1] * 0.85, rgb[2] * 0.85);
      pdf.setLineWidth(0.5);
      pdf.rect(x, finalY, cellW - 20, cellH - 10, 'S');

      // Tape
      pdf.setFillColor(255, 255, 220);
      const tapeX = x + (cellW - 20) / 2 - 20;
      pdf.rect(tapeX, finalY - 5, 40, 10, 'F');

      // Text
      if (postIt.content.trim()) {
        pdf.setFontSize(10);
        pdf.setTextColor(60, 60, 60);
        pdf.setFont('helvetica', 'normal');
        const textLines = pdf.splitTextToSize(postIt.content, cellW - 35);
        pdf.text(textLines.slice(0, 9), x + 8, finalY + 16);
      }
    });
  }

  // Save
  pdf.save('caderno-do-momo.pdf');
}

// Screenshot-based export of the entire viewport
export async function exportScreenToPdf() {
  const root = document.getElementById('root');
  if (!root) return;

  // Temporarily make the page scrollable and full-size for capture
  document.body.style.overflow = 'visible';
  root.style.overflow = 'visible';
  root.style.height = 'auto';

  const canvas = await html2canvas(root, {
    scale: 2,
    useCORS: true,
    allowTaint: true,
    backgroundColor: null,
    width: window.innerWidth,
    height: window.innerHeight,
  });

  // Restore
  document.body.style.overflow = 'hidden';
  root.style.overflow = 'hidden';
  root.style.height = '100vh';

  const imgData = canvas.toDataURL('image/png');
  const pdf = new jsPDF({
    orientation: canvas.width > canvas.height ? 'landscape' : 'portrait',
    unit: 'px',
    format: [canvas.width, canvas.height],
  });

  pdf.addImage(imgData, 'PNG', 0, 0, canvas.width, canvas.height);
  pdf.save('caderno-do-momo-screenshot.pdf');
}
