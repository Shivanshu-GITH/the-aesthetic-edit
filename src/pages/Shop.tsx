import React, { useMemo } from 'react';
import { motion } from 'motion/react';
import { Search, Filter, Shirt, Home, Sparkles, Baby, Laptop, Flame, DollarSign, Star, ChevronDown, ChevronLeft, ChevronRight } from 'lucide-react';
import { useSearchParams } from 'react-router-dom';
import { cn } from '../lib/utils';
import ProductCard from '../components/ProductCard';
import SEOMeta from '../components/SEOMeta';
import { useProducts } from '../hooks/useProducts';
import { ProductCardGridSkeleton } from '../components/Skeleton';

const CATEGORIES = [
  { 
    name: 'Clothing & Accessories', 
    icon: Shirt,
    sub: ['Clothing', 'Accessories'],
  },
  { 
    name: 'Home & Decor', 
    icon: Home,
    sub: ['Decor', 'Organization']
  },
  { 
    name: 'Lifestyle Essentials', 
    icon: Sparkles,
    sub: ['Aesthetic Picks', 'Trending']
  },
  { 
    name: 'Baby & Kids', 
    icon: Baby,
    sub: ['Clothing', 'Toys'] 
  },
  { 
    name: 'Electronics & Gadgets', 
    icon: Laptop,
    sub: ['Gadgets'] 
  },
];

const QUICK_FILTERS = [
  { name: 'Trending', icon: Flame, filter: { vibe: 'Pinteresty' } },
  { name: 'Under $50', icon: DollarSign, filter: { maxPrice: 50 } },
  { name: 'Top Rated', icon: Star, filter: { topRated: true } },
];

