import React from 'react';
import { Product } from '../types';
import { cn } from '../lib/utils';
import { useToast } from '../context/ToastContext';

interface PinterestSaveButtonProps {
  product: Product;
  variant: 'card' | 'detail';
  className?: string;
}

const PinterestSaveButton: React.FC<PinterestSaveButtonProps> = ({ product, variant, className }) => {
  const { showToast } = useToast();

  const handlePinterestSave = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    const url = encodeURIComponent(`${window.location.origin}/shop/product/${product.id}`);
    const media = encodeURIComponent(product.image);
    const description = encodeURIComponent(`${product.title} — via The Aesthetic Edit`);
    const pinterestUrl = `https://pinterest.com/pin/create/button/?url=${url}&media=${media}&description=${description}`;

    const width = 600;
    const height = 500;
    const left = window.screen.width / 2 - width / 2;
    const top = window.screen.height / 2 - height / 2;

    window.open(
      pinterestUrl,
      'Pinterest',
      `width=${width},height=${height},left=${left},top=${top},noopener,noreferrer`
    );

    // Fire-and-forget API call
    fetch(`/api/products/${product.id}/pinterest-save`, { method: 'POST' }).catch(() => {});

    showToast('Pinned to Pinterest! ✨');
  };

  const isCard = variant === 'card';

  return (
    <button
      onClick={handlePinterestSave}
      aria-label="Save to Pinterest"
      className={cn(
        'rounded-full flex items-center justify-center transition-all duration-300 group/pin shadow-sm',
        isCard ? 'w-10 h-10 bg-white/90 backdrop-blur-sm' : 'w-11 h-11 bg-white border border-outline-variant/30',
        'hover:bg-[#E60023]',
        className
      )}
    >
      <svg 
        viewBox="0 0 24 24" 
        xmlns="http://www.w3.org/2000/svg"
        className={cn(
          'fill-[#E60023] group-hover/pin:fill-white transition-colors',
          isCard ? 'w-5 h-5' : 'w-6 h-6'
        )}
      >
        <path d="M12 0C5.373 0 0 5.373 0 12c0 5.084 3.163 9.426 7.627 11.174-.105-.949-.2-2.405.042-3.441.218-.937 1.407-5.965 1.407-5.965s-.359-.719-.359-1.782c0-1.668.967-2.914 2.171-2.914 1.023 0 1.518.769 1.518 1.69 0 1.029-.655 2.568-.994 3.995-.283 1.194.599 2.169 1.777 2.169 2.133 0 3.772-2.249 3.772-5.495 0-2.873-2.064-4.882-5.012-4.882-3.414 0-5.418 2.561-5.418 5.207 0 1.031.397 2.138.893 2.738a.36.36 0 0 1 .083.345l-.333 1.36c-.053.22-.174.267-.402.161-1.499-.698-2.436-2.889-2.436-4.649 0-3.785 2.75-7.262 7.929-7.262 4.163 0 7.398 2.967 7.398 6.931 0 4.136-2.607 7.464-6.227 7.464-1.216 0-2.359-.632-2.75-1.378l-.748 2.853c-.271 1.043-1.002 2.35-1.492 3.146C9.57 23.812 10.763 24 12 24c6.627 0 12-5.373 12-12S18.627 0 12 0z"/>
      </svg>
    </button>
  );
};

export default React.memo(PinterestSaveButton);
