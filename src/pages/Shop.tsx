import React, { useMemo, useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Search, Filter, Shirt, Home, Sparkles, Baby, Laptop, Flame, IndianRupee, Star, ChevronDown, ChevronLeft, ChevronRight, Package, X } from 'lucide-react';
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

interface QuickFilter {
  name: string;
  icon: any;
  filter: {
    vibe?: string;
    trending?: string;
    maxPrice?: number;
    topRated?: string;
  };
}

const QUICK_FILTERS: QuickFilter[] = [
  { name: 'Trending', icon: Flame, filter: { trending: 'true' } },
  { name: 'Under ₹1000', icon: IndianRupee, filter: { maxPrice: 1000 } },
  { name: 'Top Rated', icon: Star, filter: { topRated: 'true' } },
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
  const topRated = searchParams.get('topRated') === 'true';
  const trending = searchParams.get('trending') === 'true';
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
    topRated: topRated || undefined,
    trending: trending || undefined,
    page: currentPage,
    limit: 12
  }), [selectedCategory, selectedSubCategory, selectedVibe, searchQuery, maxPrice, topRated, trending, currentPage]);

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

  const [localSearchQuery, setLocalSearchQuery] = useState(searchQuery);

  // Sync local query only when URL search param actually changes (e.g. clear filters)
  useEffect(() => {
    if (searchQuery !== localSearchQuery) {
      setLocalSearchQuery(searchQuery);
    }
  }, [searchQuery]);

  // Update URL search param when local query changes (debounced)
  useEffect(() => {
    const timer = setTimeout(() => {
      if (localSearchQuery !== searchQuery) {
        updateFilters({ search: localSearchQuery });
      }
    }, 500);
    return () => clearTimeout(timer);
  }, [localSearchQuery]);

  const [isMobileFilterOpen, setIsMobileFilterOpen] = useState(false);

  const toggleCategory = (name: string) => {
    setOpenCategories(prev => 
      prev.includes(name) ? prev.filter(c => c !== name) : [...prev, name]
    );
  };

  const SearchCard = () => (
    <div className="bg-white p-6 rounded-4xl border border-outline-variant/50 shadow-sm space-y-4">
      <h3 className="font-label text-[10px] uppercase tracking-[0.2em] font-bold text-outline">{siteConfigs.shop_search_card_title || 'Search'}</h3>
      <div className="relative">
        <input 
          type="text" 
          placeholder={siteConfigs.shop_search_placeholder || 'Find something...'}
          value={localSearchQuery}
          onChange={(e) => setLocalSearchQuery(e.target.value)}
          className="w-full pl-10 pr-4 py-3 rounded-xl bg-surface border border-outline-variant/30 focus:outline-none focus:border-primary transition-all font-body text-sm"
        />
        <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-outline" />
      </div>
    </div>
  );

  const FilterContent = () => (
    <div className="space-y-8">
      {/* Search Card */}
      {SearchCard()}

      {/* Quick Filters Card */}
      <div className="bg-white p-6 rounded-4xl border border-outline-variant/50 shadow-sm space-y-4">
        <h3 className="font-label text-[10px] uppercase tracking-[0.2em] font-bold text-outline">{siteConfigs.shop_quick_filters_title || 'Quick Filters'}</h3>
        <div className="space-y-2">
          {QUICK_FILTERS.map(q => (
            <button type="button"
              key={q.name}
              onClick={() => {
                const updates: Record<string, string | null> = {
                  vibe: q.filter.vibe || null,
                  trending: q.filter.trending || null,
                  maxPrice: q.filter.maxPrice?.toString() || null,
                  topRated: q.filter.topRated?.toString() || null,
                };
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
          <button type="button"
            onClick={() => {
              updateFilters({ category: 'All' });
              setIsMobileFilterOpen(false);
            }}
            className={cn(
              "flex items-center justify-between w-full p-3 rounded-xl transition-all group",
              selectedCategory === 'All' ? "bg-accent-blush text-primary" : "text-on-surface hover:bg-accent-blush/50"
            )}
          >
            <span className="font-label text-[11px] uppercase tracking-widest font-bold">{siteConfigs.shop_all_products_label || 'All Products'}</span>
          </button>

          {Array.isArray(shopCategories) && shopCategories.map(cat => {
            const Icon = ICON_MAP[cat.icon || 'Package'] || Package;
            const subCats = Array.isArray(cat.sub_categories) ? cat.sub_categories : [];
            return (
              <div key={cat.id} className="space-y-1">
                <div className="flex items-center gap-1">
                  <button type="button"
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
                    <button type="button"
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
          <h3 className="font-headline font-bold text-lg text-on-surface">{siteConfigs.shop_find_vibe_title || 'Find Your Vibe'}</h3>
          <Sparkles size={16} className="text-outline" />
        </div>
        
        <div className="flex flex-wrap gap-2">
          <button type="button"
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
            {siteConfigs.shop_vibe_all_label || 'All'}
          </button>
          {VIBES.map(vibe => (
            <button type="button"
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
      <header className="max-w-7xl mx-auto px-4 sm:px-6 pt-12 sm:pt-16 md:pt-24 pb-10 sm:pb-12 md:pb-16 text-center space-y-6 sm:space-y-8 relative overflow-hidden">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-full bg-linear-to-b from-accent-blush/20 to-transparent pointer-events-none"></div>
        <div className="space-y-6 max-w-4xl mx-auto relative z-10">
          <span className="font-label text-xs uppercase tracking-[0.3em] text-primary font-bold">{siteConfigs.shop_hero_kicker || 'Curated Shopping'}</span>
          <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-7xl font-headline font-bold leading-tight text-on-surface px-1">
            {siteConfigs.shop_hero_title_line1 || 'The'} <span className="italic font-normal text-primary">{siteConfigs.shop_hero_title_line2 || 'Aesthetic Shop'}</span>
          </h1>
          <p className="text-base md:text-lg lg:text-xl text-on-surface-variant leading-relaxed font-serif italic max-w-2xl mx-auto">
            {siteConfigs.shop_hero_subtitle || 'A refined collection of pieces to style your life, your space, and your routine.'}
          </p>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 min-w-0">
        {/* Mobile Filter Toggle */}
        <div className="lg:hidden mb-8 flex items-center justify-between gap-3 bg-white p-4 rounded-2xl border border-outline-variant/30 shadow-sm sticky top-[calc(4.5rem+env(safe-area-inset-top,0px))] z-30">
          <button type="button"
            onClick={() => setIsMobileFilterOpen(true)}
            className="flex items-center gap-2 min-h-11 min-w-11 font-label text-xs uppercase tracking-widest font-bold text-primary touch-manipulation -ml-2 pl-2"
          >
            <Filter size={16} /> Filters
          </button>
          <div className="text-[10px] font-label uppercase tracking-widest text-outline">
            {(siteConfigs.shop_products_mobile_count || '{count} Products').replace(/\{count\}/g, String(products.length))}
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-12">
          {/* Desktop Sidebar Filters */}
          <aside className="hidden lg:block space-y-8">
            {FilterContent()}
          </aside>

          {/* Product Grid */}
          <main className="lg:col-span-3 space-y-8 md:space-y-12">
            {loading ? (
              <ProductCardGridSkeleton count={9} />
            ) : error ? (
              <div className="bg-red-50 text-red-600 p-8 rounded-4xl text-center font-serif italic">
                {error || "Couldn't load products. Please refresh."}
              </div>
            ) : products.length === 0 ? (
              <div className="bg-white p-12 md:p-20 rounded-[48px] border border-outline-variant/30 text-center space-y-6 shadow-sm">
                <div className="w-16 h-16 bg-surface-container rounded-full flex items-center justify-center mx-auto text-outline/50">
                  <Search size={32} />
                </div>
                <div className="space-y-2">
                  <h3 className="text-2xl md:text-3xl font-headline font-bold text-on-surface">{siteConfigs.shop_no_matches_title || 'No matches found'}</h3>
                  <p className="text-on-surface-variant font-serif italic max-w-md mx-auto">
                    {siteConfigs.shop_empty_message || 'No products found matching your criteria.'}
                  </p>
                </div>
                <button type="button"
                  onClick={() => {
                    setLocalSearchQuery('');
                    updateFilters({ 
                      category: 'All', 
                      subCategory: 'All', 
                      vibe: 'All', 
                      search: '', 
                      maxPrice: null, 
                      topRated: null,
                      trending: null
                    });
                  }}
                  className="min-h-11 text-primary font-label text-[10px] uppercase tracking-widest font-bold border-b border-primary pb-1 touch-manipulation shrink-0"
                >
                  {siteConfigs.shop_clear_filters_cta || 'Clear all filters'}
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
                      <button type="button"
                        disabled={currentPage === 1}
                        onClick={() => updateFilters({ page: (currentPage - 1).toString() })}
                        aria-label="Previous page"
                        className="min-h-11 min-w-11 inline-flex items-center justify-center p-3 md:p-4 rounded-full border border-outline-variant/30 disabled:opacity-30 hover:bg-white hover:shadow-lg transition-all touch-manipulation"
                      >
                        <ChevronLeft size={20} />
                      </button>
                      <span className="font-label text-xs uppercase tracking-[0.2em] font-bold">
                        {meta.page} / {meta.totalPages}
                      </span>
                      <button type="button"
                        disabled={currentPage === meta.totalPages}
                        onClick={() => updateFilters({ page: (currentPage + 1).toString() })}
                        aria-label="Next page"
                        className="min-h-11 min-w-11 inline-flex items-center justify-center p-3 md:p-4 rounded-full border border-outline-variant/30 disabled:opacity-30 hover:bg-white hover:shadow-lg transition-all touch-manipulation"
                      >
                        <ChevronRight size={20} />
                      </button>
                    </div>
                    <p className="font-label text-[10px] uppercase tracking-widest text-outline">
                      {Math.min(meta.page * meta.limit, meta.total)} of {meta.total} products
                    </p>
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
                <h2 className="text-2xl font-headline font-bold">{siteConfigs.shop_mobile_filters_title || 'Filters'}</h2>
                <button type="button"
                  onClick={() => setIsMobileFilterOpen(false)}
                  aria-label="Close filters"
                  className="min-h-11 min-w-11 inline-flex items-center justify-center p-2 hover:bg-accent-blush rounded-full transition-colors touch-manipulation"
                >
                  <X size={24} />
                </button>
              </div>
              {FilterContent()}
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
