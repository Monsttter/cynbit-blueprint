import { Container } from '@mui/material';
import { WizardProvider } from '../features/discovery/WizardContext.jsx';
import DiscoveryWizard from '../features/discovery/DiscoveryWizard.jsx';
import '../features/discovery/wizard.css';

export default function DiscoveryPage() {
  return <Container maxWidth="lg" className="discovery-container"><WizardProvider><DiscoveryWizard /></WizardProvider></Container>;
}
