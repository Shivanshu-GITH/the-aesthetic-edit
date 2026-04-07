import React, { useMemo } from 'react';
import { useParams, Link, useLocation, useNavigate } from 'react-router-dom';
import { motion } from 'motion/react';
import { Clock, ArrowRight, Heart, Share2, Check } from 'lucide-react';
import SEOMeta from '../components/SEOMeta';
import { useBlogCategories, useBlogPosts } from '../hooks/useBlog';
import { BlogPostCardGridSkeleton } from '../components/Skeleton';
import ImageCarousel from '../components/ImageCarousel';
import { useWishlist } from '../context/WishlistContext';
import { useAuth } from '../context/AuthContext';

export default function BlogCategory() {
  const { category: categorySlug } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  const { isJournalWishlisted, toggleJournalWishlist } = useWishlist();
  const { user } = useAuth();
  const [justSharedId, setJustSharedId] = React.useState<string | null>(null);
  const { categories, loading: catLoading } = useBlogCategories();
  const { posts, loading: postsLoading, error } = useBlogPosts(categorySlug, 1, 12);
  const [siteConfigs, setSiteConfigs] = React.useState<Record<string, string>>({});
  const [loadingConfig, setLoadingConfig] = React.useState(true);

  React.useEffect(() => {
    fetch('/api/home-shop/config')
      .then(res => res.json())
      .then(data => {
        if (data.success) setSiteConfigs(data.data);
      })
      .catch(() => {})
      .finally(() => setLoadingConfig(false));
  }, []);

  const defaultAuthorImage =
    (!loadingConfig && siteConfigs.blog_default_author_image) ||
    'https://i.pravatar.cc/150?u=author';

  const category = useMemo(() => 
    categories.find(c => c.slug === categorySlug),
  [categories, categorySlug]);

  const handleCardWishlist = async (e: React.MouseEvent, postId: string) => {
    e.preventDefault();
    e.stopPropagation();
    if (!user) {
      navigate('/login', { state: { from: location } });
      return;
    }
    await toggleJournalWishlist(postId);
  };

  const handleCardShare = async (e: React.MouseEvent, post: any) => {
    e.preventDefault();
    e.stopPropagation();
    const shareUrl = `${window.location.origin}/blog/${post.categorySlug}/${post.slug}`;
    const shareData = {
      title: post.title,
      text: post.excerpt,
      url: shareUrl,
    };

    if (navigator.share) {
      try {
        await navigator.share(shareData);
      } catch (err) {
        console.error('Error sharing:', err);
      }
    } else if (navigator.clipboard && navigator.clipboard.writeText) {
      try {
        await navigator.clipboard.writeText(shareUrl);
        setJustSharedId(post.id);
        window.setTimeout(() => setJustSharedId((prev) => (prev === post.id ? null : prev)), 2000);
      } catch (err) {
        console.error('Error copying to clipboard:', err);
      }
    }
  };

  if (catLoading || postsLoading || loadingConfig) return (
    <div className="pb-32 bg-surface pt-24 px-6">
      <div className="max-w-7xl mx-auto space-y-12">
        <div className="h-24 w-64 bg-surface-container animate-pulse rounded-2xl mx-auto" />
        <BlogPostCardGridSkeleton count={6} />
      </div>
    </div>
  );

  if (!category || error) return (
    <div className="p-24 text-center space-y-6">
      <h2 className="text-3xl font-headline font-bold text-on-surface">{siteConfigs.blog_category_not_found_title || 'Category not found'}</h2>
      <Link to="/blog" className="text-primary font-label text-xs uppercase tracking-widest font-bold border-b border-primary">
        {siteConfigs.blog_category_back_link || 'Back to Blog'}
      </Link>
    </div>
  );

  return (
    <div className="pb-32 bg-surface">
      <SEOMeta 
        title={category.title}
        description={category.description}
        image={category.image}
        type="website"
      />
      <header className="max-w-4xl mx-auto px-6 pt-24 pb-16 text-center space-y-6 relative">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-full bg-gradient-to-b from-accent-blush/30 to-transparent pointer-events-none"></div>
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="font-label text-xs uppercase tracking-[0.3em] text-primary font-bold relative z-10"
        >
          {siteConfigs.blog_category_kicker || 'Blog Category'}
        </motion.div>
        <h1 className="text-5xl md:text-7xl font-headline font-bold leading-tight text-on-surface relative z-10">
          {category.title}
        </h1>
        <p className="font-serif italic text-xl text-on-surface-variant relative z-10">
          {category.description}
        </p>
      </header>

      <section className="max-w-7xl mx-auto px-6">
        {posts.length === 0 && (
          <div className="text-center py-24 space-y-4">
            <p className="font-serif italic text-2xl text-on-surface-variant">
              {siteConfigs.blog_category_empty_message || 'No posts in this category yet — check back soon.'}
            </p>
            <Link to="/blog" className="text-primary font-label text-xs uppercase tracking-widest font-bold border-b border-primary">
              {siteConfigs.blog_category_browse_all || 'Browse All Posts'}
            </Link>
          </div>
        )}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-12">
          {posts.map((post, index) => (
            <motion.article 
              key={post.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className="group space-y-6 bg-white p-4 rounded-[32px] border border-outline-variant/30 hover:shadow-2xl hover:-translate-y-2 transition-all duration-500"
            >
              <Link to={`/blog/${categorySlug}/${post.slug}`} className="block aspect-[4/5] rounded-[24px] overflow-hidden relative shadow-sm bg-surface-container">
                <ImageCarousel
                  images={Array.isArray(post.images) && post.images.length > 0 ? post.images : [post.image]}
                  aspectRatio="aspect-[4/5]"
                  className="rounded-none"
                  imageClassName="object-contain"
                />
              </Link>
              <div className="space-y-4 px-2">
                <div className="flex items-center justify-between gap-4">
                  <div className="flex items-center gap-4 font-label text-[10px] uppercase tracking-widest text-on-surface-variant">
                    <span>{post.date}</span>
                    <span className="w-1 h-1 bg-accent-peach rounded-full"></span>
                    <span className="flex items-center gap-1"><Clock size={12} /> {post.readTime}</span>
                  </div>
                  <div className="w-7 h-7 rounded-full overflow-hidden bg-surface-container border border-outline-variant/30">
                    <img
                      src={post.authorImage || defaultAuthorImage}
                      alt={post.author}
                      className="w-full h-full object-cover"
                      referrerPolicy="no-referrer"
                    />
                  </div>
                </div>

                {/* Actions: wishlist + share */}
                <div className="flex items-center justify-between gap-3 pt-1">
                  <button
                    type="button"
                    onClick={(e) => handleCardWishlist(e, post.id)}
                    className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full border text-[8px] md:text-[9px] font-label uppercase tracking-[0.2em] font-bold transition-all touch-manipulation min-h-9 ${
                      isJournalWishlisted(post.id)
                        ? 'bg-primary text-on-primary border-primary'
                        : 'bg-white/90 border-outline-variant/40 text-on-surface-variant hover:border-primary hover:text-primary shadow-sm'
                    }`}
                    aria-label={isJournalWishlisted(post.id) ? 'Remove saved journal' : 'Save journal'}
                  >
                    <Heart
                      size={12}
                      className={isJournalWishlisted(post.id) ? 'fill-current scale-110 transition-transform' : 'transition-transform'}
                    />
                    <span className="hidden sm:inline">
                      {isJournalWishlisted(post.id) ? (siteConfigs.journal_saved_label || 'Saved') : (siteConfigs.journal_save_label || 'Save')}
                    </span>
                  </button>

                  <button
                    type="button"
                    onClick={(e) => handleCardShare(e, post)}
                    className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full border text-[8px] md:text-[9px] font-label uppercase tracking-[0.2em] font-bold transition-all touch-manipulation min-h-9 ${
                      justSharedId === post.id
                        ? 'bg-accent-peach text-on-primary border-accent-peach'
                        : 'bg-white/90 border-outline-variant/40 text-on-surface-variant hover:border-primary hover:text-primary shadow-sm'
                    }`}
                    aria-label="Share article"
                  >
                    {justSharedId === post.id ? <Check size={12} /> : <Share2 size={12} />}
                    <span className="hidden sm:inline">
                      {justSharedId === post.id ? (siteConfigs.journal_shared_label || 'Copied') : (siteConfigs.journal_share_label || 'Share')}
                    </span>
                  </button>
                </div>

                <Link to={`/blog/${categorySlug}/${post.slug}`}>
                  <h3 className="text-2xl font-headline font-bold leading-snug text-on-surface group-hover:text-primary transition-colors">
                    {post.title}
                  </h3>
                </Link>
                <p className="text-on-surface-variant leading-relaxed line-clamp-3">
                  {post.excerpt}
                </p>
                <Link 
                  to={`/blog/${categorySlug}/${post.slug}`}
                  className="inline-flex items-center gap-2 font-label text-[10px] uppercase tracking-widest font-bold text-primary group-hover:gap-4 transition-all"
                >
                  {siteConfigs.blog_category_read_more || 'Read More'} <ArrowRight size={14} />
                </Link>
              </div>
            </motion.article>
          ))}
        </div>
      </section>
    </div>
  );
}
