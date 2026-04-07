import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { Link } from 'react-router-dom';
import { ExternalLink } from 'lucide-react';
import { Product } from '../types';
import { formatPrice } from '../lib/currency';
import PinterestSaveButton from './PinterestSaveButton';
import WishlistButton from './WishlistButton';

interface ProductCardProps {
  product: Product;
  index?: number;
  showPinterestSave?: boolean;
}

const ProductCard: React.FC<ProductCardProps> = ({ product, index = 0, showPinterestSave = true }) => {
  const [displayPrice, setDisplayPrice] = useState(formatPrice(product.price));

  useEffect(() => { 
    import('../lib/currency').then(({ formatPriceAsync }) => { 
      formatPriceAsync(product.price).then(setDisplayPrice); 
    }); 
  }, [product.price]); 

  const handleAffiliateClick = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    fetch(`/api/products/${product.id}/affiliate-click`, { method: 'POST' })
      .then(res => res.json())
      .then(res => {
        if (res.success && res.data.affiliateUrl && res.data.affiliateUrl !== '#') {
          window.open(res.data.affiliateUrl, '_blank', 'noopener,noreferrer');
        } else {
          alert('Retailer link coming soon!');
        }
      })
      .catch(() => {
        alert('Retailer link coming soon!');
      });
  };

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05 }}
      className="group bg-white rounded-4xl overflow-hidden border border-outline-variant/30 shadow-sm hover:shadow-2xl hover:-translate-y-2 transition-all duration-500"
    >
      <div className="aspect-4/5 relative overflow-hidden bg-surface-container">
        <Link to={`/shop/product/${product.id}`} className="block w-full h-full">
          <img 
            src={product.image} 
            alt={product.title} 
            className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
          />
        </Link>
        
        {showPinterestSave && (
          <>
            <div className="absolute top-3 md:top-4 right-12 md:right-16 z-10">
              <WishlistButton variant="card" productId={product.id} />
            </div>
            <div className="absolute top-3 md:top-4 right-3 md:right-4 z-10">
              <PinterestSaveButton variant="card" product={product} />
            </div>
          </>
        )}

        <div className="absolute inset-0 bg-primary/20 opacity-0 group-hover:opacity-100 transition-opacity items-center justify-center pointer-events-none hidden md:flex">
          <Link 
            to={`/shop/product/${product.id}`}
            className="bg-primary text-on-primary px-8 py-3 rounded-full font-label text-[10px] uppercase tracking-widest font-bold hover:bg-primary-hover transition-all transform translate-y-4 group-hover:translate-y-0 pointer-events-auto shadow-lg"
          >
            View Details
          </Link>
        </div>
      </div>
      <div className="p-5 md:p-8 space-y-3 md:space-y-4">
        <div className="space-y-1">
          <span className="font-label text-[8px] md:text-[9px] uppercase tracking-widest text-primary font-bold">{product.category}</span>
          <Link to={`/shop/product/${product.id}`}>
            <h3 className="font-headline font-bold text-lg md:text-xl text-on-surface group-hover:text-primary transition-colors line-clamp-1 md:line-clamp-2">{product.title}</h3>
          </Link>
        </div>
        <div className="flex items-center justify-between pt-3 md:pt-4 border-t border-outline-variant/30">
          <span className="text-lg md:text-xl font-semibold tabular-nums tracking-tight text-on-surface">{displayPrice}</span>
          <button 
            onClick={handleAffiliateClick}
            className="text-outline hover:text-primary transition-colors cursor-pointer"
          >
            <ExternalLink size={18} />
          </button>
        </div>
      </div>
    </motion.div>
  );
};

export default React.memo(ProductCard);
