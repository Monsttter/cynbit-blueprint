import { AppBar, Button, Container, Toolbar } from '@mui/material';
import { Link as RouterLink, useLocation } from 'react-router-dom';
import BrandMark from '../BrandMark.jsx';

export default function Header() {
  const { pathname } = useLocation();
  return <AppBar position="sticky" elevation={0} className="site-header">
    <Container maxWidth="lg"><Toolbar disableGutters className="header-toolbar">
      <BrandMark />
      <nav aria-label="Main navigation" className="header-nav">
        <a href="/#how-it-works" className={pathname === '/' ? 'nav-link' : 'nav-link'}>How it works</a>
        <Button component={RouterLink} to="/discover" variant="contained" color="primary" size="small" className="header-cta">Start discovery <span aria-hidden="true">↗</span></Button>
      </nav>
    </Toolbar></Container>
  </AppBar>;
}
