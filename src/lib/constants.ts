export const PRODUCT_CATEGORIES = [ 
  'Clothing & Accessories', 
  'Home & Decor', 
  'Lifestyle Essentials', 
  'Baby & Kids', 
  'Electronics & Gadgets', 
] as const; 

export const SUB_CATEGORIES: Record<string, string[]> = { 
  'Clothing & Accessories': ['Clothing', 'Accessories'], 
  'Home & Decor': ['Decor', 'Organization'], 
  'Lifestyle Essentials': ['Aesthetic Picks', 'Trending'], 
  'Baby & Kids': ['Clothing', 'Toys'], 
  'Electronics & Gadgets': ['Gadgets'], 
}; 

export const VIBES = [ 
  'Minimal', 'Cozy', 'Pinteresty', 'Aesthetic', 'Chic', 
  'Cottagecore', 'Y2K', 'Dark Academia', 'Clean Girl', 'Soft Life', 
] as const; 

export type Vibe = typeof VIBES[number]; 
