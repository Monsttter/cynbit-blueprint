import { Typography } from '@mui/material';

export default function StepHeading({ eyebrow, title, description }) {
  return <header className="wizard-step-heading"><p className="wizard-eyebrow">{eyebrow}</p>
    <Typography component="h1" variant="h2">{title}</Typography><Typography color="text.secondary">{description}</Typography>
  </header>;
}
