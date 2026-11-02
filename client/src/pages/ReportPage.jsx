import { useEffect, useState } from 'react';
import { Alert, Button, Chip, CircularProgress, Container, Paper, Typography } from '@mui/material';
import { Link, useParams } from 'react-router-dom';
import SectionEyebrow from '../components/SectionEyebrow.jsx';
import { fetchBlueprint } from '../services/blueprintApi.js';
import './report.css';

function ReportSection({ number, title, children }) {
  return <section className="report-section"><div className="report-section-number">{number}</div><div className="report-section-content"><Typography component="h2" variant="h5">{title}</Typography>{children}</div></section>;
}

function Bullets({ items }) {
  if (!items?.length) return <Typography color="text.secondary">No details were provided for this section.</Typography>;
  return <ul className="report-list">{items.map((item, index) => <li key={`${index}-${typeof item === 'string' ? item : item.requirement || item.name || item.title}`}>
    {typeof item === 'string' ? item : <><strong>{item.requirement || item.name || item.title}</strong>{item.status && <Chip size="small" label={item.status} variant="outlined" />}{item.detail && <p>{item.detail}</p>}{item.activities && <ul>{item.activities.map((activity) => <li key={activity}>{activity}</li>)}</ul>}{item.suggestedPermissions && <p className="muted">Suggested permissions: {item.suggestedPermissions.join(' ')}</p>}</>}
  </li>)}</ul>;
}

export default function ReportPage() {
  const { reference } = useParams();
  const [result, setResult] = useState(null);
  const [status, setStatus] = useState('loading');
  const [attempt, setAttempt] = useState(0);
  const [pdfState, setPdfState] = useState('idle');
  const [pdfError, setPdfError] = useState('');
  useEffect(() => {
    const controller = new AbortController();
    setStatus('loading');
    fetchBlueprint(reference, controller.signal).then((data) => { setResult(data); setStatus('success'); }).catch((error) => {
      if (error.name === 'AbortError') return;
      setResult(null); setStatus(error.status === 404 ? 'not-found' : 'error');
    });
    return () => controller.abort();
  }, [reference, attempt]);

  if (status !== 'success') return <Container maxWidth="md" className="report-state"><Paper className="report-state-card">
    {status === 'loading' ? <><CircularProgress size={28} aria-label="Loading blueprint" /><Typography component="h1" variant="h5">Loading your blueprint</Typography><Typography color="text.secondary">Retrieving the report for this reference.</Typography></> : <><SectionEyebrow>{status === 'not-found' ? 'REFERENCE NOT FOUND' : 'COULD NOT LOAD REPORT'}</SectionEyebrow><Typography component="h1" variant="h4">{status === 'not-found' ? 'This blueprint could not be found.' : 'Your report is temporarily unavailable.'}</Typography><Typography color="text.secondary">{status === 'not-found' ? 'Check the reference URL or start a new project discovery.' : 'Check your connection and try again. This page can be refreshed at any time.'}</Typography>{status !== 'not-found' && <Button variant="outlined" onClick={() => setAttempt((value) => value + 1)}>Try again</Button>}<Button component={Link} to="/discover" variant="contained">Start a discovery</Button></>}
  </Paper></Container>;

  const { blueprint, createdAt } = result;
  const downloadPdf = async () => {
    if (pdfState === 'loading') return;
    setPdfState('loading');
    setPdfError('');
    try { const { downloadBlueprintPdf } = await import('../features/report/blueprintPdf.js'); await downloadBlueprintPdf(result); setPdfState('success'); }
    catch { setPdfState('error'); setPdfError('We could not create the PDF. Please try again.'); }
  };
  return <Container maxWidth="md" className="report-page">
    <header className="report-hero"><SectionEyebrow>PROJECT BLUEPRINT · {blueprint.schemaVersion}</SectionEyebrow><Typography component="h1" variant="h2">{blueprint.title}</Typography><Typography className="report-date">Created {new Date(createdAt).toLocaleDateString(undefined, { dateStyle: 'long' })}</Typography><div className="report-meta-row"><div className="report-reference"><span>PROJECT REFERENCE</span><strong>{result.reference}</strong></div><span className={`generation-badge generation-${result.generationSource === 'gemini' ? 'gemini' : 'rules'}`}>{result.generationSource === 'gemini' ? 'AI-assisted suggestions' : 'Rules-based suggestions'}</span></div></header>
    <Paper className="report-document">
      <ReportSection number="01" title="Executive summary"><Typography>{blueprint.executiveSummary.project}</Typography><div className="summary-grid"><div><span>Problem</span><p>{blueprint.executiveSummary.problem}</p></div><div><span>Target users</span><p>{blueprint.executiveSummary.targetUsers}</p></div><div><span>Expected outcome</span><p>{blueprint.executiveSummary.expectedOutcome}</p></div></div>{blueprint.discoveryContext?.length > 0 && <div className="discovery-context"><h3>Submitted project context</h3><p>These details are user-provided and may need confirmation during planning.</p><div className="context-grid">{blueprint.discoveryContext.map((item) => <div key={item.label}><span>{item.label}</span><strong>{item.value}</strong></div>)}</div></div>}</ReportSection>
      <ReportSection number="02" title="Functional requirements"><Bullets items={blueprint.functionalRequirements} /></ReportSection>
      <ReportSection number="03" title="User roles and permissions"><Bullets items={blueprint.userRoles?.map((role) => ({ ...role, name: role.role }))} /></ReportSection>
      <ReportSection number="04" title="Recommended architecture"><div className="recommendation-grid">{Object.entries(blueprint.architecture).map(([area, item]) => <article key={area}><span>{area}</span><strong>{item.recommendation}</strong><p>{item.basis}</p></article>)}</div></ReportSection>
      <ReportSection number="05" title="Technology stack"><div className="stack-list">{blueprint.technologyStack.map((item) => <article key={item.area}><span>{item.area}</span><div><strong>{item.recommendation}</strong><p>{item.reason}</p></div></article>)}</div></ReportSection>
      <ReportSection number="06" title="Integrations"><h3>Requested</h3><Bullets items={blueprint.integrations.requested} /><h3>Optional suggestions</h3><Bullets items={blueprint.integrations.optionalSuggestions} /></ReportSection>
      <ReportSection number="07" title="Complexity assessment"><div className="complexity-panel"><Chip label={`${blueprint.complexity.level} complexity`} /><p>{blueprint.complexity.note}</p><Bullets items={blueprint.complexity.factors} /></div></ReportSection>
      <ReportSection number="08" title="Risks and considerations"><Bullets items={blueprint.risks.map((risk) => ({ ...risk, title: risk.title, detail: risk.detail }))} /></ReportSection>
      <ReportSection number="09" title="Suggested development phases"><div className="phase-list">{blueprint.developmentPhases.map((phase) => <article key={phase.name}><h3>{phase.name}</h3><Bullets items={phase.activities} /></article>)}</div></ReportSection>
      <ReportSection number="10" title="Open questions"><Bullets items={blueprint.openQuestions} /></ReportSection>
      <Alert severity="info" className="report-disclaimer">{blueprint.disclaimer}</Alert>
      {pdfError && <Alert severity="error" role="alert" className="report-pdf-error">{pdfError}</Alert>}
      <div className="report-actions"><Button variant="outlined" onClick={downloadPdf} disabled={pdfState === 'loading'} aria-busy={pdfState === 'loading'}>{pdfState === 'loading' ? <><CircularProgress size={16} /> <span>Preparing PDF…</span></> : 'Download PDF'}</Button><Button component={Link} to="/discover" variant="contained">Plan another project</Button></div>
    </Paper>
  </Container>;
}
