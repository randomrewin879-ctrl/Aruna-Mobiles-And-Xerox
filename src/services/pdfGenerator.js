import html2canvas from 'html2canvas';
import { jsPDF } from 'jspdf';
import { sanitizeFileName } from '../utils/financials';
export const exportInvoiceToPdf = async (containerElement, invoiceNumber = 'invoice') => {
  if (!containerElement) {
    throw new Error('Container element not found for PDF generation');
  }
  const images = Array.from(containerElement.querySelectorAll('img'));
  await Promise.all(
    images.map(img => {
      if (img.complete) return Promise.resolve();
      return new Promise(resolve => {
        img.onload = resolve;
        img.onerror = resolve;
      });
    })
  );
  const pages = containerElement.querySelectorAll('.invoice-page-sheet');
  const sheets = pages.length > 0 ? Array.from(pages) : [containerElement];
  const pdf = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4',
    compress: true
  });
  const pdfWidth = 210;
  const pdfHeight = 297;
  for (let i = 0; i < sheets.length; i++) {
    const sheet = sheets[i];
    const canvas = await html2canvas(sheet, {
      scale: 2.5,
      useCORS: true,
      allowTaint: true,
      logging: false,
      backgroundColor: '#ffffff',
      windowWidth: 794,
      scrollX: 0,
      scrollY: 0,
      onclone: (clonedDoc) => {
        const scaledInners = clonedDoc.querySelectorAll('.preview-scaled-inner');
        scaledInners.forEach(el => {
          el.style.transform = 'none';
          el.style.position = 'static';
          el.style.width = '794px';
        });
        const scaledBoxes = clonedDoc.querySelectorAll('.preview-scaled-box');
        scaledBoxes.forEach(el => {
          el.style.width = '794px';
          el.style.transform = 'none';
          el.style.position = 'static';
        });
        const viewports = clonedDoc.querySelectorAll('.preview-scroll-viewport');
        viewports.forEach(el => {
          el.style.overflow = 'visible';
        });
        const clonedSheets = clonedDoc.querySelectorAll('.invoice-page-sheet');
        clonedSheets.forEach(s => {
          s.style.boxShadow = 'none';
          s.style.margin = '0';
          s.style.width = '794px';
        });
      }
    });
    const imgData = canvas.toDataURL('image/jpeg', 0.98);
    if (i > 0) {
      pdf.addPage('a4', 'portrait');
    }
    const imgHeight = (canvas.height * pdfWidth) / canvas.width;
    pdf.addImage(imgData, 'JPEG', 0, 0, pdfWidth, Math.min(imgHeight, pdfHeight), undefined, 'FAST');
  }
  const cleanName = sanitizeFileName(invoiceNumber);
  pdf.save(`${cleanName}.pdf`);
  return true;
};