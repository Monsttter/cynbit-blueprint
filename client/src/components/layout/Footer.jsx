import { Container, Typography } from '@mui/material';
import BrandMark from '../BrandMark.jsx';

export default function Footer() {
  return <footer className="site-footer"><Container maxWidth="lg" className="footer-inner">
    <BrandMark /><Typography variant="caption">An independent project discovery prototype · 2026</Typography>
    <Typography variant="caption" className="footer-note">Recommendations are preliminary suggestions, not official Cynbit quotations or delivery commitments.</Typography>
  </Container></footer>;
}
