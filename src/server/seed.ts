import sql, { initDb } from './db.js'; 
import { v4 as uuidv4 } from 'uuid'; 
 
const products = [
  {
    id: 'p1',
    title: 'Minimalist Linen Dress',
    price: 89,
    image: 'https://images.unsplash.com/photo-1515372039744-b8f02a3ae446?auto=format&fit=crop&q=80&w=800',
    category: 'Clothing & Accessories',
    sub_category: 'Clothing',
    vibes: ['Minimal', 'Clean Girl'],
    affiliate_url: '#',
    retailer: 'Amazon',
    description: 'A timeless silhouette crafted from breathable organic linen, perfect for effortless summer days and intentional living. This dress combines comfort with a refined aesthetic that transitions seamlessly from morning coffee to evening strolls.'
  },
  {
    id: 'p2',
    title: 'Gold Link Bracelet',
    price: 45,
    image: 'https://images.unsplash.com/photo-1573408301185-9146fe634ad0?auto=format&fit=crop&q=80&w=800',
    category: 'Clothing & Accessories',
    sub_category: 'Accessories',
    vibes: ['Clean Girl', 'Pinteresty'],
    affiliate_url: '#',
    retailer: 'Amazon',
    description: 'Elevate your daily ensemble with this delicate gold link bracelet, designed to catch the light with every movement. Its minimalist design makes it a versatile staple for your curated jewelry collection.'
  },
  {
    id: 'p3',
    title: 'Ceramic Vase Set',
    price: 62,
    image: 'https://images.unsplash.com/photo-1581783898377-1c85bf937427?auto=format&fit=crop&q=80&w=800',
    category: 'Home & Decor',
    sub_category: 'Decor',
    vibes: ['Cozy', 'Minimal'],
    affiliate_url: '#',
    retailer: 'Amazon',
    description: 'This set of two hand-finished ceramic vases brings a sense of calm and organic texture to any corner of your home. Their soft matte finish and sculptural forms make them beautiful standalone pieces or the perfect vessel for dried botanicals.'
  },
  {
    id: 'p4',
    title: 'Woven Storage Basket',
    price: 38,
    image: 'https://images.unsplash.com/photo-1544441893-675973e31985?auto=format&fit=crop&q=80&w=800',
    category: 'Home & Decor',
    sub_category: 'Organization',
    vibes: ['Cozy', 'Pinteresty'],
    affiliate_url: '#',
    retailer: 'Amazon',
    description: 'Hand-woven from sustainable seagrass, this storage basket offers a beautiful solution for organizing your essentials while adding warmth to your space. It perfectly balances functionality with a rustic, aesthetic appeal.'
  },
  {
    id: 'p5',
    title: 'Aesthetic Mechanical Keyboard',
    price: 120,
    image: 'https://images.unsplash.com/photo-1511467687858-23d96c32e4ae?auto=format&fit=crop&q=80&w=800',
    category: 'Electronics & Gadgets',
    sub_category: 'Gadgets',
    vibes: ['Minimal', 'Pinteresty'],
    affiliate_url: '#',
    retailer: 'Amazon',
    description: 'Transform your workspace with this cream-toned mechanical keyboard, featuring a satisfying tactile feel and a clean, minimalist design. It is the ultimate fusion of modern technology and vintage-inspired aesthetics for the productive dreamer.'
  },
  {
    id: 'p6',
    title: 'Organic Cotton Baby Onesie',
    price: 24,
    image: 'https://images.unsplash.com/photo-1522771739844-6a9f6d5f14af?auto=format&fit=crop&q=80&w=800',
    category: 'Baby & Kids',
    sub_category: 'Clothing',
    vibes: ['Cozy'],
    affiliate_url: '#',
    retailer: 'Amazon',
    description: 'Softness meets sustainability in this organic cotton onesie, designed with your little one\'s comfort and the planet in mind. Its neutral palette and gentle fabric make it an essential for a mindful nursery.'
  },
  {
    id: 'p7',
    title: 'Silk Pillowcase Set',
    price: 45,
    image: 'https://images.unsplash.com/photo-1522771739844-6a9f6d5f14af?auto=format&fit=crop&q=80&w=800',
    category: 'Home & Decor',
    sub_category: 'Decor',
    vibes: ['Minimal', 'Clean Girl'],
    affiliate_url: '#',
    retailer: 'Amazon',
    description: 'Indulge in a luxurious night\'s sleep with these pure mulberry silk pillowcases that protect your hair and skin while you dream. A simple yet impactful addition to your evening ritual for a touch of everyday elegance.'
  },
  {
    id: 'p8',
    title: 'Oversized Cashmere Sweater',
    price: 145,
    image: 'https://images.unsplash.com/photo-1434389677669-e08b4cac3105?auto=format&fit=crop&q=80&w=800',
    category: 'Clothing & Accessories',
    sub_category: 'Clothing',
    vibes: ['Cozy', 'Minimal'],
    affiliate_url: '#',
    retailer: 'Amazon',
    description: 'Wrap yourself in the unparalleled softness of this ethically sourced cashmere sweater, designed for a relaxed yet polished fit. It is the quintessential piece for a timeless capsule wardrobe that prioritizes quality and comfort.'
  },
  {
    id: 'p9',
    title: 'Wooden Baby Teether',
    price: 18,
    image: 'https://images.unsplash.com/photo-1519689680058-324335c77eba?auto=format&fit=crop&q=80&w=800',
    category: 'Baby & Kids',
    sub_category: 'Toys',
    vibes: ['Cozy', 'Pinteresty'],
    affiliate_url: '#',
    retailer: 'Amazon',
    description: 'Crafted from smooth, untreated beechwood, this minimalist teether provides safe relief for your baby while maintaining a beautiful, natural aesthetic. A thoughtful and durable choice for the intentional parent.'
  },
  {
    id: 'p10',
    title: 'Matte Black Desk Lamp',
    price: 75,
    image: 'https://images.unsplash.com/photo-1513519245088-0e12902e5a38?auto=format&fit=crop&q=80&w=800',
    category: 'Electronics & Gadgets',
    sub_category: 'Gadgets',
    vibes: ['Minimal'],
    affiliate_url: '#',
    retailer: 'Amazon',
    description: 'Illuminate your thoughts with this sleek matte black desk lamp, featuring an adjustable arm and a refined industrial silhouette. It provides the perfect focused light for your late-night creative sessions and aesthetic desk setups.'
  }
];

