import { Typography } from '@mui/material';

export default function SectionEyebrow({ children, light = false }) {
  return <Typography component="p" className={`eyebrow${light ? ' eyebrow-light' : ''}`}><span aria-hidden="true" />{children}</Typography>;
}
