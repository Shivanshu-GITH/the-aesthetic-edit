import React from 'react';
import { Heart } from 'lucide-react';
import { useWishlist } from '../context/WishlistContext';
import { useAuth } from '../context/AuthContext';
import { cn } from '../lib/utils';
import { motion } from 'motion/react';
import { useNavigate, useLocation } from 'react-router-dom';

interface WishlistButtonProps {
  productId: string;
  variant: 'card' | 'detail';
  className?: string;
}

const WishlistButton: React.FC<WishlistButtonProps> = ({ productId, variant, className }) => {
  const { isWishlisted, toggleWishlist } = useWishlist();
  const { user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  
  const active = isWishlisted(productId);

  const handleToggle = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (!user) {
      navigate('/login', { state: { from: location } });
      return;
    }
    
    toggleWishlist(productId);
  };

  const isCard = variant === 'card';

  return (
    <button
      onClick={handleToggle}
      aria-label={active ? "Remove from wishlist" : "Add to wishlist"}
      className={cn(
        'rounded-full flex items-center justify-center transition-all duration-300 shadow-sm group/wish',
        isCard ? 'w-10 h-10' : 'w-11 h-11 border border-outline-variant/30',
        active 
          ? 'bg-accent-blush text-primary' 
          : 'bg-white/90 backdrop-blur-sm text-on-surface-variant hover:bg-accent-blush hover:text-primary',
        className
      )}
    >
      <motion.div
        animate={active ? { scale: [1, 1.2, 1] } : {}}
        transition={{ duration: 0.3 }}
      >
        <Heart 
          size={isCard ? 18 : 20} 
          className={cn(
            'transition-colors',
            active ? 'fill-current' : 'fill-transparent group-hover/wish:text-primary'
          )} 
        />
      </motion.div>
    </button>
  );
};

export default React.memo(WishlistButton);