const blogCategories = [
  { id: '1', title: 'Outfit Ideas', slug: 'outfit-ideas', image: 'https://images.unsplash.com/photo-1490481651871-ab68de25d43d?auto=format&fit=crop&q=80&w=800', description: 'Curated style guides and seasonal essentials.' },
  { id: '2', title: 'Home Styling', slug: 'home-styling', image: 'https://images.unsplash.com/photo-1513519245088-0e12902e5a38?auto=format&fit=crop&q=80&w=800', description: 'Creating intentional and aesthetic spaces.' },
  { id: '3', title: 'Lifestyle & Routines', slug: 'lifestyle-routines', image: 'https://images.unsplash.com/photo-1499750310107-5fef28a66643?auto=format&fit=crop&q=80&w=800', description: 'Mindful living and creative inspiration.' },
  { id: '4', title: 'Productivity & Wellness', slug: 'productivity-wellness', image: 'https://images.unsplash.com/photo-1484480974693-6ca0a78fb36b?auto=format&fit=crop&q=80&w=800', description: 'Gentle parenting and nursery essentials.' },
  { id: '5', title: 'Tech & Setups', slug: 'tech-setups', image: 'https://images.unsplash.com/photo-1519389950473-47ba0277781c?auto=format&fit=crop&q=80&w=800', description: 'Aesthetic gadgets and digital wellness.' },
];

