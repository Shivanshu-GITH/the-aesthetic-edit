import React, { useEffect } from 'react';

interface SEOMetaProps {
  title: string;
  description: string;
  image?: string;
  url?: string;
  type?: 'website' | 'article' | 'product';
  articleMeta?: {
    author: string;
    publishedTime: string;
    section: string;
  };
  productMeta?: {
    price: number;
    currency: string;
    availability: 'in stock' | 'out of stock';
    retailer?: string;
  };
}

const SEOMeta: React.FC<SEOMetaProps> = ({
  title,
  description,
  image,
  url,
  type = 'website',
  articleMeta,
  productMeta,
}) => {
  useEffect(() => {
    const fullTitle = `${title} | The Aesthetic Edit`;
    const previousTitle = document.title;
    document.title = fullTitle;

    const canonicalUrl = url || `${window.location.origin}${window.location.pathname}`;
    const absoluteImage = image?.startsWith('http') 
      ? image 
      : `${window.location.origin}${image || '/og-image.jpg'}`;

    const metaTags: { [key: string]: string }[] = [
      // Standard
      { name: 'description', content: description },
      { rel: 'canonical', href: canonicalUrl },

      // Open Graph
      { property: 'og:title', content: fullTitle },
      { property: 'og:description', content: description },
      { property: 'og:image', content: absoluteImage },
      { property: 'og:url', content: canonicalUrl },
      { property: 'og:type', content: type },
      { property: 'og:site_name', content: 'The Aesthetic Edit' },

      // Twitter Card
      { name: 'twitter:card', content: 'summary_large_image' },
      { name: 'twitter:title', content: fullTitle },
      { name: 'twitter:description', content: description },
      { name: 'twitter:image', content: absoluteImage },

      // Pinterest
      { name: 'pinterest:description', content: description },
    ];

    if (type === 'product' && productMeta) {
      metaTags.push(
        { property: 'og:price:amount', content: productMeta.price.toString() },
        { property: 'og:price:currency', content: productMeta.currency },
        { property: 'og:availability', content: productMeta.availability }
      );
    }

    if (type === 'article' && articleMeta) {
      metaTags.push(
        { property: 'article:author', content: articleMeta.author },
        { property: 'article:published_time', content: articleMeta.publishedTime },
        { property: 'article:section', content: articleMeta.section }
      );
    }

    const addedElements: HTMLElement[] = [];

    metaTags.forEach((tag) => {
      let element: HTMLElement;
      if (tag.rel === 'canonical') {
        element = document.createElement('link');
        element.setAttribute('rel', 'canonical');
        element.setAttribute('href', tag.href);
      } else {
        element = document.createElement('meta');
        Object.entries(tag).forEach(([key, value]) => {
          element.setAttribute(key, value);
        });
      }
      element.setAttribute('data-seo', 'true');
      document.head.appendChild(element);
      addedElements.push(element);
    });

    return () => {
      document.title = previousTitle;
      addedElements.forEach((el) => {
        if (el.parentNode) {
          el.parentNode.removeChild(el);
        }
      });
    };
  }, [title, description, image, url, type, articleMeta, productMeta]);

  return null;
};

export default SEOMeta;
