import React, { useMemo, useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Search, Filter, Shirt, Home, Sparkles, Baby, Laptop, Flame, DollarSign, Star, ChevronDown, ChevronLeft, ChevronRight, Package, X } from 'lucide-react';
import { useSearchParams } from 'react-router-dom';
import { cn } from '../lib/utils';
import ProductCard from '../components/ProductCard';
import SEOMeta from '../components/SEOMeta';
import { useProducts } from '../hooks/useProducts';
import { ProductCardGridSkeleton } from '../components/Skeleton';
import { VIBES } from '../lib/constants';

const ICON_MAP: Record<string, any> = {
  'Shirt': Shirt,
  'Home': Home,
  'Sparkles': Sparkles,
  'Baby': Baby,
  'Laptop': Laptop,
  'Package': Package
};

const QUICK_FILTERS = [
  { name: 'Trending', icon: Flame, filter: { vibe: 'Pinteresty' } },
  { name: 'Under $50', icon: DollarSign, filter: { maxPrice: 50 } },
  { name: 'Top Rated', icon: Star, filter: { topRated: true } },
];

export default function Shop() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [shopCategories, setShopCategories] = React.useState<any[]>([]);
  const [siteConfigs, setSiteConfigs] = React.useState<Record<string, string>>({});
  const [loadingCategories, setLoadingCategories] = React.useState(true);
  
  const selectedCategory = searchParams.get('category') || 'All';
  const selectedSubCategory = searchParams.get('subCategory') || 'All';
  const selectedVibe = searchParams.get('vibe') || 'All';
 const searchQuery = searchParams.get('search') || '';
  const maxPriceParam = searchParams.get('maxPrice');
  const maxPrice = maxPriceParam ? Number(maxPriceParam) : null;
  const currentPage = Number(searchParams.get('page')) || 1;

  const [openCategories, setOpenCategories] = React.useState<string[]>(['Clothing & Accessories']);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [catRes, configRes] = await Promise.all([
          fetch('/api/home-shop/shop-categories'),
          fetch('/api/home-shop/config')
        ]);
        if (catRes.ok) {
          const data = await catRes.json();
          setShopCategories(data.data);
        }
        if (configRes.ok) {
          const data = await configRes.json();
          setSiteConfigs(data.data);
        }
      } catch (err) {
        console.error('Failed to fetch shop data', err);
      } finally {
        setLoadingCategories(false);
      }
    };
    fetchData();
  }, []);

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

  const [isMobileFilterOpen, setIsMobileFilterOpen] = useState(false);

  const toggleCategory = (name: string) => {
    setOpenCategories(prev => 
      prev.includes(name) ? prev.filter(c => c !== name) : [...prev, name]
    );
  };

  const FilterContent = () => (
    <div className="space-y-8">
      {/* Search Card */}
      <div className="bg-white p-6 rounded-4xl border border-outline-variant/50 shadow-sm space-y-4">
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
      <div className="bg-white p-6 rounded-4xl border border-outline-variant/50 shadow-sm space-y-4">
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
                setIsMobileFilterOpen(false);
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
      <div className="bg-white p-6 rounded-4xl border border-outline-variant/50 shadow-sm space-y-6">
        <div className="flex items-center justify-between border-b border-outline-variant/30 pb-4">
          <h3 className="font-headline font-bold text-lg text-on-surface">
            {siteConfigs.shop_sidebar_title || 'Categories'}
          </h3>
          <Filter size={16} className="text-outline" />
        </div>
        
        <div className="space-y-2">
          <button 
            onClick={() => {
              updateFilters({ category: 'All' });
              setIsMobileFilterOpen(false);
            }}
            className={cn(
              "flex items-center justify-between w-full p-3 rounded-xl transition-all group",
              selectedCategory === 'All' ? "bg-accent-blush text-primary" : "text-on-surface hover:bg-accent-blush/50"
            )}
          >
            <span className="font-label text-[11px] uppercase tracking-widest font-bold">All Products</span>
          </button>

          {Array.isArray(shopCategories) && shopCategories.map(cat => {
            const Icon = ICON_MAP[cat.icon || 'Package'] || Package;
            const subCats = Array.isArray(cat.sub_categories) ? cat.sub_categories : [];
            return (
              <div key={cat.id} className="space-y-1">
                <div className="flex items-center gap-1">
                  <button 
                    onClick={() => {
                      updateFilters({ category: cat.title });
                      setIsMobileFilterOpen(false);
                    }}
                    className={cn(
                      "flex items-center gap-3 flex-1 p-3 rounded-xl transition-all group text-left",
                      selectedCategory === cat.title ? "bg-accent-blush text-primary" : "text-on-surface hover:bg-accent-blush/50"
                    )}
                  >
                    <Icon size={16} className={cn(selectedCategory === cat.title ? "text-primary" : "text-outline")} />
                    <span className="font-label text-[11px] uppercase tracking-widest font-bold flex-1">{cat.title}</span>
                  </button>
                  {subCats.length > 0 && (
                    <button 
                      onClick={() => toggleCategory(cat.title)}
                      className="p-3 hover:bg-accent-blush/50 rounded-xl transition-colors text-outline"
                    >
                      <ChevronDown size={14} className={cn("transition-transform duration-300", openCategories.includes(cat.title) ? "rotate-180" : "")} />
                    </button>
                  )}
                </div>

                <AnimatePresence>
                  {openCategories.includes(cat.title) && subCats.length > 0 && (
                    <motion.div 
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      className="overflow-hidden pl-11 space-y-1"
                    >
                      {subCats.map((sub: string) => (
                        <button
                          key={sub}
                          onClick={() => {
                            updateFilters({ category: cat.title, subCategory: sub });
                            setIsMobileFilterOpen(false);
                          }}
                          className={cn(
                            "block w-full text-left p-2 rounded-lg text-[10px] font-label uppercase tracking-widest font-bold transition-colors",
                            selectedCategory === cat.title && selectedSubCategory === sub
                              ? "text-primary bg-accent-blush/30"
                              : "text-outline hover:text-primary hover:bg-accent-blush/20"
                          )}
                        >
                          {sub}
                        </button>
                      ))}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            );
          })}
        </div>
      </div>

      {/* Vibes Card */}
      <div className="bg-white p-6 rounded-4xl border border-outline-variant/50 shadow-sm space-y-6">
        <div className="flex items-center justify-between border-b border-outline-variant/30 pb-4">
          <h3 className="font-headline font-bold text-lg text-on-surface">Find Your Vibe</h3>
          <Sparkles size={16} className="text-outline" />
        </div>
        
        <div className="flex flex-wrap gap-2">
          <button 
            onClick={() => {
              updateFilters({ vibe: 'All' });
              setIsMobileFilterOpen(false);
            }}
            className={cn(
              "px-4 py-2 rounded-full font-label text-[10px] uppercase tracking-widest font-bold transition-all border",
              selectedVibe === 'All' 
                ? "bg-primary text-on-primary border-primary" 
                : "bg-surface text-outline border-outline-variant/30 hover:border-primary hover:text-primary"
            )}
          >
            All
          </button>
          {VIBES.map(vibe => (
            <button 
              key={vibe}
              onClick={() => {
                updateFilters({ vibe });
                setIsMobileFilterOpen(false);
              }}
              className={cn(
                "px-4 py-2 rounded-full font-label text-[10px] uppercase tracking-widest font-bold transition-all border",
                selectedVibe === vibe 
                  ? "bg-primary text-on-primary border-primary" 
                  : "bg-surface text-outline border-outline-variant/30 hover:border-primary hover:text-primary"
              )}
            >
              {vibe}
            </button>
          ))}
        </div>
      </div>
    </div>
  );

  return (
    <div className="pb-32 bg-surface">
      <SEOMeta 
        title="The Aesthetic Shop — Curated Finds"
        description="Browse curated aesthetic products for fashion, home decor, lifestyle, and more. Pinterest-worthy pieces for intentional living."
        type="website"
      />
      {/* Header */}
      <header className="max-w-7xl mx-auto px-6 pt-16 md:pt-24 pb-12 md:pb-16 text-center space-y-8 relative overflow-hidden">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-full bg-linear-to-b from-accent-blush/20 to-transparent pointer-events-none"></div>
        <div className="space-y-6 max-w-4xl mx-auto relative z-10">
          <span className="font-label text-xs uppercase tracking-[0.3em] text-primary font-bold">Curated Shopping</span>
          <h1 className="text-4xl md:text-5xl lg:text-7xl font-headline font-bold leading-tight text-on-surface">
            {siteConfigs.shop_hero_title_line1 || 'The'} <span className="italic font-normal text-primary">{siteConfigs.shop_hero_title_line2 || 'Aesthetic Shop'}</span>
          </h1>
          <p className="text-base md:text-lg lg:text-xl text-on-surface-variant leading-relaxed font-serif italic max-w-2xl mx-auto">
            {siteConfigs.shop_hero_subtitle || 'A refined collection of pieces to style your life, your space, and your routine.'}
          </p>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-6">
        {/* Mobile Filter Toggle */}
        <div className="lg:hidden mb-8 flex items-center justify-between bg-white p-4 rounded-2xl border border-outline-variant/30 shadow-sm sticky top-20 z-30">
          <button 
            onClick={() => setIsMobileFilterOpen(true)}
            className="flex items-center gap-2 font-label text-xs uppercase tracking-widest font-bold text-primary"
          >
            <Filter size={16} /> Filters
          </button>
          <div className="text-[10px] font-label uppercase tracking-widest text-outline">
            {products.length} Products
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-12">
          {/* Desktop Sidebar Filters */}
          <aside className="hidden lg:block space-y-8">
            <FilterContent />
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
                <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6 md:gap-8">
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
                        className="p-3 md:p-4 rounded-full border border-outline-variant/30 disabled:opacity-30 hover:bg-white hover:shadow-lg transition-all"
                      >
                        <ChevronLeft size={20} />
                      </button>
                      <span className="font-label text-xs uppercase tracking-[0.2em] font-bold">
                        {meta.page} / {meta.totalPages}
                      </span>
                      <button 
                        disabled={currentPage === meta.totalPages}
                        onClick={() => updateFilters({ page: (currentPage + 1).toString() })}
                        className="p-3 md:p-4 rounded-full border border-outline-variant/30 disabled:opacity-30 hover:bg-white hover:shadow-lg transition-all"
                      >
                        <ChevronRight size={20} />
                      </button>
                    </div>
                    <p className="font-label text-[10px] uppercase tracking-widest text-outline">
                      {Math.min(meta.page * meta.limit, meta.total)} of {meta.total} products
                    </p>
                  </div>
                )}

                {products.length === 0 && (
                  <div className="text-center py-24 space-y-4">
                    <p className="font-serif italic text-2xl text-on-surface-variant">
                      {siteConfigs.shop_empty_message || 'No products found.'}
                    </p>
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

      {/* Mobile Filter Drawer */}
      <AnimatePresence>
        {isMobileFilterOpen && (
          <>
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsMobileFilterOpen(false)}
              className="fixed inset-0 bg-black/60 backdrop-blur-sm z-60 lg:hidden"
            />
            <motion.div 
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="fixed right-0 top-0 h-full w-[85%] max-w-sm bg-surface z-70 lg:hidden overflow-y-auto p-6 shadow-2xl"
            >
              <div className="flex items-center justify-between mb-8 pb-4 border-b border-outline-variant/30">
                <h2 className="text-2xl font-headline font-bold">Filters</h2>
                <button 
                  onClick={() => setIsMobileFilterOpen(false)}
                  className="p-2 hover:bg-accent-blush rounded-full transition-colors"
                >
                  <X size={24} />
                </button>
              </div>
              <FilterContent />
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
