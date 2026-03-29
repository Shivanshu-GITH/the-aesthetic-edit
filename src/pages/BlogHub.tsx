import React, { useMemo } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { motion } from 'motion/react';
import { Search, ArrowRight, Mail } from 'lucide-react';
import { cn } from '../lib/utils';
import SEOMeta from '../components/SEOMeta';
import { useBlogCategories, useBlogPosts } from '../hooks/useBlog';
import { BlogPostCardGridSkeleton, Skeleton } from '../components/Skeleton';

export default function BlogHub() {
  const [searchParams, setSearchParams] = useSearchParams();
  const searchQuery = searchParams.get('search') || '';
  
  const updateSearch = (query: string) => {
    const newParams = new URLSearchParams(searchParams);
    if (query) {
      newParams.set('search', query);
    } else {
      newParams.delete('search');
    }
    setSearchParams(newParams, { replace: true });
  };

  const [email, setEmail] = React.useState('');
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const [submitStatus, setSubmittingStatus] = React.useState<'idle' | 'success' | 'error'>('idle');

  const { categories, loading: catLoading } = useBlogCategories();
  const { posts, loading: postsLoading } = useBlogPosts(undefined, 1, 12);

  const featuredPost = useMemo(() => posts[0] ?? null, [posts]);

  const filteredPosts = useMemo(() => {
    return posts.filter(post => {
      const matchesSearch = post.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
                           post.excerpt.toLowerCase().includes(searchQuery.toLowerCase());
      return matchesSearch;
    });
  }, [posts, searchQuery]);

  const handleSubscribe = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      alert('Please enter a valid email address');
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await fetch('/api/leads', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: 'Blog Subscriber', email, source: 'blog-hub' }),
      });
      if (res.ok) {
        setSubmittingStatus('success');
        setEmail('');
      } else {
        setSubmittingStatus('error');
      }
    } catch (err) {
      setSubmittingStatus('error');
    } finally {
      setIsSubmitting(false);
      setTimeout(() => setSubmittingStatus('idle'), 3000);
    }
  };

  return (
    <div className="pb-32 space-y-24 bg-surface">
      <SEOMeta 
        title="The Journal — Aesthetic Inspiration & Guides"
        description="Explore curated guides on fashion, home styling, and intentional living. Pinterest-inspired content by Anjali."
        type="website"
      />
      {/* Hero Section */}
      <header className="max-w-4xl mx-auto px-6 pt-24 text-center space-y-6 relative">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-full bg-gradient-to-b from-accent-blush/20 to-transparent pointer-events-none"></div>
        <h1 className="text-5xl md:text-7xl font-headline font-bold leading-tight text-on-surface relative z-10">
          The <span className="italic font-normal text-primary">Journal</span>
        </h1>
        <p className="font-serif italic text-xl text-on-surface-variant max-w-2xl mx-auto relative z-10">
          Ideas, inspiration, and curated guides to help you style your life with intention.
        </p>
      </header>

      {/* Featured Post */}
      <section className="max-w-7xl mx-auto px-6">
        {postsLoading ? (
          <div className="bg-white rounded-[40px] overflow-hidden border border-outline-variant/30 h-[500px]">
            <Skeleton className="w-full h-full" />
          </div>
        ) : featuredPost && (
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="group relative bg-white rounded-[40px] overflow-hidden border border-outline-variant/30 shadow-sm hover:shadow-2xl transition-all duration-500"
          >
            <div className="grid grid-cols-1 lg:grid-cols-2">
              <div className="aspect-[16/10] lg:aspect-auto overflow-hidden bg-surface-container">
                <img 
                  src={featuredPost.image} 
                  alt={featuredPost.title} 
                  loading="lazy"
                  className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-105"
                  referrerPolicy="no-referrer"
                />
              </div>
              <div className="p-8 lg:p-16 flex flex-col justify-center space-y-8 bg-gradient-to-br from-white to-accent-blush/10">
                <div className="space-y-4">
                  <span className="font-label text-xs uppercase tracking-[0.3em] text-primary font-bold">Featured Article</span>
                  <h2 className="text-3xl md:text-5xl font-headline font-bold leading-tight text-on-surface group-hover:text-primary transition-colors">
                    {featuredPost.title}
                  </h2>
                  <p className="text-lg text-on-surface-variant leading-relaxed">
                    {featuredPost.excerpt}
                  </p>
                </div>
                <Link 
                  to={`/blog/${featuredPost.categorySlug}/${featuredPost.slug}`}
                  className="inline-flex items-center gap-3 text-primary font-label text-sm uppercase tracking-widest font-bold group/link"
                >
                  Read Article
                  <ArrowRight size={18} className="transition-transform group-hover/link:translate-x-2" />
                </Link>
              </div>
            </div>
          </motion.div>
        )}
      </section>

      {/* Explore by Category */}
      <section className="max-w-7xl mx-auto px-6 space-y-12">
        <div className="text-center space-y-4">
          <h2 className="text-3xl font-headline font-bold text-on-surface">Explore by Category</h2>
          <div className="w-16 h-0.5 bg-accent-peach mx-auto"></div>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-6">
          {catLoading ? (
            Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="aspect-[4/5] rounded-[32px] overflow-hidden">
                <Skeleton className="w-full h-full" />
              </div>
            ))
          ) : (
            categories.map((category, index) => (
              <motion.div
                key={category.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                whileHover={{ scale: 1.03 }}
                className="transition-transform duration-300"
              >
                <Link to={`/blog/${category.slug}`} className="group block relative aspect-[4/5] rounded-[32px] overflow-hidden shadow-sm hover:shadow-2xl transition-all duration-500 bg-surface-container">
                  <img 
                    src={category.image} 
                    alt={category.title} 
                    loading="lazy"
                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                    referrerPolicy="no-referrer"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-on-surface/80 via-on-surface/20 to-transparent opacity-60 group-hover:opacity-80 transition-opacity"></div>
                  <div className="absolute bottom-6 left-6 right-6 text-white text-center">
                    <h3 className="text-xl font-headline font-bold leading-tight">{category.title}</h3>
                  </div>
                </Link>
              </motion.div>
            ))
          )}
        </div>
      </section>

      {/* Blog Grid Section */}
      <section className="max-w-7xl mx-auto px-6 space-y-12">
        {/* Search */}
        <div className="flex justify-center border-b border-outline-variant/30 pb-12">
          <div className="relative w-full max-w-xl">
            <input 
              type="text" 
              placeholder="Search articles..."
              value={searchQuery}
              onChange={(e) => updateSearch(e.target.value)}
              className="w-full pl-12 pr-4 py-4 rounded-2xl bg-white border border-outline-variant/30 focus:outline-none focus:border-primary transition-all font-body text-sm shadow-sm"
            />
            <Search size={20} className="absolute left-4 top-1/2 -translate-y-1/2 text-outline" />
          </div>
        </div>

        {/* Grid */}
        {postsLoading ? (
          <BlogPostCardGridSkeleton count={6} />
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-12">
            {filteredPosts.map((post, index) => (
              <motion.article
                key={post.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className="group space-y-6 bg-white p-4 rounded-[32px] border border-outline-variant/30 hover:shadow-2xl hover:-translate-y-2 transition-all duration-500"
              >
                <Link to={`/blog/${post.categorySlug}/${post.slug}`} className="block relative aspect-[4/5] rounded-[24px] overflow-hidden shadow-sm bg-surface-container">
                  <img 
                    src={post.image} 
                    alt={post.title} 
                    loading="lazy"
                    className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-110"
                    referrerPolicy="no-referrer"
                  />
                  <div className="absolute top-6 left-6">
                    <span className="bg-accent-blush/90 backdrop-blur-sm px-4 py-1.5 rounded-full font-label text-[9px] uppercase tracking-widest font-bold text-primary">
                      {post.category}
                    </span>
                  </div>
                </Link>
                <div className="space-y-4 px-2">
                  <div className="flex items-center gap-4 text-[10px] font-label uppercase tracking-widest text-outline">
                    <span>{post.date}</span>
                    <span className="w-1 h-1 rounded-full bg-outline/30"></span>
                    <span>{post.readTime}</span>
                  </div>
                  <h3 className="text-2xl font-headline font-bold leading-tight text-on-surface group-hover:text-primary transition-colors">
                    <Link to={`/blog/${post.categorySlug}/${post.slug}`}>{post.title}</Link>
                  </h3>
                  <p className="text-on-surface-variant leading-relaxed line-clamp-2">
                    {post.excerpt}
                  </p>
                  <Link 
                    to={`/blog/${post.categorySlug}/${post.slug}`}
                    className="inline-flex items-center gap-2 text-primary font-label text-[10px] uppercase tracking-widest font-bold group/more"
                  >
                    Read More
                    <ArrowRight size={14} className="transition-transform group-hover/more:translate-x-1" />
                  </Link>
                </div>
              </motion.article>
            ))}
          </div>
        )}

        {!postsLoading && filteredPosts.length === 0 && (
          <div className="text-center py-24">
            <p className="font-serif italic text-2xl text-on-surface-variant">No articles found for this selection.</p>
          </div>
        )}
      </section>

      {/* Email CTA */}
      <section className="w-full py-24 bg-gradient-to-b from-surface to-accent-blush/20">
        <div className="max-w-7xl mx-auto px-6">
          <div className="rounded-[48px] p-12 md:p-24 text-center space-y-10 relative overflow-hidden shadow-2xl border border-outline-variant/30 bg-gradient-to-br from-surface-container to-accent-blush/30">
            {/* Subtle decorative elements */}
            <div className="absolute inset-0 opacity-30 pointer-events-none">
              <div className="absolute -top-24 -left-24 w-96 h-96 bg-white/40 blur-[100px] rounded-full"></div>
              <div className="absolute -bottom-24 -right-24 w-96 h-96 bg-accent-peach/20 blur-[100px] rounded-full"></div>
            </div>
            
            <div className="relative z-10 space-y-8 max-w-2xl mx-auto">
              <div className="w-20 h-20 bg-white/60 backdrop-blur-md rounded-full flex items-center justify-center mx-auto mb-4 shadow-sm border border-white/40">
                <Mail className="text-primary" size={32} />
              </div>
              <div className="space-y-4">
                <h2 className="text-4xl md:text-6xl font-headline font-bold text-on-surface tracking-tight">
                  Get weekly aesthetic <span className="italic font-normal serif text-primary">inspiration</span>
                </h2>
                <p className="text-on-surface-variant text-lg md:text-xl font-serif italic max-w-lg mx-auto leading-relaxed">
                  Join 10,000+ others receiving curated guides, styling tips, and intentional living inspiration.
                </p>
              </div>
              
              <form className="flex flex-col sm:flex-row gap-4 pt-6" onSubmit={handleSubscribe}>
                <input 
                  type="email" 
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Your email address"
                  className="flex-1 px-8 py-5 rounded-2xl bg-white/70 backdrop-blur-sm text-on-surface placeholder:text-on-surface-variant/50 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:bg-white/90 transition-all shadow-sm border border-outline-variant/30"
                />
                <button 
                  disabled={isSubmitting}
                  className="bg-primary hover:bg-primary-hover text-white px-10 py-5 rounded-2xl font-label font-bold uppercase tracking-widest transition-all shadow-xl shadow-primary/20 active:scale-95 disabled:opacity-50"
                >
                  {isSubmitting ? 'Subscribing...' : 'Subscribe'}
                </button>
              </form>
              
              {submitStatus === 'success' && <p className="text-green-600 font-label text-xs uppercase tracking-widest">Successfully subscribed! ✨</p>}
              {submitStatus === 'error' && <p className="text-red-400 font-label text-xs uppercase tracking-widest">Something went wrong. Try again.</p>}
              
              <p className="text-[10px] font-label uppercase tracking-[0.2em] text-on-surface-variant/60 font-bold">
                No spam. Just pure inspiration.
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
