import Header from '../components/Header.jsx';
import Footer from '../components/Footer.jsx';
import PreferencesDrawer from '../components/PreferencesDrawer.jsx';

export default function MainLayout({ children }) {
  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1">{children}</main>
      <Footer />
      <PreferencesDrawer />
    </div>
  );
}
