import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { motion } from 'motion/react';
import { ShoppingBag, ArrowLeft, ExternalLink, Star, ShieldCheck, Truck, Share2, Check } from 'lucide-react';
import { formatPrice } from '../lib/currency';
import PinterestSaveButton from '../components/PinterestSaveButton';
import WishlistButton from '../components/WishlistButton';
import ProductCard from '../components/ProductCard';
import { cn } from '../lib/utils';
import SEOMeta from '../components/SEOMeta';
import { useProduct } from '../hooks/useProducts';
import { ProductDetailSkeleton } from '../components/Skeleton';

export default function ProductDetail() {
  const { id } = useParams();
  const [showAllRelated, setShowAllRelated] = useState(false);
  const [isShared, setIsShared] = useState(false);
  const [displayPrice, setDisplayPrice] = useState('');
  
  const { product, related, loading, error } = useProduct(id);

  useEffect(() => { 
    if (product) {
      setDisplayPrice(formatPrice(product.price));
      import('../lib/currency').then(({ formatPriceAsync }) => { 
        formatPriceAsync(product.price).then(setDisplayPrice); 
      }); 
    }
  }, [product]); 

  const handleAffiliateClick = async () => {
    if (!product) return;
    // Fire-and-forget API call to track click
    fetch(`/api/products/${product.id}/affiliate-click`, { method: 'POST' })
      .then(res => res.json())
      .then(res => {
        if (res.success && res.data.affiliateUrl && res.data.affiliateUrl !== '#') {
          window.open(res.data.affiliateUrl, '_blank', 'noopener,noreferrer');
        } else {
          alert('Retailer link coming soon!');
        }
      })
      .catch(() => {
        alert('Retailer link coming soon!');
      });
  };

  const handleShare = async () => {
    const shareData = {
      title: product.title,
      text: `Check out this ${product.title} on The Aesthetic Edit!`,
      url: window.location.href
    };

    if (navigator.share) {
      try {
        await navigator.share(shareData);
      } catch (err) {
        console.error('Error sharing:', err);
      }
    } else {
      try {
        await navigator.clipboard.writeText(window.location.href);
        setIsShared(true);
        setTimeout(() => setIsShared(false), 2000);
      } catch (err) {
        console.error('Error copying to clipboard:', err);
      }
    }
  };

  if (loading) return (
    <div className="pb-32 bg-surface pt-24 px-6">
      <div className="max-w-7xl mx-auto">
        <ProductDetailSkeleton />
      </div>
    </div>
  );

  if (error || !product) return (
    <div className="p-24 text-center space-y-6">
      <h2 className="text-3xl font-headline font-bold text-on-surface">Product not found</h2>
      <Link to="/shop" className="text-primary font-label text-xs uppercase tracking-widest font-bold border-b border-primary">
        Back to Shop
      </Link>
    </div>
  );

  const relatedColumns = 4;
  const visibleRelated = showAllRelated 
    ? related 
    : (related.length > relatedColumns 
        ? related.slice(0, Math.floor(related.length / relatedColumns) * relatedColumns)
        : related);
  const hasMoreRelated = !showAllRelated && related.length > visibleRelated.length;

  return (
    <div className="pb-32 bg-surface">
      <SEOMeta 
        title={product.title}
        description={product.description || `Shop ${product.title} — a curated aesthetic find from The Aesthetic Edit.`}
        image={product.image}
        type="product"
        productMeta={{
          price: product.price,
          currency: "USD",
          availability: "in stock",
          retailer: product.retailer
        }}
      />
      <div className="max-w-7xl mx-auto px-6 pt-12 relative">
        <div className="absolute top-0 left-0 w-full h-96 bg-gradient-to-b from-accent-blush/20 to-transparent pointer-events-none"></div>
        <Link to="/shop" className="inline-flex items-center gap-2 text-on-surface-variant hover:text-primary transition-colors font-label text-[10px] uppercase tracking-widest font-bold mb-12 relative z-10">
          <ArrowLeft size={14} /> Back to Shop
        </Link>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 relative z-10">
          {/* Product Images */}
          <motion.div 
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="space-y-6"
          >
            <div className="aspect-[4/5] rounded-[48px] overflow-hidden shadow-2xl bg-white border-[12px] border-white relative bg-surface-container">
              <img 
                src={product.image} 
                alt={product.title} 
                loading="lazy"
                className="w-full h-full object-cover"
                referrerPolicy="no-referrer"
              />
            </div>
            {/* Vibe pills */}
            <div className="flex flex-wrap gap-2 justify-center">
              {Array.isArray(product.vibe) && product.vibe.map(v => (
                <span key={v} className="px-4 py-1.5 rounded-full bg-accent-blush/60 text-[10px] font-label uppercase tracking-widest text-primary font-bold">
                  {v}
                </span>
              ))}
            </div>
          </motion.div>

          {/* Product Info */}
          <motion.div 
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="space-y-10"
          >
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="font-label text-xs uppercase tracking-[0.3em] text-primary font-bold">{product.category}</span>
                <div className="flex gap-3 items-center">
                  <WishlistButton variant="detail" productId={product.id} />
                  <PinterestSaveButton variant="detail" product={product} />
                  <button 
                    onClick={handleShare}
                    className={cn(
                      "w-11 h-11 rounded-full flex items-center justify-center transition-all",
                      isShared 
                        ? "bg-accent-peach text-on-primary" 
                        : "bg-surface-container text-on-surface-variant hover:text-primary hover:bg-accent-blush"
                    )}
                    aria-label="Share product"
                  >
                    {isShared ? <Check size={18} /> : <Share2 size={18} />}
                  </button>
                </div>
              </div>
              <h1 className="text-4xl md:text-6xl font-headline font-bold leading-tight text-on-surface">{product.title}</h1>
              <div className="flex items-center gap-4">
                <div className="flex text-accent-peach">
                  {[1, 2, 3, 4, 5].map((i) => <Star key={i} size={16} fill="currentColor" />)}
                </div>
                <span className="text-xs font-label text-on-surface-variant uppercase tracking-widest font-bold">48 Reviews</span>
              </div>
              <p className="text-3xl font-bold text-primary">{displayPrice}</p>
            </div>

            <div className="space-y-6">
              <p className="text-on-surface-variant leading-loose text-lg">
                This curated piece is designed for those who appreciate the finer details of intentional living. Crafted with quality materials and a timeless aesthetic, it seamlessly blends into any modern space or wardrobe.
              </p>
              
              <div className="flex flex-wrap gap-2">
                {Array.isArray(product.vibe) && product.vibe.map(v => (
                  <span key={v} className="px-4 py-1.5 rounded-full bg-accent-blush/50 text-[10px] font-label uppercase tracking-widest text-primary font-bold">
                    {v}
                  </span>
                ))}
              </div>
            </div>

            <div className="space-y-4 pt-6">
              <button 
                onClick={handleAffiliateClick}
                className="w-full bg-primary text-white py-5 rounded-2xl font-label font-bold uppercase tracking-widest hover:bg-primary-hover transition-all shadow-xl shadow-primary/20 flex items-center justify-center gap-3"
              >
                <ShoppingBag size={20} /> View on Retailer Site
              </button>
              <p className="text-[10px] text-center text-on-surface-variant uppercase tracking-widest font-bold">
                * This is an affiliate link. I may earn a small commission at no extra cost to you.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-10 border-t border-outline-variant/30">
              <div className="flex flex-col items-center text-center space-y-2">
                <Truck size={24} className="text-primary" />
                <span className="text-[10px] font-label uppercase tracking-widest font-bold text-on-surface">Fast Shipping</span>
              </div>
              <div className="flex flex-col items-center text-center space-y-2">
                <ShieldCheck size={24} className="text-primary" />
                <span className="text-[10px] font-label uppercase tracking-widest font-bold text-on-surface">Quality Assured</span>
              </div>
              <div className="flex flex-col items-center text-center space-y-2">
                <ExternalLink size={24} className="text-primary" />
                <span className="text-[10px] font-label uppercase tracking-widest font-bold text-on-surface">Trusted Retailer</span>
              </div>
            </div>
          </motion.div>
        </div>

        {/* Related Products */}
        <section className="mt-40">
          <div className="flex justify-between items-end mb-12">
            <h2 className="text-3xl font-headline font-bold text-on-surface">Complete the Look</h2>
            <Link to="/shop" className="text-primary font-label text-xs uppercase tracking-widest border-b border-primary/20 pb-1 hover:border-primary transition-all font-bold">View All</Link>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {visibleRelated.map((p, index) => (
              <ProductCard key={p.id} product={p} index={index} />
            ))}
          </div>

          {hasMoreRelated && (
            <div className="text-center pt-12">
              <button 
                onClick={() => setShowAllRelated(true)}
                className="text-primary font-label text-xs uppercase tracking-widest font-bold border-b border-primary/20 pb-1 hover:border-primary transition-all"
              >
                See More Products
              </button>
            </div>
          )}
        </section>
      </div>
    </div>
  );
}
