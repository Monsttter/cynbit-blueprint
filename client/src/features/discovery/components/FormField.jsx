import { TextField } from '@mui/material';

export default function FormField({ id, label, value, onChange, error, helperText, multiline = false, rows = 1, optional = false, type = 'text', placeholder, ...props }) {
  return <TextField id={id} label={optional ? `${label} (optional)` : label} type={type} value={value ?? ''}
    onChange={(event) => onChange(event.target.value)} error={Boolean(error)} helperText={error || helperText}
    multiline={multiline} minRows={multiline ? rows : undefined} fullWidth placeholder={placeholder} variant="outlined" {...props} />;
}
