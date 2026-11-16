import { useEffect } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { AnnouncementBar } from './AnnouncementBar';
import { Header } from './Header';
import { Footer } from './Footer';
import { MobileBottomNav } from './MobileBottomNav';
import { SearchOverlay } from './SearchOverlay';
import { CartDrawer } from './CartDrawer';
import { CompareBar } from './CompareBar';
import { Toaster } from '@/components/ui/Toaster';
import { useUiStore } from '@/stores/ui.store';
import { useKeyPress } from '@/hooks/useUi';

export function Layout() {
  const { t } = useTranslation();
  const { openSearch, closeAll } = useUiStore();
  const location = useLocation();

  useKeyPress('k', (event) => {
    if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === 'k') {
      event.preventDefault();
      openSearch();
    }
  });

  useEffect(() => {
    closeAll();
  }, [location.pathname, closeAll]);

  return (
    <div className="flex min-h-screen flex-col">
      <a
        href="#main"
        className="sr-only z-[200] rounded-full bg-white px-4 py-2 text-sm font-medium text-ink-900 focus:not-sr-only focus:fixed focus:left-4 focus:top-4"
      >
        {t('nav.skipToContent')}
      </a>
      <AnnouncementBar />
      <Header />
      <main id="main" className="flex-1 pb-24 lg:pb-0">
        <Outlet />
      </main>
      <Footer />
      <MobileBottomNav />
      <SearchOverlay />
      <CartDrawer />
      <CompareBar />
      <Toaster />
    </div>
  );
}
