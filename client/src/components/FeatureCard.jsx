import { Card, CardContent, Typography } from '@mui/material';

const symbols = { discovery: '01', analysis: '02', blueprint: '03' };
export default function FeatureCard({ icon, title, children }) {
  return <Card className="feature-card"><CardContent>
    <div className="feature-top"><span className={`feature-symbol feature-${icon}`} aria-hidden="true">{symbols[icon]}</span><span className="feature-arrow" aria-hidden="true">↗</span></div>
    <Typography variant="h6" component="h3">{title}</Typography>
    <Typography variant="body2" color="text.secondary">{children}</Typography>
  </CardContent></Card>;
}
