import test from 'node:test';
import assert from 'node:assert/strict';
import { getDocument } from 'pdfjs-dist/legacy/build/pdf.mjs';
import { createBlueprintPdf } from './blueprintPdf.js';

const longRisk = `Verify data retention, access boundaries, backup recovery, and failure behavior for every workflow before launch. `.repeat(100);
const report = {
  reference: 'test-reference-0123456789',
  createdAt: '2026-11-01T00:00:00.000Z',
  generationSource: 'gemini',
  blueprint: {
    schemaVersion: '1.0', title: 'Field Operations Portal',
    executiveSummary: { project: 'A project for field teams.', problem: 'Manual coordination.', targetUsers: 'Field operators', expectedOutcome: 'More reliable operations.' },
    discoveryContext: [{ label: 'Target platforms', value: 'Responsive web', source: 'User-provided' }, { label: 'Client budget range', value: '₹5–15 lakh — client range', source: 'User-provided' }],
    functionalRequirements: [{ requirement: 'Shift dashboard', source: 'selected', status: 'User-provided' }, { requirement: 'Export reports', source: 'suggested', status: 'Inferred suggestion' }],
    userRoles: [{ role: 'Administrator', source: 'selected', suggestedPermissions: ['Manage users and settings.'] }],
    architecture: Object.fromEntries(['frontend', 'backend', 'database', 'hosting'].map((area) => [area, { recommendation: `${area} plan`, basis: 'Fits the described needs.' }])),
    technologyStack: [{ area: 'API', recommendation: 'Node.js with Express', reason: 'Fits the backend workflow.' }],
    integrations: { requested: ['CRM'], optionalSuggestions: ['Email notifications'] },
    complexity: { level: 'Medium', factors: ['Multiple roles'], note: 'Directional, not an effort estimate.' },
    risks: [{ title: 'Data retention', detail: longRisk }],
    developmentPhases: [{ name: '1. Discovery', activities: ['Confirm workflows.', 'Set acceptance criteria.'] }],
    openQuestions: ['Which regions must be supported?'],
    disclaimer: 'Preliminary planning suggestions only. Not an official proposal or quotation.',
  },
};

test('generates a multipage PDF with expected report content and page numbering', async () => {
  const blob = await createBlueprintPdf(report);
  assert.equal(blob.type, 'application/pdf');
  assert.ok(blob.size > 1000);
  const document = await getDocument({ data: new Uint8Array(await blob.arrayBuffer()), disableWorker: true, useSystemFonts: true }).promise;
  assert.ok(document.numPages > 1, 'long report should flow across pages');
  const extracted = [];
  for (let pageNumber = 1; pageNumber <= document.numPages; pageNumber += 1) {
    const page = await document.getPage(pageNumber);
    extracted.push((await page.getTextContent()).items.map((item) => item.str).join(' '));
  }
  const text = extracted.join('\n');
  for (const expected of ['Field Operations Portal', 'Executive summary', 'Functional requirements', 'Administrator', 'Recommended technical architecture', 'Node.js with Express', 'Complexity assessment', 'Data retention', 'Suggested development phases', 'Open questions', 'AI-ASSISTED SUGGESTIONS', 'Preliminary planning suggestions only', 'INR 5-15 lakh - client range', `Page ${document.numPages} of ${document.numPages}`]) {
    assert.ok(text.includes(expected), `PDF should contain: ${expected}`);
  }
  extracted.forEach((page, index) => {
    assert.ok(page.includes(`Page ${index + 1} of ${document.numPages}`), `page ${index + 1} should be numbered`);
    assert.ok(page.replace(/Reference:.*$/, '').length > 80, `page ${index + 1} should contain report content`);
  });
  await document.destroy?.();
});
