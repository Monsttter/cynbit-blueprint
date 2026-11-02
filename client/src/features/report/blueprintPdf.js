import { createElement } from 'react';
import { pdf } from '@react-pdf/renderer';
import { PDFDocument, StandardFonts, rgb } from 'pdf-lib';
import { BlueprintPdfDocument } from './BlueprintPdf.jsx';

export async function createBlueprintPdf(report) {
  const layoutBlob = await pdf(createElement(BlueprintPdfDocument, { report })).toBlob();
  const document = await PDFDocument.load(await layoutBlob.arrayBuffer());
  const font = await document.embedFont(StandardFonts.Helvetica);
  const pages = document.getPages();
  pages.forEach((page, index) => {
    const label = `Page ${index + 1} of ${pages.length}`;
    const width = font.widthOfTextAtSize(label, 8);
    page.drawText(label, { x: page.getWidth() - 48 - width, y: 24, size: 8, font, color: rgb(0.48, 0.53, 0.49) });
  });
  const blob = new Blob([await document.save()], { type: 'application/pdf' });
  if (!blob.size || blob.type !== 'application/pdf') throw new Error('The PDF file could not be generated.');
  return blob;
}

export async function downloadBlueprintPdf(report) {
  const blob = await createBlueprintPdf(report);
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement('a');
  const safeTitle = report.blueprint.title.replace(/[^a-z0-9]+/gi, '-').replace(/^-|-$/g, '').toLowerCase() || 'project-blueprint';
  anchor.href = url;
  anchor.download = `${safeTitle}-blueprint.pdf`;
  anchor.style.display = 'none';
  document.body.appendChild(anchor);
  anchor.click();
  anchor.remove();
  window.setTimeout(() => URL.revokeObjectURL(url), 1000);
}
