import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate, useLocation } from 'react-router-dom';
import { motion } from 'motion/react';
import { Clock, Share2, Heart, ArrowRight, ShoppingBag, Check, Sparkles } from 'lucide-react';
import { formatPrice } from '../lib/currency';
import SEOMeta from '../components/SEOMeta';
import ImageCarousel from '../components/ImageCarousel';
import { useBlogPost } from '../hooks/useBlog';
import { BlogPostSkeleton } from '../components/Skeleton';
import PinterestSaveButton from '../components/PinterestSaveButton';
import { useWishlist } from '../context/WishlistContext';
import { useAuth } from '../context/AuthContext';
import { cn } from '../lib/utils';

export default function BlogPost() {
  const { slug } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const [showAllRecommended, setShowAllRecommended] = useState(false);
  const [showAllRelated, setShowAllRelated] = useState(false);
  const [isShared, setIsShared] = useState(false);
  const [productPrices, setProductPrices] = useState<Record<string, string>>({});
  
  const { post, recommendedProducts, relatedPosts, loading, error } = useBlogPost(slug);
  const { isJournalWishlisted, toggleJournalWishlist } = useWishlist();
  const { user } = useAuth();

  useEffect(() => {
    if (recommendedProducts.length > 0) {
      const initialPrices: Record<string, string> = {};
      recommendedProducts.forEach(p => {
        initialPrices[p.id] = formatPrice(p.price);
      });
      setProductPrices(initialPrices);

      import('../lib/currency').then(({ formatPriceAsync }) => {
        recommendedProducts.forEach(p => {
          formatPriceAsync(p.price).then(price => {
            setProductPrices(prev => ({ ...prev, [p.id]: price }));
          });
        });
      });
    }
  }, [recommendedProducts]);

  const handleWishlist = (e: React.MouseEvent) => {
    e.preventDefault();
    if (!user) {
      navigate('/login', { state: { from: location } });
      return;
    }
    if (post) toggleJournalWishlist(post.id);
  };

  const handleShare = async () => {
    if (!post) return;
    const shareData = {
      title: post.title,
      text: post.excerpt,
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

  const handleAffiliateClick = async (product) => {
    try {
      const response = await fetch(`/api/products/${product.id}/affiliate-click`, { method: 'POST' });
      const res = await response.json();
      if (res.success && res.data.affiliateUrl && res.data.affiliateUrl !== '#') {
        window.open(res.data.affiliateUrl, '_blank', 'noopener,noreferrer');
      } else {
        alert('Retailer link coming soon!');
      }
    } catch (error) {
      alert('Retailer link coming soon!');
    }
  };

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [slug]);

  if (loading) return (
    <div className="pb-32 bg-surface pt-16 md:pt-24 px-6">
      <div className="max-w-7xl mx-auto">
        <BlogPostSkeleton />
      </div>
    </div>
  );

  if (error || !post) return (
    <div className="p-16 md:p-24 text-center space-y-6">
      <h2 className="text-2xl md:text-3xl font-headline font-bold text-on-surface">Article not found</h2>
      <Link to="/blog" className="text-primary font-label text-xs uppercase tracking-widest font-bold border-b border-primary">
        Back to Journal
      </Link>
    </div>
  );

  const finalRelated = relatedPosts || [];
  const relatedColumns = 3;
  const visibleRelated = showAllRelated 
    ? finalRelated 
    : (finalRelated.length > relatedColumns 
        ? finalRelated.slice(0, Math.floor(finalRelated.length / relatedColumns) * relatedColumns)
        : finalRelated);
  const hasMoreRelated = !showAllRelated && finalRelated.length > visibleRelated.length;

  return (
    <div className="pb-32 bg-surface overflow-x-hidden">
      <SEOMeta 
        title={post.title}
        description={post.excerpt}
        image={post.image}
        type="article"
        articleMeta={{
          author: post.author,
          publishedTime: post.date,
          section: post.category
        }}
      />
      {/* Article Header */}
      <header className="max-w-4xl mx-auto px-6 pt-16 md:pt-24 pb-12 md:pb-16 text-center space-y-6 md:space-y-8 relative">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-full bg-linear-to-b from-accent-blush/30 to-transparent pointer-events-none"></div>
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="flex items-center justify-center gap-3 md:gap-4 font-label text-[9px] md:text-[10px] uppercase tracking-[0.3em] text-primary font-bold relative z-10"
        >
          <span>{post.category}</span>
          <span className="w-1 h-1 bg-accent-peach rounded-full"></span>
          <span>{post.date}</span>
        </motion.div>
        
        <motion.h1 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-4xl md:text-6xl lg:text-7xl font-headline font-bold leading-tight text-on-surface relative z-10"
        >
          {post.title}
        </motion.h1>

        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="flex flex-col items-center justify-center gap-3 md:gap-4 relative z-10"
        >
          <div className="flex items-center justify-center gap-4 md:gap-6">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 md:w-10 md:h-10 rounded-full overflow-hidden border-2 border-white shadow-sm bg-surface-container">
                <img 
                  src={post.authorImage || "https://i.pravatar.cc/150?u=elena"} 
                  alt={post.author} 
                  className="w-full h-full object-cover" 
                  referrerPolicy="no-referrer" 
                />
              </div>
              <span className="font-label text-[9px] md:text-[10px] uppercase tracking-widest font-bold text-on-surface">{post.author}</span>
            </div>
            <div className="hidden md:block h-4 w-px bg-outline-variant/30"></div>
            <div className="flex items-center gap-2 font-label text-[9px] md:text-[10px] uppercase tracking-widest text-on-surface-variant">
              <Clock size={14} /> {post.readTime}
            </div>
          </div>

          {/* Share & Wishlist actions */}
          <div className="flex flex-wrap items-center justify-center gap-3 md:gap-4 mt-2">
            <button
              type="button"
              onClick={handleShare}
              className={cn(
                "inline-flex items-center gap-2 px-4 py-2 rounded-full border text-[9px] md:text-[10px] font-label uppercase tracking-[0.2em] font-bold transition-all touch-manipulation min-h-11",
                isShared
                  ? "bg-accent-peach border-accent-peach text-on-primary"
                  : "bg-white/90 border-outline-variant/40 text-on-surface-variant hover:border-primary hover:text-primary shadow-sm"
              )}
              aria-label="Share article"
            >
              {isShared ? <Check size={14} /> : <Share2 size={14} />}
              <span className="hidden xs:inline">Share</span>
            </button>

            <button
              type="button"
              onClick={handleWishlist}
              className={cn(
                "inline-flex items-center gap-2 px-4 py-2 rounded-full border text-[9px] md:text-[10px] font-label uppercase tracking-[0.2em] font-bold transition-all touch-manipulation min-h-11",
                isJournalWishlisted(post.id)
                  ? "bg-primary text-on-primary border-primary"
                  : "bg-white/90 border-outline-variant/40 text-on-surface-variant hover:border-primary hover:text-primary shadow-sm"
              )}
              aria-label={isJournalWishlisted(post.id) ? "Remove from saved journals" : "Save journal to wishlist"}
            >
              <Heart
                size={14}
                className={cn(
                  "transition-transform",
                  isJournalWishlisted(post.id) && "fill-current scale-110"
                )}
              />
              <span className="hidden xs:inline">
                {isJournalWishlisted(post.id) ? 'Saved' : 'Save'}
              </span>
            </button>
          </div>
        </motion.div>
      </header>

      {/* Featured Image and Carousel */}
      <section className="max-w-7xl mx-auto px-6 mb-16 md:mb-24">
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 1 }}
          className="rounded-4xl md:rounded-[48px] overflow-hidden shadow-2xl border-8 md:border-12 border-white"
        >
          <ImageCarousel 
            images={post.images && post.images.length > 0 ? post.images : [post.image]} 
            aspectRatio="aspect-[4/3] sm:aspect-[16/9] lg:aspect-[21/9]"
            autoPlay={true}
          />
        </motion.div>
      </section>

      {/* Article Content */}
      <article className="max-w-7xl mx-auto px-4 sm:px-6 min-w-0 pb-[max(2rem,env(safe-area-inset-bottom,0px))]">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16">
          {/* Main Content */}
          <div className="lg:col-span-8 space-y-8 md:space-y-12 text-base md:text-lg text-on-surface-variant leading-loose font-body">
            <p className="text-xl md:text-2xl font-serif italic text-on-surface leading-relaxed border-l-4 border-accent-peach pl-6 md:pl-8 py-2">
              {post.excerpt}
            </p>
            
            <div className="max-w-none text-base md:text-lg text-on-surface-variant leading-[1.75] font-body space-y-6">
              {String(post.content ?? '')
                .split(/\n+/)
                .filter((p) => p.trim())
                .map((para, i) => (
                <p key={i} className="break-words whitespace-pre-wrap">
                  {para}
                </p>
              ))}
            </div>

            <div className="lg:hidden space-y-8 py-12 border-t border-outline-variant/30">
              {recommendedProducts.length > 0 && (
                <div className="space-y-4">
                  <div className="flex items-center gap-2 text-primary">
                    <ShoppingBag size={18} />
                    <span className="font-label text-[10px] uppercase tracking-widest font-bold">
                      {post.sectionSubheading || 'Curated Picks'}
                    </span>
                  </div>
                  <h2 className="text-2xl md:text-3xl font-headline font-bold text-on-surface">
                    {post.sectionHeading || 'Shop the Look'}
                  </h2>
                  {post.sectionDescription && (
                    <p className="text-sm text-on-surface-variant font-serif italic">
                      {post.sectionDescription}
                    </p>
                  )}
                </div>
              )}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 md:gap-8">
                {recommendedProducts.map((product) => (
                  <div key={product.id} className="group space-y-4 bg-white p-5 md:p-6 rounded-4xl border border-outline-variant/30 shadow-sm">
                    <div className="aspect-square rounded-3xl overflow-hidden relative bg-surface-container">
                      <Link to={`/shop/product/${product.id}`}>
                        <img 
                          src={product.image} 
                          alt={product.title} 
                          loading="lazy"
                          className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                          referrerPolicy="no-referrer"
                        />
                      </Link>
                    </div>
                    <div className="space-y-2">
                      <h3 className="font-headline font-bold text-lg text-on-surface">{product.title}</h3>
                      <p className="text-primary font-bold">{productPrices[product.id] || formatPrice(product.price)}</p>
                      <div className="flex gap-3">
                        <button 
                          onClick={() => handleAffiliateClick(product)}
                          className="flex-1 bg-primary text-white py-3 rounded-xl font-label text-[9px] md:text-[10px] uppercase tracking-widest font-bold"
                        >
                          Shop Now
                        </button>
                        <PinterestSaveButton product={product} variant="card" />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <p>
              As you move through your home today, ask yourself: Does this object bring me peace? Does this arrangement serve my daily rituals? Slow living is a practice of constant refinement, a journey toward a more beautiful, intentional life.
            </p>
          </div>

          {/* Sticky Sidebar */}
          <aside className="hidden lg:block lg:col-span-4">
            <div className="sticky top-32 space-y-8">
              {recommendedProducts.length > 0 && (
                <div className="bg-white rounded-4xl p-8 border border-outline-variant/30 shadow-sm space-y-6">
                  <div className="space-y-4">
                    <div className="flex items-center gap-3">
                      <ShoppingBag size={20} className="text-primary" />
                      <span className="font-label text-[10px] uppercase tracking-widest font-bold text-primary">
                        {post.sectionSubheading || 'Curated Picks'}
                      </span>
                    </div>
                    <h2 className="text-xl font-headline font-bold text-on-surface">
                      {post.sectionHeading || 'Shop the Look'}
                    </h2>
                    {post.sectionDescription && (
                      <p className="text-xs text-on-surface-variant font-serif italic leading-relaxed">
                        {post.sectionDescription}
                      </p>
                    )}
                  </div>
                  <p className="text-[9px] font-label text-outline uppercase tracking-widest leading-relaxed">
                    * Affiliate links. I may earn a commission if you make a purchase.
                  </p>
                  
                  <div className="space-y-6">
                    {recommendedProducts.map((p, i) => (
                      <div key={p.id} className={cn("pt-6 space-y-4", i !== 0 && "border-t border-outline-variant/20")}>
                        <div className="flex gap-4">
                          <div className="w-20 h-20 rounded-2xl overflow-hidden bg-surface-container shrink-0">
                            <img 
                              src={p.image} 
                              alt={p.title} 
                              loading="lazy"
                              className="w-full h-full object-cover"
                              referrerPolicy="no-referrer"
                            />
                          </div>
                          <div className="flex flex-col justify-center min-w-0">
                            <h3 className="text-sm font-headline font-bold truncate">{p.title}</h3>
                            <p className="text-primary text-sm font-bold mt-1">{productPrices[p.id] || formatPrice(p.price)}</p>
                          </div>
                        </div>
                        <div className="flex gap-3">
                          <button 
                            onClick={() => handleAffiliateClick(p)}
                            className="flex-1 bg-primary text-white py-2.5 rounded-xl font-label text-[9px] uppercase tracking-widest font-bold hover:bg-primary-hover transition-all"
                          >
                            Shop Now
                          </button>
                          <PinterestSaveButton product={p} variant="card" />
                        </div>
                      </div>
                    ))}
                  </div>
                  {post.sectionCtaText && (
                    <div className="pt-4 border-t border-outline-variant/20">
                      <Link to="/shop" className="group flex items-center justify-between gap-2 text-primary font-label text-[10px] uppercase tracking-widest font-bold">
                        {post.sectionCtaText}
                        <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform" />
                      </Link>
                    </div>
                  )}
                </div>
              )}
            </div>
          </aside>
        </div>
      </article>

      {/* Related Posts */}
      <section className="max-w-7xl mx-auto px-6 mt-16 md:mt-24 pt-12 md:pt-16 border-t border-outline-variant/30">
        <div className="max-w-2xl mb-12 md:mb-16 space-y-6">
          <div className="flex items-center gap-3 text-primary">
            <Sparkles size={20} fill="currentColor" />
            <span className="font-label text-xs uppercase tracking-[0.4em] font-bold">
              Journal
            </span>
          </div>
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-8">
            <div className="space-y-4">
              <h2 className="text-4xl md:text-6xl font-headline font-bold text-on-surface leading-tight">
                You Might Also Love
              </h2>
            </div>
            <Link to="/blog" className="group flex items-center gap-3 text-primary font-label text-xs uppercase tracking-[0.2em] font-bold whitespace-nowrap">
              <span className="border-b-2 border-primary/20 group-hover:border-primary transition-all pb-1">
                See More Inspiration
              </span>
              <div className="w-8 h-8 rounded-full bg-accent-blush flex items-center justify-center group-hover:bg-primary group-hover:text-white transition-all">
                <ArrowRight size={14} />
              </div>
            </Link>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8 md:gap-10">
          {visibleRelated.map((related) => (
            <div key={related.id} className="group bg-white p-4 rounded-4xl border border-outline-variant/30 hover:shadow-2xl hover:-translate-y-2 transition-all duration-500">
              <Link to={`/blog/${related.categorySlug}/${related.slug}`}>
                <div className="aspect-4/3 rounded-3xl overflow-hidden mb-6 bg-surface-container">
                  <img 
                    src={related.image} 
                    alt={related.title} 
                    loading="lazy"
                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" 
                    referrerPolicy="no-referrer" 
                  />
                </div>
              </Link>
              <div className="space-y-3 px-1">
                <span className="font-label text-[9px] md:text-[10px] uppercase tracking-widest text-primary font-bold">{related.category}</span>
                <Link to={`/blog/${related.categorySlug}/${related.slug}`}>
                  <h3 className="text-xl font-headline font-bold mt-1 text-on-surface group-hover:text-primary transition-colors line-clamp-2">
                    {related.title}
                  </h3>
                </Link>
                {/* Actions: wishlist + share */}
                <div className="flex items-center justify-between gap-3 pt-1">
                  <button
                    type="button"
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      if (!user) {
                        navigate('/login', { state: { from: location } });
                        return;
                      }
                      toggleJournalWishlist(related.id);
                    }}
                    className={cn(
                      "inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full border text-[8px] md:text-[9px] font-label uppercase tracking-[0.2em] font-bold transition-all touch-manipulation min-h-9",
                      isJournalWishlisted(related.id)
                        ? "bg-primary text-on-primary border-primary"
                        : "bg-white/90 border-outline-variant/40 text-on-surface-variant hover:border-primary hover:text-primary shadow-sm"
                    )}
                    aria-label={isJournalWishlisted(related.id) ? "Remove saved journal" : "Save journal"}
                  >
                    <Heart
                      size={12}
                      className={cn(
                        "transition-transform",
                        isJournalWishlisted(related.id) && "fill-current scale-110"
                      )}
                    />
                    <span className="hidden sm:inline">
                      {isJournalWishlisted(related.id) ? 'Saved' : 'Save'}
                    </span>
                  </button>

                  <button
                    type="button"
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      const shareUrl = `${window.location.origin}/blog/${related.categorySlug}/${related.slug}`;
                      const shareData = {
                        title: related.title,
                        text: related.excerpt,
                        url: shareUrl,
                      };
                      if (navigator.share) {
                        navigator.share(shareData).catch((err) => {
                          console.error('Error sharing:', err);
                        });
                      } else if (navigator.clipboard && navigator.clipboard.writeText) {
                        navigator.clipboard.writeText(shareUrl).catch((err) => {
                          console.error('Error copying to clipboard:', err);
                        });
                      }
                    }}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full border text-[8px] md:text-[9px] font-label uppercase tracking-[0.2em] font-bold transition-all touch-manipulation min-h-9 bg-white/90 border-outline-variant/40 text-on-surface-variant hover:border-primary hover:text-primary shadow-sm"
                    aria-label="Share article"
                  >
                    <Share2 size={12} />
                    <span className="hidden sm:inline">Share</span>
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

        {hasMoreRelated && (
          <div className="text-center pt-12">
            <button 
              onClick={() => setShowAllRelated(true)}
              className="text-primary font-label text-[10px] md:text-xs uppercase tracking-widest font-bold border-b border-primary/20 pb-1 hover:border-primary transition-all"
            >
              See More Inspiration
            </button>
          </div>
        )}
      </section>
    </div>
  );
}
