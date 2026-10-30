import { LogOut } from 'lucide-react';
import BrandLogo from '@/components/BrandLogo';
import type { Page } from '@/types';

interface NavbarProps {
  page: Page;
  isLoggedIn: boolean;
  onNavigate: (page: Page) => void;
  onLogout: () => void;
}

const SIGNED_IN_LINKS: { page: Page; label: string }[] = [
  { page: 'dashboard', label: 'Dashboard' },
  { page: 'find', label: 'Find Donor' },
  { page: 'request', label: 'Request Blood' },
];

export default function Navbar({ page, isLoggedIn, onNavigate, onLogout }: NavbarProps) {
  return (
    <header className="sticky top-0 z-40 border-b border-stone-100 bg-white/90 backdrop-blur-md">
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-4 py-3 sm:px-6">
        <button
          type="button"
          onClick={() => onNavigate(isLoggedIn ? 'dashboard' : 'landing')}
          className="rounded-lg focus:outline-none focus-visible:ring-4 focus-visible:ring-red-100"
          aria-label="Blood Bridge home"
        >
          <BrandLogo />
        </button>

        {isLoggedIn ? (
          <div className="flex items-center gap-1 sm:gap-2">
            <nav className="hidden items-center gap-1 md:flex" aria-label="Main">
              {SIGNED_IN_LINKS.map((link) => (
                <button
                  key={link.page}
                  type="button"
                  onClick={() => onNavigate(link.page)}
                  aria-current={page === link.page ? 'page' : undefined}
                  className={`rounded-lg px-3.5 py-2 text-sm font-medium transition-colors duration-200 focus:outline-none focus-visible:ring-4 focus-visible:ring-red-100 ${
                    page === link.page
                      ? 'bg-red-50 text-red-700'
                      : 'text-stone-600 hover:bg-stone-100 hover:text-stone-900'
                  }`}
                >
                  {link.label}
                </button>
              ))}
            </nav>
            <button
              type="button"
              onClick={onLogout}
              className="inline-flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium text-stone-600 transition-colors duration-200 hover:bg-stone-100 hover:text-stone-900 focus:outline-none focus-visible:ring-4 focus-visible:ring-red-100"
            >
              <LogOut className="h-4 w-4" />
              <span className="hidden sm:inline">Log out</span>
            </button>
          </div>
        ) : (
          <button type="button" onClick={() => onNavigate('login')} className="btn-secondary">
            Log in
          </button>
        )}
      </div>

      {isLoggedIn && (
        <nav className="flex gap-2 overflow-x-auto border-t border-stone-100 px-4 py-2 md:hidden" aria-label="Mobile">
          {SIGNED_IN_LINKS.map((link) => (
            <button
              key={link.page}
              type="button"
              onClick={() => onNavigate(link.page)}
              aria-current={page === link.page ? 'page' : undefined}
              className={`shrink-0 rounded-full px-4 py-1.5 text-sm font-medium transition-colors duration-200 ${
                page === link.page ? 'bg-red-600 text-white' : 'bg-stone-100 text-stone-700'
              }`}
            >
              {link.label}
            </button>
          ))}
        </nav>
      )}
    </header>
  );
}