const blogPosts = [
  {
    id: 'b1',
    slug: 'minimal-outfit-ideas',
    category_slug: 'outfit-ideas',
    title: '10 Minimal Outfit Ideas You\'ll Actually Wear',
    excerpt: 'Build a timeless capsule wardrobe that makes getting dressed effortless every single morning.',
    content: `Building a capsule wardrobe is one of the most liberating steps you can take toward an intentional life. In a world that constantly pushes more, choosing less is a radical act of self-care. When we strip away the noise of fast fashion, we're left with pieces that truly resonate with our personal style and values.

    A minimal wardrobe isn't about having a boring closet; it's about having a functional one. Think of high-quality linen dresses that breathe with you, or gold link bracelets that add a touch of elegance to a simple white tee. These are the foundations of a style that is both timeless and effortless. By investing in better pieces, you're not just buying clothes—you're curating a collection that tells your story.

    In this guide, we'll explore ten outfit combinations that rely on classic silhouettes and neutral palettes. From the perfect oversized cashmere sweater paired with tailored trousers to the simple grace of a linen midi dress, these looks are designed to be worn and loved for years. Let's embrace the beauty of simplicity together and discover how less really can be more when it comes to your daily style.`,
    image: 'https://images.unsplash.com/photo-1489987707025-afc232f7ea0f?auto=format&fit=crop&q=80&w=800',
    category: 'Outfit Ideas',
    author: 'Elena Muse',
    date: 'Oct 12, 2024',
    read_time: '8 Min Read',
    recommended_products: ['p1', 'p2', 'p8'],
  },
  {
    id: 'b2',
    slug: 'cozy-room-tips',
    category_slug: 'home-styling',
    title: 'How to Make Your Room Feel Instantly Cozy',
    excerpt: 'Transform your space into a warm sanctuary with these simple aesthetic touches and lighting tips.',
    content: `Your bedroom should be a sanctuary—a place where the weight of the world falls away the moment you step through the door. Creating a cozy atmosphere isn't about expensive renovations; it's about intentional details that appeal to the senses and promote a sense of calm.

    Lighting is the most powerful tool in your design kit. Instead of harsh overhead lights, layer your illumination with warm-toned lamps and candles. A matte black desk lamp can provide focused light for reading, while a cluster of candles on a ceramic tray adds a soft, flickering glow that instantly softens the room. Texture is another key element. Think about the feel of a woven storage basket against a smooth floor, or the luxury of a silk pillowcase against your skin.

    Incorporating natural elements like wood and ceramics can also ground your space. A simple ceramic vase set with a few dried stems can bring a touch of the outdoors inside, creating a peaceful connection to nature. Remember, a cozy room is a personal reflection of what makes you feel safe and at home. It's about surrounding yourself with things you love and creating a space that nurtures your soul every single day.`,
    image: 'https://images.unsplash.com/photo-1494438639946-1ebd1d20bf85?auto=format&fit=crop&q=80&w=800',
    category: 'Home Styling',
    author: 'Elena Muse',
    date: 'Oct 15, 2024',
    read_time: '6 Min Read',
    recommended_products: ['p3', 'p4', 'p7'],
  },
  {
    id: 'b3',
    slug: 'clean-girl-morning-routine',
    category_slug: 'lifestyle-routines',
    title: 'Clean Girl Morning Routine That Actually Works',
    excerpt: 'A realistic guide to starting your day with intention, productivity, and a touch of aesthetic.',
    content: `The "Clean Girl" morning routine isn't just about looking polished; it's about cultivating a mindset of clarity and intention from the moment you wake up. It's about reclaiming your morning from the digital noise and focusing on the small rituals that set a positive tone for the rest of your day.

    Start your morning with a moment of stillness. Before reaching for your phone, take a few deep breaths and set an intention for the day. This could be as simple as "I will be present" or "I will move with grace." Follow this with a glass of warm lemon water to hydrate your body and awaken your senses. A mindful skincare routine is another cornerstone of this aesthetic—taking the time to gently massage your skin and appreciate the ritual can be incredibly grounding.

    Productivity flows naturally from a clear mind and an organized environment. If you're working from home, ensure your workspace is a place you actually enjoy being. An aesthetic mechanical keyboard can make typing feel like a creative act, while a minimalist desk lamp provides the perfect focus. By weaving these intentional habits into your morning, you're not just following a trend; you're building a lifestyle that supports your highest self.`,
    image: 'https://images.unsplash.com/photo-1499750310107-5fef28a66643?auto=format&fit=crop&q=80&w=800',
    category: 'Lifestyle & Routines',
    author: 'Elena Muse',
    date: 'Oct 20, 2024',
    read_time: '5 Min Read',
    recommended_products: ['p5', 'p10'],
  },
  {
    id: 'b4',
    slug: 'aesthetic-tech-setup',
    category_slug: 'tech-setups',
    title: 'Aesthetic Tech Setup: Form Meets Function',
    excerpt: 'Elevate your workspace with these curated tech and organization picks for maximum focus.',
    content: `In our increasingly digital world, our workspaces have become the hubs of our creative lives. However, a cluttered desk often leads to a cluttered mind. Creating an aesthetic tech setup is about finding the perfect balance between high-performance functionality and a clean, inspiring design.

    The centerpiece of any great setup is a keyboard that feels as good as it looks. A cream-toned mechanical keyboard not only adds a vintage-inspired aesthetic to your desk but also provides a tactile experience that makes every keystroke intentional. Pair this with a matte black desk lamp for focused illumination that minimizes eye strain during long hours of work. Organization is equally important—using woven storage baskets to hide cables and peripherals can instantly elevate the look of your space.

    Your setup should be a reflection of your workflow and your personal style. It's about choosing tools that not only do the job but also bring a sense of joy and inspiration to your daily tasks. When your environment is beautiful and functional, you're free to focus on what truly matters: your ideas and your creativity. Let's build a workspace that supports your best work and makes every hour spent at your desk a pleasure.`,
    image: 'https://images.unsplash.com/photo-1519389950473-47ba0277781c?auto=format&fit=crop&q=80&w=800',
    category: 'Tech & Setups',
    author: 'Elena Muse',
    date: 'Oct 22, 2024',
    read_time: '7 Min Read',
    recommended_products: ['p5', 'p10'],
  }
];

