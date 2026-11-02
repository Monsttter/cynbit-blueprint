import React from 'react';
import { Document, Page, StyleSheet, Text, View } from '@react-pdf/renderer';

const pdfText = (value) => String(value ?? '')
  .replaceAll('₹', 'INR ')
  .replace(/[\u2010-\u2015]/g, '-')
  .replace(/[“”]/g, '"')
  .replace(/[‘’]/g, "'")
  .replaceAll('\u00a0', ' ')
  .replaceAll('…', '...');

const styles = StyleSheet.create({
  page: { paddingTop: 62, paddingBottom: 56, paddingHorizontal: 48, fontFamily: 'Helvetica', fontSize: 9, lineHeight: 1.5, color: '#34433a', backgroundColor: '#ffffff' },
  runningHeader: { position: 'absolute', top: 25, left: 48, right: 48, paddingBottom: 8, borderBottomWidth: 1, borderBottomColor: '#e2e9df', color: '#617266', fontSize: 8, letterSpacing: 1.2 },
  footer: { position: 'absolute', bottom: 24, left: 48, right: 48, paddingTop: 8, borderTopWidth: 1, borderTopColor: '#e2e9df', color: '#7b877e', fontSize: 8 },
  kicker: { color: '#69816b', fontSize: 8, fontWeight: 700, letterSpacing: 1.5, marginBottom: 8 },
  title: { color: '#203a34', fontSize: 25, lineHeight: 1.15, fontWeight: 700, marginBottom: 7 },
  meta: { color: '#718077', fontSize: 8, marginBottom: 4 },
  source: { alignSelf: 'flex-start', marginTop: 8, marginBottom: 18, paddingVertical: 4, paddingHorizontal: 8, backgroundColor: '#edf3e9', color: '#456149', fontSize: 8, fontWeight: 700 },
  section: { marginTop: 14, paddingTop: 11, borderTopWidth: 1, borderTopColor: '#e8ede6' },
  sectionTitle: { marginBottom: 8, color: '#203a34', fontSize: 13, fontWeight: 700 },
  subsectionTitle: { marginTop: 6, marginBottom: 4, color: '#344a3d', fontSize: 9, fontWeight: 700 },
  paragraph: { marginBottom: 5, lineHeight: 1.55 },
  keyValue: { marginBottom: 7 },
  label: { marginBottom: 2, color: '#79867d', fontSize: 7, fontWeight: 700, letterSpacing: 0.8, textTransform: 'uppercase' },
  listItem: { flexDirection: 'row', alignItems: 'flex-start', marginBottom: 5, paddingLeft: 4 },
  bullet: { width: 12, color: '#718b6b', fontWeight: 700 },
  itemContent: { flexGrow: 1, flexShrink: 1 },
  itemTitle: { color: '#364b3e', fontWeight: 700 },
  itemMeta: { color: '#76827a', fontSize: 8 },
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  gridCell: { width: '48%', padding: 8, backgroundColor: '#f6f8f4', borderRadius: 3 },
  recommendation: { marginBottom: 8, padding: 8, borderWidth: 1, borderColor: '#e7ece5', borderRadius: 3 },
  phase: { marginBottom: 8, paddingLeft: 9, borderLeftWidth: 2, borderLeftColor: '#9caf90' },
  disclaimer: { marginTop: 18, padding: 10, backgroundColor: '#f0f4ec', color: '#46564a', fontSize: 8 },
});

function PageFrame({ children, reference }) {
  return <Page size="A4" style={styles.page} wrap><Text fixed style={styles.runningHeader}>CYNBIT BLUEPRINT  /  PRELIMINARY PROJECT PLAN</Text>{children}<View fixed style={styles.footer}><Text>Reference: {reference}</Text></View></Page>;
}

function Section({ title, children, keepTogether = false, breakBefore = false }) {
  return <View break={breakBefore} wrap={!keepTogether} style={styles.section}><Text style={styles.sectionTitle}>{title}</Text>{children}</View>;
}

