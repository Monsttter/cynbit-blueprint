import { Outlet } from 'react-router-dom';
import Header from './Header.jsx';
import Footer from './Footer.jsx';

export default function AppLayout() {
  return <div className="app-shell"><Header /><main id="main-content"><Outlet /></main><Footer /></div>;
}
