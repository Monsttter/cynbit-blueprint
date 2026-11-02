import { Button, Chip, Container, Grid, Paper, Stack, Typography } from '@mui/material';
import { Link } from 'react-router-dom';
import FeatureCard from '../components/FeatureCard.jsx';
import SectionEyebrow from '../components/SectionEyebrow.jsx';

const features = [
  { icon: 'discovery', title: 'Guided Project Discovery', text: 'A few thoughtful questions help turn a starting idea into a clearer project brief.' },
  { icon: 'analysis', title: 'Intelligent Requirement Analysis', text: 'Bring goals, users, features and constraints together in one useful overview.' },
  { icon: 'blueprint', title: 'Structured Technical Blueprint', text: 'Get a planning document with requirements, architecture suggestions and open questions.' },
];

function BlueprintPreview() {
  return <Paper elevation={0} className="preview-card" aria-label="Example blueprint preview">
    <div className="preview-head"><div><span className="preview-kicker">PROJECT BLUEPRINT</span><Typography variant="h6">A clearer way forward</Typography></div><span className="preview-menu" aria-hidden="true">···</span></div>
    <div className="preview-rule" />
    <div className="preview-item"><span className="preview-check" aria-hidden="true">✓</span><div><b>Product direction</b><small>Goals, users &amp; project scope</small></div><span className="preview-state">DEFINED</span></div>
    <div className="preview-item"><span className="preview-check" aria-hidden="true">✓</span><div><b>Technical approach</b><small>Architecture &amp; stack suggestions</small></div><span className="preview-state preview-muted">IN REVIEW</span></div>
    <div className="preview-quote"><span>“</span><p>Good projects start with the right questions.</p></div>
    <div className="preview-footer"><span><i /> Discovery in progress</span><span>01 — 03</span></div>
  </Paper>;
}

export default function LandingPage() {
  return <>
    <section className="hero-section"><Container maxWidth="lg"><div className="hero-grid">
      <div className="hero-copy"><Chip label="A better starting point for your next build" size="small" className="hero-chip" />
        <Typography component="h1" variant="h1">Turn your idea into a <span>technical blueprint.</span></Typography>
        <Typography className="hero-description">Describe your software idea, explore its requirements and receive a structured technical blueprint to help plan your project.</Typography>
        <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1.5} className="hero-actions">
          <Button component={Link} to="/discover" variant="contained" size="large" endIcon={<span aria-hidden="true">→</span>} className="primary-cta">Start Project Discovery</Button>
          <Button href="#how-it-works" variant="text" size="large" endIcon={<span aria-hidden="true">→</span>} className="secondary-cta">Learn How It Works</Button>
        </Stack>
        <div className="hero-proof"><span className="proof-mark" aria-hidden="true">✳</span><Typography variant="caption">A considered plan for the thing you want to build.</Typography></div>
      </div>
      <div className="hero-visual"><div className="visual-orbit orbit-one" /><div className="visual-orbit orbit-two" /><BlueprintPreview /><span className="visual-caption">FROM FIRST THOUGHT TO CLEARER DIRECTION</span></div>
    </div></Container></section>

    <section className="features-section" id="how-it-works"><Container maxWidth="lg">
      <div className="section-heading"><div><SectionEyebrow>HOW IT WORKS</SectionEyebrow><Typography component="h2" variant="h2">Clarity before you build.</Typography></div><Typography className="section-intro">Move from “what if?” to a useful first plan, with a process designed around your idea.</Typography></div>
      <Grid container spacing={2} className="feature-grid">{features.map((feature) => <Grid key={feature.title} size={{ xs: 12, md: 4 }}><FeatureCard icon={feature.icon} title={feature.title}>{feature.text}</FeatureCard></Grid>)}</Grid>
    </Container></section>

    <section className="closing-section"><Container maxWidth="lg"><div className="closing-panel"><div><SectionEyebrow light>YOUR NEXT STEP</SectionEyebrow><Typography component="h2" variant="h2">Every good build begins with a conversation.</Typography><Typography>Start with the idea you have. We’ll help you shape the questions around it.</Typography></div><Button component={Link} to="/discover" variant="contained" color="secondary" size="large" endIcon={<span aria-hidden="true">→</span>}>Start Project Discovery</Button></div>
      <p className="disclaimer"><span aria-hidden="true">ⓘ</span> This independent assessment prototype provides preliminary planning suggestions. It is not an official Cynbit quotation, proposal or delivery commitment.</p>
    </Container></section>
  </>;
}
