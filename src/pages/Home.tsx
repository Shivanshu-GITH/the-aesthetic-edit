import React, { useMemo, useEffect } from 'react';
import { motion } from 'motion/react';
import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import SEOMeta from '../components/SEOMeta';
import { useBlogPosts } from '../hooks/useBlog';
import { BlogPostCardGridSkeleton } from '../components/Skeleton';

export default function Home() {
  const [showAllMoods, setShowAllMoods] = React.useState(false);
  const [moods, setMoods] = React.useState<any[]>([]);
  const [findHereItems, setFindHereItems] = React.useState<any[]>([]);
  const [siteConfigs, setSiteConfigs] = React.useState<Record<string, string>>({});
  const [loadingConfig, setLoadingConfig] = React.useState(true);

  const { posts, loading: journalLoading } = useBlogPosts(undefined, 1, 3);
  const journalPosts = useMemo(() => posts.slice(0, 3), [posts]);

  useEffect(() => {
    const fetchConfig = async () => {
      try {
        const [moodsRes, findHereRes, configRes] = await Promise.all([
          fetch('/api/home-shop/moods'),
          fetch('/api/home-shop/find-here'),
          fetch('/api/home-shop/config')
        ]);
        if (moodsRes.ok && findHereRes.ok && configRes.ok) {
          const [moodsData, findHereData, configData] = await Promise.all([
            moodsRes.json(),
            findHereRes.json(),
            configRes.json()
          ]);
          setMoods(moodsData.data);
          setFindHereItems(findHereData.data);
          setSiteConfigs(configData.data);
        }
      } catch (err) {
        console.error('Failed to fetch home config', err);
      } finally {
        setLoadingConfig(false);
      }
    };
    fetchConfig();
  }, []);

  const homeHeroImage = siteConfigs.home_hero_image || (!loadingConfig ? "https://images.unsplash.com/photo-1494438639946-1ebd1d20bf85?auto=format&fit=crop&q=80&w=1200" : '');

  const moodColumns = 5;
  const visibleMoods = showAllMoods ? moods : (moods.length > moodColumns ? moods.slice(0, Math.floor(moods.length / moodColumns) * moodColumns) : moods);
  const hasMoreMoods = !showAllMoods && moods.length > visibleMoods.length;

  return (
    <div className="min-h-screen space-y-20 md:space-y-32 pb-20 md:pb-32">
      <SEOMeta 
        title="Curated Aesthetic Finds for Your Home, Style & Life"
        description="The Aesthetic Edit by Anjali — curated Pinterest-inspired picks for fashion, home decor, and intentional living. Shop the aesthetic."
        image="https://images.unsplash.com/photo-1494438639946-1ebd1d20bf85?auto=format&fit=crop&q=80&w=1200"
        type="website"
      />
      {/* Hero Section */}
      <section className="relative min-h-[85vh] flex items-center bg-linear-to-br from-surface via-surface to-accent-blush/30 px-6 py-20 lg:py-10 overflow-hidden">
        <div className="absolute top-[-10%] right-[-10%] w-125 h-125 bg-accent-peach/20 rounded-full blur-[120px] pointer-events-none"></div>
        <div className="absolute bottom-[-10%] left-[-10%] w-100 h-100 bg-accent-blush/30 rounded-full blur-[100px] pointer-events-none"></div>
        
        <div className="max-w-7xl mx-auto w-full grid grid-cols-1 lg:grid-cols-[1fr_auto] gap-12 lg:gap-16 items-center relative z-10">
          <motion.div 
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="space-y-8 md:space-y-10 relative z-10 text-center lg:text-left"
          >
            <div className="space-y-4 md:space-y-6">
              <h1 className="text-5xl md:text-7xl lg:text-8xl font-headline font-bold leading-[0.9] tracking-tight text-on-surface">
                {siteConfigs.home_hero_title_line1 || 'The'} <br />
                <span className="italic font-normal text-primary">{siteConfigs.home_hero_title_line2 || 'Aesthetic Edit'}</span>
              </h1>
              <div className="space-y-4 md:space-y-6">
                <h2 className="text-xl md:text-2xl lg:text-3xl font-serif italic text-primary leading-relaxed lg:whitespace-nowrap">
                  {siteConfigs.home_hero_subtitle || 'Turn your saved inspiration into a life you actually live.'}
                </h2>
                <p className="text-base md:text-lg lg:text-xl text-on-surface-variant leading-[1.6] max-w-135 mx-auto lg:mx-0">
                  {siteConfigs.home_hero_description || 'Curated finds, cozy spaces, and effortless style — everything you need to romanticize your life and create a world that feels uniquely yours.'}
                </p>
              </div>
            </div>
            <div className="flex flex-col sm:flex-row flex-wrap gap-4 md:gap-6 justify-center lg:justify-start">
              <Link 
                to="/shop" 
                className="bg-primary text-on-primary px-8 md:px-10 py-3.5 md:py-4 rounded-2xl font-label font-semibold tracking-widest uppercase hover:bg-primary-hover transition-all shadow-xl shadow-primary/20 text-sm md:text-base"
              >
                {siteConfigs.home_hero_shop_btn || 'Shop the Aesthetic'}
              </Link>
              <Link 
                to="/blog" 
                className="border-2 border-primary text-primary px-8 md:px-10 py-3.5 md:py-4 rounded-2xl font-label font-semibold tracking-widest uppercase hover:bg-accent-blush transition-all text-sm md:text-base"
              >
                {siteConfigs.home_hero_blog_btn || 'Explore the Blog'}
              </Link>
            </div>
          </motion.div>

          <motion.div 
            initial={{ opacity: 0, scale: 0.95, x: 20 }}
            animate={{ opacity: 1, scale: 1, x: 0 }}
            transition={{ duration: 1.2, delay: 0.2 }}
            className="relative aspect-4/5 rounded-4xl overflow-hidden shadow-2xl w-full max-w-100 mx-auto group bg-surface-container lg:block"
          >
            <div className="absolute inset-0 bg-linear-to-t from-primary/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-700 z-10"></div>
            {homeHeroImage ? (
              <img 
                src={homeHeroImage} 
                alt={siteConfigs.home_hero_title_line2 || "Minimalist Aesthetic Interior"} 
                loading="lazy"
                className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-110"
                referrerPolicy="no-referrer"
              />
            ) : null}
          </motion.div>
        </div>
      </section>

      {/* Browse by Mood */}
      <section className="max-w-7xl mx-auto px-6">
        <div className="text-center mb-12 md:mb-16 space-y-4">
          <h2 className="text-3xl md:text-4xl font-headline font-bold text-on-surface">
            {siteConfigs.home_mood_title || 'Browse by Mood'}
          </h2>
          <div className="w-20 md:w-24 h-0.5 bg-accent-peach mx-auto"></div>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-6">
          {Array.isArray(visibleMoods) && visibleMoods.map((cat, i) => (
            <motion.div 
              key={cat.id || cat.name}
              whileHover={{ y: -10 }}
              className="relative aspect-4/5 rounded-3xl overflow-hidden group cursor-pointer shadow-sm hover:shadow-2xl transition-all duration-500 bg-surface-container"
            >
              <img 
                src={cat.image || cat.img} 
                alt={cat.name} 
                loading="lazy"
                className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" 
                referrerPolicy="no-referrer" 
              />
              <div className="absolute inset-0 bg-linear-to-t from-on-surface/60 via-transparent to-transparent opacity-80 group-hover:opacity-100 transition-opacity"></div>
              <div className="absolute top-4 right-4 bg-accent-blush/90 backdrop-blur-sm text-primary px-3 py-1 rounded-full text-[10px] font-bold font-label tracking-widest uppercase">{cat.count}</div>
              
              <div className="absolute inset-0 flex flex-col justify-end p-6 text-center">
                <div className="space-y-3 translate-y-4 group-hover:translate-y-0 transition-transform duration-500">
                  <Link 
                    to={cat.linked_category_title ? `/shop?category=${encodeURIComponent(cat.linked_category_title)}` : (cat.vibe ? `/shop?vibe=${encodeURIComponent(cat.vibe)}` : '/shop')}
                    className="inline-block bg-white/90 backdrop-blur-sm text-primary text-[9px] font-label uppercase tracking-widest px-3 py-1.5 rounded-full font-bold opacity-0 group-hover:opacity-100 transition-opacity duration-300 shadow-sm"
                  >
                    {siteConfigs.home_mood_shop_link_cta || 'Shop this vibe →'}
                  </Link>
                  <Link to={cat.slug ? `/blog/${cat.slug}` : '#'} className="block">
                    <span className="text-white font-label font-semibold text-sm tracking-widest uppercase">{cat.name}</span>
                  </Link>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
        {hasMoreMoods && (
          <div className="text-center pt-8">
            <button 
              onClick={() => setShowAllMoods(true)}
              className="text-primary font-label text-xs uppercase tracking-widest font-bold border-b border-primary/20 pb-1 hover:border-primary transition-all"
            >
              {siteConfigs.home_mood_see_more_cta || 'See More Moods'}
            </button>
          </div>
        )}
      </section>

      {/* Latest from the Studio */}
      <section className="max-w-7xl mx-auto px-6">
        <div className="flex flex-col md:flex-row justify-between items-center md:items-end gap-6 mb-12 md:mb-16">
          <h2 className="text-3xl md:text-4xl font-headline font-bold text-on-surface text-center md:text-left">
            {siteConfigs.home_journal_title || 'Latest from the Journal'}
          </h2>
          <Link to="/blog" className="text-primary font-label text-sm uppercase tracking-widest border-b border-primary/20 pb-1 hover:border-primary transition-all">{siteConfigs.home_journal_view_all || 'View All Posts'}</Link>
        </div>
        
        {journalLoading ? (
          <BlogPostCardGridSkeleton count={3} />
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8 md:gap-10">
            {journalPosts.map((post) => (
              <article key={post.id} className="group space-y-6 bg-white p-4 rounded-4xl border border-outline-variant/50 hover:shadow-2xl hover:-translate-y-2 transition-all duration-500">
                <Link to={`/blog/${post.categorySlug}/${post.slug}`}>
                  <div className="aspect-4/5 rounded-3xl overflow-hidden relative bg-surface-container">
                    <img 
                      src={post.image} 
                      alt={post.title} 
                      loading="lazy"
                      className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" 
                      referrerPolicy="no-referrer" 
                    />
                    <div className="absolute top-4 left-4 bg-accent-blush/90 backdrop-blur-sm px-3 py-1 rounded-full text-[10px] font-bold font-label tracking-widest uppercase text-primary">
                      {post.category}
                    </div>
                  </div>
                  <div className="space-y-3 mt-6 px-2">
                    <h3 className="text-xl md:text-2xl font-headline font-bold leading-snug text-on-surface group-hover:text-primary transition-colors cursor-pointer line-clamp-2">
                      {post.title}
                    </h3>
                    <div className="flex items-center justify-between text-[10px] font-label uppercase tracking-widest text-outline">
                      <span>{post.author}</span>
                      <span>{post.date}</span>
                    </div>
                  </div>
                </Link>
              </article>
            ))}
          </div>
        )}
      </section>

      {/* Bento Grid Section */}
      <section className="max-w-7xl mx-auto px-6">
        <div className="text-center mb-12 md:mb-16">
          <h2 className="text-3xl md:text-4xl font-headline font-bold text-on-surface">
            {siteConfigs.home_find_here_title || "What You'll Find Here"}
          </h2>
          <p className="font-serif italic text-on-surface-variant mt-4 text-base md:text-lg">
            {siteConfigs.home_find_here_subtitle || 'A curated blend of inspiration and utility.'}
          </p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-4 md:grid-rows-2 gap-6 h-auto md:h-200">
          {Array.isArray(findHereItems) && findHereItems.slice(0, 3).map((item, i) => (
            <div 
              key={item.id}
              className={`${i === 0 ? 'md:col-span-2 md:row-span-2' : 'md:col-span-2 md:row-span-1'} relative aspect-square md:aspect-auto rounded-4xl overflow-hidden group shadow-lg bg-surface-container`}
            >
              <img 
                src={item.image} 
                loading="lazy"
                className="absolute inset-0 w-full h-full object-cover transition-transform duration-1000 group-hover:scale-110" 
                referrerPolicy="no-referrer" 
              />
              <div className="absolute inset-0 bg-linear-to-t from-black/80 via-black/20 to-transparent"></div>
              <div className="absolute inset-0 p-6 md:p-10 flex flex-col justify-end text-white">
                <div className="space-y-3 md:space-y-4 translate-y-6 group-hover:translate-y-0 transition-transform duration-500">
                  <h3 className="text-2xl md:text-3xl font-headline font-bold">{item.title}</h3>
                  <p className="text-white/80 font-serif italic text-base md:text-lg max-w-md opacity-0 group-hover:opacity-100 transition-opacity duration-500 hidden sm:block">
                    {item.description}
                  </p>
                  <Link 
                    to={item.linked_blog_category_slug ? `/blog/${item.linked_blog_category_slug}` : '/blog'}
                    className="inline-flex items-center gap-2 bg-white text-primary px-5 md:px-6 py-2.5 md:py-3 rounded-full font-label text-[10px] md:text-xs uppercase tracking-widest font-bold opacity-0 group-hover:opacity-100 transition-opacity duration-500 hover:bg-accent-peach hover:text-white w-fit"
                  >
                    Explore <span className="hidden sm:inline">Category</span> <ArrowRight size={16} />
                  </Link>
                </div>
              </div>
            </div>
          ))}
          {/* Fallback if no items configured */}
          {(!Array.isArray(findHereItems) || findHereItems.length === 0) && (
            <div className="md:col-span-4 md:row-span-2 flex items-center justify-center border-2 border-dashed border-outline-variant/30 rounded-4xl aspect-square md:aspect-auto">
              <p className="text-outline font-label uppercase tracking-widest text-xs">{siteConfigs.home_find_here_empty_hint || 'Configure What You’ll Find Here in Admin'}</p>
            </div>
          )}
        </div>
      </section>

      {/* Newsletter Section */}
      <section className="bg-linear-to-br from-surface-container via-surface-container to-accent-blush/30 py-20 md:py-32 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 md:w-96 h-64 md:h-96 bg-accent-peach/20 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2"></div>
        <div className="absolute bottom-0 left-0 w-48 md:w-64 h-48 md:h-64 bg-accent-blush/20 rounded-full blur-3xl translate-y-1/2 -translate-x-1/2"></div>
        
        <div className="max-w-2xl mx-auto px-6 text-center space-y-8 md:space-y-10 relative z-10">
          <div className="space-y-4">
            <h2 className="text-3xl md:text-5xl font-headline font-bold text-on-surface leading-tight">
              {siteConfigs.newsletter_title || 'Get My Free Pinterest Growth Guide'}
            </h2>
            <p className="text-on-surface-variant leading-relaxed text-base md:text-lg">
              {siteConfigs.newsletter_subtitle || 'Join 50k+ beautiful souls receiving weekly tips on design, style, and slow-living delivered directly to your inbox.'}
            </p>
          </div>
          <div className="flex justify-center">
            <Link 
              to="/free-guide" 
              className="bg-primary text-on-primary px-8 md:px-12 py-4 md:py-5 rounded-2xl font-label font-bold uppercase tracking-widest hover:bg-primary-hover transition-all shadow-xl shadow-primary/20 text-sm md:text-base w-full sm:w-auto"
            >
              {siteConfigs.newsletter_cta || 'Download Free Guide'}
            </Link>
          </div>
          <p className="text-[9px] md:text-[10px] font-label uppercase tracking-widest text-outline">
            {siteConfigs.newsletter_disclaimer || 'No spam, just pure inspiration. Unsubscribe anytime.'}
          </p>
        </div>
      </section>
    </div>
  );
}
