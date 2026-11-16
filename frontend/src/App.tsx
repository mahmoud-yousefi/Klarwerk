import { lazy, Suspense, useEffect } from 'react';
import { Route, Routes, useLocation } from 'react-router-dom';
import { Layout } from '@/components/layout/Layout';
import { HomePage } from '@/pages/HomePage';
import { Spinner } from '@/components/ui/Spinner';

const CatalogPage = lazy(() => import('@/pages/CatalogPage'));
const ProductPage = lazy(() => import('@/pages/ProductPage'));
const CartPage = lazy(() => import('@/pages/CartPage'));
const CheckoutPage = lazy(() => import('@/pages/CheckoutPage'));
const ConfirmationPage = lazy(() => import('@/pages/ConfirmationPage'));
const WishlistPage = lazy(() => import('@/pages/WishlistPage'));
const ComparePage = lazy(() => import('@/pages/ComparePage'));
const AssistantPage = lazy(() => import('@/pages/AssistantPage'));
const MagazinePage = lazy(() => import('@/pages/MagazinePage'));
const ArticlePage = lazy(() => import('@/pages/ArticlePage'));
const InfoPage = lazy(() => import('@/pages/InfoPage'));
const NotFoundPage = lazy(() => import('@/pages/NotFoundPage'));

function ScrollToTop() {
  const { pathname, search } = useLocation();
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'instant' as ScrollBehavior });
  }, [pathname, search]);
  return null;
}

function RouteFallback() {
  return (
    <div className="flex min-h-[60vh] items-center justify-center">
      <Spinner />
    </div>
  );
}

export function App() {
  return (
    <>
      <ScrollToTop />
      <Suspense fallback={<RouteFallback />}>
        <Routes>
          <Route element={<Layout />}>
            <Route path="/" element={<HomePage />} />
            <Route path="/shop" element={<CatalogPage />} />
            <Route path="/product/:slug" element={<ProductPage />} />
            <Route path="/cart" element={<CartPage />} />
            <Route path="/checkout" element={<CheckoutPage />} />
            <Route path="/order/:id" element={<ConfirmationPage />} />
            <Route path="/wishlist" element={<WishlistPage />} />
            <Route path="/compare" element={<ComparePage />} />
            <Route path="/advisor" element={<AssistantPage />} />
            <Route path="/magazine" element={<MagazinePage />} />
            <Route path="/magazine/:slug" element={<ArticlePage />} />
            <Route path="/info/:slug" element={<InfoPage />} />
            <Route path="*" element={<NotFoundPage />} />
          </Route>
        </Routes>
      </Suspense>
    </>
  );
}
