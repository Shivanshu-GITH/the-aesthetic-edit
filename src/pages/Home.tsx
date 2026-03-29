import React, { useMemo } from 'react';
import { motion } from 'motion/react';
import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import SEOMeta from '../components/SEOMeta';
import { useBlogPosts } from '../hooks/useBlog';
import { BlogPostCardGridSkeleton } from '../components/Skeleton';

export default function Home() {
  const [showAllMoods, setShowAllMoods] = React.useState(false);

  const { posts, loading: journalLoading } = useBlogPosts(undefined, 1, 3);
  const journalPosts = useMemo(() => posts.slice(0, 3), [posts]);

  const moods = [
    { name: 'Style That Speaks', slug: 'outfit-ideas', vibe: 'Clean Girl', img: 'https://images.unsplash.com/photo-1490481651871-ab68de25d43d?auto=format&fit=crop&q=80&w=400', count: '1.2k' },
    { name: 'Cozy Corners', slug: 'home-styling', vibe: 'Cozy Home', img: 'https://images.unsplash.com/photo-1513519245088-0e12902e5a38?auto=format&fit=crop&q=80&w=400', count: '850' },
    { name: 'Life, But Better', slug: 'lifestyle-routines', vibe: 'Minimal Aesthetic', img: 'https://images.unsplash.com/photo-1499750310107-5fef28a66643?auto=format&fit=crop&q=80&w=400', count: '420' },
    { name: 'Tiny Treasures', slug: 'productivity-wellness', vibe: 'Cozy Home', img: 'https://images.unsplash.com/photo-1519689680058-324335c77eba?auto=format&fit=crop&q=80&w=400', count: '2.1k' },
    { name: 'Future Essentials', slug: 'tech-setups', vibe: 'Minimal Aesthetic', img: 'https://images.unsplash.com/photo-1519389950473-47ba0277781c?auto=format&fit=crop&q=80&w=400', count: '940' },
  ];

  const moodColumns = 5;
  const visibleMoods = showAllMoods ? moods : (moods.length > moodColumns ? moods.slice(0, Math.floor(moods.length / moodColumns) * moodColumns) : moods);
  const hasMoreMoods = !showAllMoods && moods.length > visibleMoods.length;

  return (
    <div className="min-h-screen space-y-32 pb-32">
      <SEOMeta 
        title="Curated Aesthetic Finds for Your Home, Style & Life"
        description="The Aesthetic Edit by Anjali — curated Pinterest-inspired picks for fashion, home decor, and intentional living. Shop the aesthetic."
        image="https://images.unsplash.com/photo-1494438639946-1ebd1d20bf85?auto=format&fit=crop&q=80&w=1200"
        type="website"
      />
      {/* Hero Section */}
      <section className="relative min-h-[85vh] flex items-center bg-gradient-to-br from-surface via-surface to-accent-blush/30 px-6 pt-10 overflow-hidden">
        <div className="absolute top-[-10%] right-[-10%] w-[500px] h-[500px] bg-accent-peach/20 rounded-full blur-[120px] pointer-events-none"></div>
        <div className="absolute bottom-[-10%] left-[-10%] w-[400px] h-[400px] bg-accent-blush/30 rounded-full blur-[100px] pointer-events-none"></div>
        
        <div className="max-w-7xl mx-auto w-full grid grid-cols-1 lg:grid-cols-[1fr_auto] gap-16 items-center relative z-10">
          <motion.div 
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="space-y-10 relative z-10"
          >
            <div className="space-y-6">
              <h1 className="text-6xl md:text-8xl font-headline font-bold leading-[0.9] tracking-tight text-on-surface">
                The <br />
                <span className="italic font-normal text-primary">Aesthetic Edit</span>
              </h1>
              <div className="space-y-6">
                <h2 className="text-2xl md:text-3xl font-serif italic text-primary leading-relaxed lg:whitespace-nowrap">
                  Turn your saved inspiration into a life you actually live.
                </h2>
                <p className="text-lg md:text-xl text-on-surface-variant leading-[1.6] max-w-[540px]">
                  Curated finds, cozy spaces, and effortless style — everything you need to romanticize your life and create a world that feels uniquely yours.
                </p>
              </div>
            </div>
            <div className="flex flex-wrap gap-6">
              <Link 
                to="/shop" 
                className="bg-primary text-on-primary px-10 py-4 rounded-2xl font-label font-semibold tracking-widest uppercase hover:bg-primary-hover transition-all shadow-xl shadow-primary/20"
              >
                Shop the Aesthetic
              </Link>
              <Link 
                to="/blog" 
                className="border-2 border-primary text-primary px-10 py-4 rounded-2xl font-label font-semibold tracking-widest uppercase hover:bg-accent-blush transition-all"
              >
                Explore the Blog
              </Link>
            </div>
          </motion.div>

          <motion.div 
            initial={{ opacity: 0, scale: 0.95, x: 20 }}
            animate={{ opacity: 1, scale: 1, x: 0 }}
            transition={{ duration: 1.2, delay: 0.2 }}
            className="relative aspect-[4/5] rounded-[32px] overflow-hidden shadow-2xl hidden lg:block w-[400px] group bg-surface-container"
          >
            <div className="absolute inset-0 bg-gradient-to-t from-primary/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-700 z-10"></div>
            <img 
              src="https://images.unsplash.com/photo-1494438639946-1ebd1d20bf85?auto=format&fit=crop&q=80&w=1200" 
              alt="Minimalist Aesthetic Interior" 
              loading="lazy"
              className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-110"
              referrerPolicy="no-referrer"
            />
          </motion.div>
        </div>
      </section>

      {/* Browse by Mood */}
      <section className="max-w-7xl mx-auto px-6">
        <div className="text-center mb-16 space-y-4">
          <h2 className="text-4xl font-headline font-bold text-on-surface">Browse by Mood</h2>
          <div className="w-24 h-0.5 bg-accent-peach mx-auto"></div>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-6">
          {visibleMoods.map((cat, i) => (
            <motion.div 
              key={cat.name}
              whileHover={{ y: -10 }}
              className="relative aspect-[4/5] rounded-[24px] overflow-hidden group cursor-pointer shadow-sm hover:shadow-2xl transition-all duration-500 bg-surface-container"
            >
              <img 
                src={cat.img} 
                alt={cat.name} 
                loading="lazy"
                className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" 
                referrerPolicy="no-referrer" 
              />
              <div className="absolute inset-0 bg-gradient-to-t from-on-surface/60 via-transparent to-transparent opacity-80 group-hover:opacity-100 transition-opacity"></div>
              <div className="absolute top-4 right-4 bg-accent-blush/90 backdrop-blur-sm text-primary px-3 py-1 rounded-full text-[10px] font-bold font-label tracking-widest uppercase">{cat.count}</div>
              
              <div className="absolute inset-0 flex flex-col justify-end p-6 text-center">
                <div className="space-y-3 translate-y-4 group-hover:translate-y-0 transition-transform duration-500">
                  <Link 
                    to={`/shop?vibe=${encodeURIComponent(cat.vibe)}`}
                    className="inline-block bg-white/90 backdrop-blur-sm text-primary text-[9px] font-label uppercase tracking-widest px-3 py-1.5 rounded-full font-bold opacity-0 group-hover:opacity-100 transition-opacity duration-300 shadow-sm"
                  >
                    Shop this vibe →
                  </Link>
                  <Link to={`/blog/${cat.slug}`} className="block">
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
              See More Moods
            </button>
          </div>
        )}
      </section>

      {/* Latest from the Studio */}
      <section className="max-w-7xl mx-auto px-6">
        <div className="flex justify-between items-end mb-16">
          <h2 className="text-4xl font-headline font-bold text-on-surface">Latest from the Journal</h2>
          <Link to="/blog" className="text-primary font-label text-sm uppercase tracking-widest border-b border-primary/20 pb-1 hover:border-primary transition-all">View All Posts</Link>
        </div>
        
        {journalLoading ? (
          <BlogPostCardGridSkeleton count={3} />
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
            {journalPosts.map((post) => (
              <article key={post.id} className="group space-y-6 bg-white p-4 rounded-[32px] border border-outline-variant/50 hover:shadow-2xl hover:-translate-y-2 transition-all duration-500">
                <Link to={`/blog/${post.categorySlug}/${post.slug}`}>
                  <div className="aspect-[4/5] rounded-[24px] overflow-hidden relative bg-surface-container">
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
                    <h3 className="text-2xl font-headline font-bold leading-snug text-on-surface group-hover:text-primary transition-colors cursor-pointer">
                      {post.title}
                    </h3>
                    <div className="flex items-center justify-between text-[10px] font-label uppercase tracking-widest text-outline">
                      <span>{post.author}</span>
                      <span>{post.date} • {post.readTime}</span>
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
        <div className="text-center mb-16">
          <h2 className="text-4xl font-headline font-bold text-on-surface">What You'll Find Here</h2>
          <p className="font-serif italic text-on-surface-variant mt-4">A curated blend of inspiration and utility.</p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-4 grid-rows-2 gap-6 h-[800px]">
          <div className="md:col-span-2 md:row-span-2 relative rounded-[32px] overflow-hidden group shadow-lg bg-surface-container">
            <img 
              src="https://images.unsplash.com/photo-1513519245088-0e12902e5a38?auto=format&fit=crop&q=80&w=1200" 
              loading="lazy"
              className="absolute inset-0 w-full h-full object-cover transition-transform duration-1000 group-hover:scale-110" 
              referrerPolicy="no-referrer" 
            />
            <div className="absolute inset-0 bg-gradient-to-t from-on-surface/80 via-on-surface/20 to-transparent opacity-60 group-hover:opacity-80 transition-all"></div>
            <div className="absolute bottom-10 left-10 right-10 text-white space-y-4">
              <span className="font-label text-xs uppercase tracking-[0.3em] font-bold text-accent-peach">The Journal</span>
              <h3 className="text-4xl font-headline font-bold">Curated Design & <br />Intentional Living</h3>
              <Link to="/blog/home-styling" className="inline-block border-b border-white pb-1 font-label text-xs uppercase tracking-widest hover:text-accent-peach transition-colors">Read the Journal</Link>
            </div>
          </div>
          <div className="md:col-span-2 relative rounded-[32px] overflow-hidden group shadow-lg bg-surface-container">
            <Link to="/blog/lifestyle-routines">
              <img 
                src="https://images.unsplash.com/photo-1556228720-195a672e8a03?auto=format&fit=crop&q=80&w=800" 
                loading="lazy"
                className="absolute inset-0 w-full h-full object-cover transition-transform duration-1000 group-hover:scale-110" 
                referrerPolicy="no-referrer" 
              />
              <div className="absolute inset-0 bg-gradient-to-t from-on-surface/60 to-transparent opacity-60 group-hover:opacity-80 transition-all"></div>
              <div className="absolute bottom-8 left-8 text-white">
                <h3 className="text-2xl font-headline font-bold">Beauty Rituals</h3>
              </div>
            </Link>
          </div>
          <div className="relative rounded-[32px] overflow-hidden group shadow-lg bg-surface-container">
            <Link to="/blog/home-styling">
              <img 
                src="https://images.unsplash.com/photo-1522771739844-6a9f6d5f14af?auto=format&fit=crop&q=80&w=800" 
                loading="lazy"
                className="absolute inset-0 w-full h-full object-cover transition-transform duration-1000 group-hover:scale-110" 
                referrerPolicy="no-referrer" 
              />
              <div className="absolute inset-0 bg-gradient-to-t from-on-surface/60 to-transparent opacity-60 group-hover:opacity-80 transition-all"></div>
              <div className="absolute bottom-6 left-6 text-white">
                <h3 className="text-xl font-headline font-bold">Home Picks</h3>
              </div>
            </Link>
          </div>
          <div className="relative rounded-[32px] overflow-hidden group shadow-lg bg-surface-container">
            <Link to="/blog/outfit-ideas">
              <img 
                src="https://images.unsplash.com/photo-1490481651871-ab68de25d43d?auto=format&fit=crop&q=80&w=800" 
                loading="lazy"
                className="absolute inset-0 w-full h-full object-cover transition-transform duration-1000 group-hover:scale-110" 
                referrerPolicy="no-referrer" 
              />
              <div className="absolute inset-0 bg-gradient-to-t from-on-surface/60 to-transparent opacity-60 group-hover:opacity-80 transition-all"></div>
              <div className="absolute bottom-6 left-6 text-white">
                <h3 className="text-xl font-headline font-bold">Seasonal Style</h3>
              </div>
            </Link>
          </div>
        </div>
      </section>

      {/* Newsletter Section */}
      <section className="bg-gradient-to-br from-surface-container via-surface-container to-accent-blush/30 py-32 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-accent-peach/20 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2"></div>
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-accent-blush/20 rounded-full blur-3xl translate-y-1/2 -translate-x-1/2"></div>
        
        <div className="max-w-2xl mx-auto px-6 text-center space-y-10 relative z-10">
          <div className="space-y-4">
            <h2 className="text-4xl md:text-5xl font-headline font-bold text-on-surface">Get My Free Pinterest Growth Guide</h2>
            <p className="text-on-surface-variant leading-relaxed text-lg">Join 50k+ beautiful souls receiving weekly tips on design, style, and slow-living delivered directly to your inbox.</p>
          </div>
          <div className="flex justify-center">
            <Link 
              to="/free-guide" 
              className="bg-primary text-on-primary px-12 py-5 rounded-2xl font-label font-bold uppercase tracking-widest hover:bg-primary-hover transition-all shadow-xl shadow-primary/20"
            >
              Download Free Guide
            </Link>
          </div>
          <p className="text-[10px] font-label uppercase tracking-widest text-outline">No spam, just pure inspiration. Unsubscribe anytime.</p>
        </div>
      </section>
    </div>
  );
}
