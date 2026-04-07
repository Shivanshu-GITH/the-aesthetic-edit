import React, { Suspense, lazy } from 'react';
import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import { Navbar, Footer } from './components/Layout';
import { ToastProvider } from './context/ToastContext';
import { WishlistProvider } from './context/WishlistContext';
import { AuthProvider } from './context/AuthContext';
import { ToastStack } from './components/Toast';
import ErrorBoundary from './components/ErrorBoundary';

const loadHome = () => import('./pages/Home');
const loadAbout = () => import('./pages/About');
const loadBlogHub = () => import('./pages/BlogHub');
const loadBlogCategory = () => import('./pages/BlogCategory');
const loadBlogPost = () => import('./pages/BlogPost');
const loadShop = () => import('./pages/Shop');
const loadProductDetail = () => import('./pages/ProductDetail');
const loadFreeGuide = () => import('./pages/FreeGuide');
const loadWishlist = () => import('./pages/Wishlist');
const loadNotFound = () => import('./pages/NotFound');
const loadAdmin = () => import('./pages/Admin');
const loadLogin = () => import('./pages/Login');
const loadSignup = () => import('./pages/Signup');

const Home = lazy(loadHome);
const About = lazy(loadAbout);
const BlogHub = lazy(loadBlogHub);
const BlogCategory = lazy(loadBlogCategory);
const BlogPost = lazy(loadBlogPost);
const Shop = lazy(loadShop);
const ProductDetail = lazy(loadProductDetail);
const FreeGuide = lazy(loadFreeGuide);
const Wishlist = lazy(loadWishlist);
const NotFound = lazy(loadNotFound);
const Admin = lazy(loadAdmin);
const Login = lazy(loadLogin);
const Signup = lazy(loadSignup);

function ScrollToTop() {
  const { pathname } = useLocation();
  React.useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);
  return null;
}

export default function App() {
  return (
    <ErrorBoundary>
      <Router>
        <AuthProvider>
          <ToastProvider>
            <WishlistProvider>
              <ScrollToTop />
              <AppContent />
              <ToastStack />
            </WishlistProvider>
          </ToastProvider>
        </AuthProvider>
      </Router>
    </ErrorBoundary>
  );
}

function AppContent() {
  const location = useLocation();
  const isAdminPage = location.pathname.startsWith('/admin');
  const prefetchedPublicRoutesRef = React.useRef(false);

  React.useEffect(() => {
    let isMounted = true;
    fetch('/api/home-shop/config')
      .then((res) => res.json())
      .then((data) => {
        if (!isMounted || !data?.success) return;
        const faviconUrl = data?.data?.favicon_url;
        if (!faviconUrl) return;

        let link = document.querySelector("link[rel='icon']") as HTMLLinkElement | null;
        if (!link) {
          link = document.createElement('link');
          link.rel = 'icon';
          document.head.appendChild(link);
        }
        link.href = faviconUrl;
      })
      .catch(() => {});

    return () => {
      isMounted = false;
    };
  }, []);

  React.useEffect(() => {
    if (typeof window === 'undefined') return;
    if (isAdminPage || prefetchedPublicRoutesRef.current) return;

    const runtime = globalThis as typeof globalThis & {
      requestIdleCallback?: (callback: () => void) => number;
      cancelIdleCallback?: (id: number) => void;
    };

    const prefetchPublicRoutes = () => {
      if (prefetchedPublicRoutesRef.current) return;
      prefetchedPublicRoutesRef.current = true;
      void loadShop();
      void loadBlogHub();
      void loadFreeGuide();
      void loadProductDetail();
      void loadBlogPost();
    };

    if (typeof runtime.requestIdleCallback === 'function' && typeof runtime.cancelIdleCallback === 'function') {
      const idleId = runtime.requestIdleCallback(prefetchPublicRoutes);
      return () => runtime.cancelIdleCallback?.(idleId);
    }

    const timerId = globalThis.setTimeout(prefetchPublicRoutes, 700);
    return () => globalThis.clearTimeout(timerId);
  }, [isAdminPage]);

  return (
    <div className="min-h-screen flex flex-col noise-overlay w-full min-w-0 overflow-x-clip">
      {!isAdminPage && <Navbar />}
      <main className="flex-1 w-full min-w-0">
        <Suspense fallback={<div className="min-h-screen bg-surface" />}>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/about" element={<About />} />
            <Route path="/blog" element={<BlogHub />} />
            <Route path="/blog/:category" element={<BlogCategory />} />
            <Route path="/blog/:category/:slug" element={<BlogPost />} />
            <Route path="/shop" element={<Shop />} />
            <Route path="/shop/product/:id" element={<ProductDetail />} />
            <Route path="/free-guide" element={<FreeGuide />} />
            <Route path="/wishlist" element={<Wishlist />} />
            <Route path="/admin" element={<Admin />} />
            <Route path="/login" element={<Login />} />
            <Route path="/signup" element={<Signup />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </Suspense>
      </main>
      {!isAdminPage && <Footer />}
    </div>
  );
}
