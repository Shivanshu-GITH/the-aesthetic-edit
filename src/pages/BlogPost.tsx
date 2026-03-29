import React from 'react';
import { useParams, Link, useNavigate, useLocation } from 'react-router-dom';
import { motion } from 'motion/react';
import { Clock, Share2, Heart, ArrowRight, ShoppingBag, Check } from 'lucide-react';
import { formatPrice } from '../lib/currency';
import SEOMeta from '../components/SEOMeta';
import { useBlogPost } from '../hooks/useBlog';
import { BlogPostSkeleton } from '../components/Skeleton';
import PinterestSaveButton from '../components/PinterestSaveButton';
import { useWishlist } from '../context/WishlistContext';
import { useAuth } from '../context/AuthContext';
import { cn } from '../lib/utils';

export default function BlogPost() {
  const { category, slug } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const [showAllRecommended, setShowAllRecommended] = React.useState(false);
  const [showAllRelated, setShowAllRelated] = React.useState(false);
  const [isShared, setIsShared] = React.useState(false);
  
  const { post, recommendedProducts, relatedPosts, loading, error } = useBlogPost(slug);
  const { isJournalWishlisted, toggleJournalWishlist } = useWishlist();
  const { user } = useAuth();

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

  if (loading) return <BlogPostSkeleton />;

  if (error || !post) return (
    <div className="p-24 text-center space-y-6">
      <h2 className="text-3xl font-headline font-bold text-on-surface">Post not found</h2>
      <Link to="/blog" className="text-primary font-label text-xs uppercase tracking-widest font-bold border-b border-primary">
        Back to Blog
      </Link>
    </div>
  );

  const visibleRelated = showAllRelated 
    ? relatedPosts 
    : (relatedPosts.length > 3 
        ? relatedPosts.slice(0, 3)
        : relatedPosts);
  const hasMoreRelated = !showAllRelated && relatedPosts.length > visibleRelated.length;

  return (
    <div className="pb-32 bg-surface">
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
      <header className="max-w-4xl mx-auto px-6 pt-24 pb-16 text-center space-y-8 relative">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-full bg-gradient-to-b from-accent-blush/30 to-transparent pointer-events-none"></div>
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="flex items-center justify-center gap-4 font-label text-[10px] uppercase tracking-[0.3em] text-primary font-bold relative z-10"
        >
          <span>{post.category}</span>
          <span className="w-1 h-1 bg-accent-peach rounded-full"></span>
          <span>{post.date}</span>
        </motion.div>
        
        <motion.h1 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-5xl md:text-7xl font-headline font-bold leading-tight text-on-surface relative z-10"
        >
          {post.title}
        </motion.h1>

        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="flex items-center justify-center gap-6 relative z-10"
        >
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full overflow-hidden border-2 border-white shadow-sm">
              <img src="https://i.pravatar.cc/150?u=elena" alt={post.author} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
            </div>
            <span className="font-label text-[10px] uppercase tracking-widest font-bold text-on-surface">{post.author}</span>
          </div>
          <div className="h-4 w-px bg-outline-variant/30"></div>
          <div className="flex items-center gap-2 font-label text-[10px] uppercase tracking-widest text-on-surface-variant">
            <Clock size={14} /> {post.readTime}
          </div>
        </motion.div>
      </header>

      {/* Featured Image */}
      <section className="max-w-7xl mx-auto px-6 mb-24">
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 1 }}
          className="aspect-[21/9] rounded-[48px] overflow-hidden shadow-2xl border-[12px] border-white bg-surface-container"
        >
          <img 
            src={post.image} 
            alt={post.title} 
            loading="lazy"
            className="w-full h-full object-cover"
            referrerPolicy="no-referrer"
          />
        </motion.div>
      </section>

      {/* Article Content */}
      <article className="max-w-7xl mx-auto px-6">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-16">
          {/* Main Content */}
          <div className="lg:col-span-8 space-y-12 text-lg text-on-surface-variant leading-loose font-body">
            <p className="text-2xl font-serif italic text-on-surface leading-relaxed border-l-4 border-accent-peach pl-8 py-2">
              {post.excerpt}
            </p>
            
            <p>{post.content}</p>

            <div className="lg:hidden space-y-8 py-12 border-t border-outline-variant/30">
              <h2 className="text-3xl font-headline font-bold text-on-surface">Shop the Look</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
                {recommendedProducts.map((product) => (
                  <div key={product.id} className="group space-y-4 bg-white p-6 rounded-[32px] border border-outline-variant/30 shadow-sm">
                    <div className="aspect-square rounded-[24px] overflow-hidden relative bg-surface-container">
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
                      <p className="text-primary font-bold">{formatPrice(product.price)}</p>
                      <div className="flex gap-3">
                        <button 
                          onClick={() => handleAffiliateClick(product)}
                          className="flex-1 bg-primary text-white py-3 rounded-xl font-label text-[10px] uppercase tracking-widest font-bold"
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
              <div className="bg-white rounded-[32px] p-8 border border-outline-variant/30 shadow-sm space-y-6">
                <div className="flex items-center gap-3">
                  <ShoppingBag size={20} className="text-primary" />
                  <h2 className="text-xl font-headline font-bold text-on-surface">Shop the Look</h2>
                </div>
                <p className="text-[9px] font-label text-outline uppercase tracking-widest leading-relaxed">
                  * Affiliate links. I may earn a commission if you make a purchase.
                </p>
                
                <div className="space-y-6">
                  {recommendedProducts.map((p, i) => (
                    <div key={p.id} className={cn("pt-6 space-y-4", i !== 0 && "border-t border-outline-variant/20")}>
                      <div className="flex gap-4">
                        <div className="w-20 h-20 rounded-2xl overflow-hidden bg-surface-container flex-shrink-0">
                          <img 
                            src={p.image} 
                            alt={p.title} 
                            loading="lazy"
                            className="w-full h-full object-cover"
                            referrerPolicy="no-referrer"
                          />
                        </div>
                        <div className="space-y-1">
                          <Link to={`/shop/product/${p.id}`}>
                            <h3 className="font-headline font-bold text-sm text-on-surface hover:text-primary transition-colors line-clamp-2">{p.title}</h3>
                          </Link>
                          <p className="text-primary font-bold text-sm">{formatPrice(p.price)}</p>
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <button 
                          onClick={() => handleAffiliateClick(p)}
                          className="flex-1 bg-primary text-on-primary text-[9px] font-label uppercase tracking-widest px-3 py-2.5 rounded-xl hover:bg-primary-hover transition-all font-bold"
                        >
                          Shop
                        </button>
                        <PinterestSaveButton product={p} variant="card" className="w-9 h-9" />
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Social Actions */}
              <div className="flex justify-center gap-6">
                <button 
                  onClick={handleWishlist}
                  className={cn(
                    "w-14 h-14 rounded-full border flex items-center justify-center transition-all shadow-sm",
                    post && isJournalWishlisted(post.id)
                      ? "bg-accent-blush border-primary text-primary"
                      : "border-outline-variant/30 text-outline hover:text-primary hover:border-primary hover:bg-white"
                  )}
                  aria-label={post && isJournalWishlisted(post.id) ? "Remove from saved" : "Save journal"}
                >
                  <Heart size={24} className={post && isJournalWishlisted(post.id) ? "fill-current" : ""} />
                </button>
                <button 
                  onClick={handleShare}
                  className={cn(
                    "w-14 h-14 rounded-full border flex items-center justify-center transition-all shadow-sm",
                    isShared
                      ? "bg-accent-peach border-accent-peach text-on-primary"
                      : "border-outline-variant/30 text-outline hover:text-primary hover:border-primary hover:bg-white"
                  )}
                  aria-label="Share journal"
                >
                  {isShared ? <Check size={24} /> : <Share2 size={24} />}
                </button>
              </div>
            </div>
          </aside>
        </div>
      </article>

      {/* Related Posts */}
      <section className="max-w-7xl mx-auto px-6 mt-40 pt-24 border-t border-outline-variant/30">
        <h2 className="text-3xl font-headline font-bold mb-12 text-on-surface">You Might Also Love</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
          {visibleRelated.map((related) => (
            <div key={related.id} className="group bg-white p-4 rounded-[32px] border border-outline-variant/30 hover:shadow-2xl hover:-translate-y-2 transition-all duration-500">
              <Link to={`/blog/${related.categorySlug}/${related.slug}`}>
                <div className="aspect-[4/3] rounded-[24px] overflow-hidden mb-6 bg-surface-container">
                  <img 
                    src={related.image} 
                    alt={related.title} 
                    loading="lazy"
                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" 
                    referrerPolicy="no-referrer" 
                  />
                </div>
                <span className="font-label text-[10px] uppercase tracking-widest text-primary font-bold">{related.category}</span>
                <h3 className="text-xl font-headline font-bold mt-2 text-on-surface group-hover:text-primary transition-colors">{related.title}</h3>
              </Link>
            </div>
          ))}
        </div>

        {hasMoreRelated && (
          <div className="text-center pt-12">
            <button 
              onClick={() => setShowAllRelated(true)}
              className="text-primary font-label text-xs uppercase tracking-widest font-bold border-b border-primary/20 pb-1 hover:border-primary transition-all"
            >
              See More Articles
            </button>
          </div>
        )}
      </section>
    </div>
  );
}