function BulletList({ items = [] }) {
  if (!items.length) return <Text style={styles.itemMeta}>No details provided.</Text>;
  return items.map((item, index) => {
    const label = typeof item === 'string' ? item : item.requirement || item.role || item.title || item.name || item.area;
    return <View key={`${index}-${label}`} style={styles.listItem}>
      <Text style={styles.bullet}>-</Text>
      <View style={styles.itemContent}>
        <Text style={styles.itemTitle}>{pdfText(label)}</Text>
        {item?.status && <Text style={styles.itemMeta}>{pdfText(item.status)}</Text>}
        {item?.detail && <Text style={styles.paragraph}>{pdfText(item.detail)}</Text>}
        {item?.reason && <Text style={styles.itemMeta}>{pdfText(item.reason)}</Text>}
        {item?.suggestedPermissions?.map((permission) => <Text key={permission} style={styles.itemMeta}>Suggested permissions: {pdfText(permission)}</Text>)}
        {item?.activities && <BulletList items={item.activities} />}
      </View>
    </View>;
  });
}

function KeyValue({ label, value }) {
  if (!value) return null;
  return <View style={styles.keyValue}><Text style={styles.label}>{pdfText(label)}</Text><Text>{pdfText(value)}</Text></View>;
}

export function BlueprintPdfDocument({ report }) {
  const { blueprint, reference, createdAt, generationSource } = report;
  const summary = blueprint.executiveSummary;
  return <Document title={`${blueprint.title} - Project Blueprint`} author="Cynbit Blueprint" subject="Preliminary technical planning document">
    <PageFrame reference={reference}>
      <Text style={styles.kicker}>PROJECT BLUEPRINT  /  {blueprint.schemaVersion}</Text>
      <Text style={styles.title}>{pdfText(blueprint.title)}</Text>
      <Text style={styles.meta}>Reference: {pdfText(reference)}</Text>
      <Text style={styles.meta}>Created: {new Date(createdAt).toLocaleDateString('en-IN', { dateStyle: 'long', timeZone: 'UTC' })}</Text>
      <Text style={styles.source}>{generationSource === 'gemini' ? 'AI-ASSISTED SUGGESTIONS' : 'RULES-BASED SUGGESTIONS'}</Text>

      <Section title="Executive summary"><Text style={styles.paragraph}>{pdfText(summary.project)}</Text><KeyValue label="Problem" value={summary.problem} /><KeyValue label="Target users" value={summary.targetUsers} /><KeyValue label="Expected outcome" value={summary.expectedOutcome} /></Section>
      {blueprint.discoveryContext?.length > 0 && <Section title="Submitted project context"><Text style={styles.itemMeta}>User-provided details; confirm before implementation.</Text><View style={styles.grid}>{blueprint.discoveryContext.map((item) => <View key={item.label} style={styles.gridCell}><Text style={styles.label}>{pdfText(item.label)}</Text><Text>{pdfText(item.value)}</Text></View>)}</View></Section>}
      <Section title="Functional requirements"><BulletList items={blueprint.functionalRequirements} /></Section>
      <Section title="User roles and permissions"><BulletList items={blueprint.userRoles} /></Section>
      <Section title="Recommended technical architecture" keepTogether breakBefore>{Object.entries(blueprint.architecture).map(([area, recommendation]) => <View wrap={false} key={area} style={styles.recommendation}><Text style={styles.label}>{area}</Text><Text style={styles.itemTitle}>{pdfText(recommendation.recommendation)}</Text><Text style={styles.itemMeta}>{pdfText(recommendation.basis)}</Text></View>)}</Section>
      <Section title="Technology stack" keepTogether>{blueprint.technologyStack.map((item) => <View wrap={false} key={item.area} style={styles.recommendation}><Text style={styles.label}>{pdfText(item.area)}</Text><Text style={styles.itemTitle}>{pdfText(item.recommendation)}</Text><Text style={styles.itemMeta}>{pdfText(item.reason)}</Text></View>)}</Section>
      <Section title="Integrations"><Text style={styles.subsectionTitle}>Requested</Text><BulletList items={blueprint.integrations.requested} /><Text style={styles.subsectionTitle}>Optional suggestions</Text><BulletList items={blueprint.integrations.optionalSuggestions} /></Section>
      <Section title="Complexity assessment"><Text style={styles.itemTitle}>{blueprint.complexity.level} complexity</Text><Text style={styles.paragraph}>{blueprint.complexity.note}</Text><BulletList items={blueprint.complexity.factors} /></Section>
      <Section title="Risks and considerations" breakBefore><BulletList items={blueprint.risks} /></Section>
      <Section title="Suggested development phases"><BulletList items={blueprint.developmentPhases} /></Section>
      <Section title="Open questions"><BulletList items={blueprint.openQuestions} /></Section>
      <Text style={styles.disclaimer}>{pdfText(blueprint.disclaimer)}</Text>
    </PageFrame>
  </Document>;
}