async function seed() { 
  console.log('Initializing database...'); 
  await initDb(); 
 
  console.log('Seeding products...'); 
  for (const product of products) { 
    await sql` 
      INSERT INTO products (id, title, price, image, category, sub_category, vibes, affiliate_url, retailer, description) 
      VALUES ( 
        ${product.id}, 
        ${product.title}, 
        ${product.price}, 
        ${product.image}, 
        ${product.category}, 
        ${product.sub_category}, 
        ${JSON.stringify(product.vibes)}::jsonb, 
        ${product.affiliate_url}, 
        ${product.retailer || null}, 
        ${product.description || null} 
      ) 
      ON CONFLICT (id) DO NOTHING 
    `; 
  } 
 
  console.log('Seeding blog categories...'); 
  for (const cat of blogCategories) { 
    await sql` 
      INSERT INTO blog_categories (id, title, slug, image, description) 
      VALUES (${cat.id}, ${cat.title}, ${cat.slug}, ${cat.image}, ${cat.description}) 
      ON CONFLICT (id) DO NOTHING 
    `; 
  } 
 
  console.log('Seeding blog posts...'); 
  for (const post of blogPosts) { 
    await sql` 
      INSERT INTO blog_posts (id, slug, category_slug, title, excerpt, content, image, category, author, date, read_time, recommended_products, is_published) 
      VALUES ( 
        ${post.id}, ${post.slug}, ${post.category_slug}, ${post.title}, ${post.excerpt}, 
        ${post.content}, ${post.image}, ${post.category}, ${post.author}, ${post.date}, 
        ${post.read_time}, ${JSON.stringify(post.recommended_products || [])}::jsonb, true 
      ) 
      ON CONFLICT (id) DO NOTHING 
    `; 
  } 
 
  console.log('Seeding complete!'); 
  process.exit(0); 
} 
 
seed().catch((e) => { console.error(e); process.exit(1); }); 