export default function Shop() {
  const [searchParams, setSearchParams] = useSearchParams();
  
  const selectedCategory = searchParams.get('category') || 'All';
  const selectedSubCategory = searchParams.get('subCategory') || 'All';
  const selectedVibe = searchParams.get('vibe') || 'All';
  const searchQuery = searchParams.get('search') || '';
  const maxPriceParam = searchParams.get('maxPrice');
  const maxPrice = maxPriceParam ? Number(maxPriceParam) : null;
  const currentPage = Number(searchParams.get('page')) || 1;

  const [openCategories, setOpenCategories] = React.useState<string[]>(['Clothing & Accessories']);

  const filters = useMemo(() => ({
    category: selectedCategory !== 'All' ? selectedCategory : undefined,
    subCategory: selectedSubCategory !== 'All' ? selectedSubCategory : undefined,
    vibe: selectedVibe !== 'All' ? selectedVibe : undefined,
    search: searchQuery || undefined,
    maxPrice: maxPrice || undefined,
    page: currentPage,
    limit: 12
  }), [selectedCategory, selectedSubCategory, selectedVibe, searchQuery, maxPrice, currentPage]);

  const { products, loading, error, meta } = useProducts(filters);

  const updateFilters = (updates: Record<string, string | null>) => {
    const newParams = new URLSearchParams(searchParams);
    Object.entries(updates).forEach(([key, value]) => {
      if (value === null || value === 'All' || value === '') {
        newParams.delete(key);
      } else {
        newParams.set(key, value);
      }
    });
    
    // If updating category, reset subCategory
    if (updates.category) {
      newParams.delete('subCategory');
    }

    // Reset to page 1 on filter change
    if (!updates.page) {
      newParams.delete('page');
    }
    setSearchParams(newParams, { replace: true });
  };

  const toggleCategory = (name: string) => {
    setOpenCategories(prev => 
      prev.includes(name) ? prev.filter(c => c !== name) : [...prev, name]
    );
  };

  return (
    <div className="pb-32 bg-surface">
      <SEOMeta 
        title="The Aesthetic Shop — Curated Finds"
        description="Browse curated aesthetic products for fashion, home decor, lifestyle, and more. Pinterest-worthy pieces for intentional living."
        type="website"
      />
      {/* Header */}
      <header className="max-w-7xl mx-auto px-6 pt-24 pb-16 text-center space-y-8 relative overflow-hidden">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-full bg-gradient-to-b from-accent-blush/20 to-transparent pointer-events-none"></div>
        <div className="space-y-6 max-w-4xl mx-auto relative z-10">
          <span className="font-label text-xs uppercase tracking-[0.3em] text-primary font-bold">Curated Shopping</span>
          <h1 className="text-5xl md:text-7xl font-headline font-bold leading-tight text-on-surface">
            The <span className="italic font-normal text-primary">Aesthetic Shop</span>
          </h1>
          <p className="text-lg md:text-xl text-on-surface-variant leading-relaxed font-serif italic">
            A refined collection of pieces to style your life, your space, and your routine. From curated home essentials to effortless lifestyle finds, discover everything you need to romanticize your daily rituals and elevate your personal aesthetic.
          </p>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-6 grid grid-cols-1 lg:grid-cols-4 gap-12">
        {/* Sidebar Filters */}
        <aside className="space-y-8">
          {/* Search Card */}
          <div className="bg-white p-6 rounded-[32px] border border-outline-variant/50 shadow-sm space-y-4">
            <h3 className="font-label text-[10px] uppercase tracking-[0.2em] font-bold text-outline">Search</h3>
            <div className="relative">
              <input 
                type="text" 
                placeholder="Find something..."
                value={searchQuery}
                onChange={(e) => updateFilters({ search: e.target.value })}
                className="w-full pl-10 pr-4 py-3 rounded-xl bg-surface border border-outline-variant/30 focus:outline-none focus:border-primary transition-all font-body text-sm"
              />
              <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-outline" />
            </div>
          </div>

          {/* Quick Filters Card */}
          <div className="bg-white p-6 rounded-[32px] border border-outline-variant/50 shadow-sm space-y-4">
            <h3 className="font-label text-[10px] uppercase tracking-[0.2em] font-bold text-outline">Quick Filters</h3>
            <div className="space-y-2">
              {QUICK_FILTERS.map(q => (
                <button 
                  key={q.name}
                  onClick={() => {
                    const updates: Record<string, string | null> = {};
                    if (q.filter.vibe) updates.vibe = q.filter.vibe;
                    if (q.filter.maxPrice) updates.maxPrice = q.filter.maxPrice.toString();
                    updateFilters(updates);
                  }}
                  className="flex items-center gap-3 w-full p-3 rounded-xl hover:bg-accent-blush transition-all group text-left"
                >
                  <div className="w-8 h-8 rounded-lg bg-accent-blush flex items-center justify-center text-primary group-hover:bg-primary group-hover:text-on-primary transition-colors">
                    <q.icon size={16} />
                  </div>
                  <span className="font-label text-[11px] uppercase tracking-widest font-bold text-on-surface">{q.name}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Categories Card */}
          <div className="bg-white p-6 rounded-[32px] border border-outline-variant/50 shadow-sm space-y-6">
            <div className="flex items-center justify-between border-b border-outline-variant/30 pb-4">
              <h3 className="font-headline font-bold text-lg text-on-surface">Find Your Vibe</h3>
              <Filter size={16} className="text-outline" />
            </div>
            
            <div className="space-y-2">
              <button 
                onClick={() => updateFilters({ category: 'All' })}
                className={cn(
                  "flex items-center justify-between w-full p-3 rounded-xl transition-all group",
                  selectedCategory === 'All' ? "bg-accent-blush text-primary" : "text-on-surface hover:bg-accent-blush/50"
                )}
              >
                <span className="font-label text-[11px] uppercase tracking-widest font-bold">All Products</span>
              </button>

              {CATEGORIES.map(cat => (
                <div key={cat.name} className="space-y-1">
                  <div className="flex items-center gap-1">
                    <button 
                      onClick={() => updateFilters({ category: cat.name })}
                      className={cn(
                        "flex items-center gap-3 flex-1 p-3 rounded-xl transition-all group text-left",
                        selectedCategory === cat.name ? "bg-accent-blush text-primary" : "text-on-surface hover:bg-accent-blush/50"
                      )}
                    >
                      <cat.icon size={16} className={cn(selectedCategory === cat.name ? "text-primary" : "text-outline")} />
                      <span className="font-label text-[11px] uppercase tracking-widest font-bold flex-1">{cat.name}</span>
                    </button>
                    {cat.sub.length > 0 && (
                      <button 
                        onClick={() => toggleCategory(cat.name)}
                        className="p-3 hover:bg-accent-blush/50 rounded-xl transition-colors text-outline"
                      >
                        <ChevronDown size={14} className={cn("transition-transform duration-300", openCategories.includes(cat.name) ? "rotate-180" : "")} />
                      </button>
                    )}
                  </div>

                  {cat.sub.length > 0 && openCategories.includes(cat.name) && (
                    <motion.div 
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      className="pl-11 space-y-1 overflow-hidden"
                    >
                      {cat.sub.map(sub => (
                        <button 
                          key={sub}
                          onClick={() => updateFilters({ subCategory: sub })}
                          className={cn(
                            "flex items-center justify-between w-full p-2 rounded-lg transition-all text-left",
                            selectedSubCategory === sub ? "text-primary font-bold" : "text-outline hover:text-on-surface hover:translate-x-1"
                          )}
                        >
                          <span className="font-label text-[10px] uppercase tracking-widest">{sub}</span>
                        </button>
                      ))}
                    </motion.div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </aside>

        {/* Product Grid */}
        <main className="lg:col-span-3">
          {loading ? (
            <ProductCardGridSkeleton count={9} />
          ) : error ? (
            <div className="text-center py-24 space-y-4">
              <p className="font-serif italic text-2xl text-on-surface-variant">{error || "Couldn't load products. Please refresh."}</p>
              <button 
                onClick={() => window.location.reload()}
                className="text-primary font-label text-xs uppercase tracking-widest font-bold border-b border-primary"
              >
                Refresh Page
              </button>
            </div>
          ) : (
            <>
              <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-8">
                {products.map((product, index) => (
                  <ProductCard key={product.id} product={product} index={index} />
                ))}
              </div>

              {meta && meta.totalPages > 1 && (
                <div className="flex flex-col items-center gap-6 pt-16">
                  <div className="flex items-center gap-4">
                    <button 
                      disabled={currentPage === 1}
                      onClick={() => updateFilters({ page: (currentPage - 1).toString() })}
                      className="p-4 rounded-full border border-outline-variant/30 disabled:opacity-30 hover:bg-white hover:shadow-lg transition-all"
                    >
                      <ChevronLeft size={20} />
                    </button>
                    <span className="font-label text-xs uppercase tracking-[0.2em] font-bold">
                      Page {meta.page} of {meta.totalPages}
                    </span>
                    <button 
                      disabled={currentPage === meta.totalPages}
                      onClick={() => updateFilters({ page: (currentPage + 1).toString() })}
                      className="p-4 rounded-full border border-outline-variant/30 disabled:opacity-30 hover:bg-white hover:shadow-lg transition-all"
                    >
                      <ChevronRight size={20} />
                    </button>
                  </div>
                  <p className="font-label text-[10px] uppercase tracking-widest text-outline">
                    Showing {((meta.page - 1) * meta.limit) + 1}–{Math.min(meta.page * meta.limit, meta.total)} of {meta.total} products
                  </p>
                </div>
              )}

              {products.length === 0 && (
                <div className="text-center py-24 space-y-4">
                  <p className="font-serif italic text-2xl text-on-surface-variant">No products found for this selection.</p>
                  <button 
                    onClick={() => updateFilters({ category: 'All', vibe: 'All', search: '', maxPrice: null })}
                    className="text-primary font-label text-xs uppercase tracking-widest font-bold border-b border-primary"
                  >
                    Clear all filters
                  </button>
                </div>
              )}
            </>
          )}
        </main>
      </div>
    </div>
  );
}
