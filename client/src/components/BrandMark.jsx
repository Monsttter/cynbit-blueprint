import { Box, Typography } from '@mui/material';
import { Link } from 'react-router-dom';

export default function BrandMark() {
  return <Box component={Link} to="/" aria-label="Cynbit Blueprint home" className="brand-mark">
    <Typography component="span" className="brand-name">cynbit <span>blueprint</span></Typography>
  </Box>;
}
