import { useEffect, useState } from 'react';
import BrandLogo from '@/components/BrandLogo';
import Navbar from '@/components/Navbar';
import { useAuth } from '@/context/AuthContext';
import DonorDashboardPage from '@/pages/DonorDashboardPage';
import FindDonorPage from '@/pages/FindDonorPage';
import LandingPage from '@/pages/LandingPage';
import LoginPage from '@/pages/LoginPage';
import RequestBloodPage from '@/pages/RequestBloodPage';
import SignUpPage from '@/pages/SignUpPage';
import type { Page } from '@/types';

const SIGNED_IN_PAGES: Page[] = ['dashboard', 'find', 'request'];
const AUTH_ENTRY_PAGES: Page[] = ['landing', 'login', 'signup'];

function App() {
  const { session, isLoading, signOut } = useAuth();
  const [page, setPage] = useState<Page>('landing');
  const isLoggedIn = session !== null;

  useEffect(() => {
    if (!isLoading && isLoggedIn) {
      setPage((current) => (AUTH_ENTRY_PAGES.includes(current) ? 'dashboard' : current));
    }
  }, [isLoading, isLoggedIn]);

  const navigate = (nextPage: Page) => {
    setPage(nextPage);
    window.scrollTo({ top: 0 });
  };

  const handleLogout = async () => {
    await signOut();
    navigate('landing');
  };

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-white">
        <div className="animate-fade-up">
          <BrandLogo size="lg" />
        </div>
      </div>
    );
  }

  const visiblePage: Page = !isLoggedIn && SIGNED_IN_PAGES.includes(page) ? 'login' : page;

  const renderPage = () => {
    switch (visiblePage) {
      case 'login':
        return <LoginPage onSwitchToSignUp={() => navigate('signup')} />;
      case 'signup':
        return <SignUpPage onSwitchToLogin={() => navigate('login')} />;
      case 'dashboard':
        return <DonorDashboardPage onNavigate={navigate} />;
      case 'find':
        return <FindDonorPage onNavigate={navigate} />;
      case 'request':
        return <RequestBloodPage />;
      case 'landing':
      default:
        return <LandingPage onGetStarted={() => navigate('signup')} />;
    }
  };

  return (
    <div className="min-h-screen bg-stone-50">
      <Navbar page={visiblePage} isLoggedIn={isLoggedIn} onNavigate={navigate} onLogout={handleLogout} />
      <main key={visiblePage} className="animate-fade-up">
        {renderPage()}
      </main>
    </div>
  );
}

export default App;
