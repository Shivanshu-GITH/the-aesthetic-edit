import React, { Suspense, lazy } from 'react';
import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import { Navbar, Footer } from './components/Layout';
import { ToastProvider } from './context/ToastContext';
import { WishlistProvider } from './context/WishlistContext';
import { AuthProvider } from './context/AuthContext';
import { ToastStack } from './components/Toast';
import ErrorBoundary from './components/ErrorBoundary';

const Home = lazy(() => import('./pages/Home'));
const About = lazy(() => import('./pages/About'));
const BlogHub = lazy(() => import('./pages/BlogHub'));
const BlogCategory = lazy(() => import('./pages/BlogCategory'));
const BlogPost = lazy(() => import('./pages/BlogPost'));
const Shop = lazy(() => import('./pages/Shop'));
const ProductDetail = lazy(() => import('./pages/ProductDetail'));
const FreeGuide = lazy(() => import('./pages/FreeGuide'));
const Wishlist = lazy(() => import('./pages/Wishlist'));
const NotFound = lazy(() => import('./pages/NotFound'));
const Admin = lazy(() => import('./pages/Admin'));
const Login = lazy(() => import('./pages/Login'));
const Signup = lazy(() => import('./pages/Signup'));

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

  return (
    <div className="min-h-screen flex flex-col noise-overlay">
      {!isAdminPage && <Navbar />}
      <main className="flex-1">
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
