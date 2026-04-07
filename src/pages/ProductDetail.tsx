import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { motion } from 'motion/react';
import { ShoppingBag, ArrowLeft, ExternalLink, ShieldCheck, Truck, Share2, Check, Sparkles, RefreshCw } from 'lucide-react';
import { formatPrice } from '../lib/currency';
import PinterestSaveButton from '../components/PinterestSaveButton';
import WishlistButton from '../components/WishlistButton';
import ProductCard from '../components/ProductCard';
import { cn } from '../lib/utils';
import SEOMeta from '../components/SEOMeta';
import ImageCarousel from '../components/ImageCarousel';
import { useProduct } from '../hooks/useProducts';
import { ProductDetailSkeleton } from '../components/Skeleton';

export default function ProductDetail() {
  const { id } = useParams();
  const [showAllRelated, setShowAllRelated] = useState(false);
  const [isShared, setIsShared] = useState(false);
  const [displayPrice, setDisplayPrice] = useState('');
  const [siteConfigs, setSiteConfigs] = useState<Record<string, string>>({});
  
  const { product, related: autoRelated, loading, error } = useProduct(id);

  useEffect(() => {
    fetch('/api/home-shop/config')
      .then((res) => res.json())
      .then((data) => {
        if (data.success) setSiteConfigs(data.data);
      })
      .catch(() => {});
  }, []);

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
    <div className="pb-32 bg-surface pt-16 md:pt-24 px-6">
      <div className="max-w-7xl mx-auto">
        <ProductDetailSkeleton />
      </div>
    </div>
  );

  if (error || !product) return (
    <div className="p-16 md:p-24 text-center space-y-6">
      <h2 className="text-2xl md:text-3xl font-headline font-bold text-on-surface">
        {siteConfigs.product_not_found_title || 'Product not found'}
      </h2>
      <Link to="/shop" className="text-primary font-label text-xs uppercase tracking-widest font-bold border-b border-primary">
        {siteConfigs.product_not_found_shop_link || 'Back to Shop'}
      </Link>
    </div>
  );

  const finalRelated = autoRelated || [];
  const relatedColumns = 4;
  const visibleRelated = showAllRelated 
    ? finalRelated 
    : (finalRelated.length > relatedColumns 
        ? finalRelated.slice(0, Math.floor(finalRelated.length / relatedColumns) * relatedColumns)
        : finalRelated);
  const hasMoreRelated = !showAllRelated && finalRelated.length > visibleRelated.length;

  return (
    <div className="pb-32 bg-surface overflow-x-hidden">
      <SEOMeta 
        title={product.title}
        description={product.description || `Shop ${product.title} — a curated aesthetic find from The Aesthetic Edit.`}
        image={product.image}
        type="product"
        productMeta={{
          price: product.price,
          currency: "INR",
          availability: "in stock",
          retailer: product.retailer
        }}
      />
      
      {/* Decorative background elements */}
      <div className="fixed top-0 left-0 w-full h-full pointer-events-none z-0 overflow-hidden">
        <div className="absolute top-[-10%] right-[-5%] w-[40%] h-[40%] rounded-full bg-accent-blush/10 blur-[120px]"></div>
        <div className="absolute bottom-[10%] left-[-5%] w-[30%] h-[30%] rounded-full bg-accent-peach/10 blur-[100px]"></div>
      </div>

      <div className="max-w-7xl mx-auto px-6 pt-8 md:pt-12 relative z-10">
        <Link to="/shop" className="inline-flex items-center gap-2 text-on-surface-variant hover:text-primary transition-all font-label text-[10px] uppercase tracking-widest font-bold mb-8 md:mb-12 group">
          <ArrowLeft size={14} className="group-hover:-translate-x-1 transition-transform" /> {siteConfigs.product_back_to_shop || 'Back to Shop'}
        </Link>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 md:gap-20 items-start">
          {/* Product Images */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-8"
          >
            <div className="rounded-[48px] md:rounded-[64px] overflow-hidden shadow-[0_32px_64px_-16px_rgba(0,0,0,0.1)] bg-white border-8 md:border-16 border-white relative group">
              <ImageCarousel 
                images={product.images && product.images.length > 0 ? product.images : [product.image]} 
                aspectRatio="aspect-[4/5]"
                autoPlay={true}
              />
              <div className="absolute top-6 right-6 flex flex-col gap-3 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                <WishlistButton variant="detail" productId={product.id} />
                <PinterestSaveButton variant="detail" product={product} />
              </div>
            </div>
            
            {/* Desktop Vibes */}
            <div className="hidden lg:flex flex-wrap gap-3 justify-center">
              {Array.isArray(product.vibe) && product.vibe.map(v => (
                <span key={v} className="px-5 py-2 rounded-full bg-white/80 backdrop-blur-sm border border-outline-variant/30 text-[10px] font-label uppercase tracking-widest text-primary font-bold shadow-sm">
                  {v}
                </span>
              ))}
            </div>
          </motion.div>

          {/* Product Info */}
          <motion.div 
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
            className="space-y-10 md:pt-4"
          >
            <div className="space-y-6">
              <div className="flex items-center gap-4">
                <div className="h-px w-8 bg-primary/30"></div>
                <span className="font-label text-[10px] md:text-xs uppercase tracking-[0.4em] text-primary font-bold">{product.category}</span>
              </div>
              
              <h1 className="text-4xl md:text-6xl lg:text-7xl font-headline font-bold leading-[1.1] text-on-surface">
                {product.title}
              </h1>

              <div className="flex items-center">
                <p className="text-3xl md:text-4xl font-headline font-bold text-primary">{displayPrice}</p>
              </div>
            </div>

            <div className="space-y-8">
              <div className="relative">
                <div className="absolute -left-4 top-0 bottom-0 w-1 bg-accent-blush rounded-full"></div>
                <p className="text-base md:text-xl text-on-surface-variant leading-relaxed font-serif italic pl-4">
                  {product.description ||
                    siteConfigs.product_default_description ||
                    'This curated piece is designed for those who appreciate the finer details of intentional living. Crafted with quality materials and a timeless aesthetic, it seamlessly blends into any modern space or wardrobe.'}
                </p>
              </div>
              
              {/* Mobile Vibes */}
              <div className="flex flex-wrap gap-2 lg:hidden">
                {Array.isArray(product.vibe) && product.vibe.map(v => (
                  <span key={v} className="px-4 py-1.5 rounded-full bg-accent-blush/40 text-[9px] font-label uppercase tracking-widest text-primary font-bold">
                    {v}
                  </span>
                ))}
              </div>
            </div>

            <div className="space-y-6 pt-4">
              <div className="flex flex-col sm:flex-row gap-4">
                <button 
                  onClick={handleAffiliateClick}
                  className="flex-1 bg-primary text-white py-5 md:py-6 rounded-2xl font-label font-bold uppercase tracking-[0.2em] hover:bg-primary-hover transition-all shadow-[0_20px_40px_-12px_rgba(var(--color-primary-rgb),0.3)] flex items-center justify-center gap-3 text-xs md:text-sm group"
                >
                  <ShoppingBag size={20} className="group-hover:scale-110 transition-transform" />{' '}
                  {siteConfigs.product_shop_retailer_cta || 'View on Retailer Site'}
                </button>
                
                <button 
                  onClick={handleShare}
                  className={cn(
                    "px-6 py-5 md:py-6 rounded-2xl flex items-center justify-center transition-all border-2",
                    isShared 
                      ? "bg-accent-peach border-accent-peach text-white" 
                      : "bg-white border-outline-variant/30 text-on-surface-variant hover:border-primary hover:text-primary shadow-sm"
                  )}
                  aria-label="Share product"
                >
                  {isShared ? <Check size={20} /> : <Share2 size={20} />}
                </button>
              </div>
              <p className="text-[9px] md:text-[10px] text-center text-on-surface-variant uppercase tracking-[0.1em] font-bold opacity-60 italic">
                {siteConfigs.product_affiliate_disclaimer ||
                  '* This is an affiliate link. I may earn a small commission at no extra cost to you.'}
              </p>
            </div>

            <div className="grid grid-cols-3 gap-4 md:gap-8 pt-12 border-t border-outline-variant/30">
              <div className="flex flex-col items-center text-center space-y-3 group">
                <div className="w-12 h-12 rounded-2xl bg-accent-blush/30 flex items-center justify-center text-primary group-hover:bg-primary group-hover:text-white transition-all duration-500">
                  <Truck size={22} />
                </div>
                <span className="text-[9px] md:text-[11px] font-label uppercase tracking-widest font-bold text-on-surface">{siteConfigs.product_trust_shipping || 'Fast Shipping'}</span>
              </div>
              <div className="flex flex-col items-center text-center space-y-3 group">
                <div className="w-12 h-12 rounded-2xl bg-accent-blush/30 flex items-center justify-center text-primary group-hover:bg-primary group-hover:text-white transition-all duration-500">
                  <ShieldCheck size={22} />
                </div>
                <span className="text-[9px] md:text-[11px] font-label uppercase tracking-widest font-bold text-on-surface">{siteConfigs.product_trust_quality || 'Quality Assured'}</span>
              </div>
              <div className="flex flex-col items-center text-center space-y-3 group">
                <div className="w-12 h-12 rounded-2xl bg-accent-blush/30 flex items-center justify-center text-primary group-hover:bg-primary group-hover:text-white transition-all duration-500">
                  <ExternalLink size={22} />
                </div>
                <span className="text-[9px] md:text-[11px] font-label uppercase tracking-widest font-bold text-on-surface">{siteConfigs.product_trust_retailer || 'Trusted Retailer'}</span>
              </div>
            </div>
          </motion.div>
        </div>

        {/* Related Products Section */}
        <section className="mt-32 md:mt-56 relative">
          {/* Section Header */}
          <div className="max-w-2xl mb-16 md:mb-20 space-y-6">
            <div className="flex items-center gap-3 text-primary">
              <Sparkles size={20} fill="currentColor" />
              <span className="font-label text-xs uppercase tracking-[0.4em] font-bold">
                {product.sectionSubheading || siteConfigs.product_related_subheading_default || 'Curated Picks'}
              </span>
            </div>
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-8">
              <div className="space-y-4">
                <h2 className="text-4xl md:text-6xl font-headline font-bold text-on-surface leading-tight">
                  {product.sectionHeading || siteConfigs.product_related_heading_default || 'Complete the Look'}
                </h2>
                <p className="text-base md:text-lg text-on-surface-variant font-serif italic">
                  {product.sectionDescription ||
                    siteConfigs.product_related_description_default ||
                    'Hand-selected pieces that perfectly complement your current aesthetic. Curated for intentional styling.'}
                </p>
              </div>
              <Link to="/shop" className="group flex items-center gap-3 text-primary font-label text-xs uppercase tracking-[0.2em] font-bold whitespace-nowrap">
                <span className="border-b-2 border-primary/20 group-hover:border-primary transition-all pb-1">
                  {product.sectionCtaText || siteConfigs.product_related_cta_default || 'View All Collection'}
                </span>
                <div className="w-8 h-8 rounded-full bg-accent-blush flex items-center justify-center group-hover:bg-primary group-hover:text-white transition-all">
                  <ArrowLeft size={14} className="rotate-180" />
                </div>
              </Link>
            </div>
          </div>

          {/* Related Products Grid - Asymmetric Editorial Feel */}
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-x-8 gap-y-16 md:gap-y-24">
            {visibleRelated.map((p, index) => (
              <motion.div 
                key={p.id}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                className={cn(
                  "relative",
                  index % 2 === 1 ? "md:translate-y-12" : ""
                )}
              >
                <ProductCard product={p} index={index} />
              </motion.div>
            ))}
          </div>

          {hasMoreRelated && (
            <div className="text-center pt-24 md:pt-40">
              <button 
                onClick={() => setShowAllRelated(true)}
                className="group relative inline-flex items-center gap-4 px-10 py-5 rounded-2xl bg-white border-2 border-outline-variant/30 text-primary font-label text-xs uppercase tracking-[0.3em] font-bold hover:border-primary hover:shadow-2xl hover:shadow-primary/10 transition-all"
              >
                <span className="relative z-10">{siteConfigs.product_related_discover_more || 'Discover More Pieces'}</span>
                <RefreshCw size={16} className="group-hover:rotate-180 transition-transform duration-700" />
              </button>
            </div>
          )}
        </section>
      </div>
    </div>
  );
}
