import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'motion/react';
import { Loader2, CheckCircle2 } from 'lucide-react';
import SEOMeta from '../components/SEOMeta';
import { useToast } from '../context/ToastContext';

export default function About() {
  const { showToast } = useToast();
  const [siteConfigs, setSiteConfigs] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    fetch('/api/home-shop/config')
      .then(res => res.json())
      .then(data => {
        if (data.success) setSiteConfigs(data.data);
      })
      .catch(err => console.error('Failed to fetch site config', err))
      .finally(() => setLoading(false));
  }, []);

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    message: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    try {
      const response = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });
      
      const result = await response.json();
      
      if (result.success) {
        setIsSuccess(true);
        showToast('Message sent successfully! I will get back to you soon. ♡');
        setFormData({ name: '', email: '', message: '' });
      } else {
        showToast(result.error || 'Failed to send message', 'error');
      }
    } catch (error) {
      showToast('Something went wrong. Please try again later.', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="pb-32 bg-surface overflow-x-hidden">
      <SEOMeta 
        title="About Anjali — The Woman Behind The Aesthetic Edit"
        description="Meet Anjali, the creator of The Aesthetic Edit. Curating beauty, style, and intentional living through a Pinterest-first lens."
        type="website"
      />
      {/* Hero Section */}
      <section className="max-w-7xl mx-auto px-6 pt-16 md:pt-20 mb-20 md:mb-32 relative">
        <div className="absolute top-0 left-0 w-full h-full bg-linear-to-b from-accent-blush/30 to-transparent pointer-events-none"></div>
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-center relative z-10">
          <div className="lg:col-span-5 relative max-w-md mx-auto lg:max-w-none">
            <motion.div 
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 1 }}
              className="aspect-square rounded-full overflow-hidden border-8 md:border-12 border-white shadow-2xl relative z-10 bg-surface-container"
            >
              <img 
                src={siteConfigs.about_hero_image || "https://images.unsplash.com/photo-1524504388940-b1c1722653e1?auto=format&fit=crop&q=80&w=800"} 
                alt={siteConfigs.about_hero_signature || "Anjali"} 
                loading="lazy"
                className="w-full h-full object-cover"
                referrerPolicy="no-referrer"
              />
            </motion.div>
            <div className="absolute -bottom-6 md:-bottom-8 right-0 lg:-right-4 font-signature text-4xl md:text-5xl text-primary transform -rotate-12 z-20">
              {siteConfigs.about_hero_signature || "Anjali"}
            </div>
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[110%] h-[110%] border border-primary/10 rounded-full z-0"></div>
          </div>
          
          <div className="lg:col-span-7 space-y-6 md:space-y-8 text-center lg:text-left">
            <h1 className="text-5xl md:text-7xl lg:text-8xl font-headline font-bold leading-tight text-on-surface">
              {siteConfigs.about_hero_title || 'Hi, I’m Anjali.'}
            </h1>
            <p className="text-xl md:text-2xl lg:text-3xl font-serif italic text-on-surface-variant leading-relaxed">
              {siteConfigs.about_hero_subtitle || 'Creating a life that feels as beautiful as it looks.'}
            </p>
            <div className="w-16 h-0.5 bg-accent-peach mx-auto lg:mx-0"></div>
            <div className="space-y-6 text-base md:text-lg text-on-surface-variant leading-loose max-w-xl mx-auto lg:mx-0">
              <p>
                {siteConfigs.about_hero_description || 'I’ve always believed that beauty isn’t just something you see — it’s something you feel.'}
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* My Story Section */}
      <section className="bg-surface-container-low py-20 md:py-32 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-accent-peach/10 blur-[100px] rounded-full pointer-events-none"></div>
        <div className="max-w-5xl mx-auto px-6 relative z-10">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-16 md:gap-24 items-center">
            <div className="space-y-8 bg-white p-6 md:p-12 rounded-4xl border border-outline-variant/30 shadow-sm">
              <h2 className="text-3xl md:text-4xl font-headline font-bold text-on-surface">
                {siteConfigs.about_story_title || 'My Story'}
              </h2>
              <div className="space-y-6 text-sm md:text-base text-on-surface-variant leading-loose whitespace-pre-wrap">
                {siteConfigs.about_story_content ? (
                  siteConfigs.about_story_content.split('\n\n').map((para, i) => (
                    <p key={i}>{para}</p>
                  ))
                ) : (
                  <>
                    <p>My journey began with a simple love for creating beauty in the everyday.</p>
                    <p>What started as experimenting with outfits and personal style slowly grew into something deeper — a passion for designing spaces that feel just as good as they look. Over time, I realized that style isn’t limited to what you wear. It’s in how you live, how your home feels, and how your space reflects who you are.</p>
                    <p>I started this platform to bring those two worlds together — fashion and home — into one seamless, intentional lifestyle.</p>
                    <p>Here, you’ll find curated ideas for styling your outfits, elevating your spaces, and creating a life that feels both refined and effortless. Whether it’s a cozy corner in your home or a look that makes you feel like your best self, my goal is to help you build a lifestyle that feels uniquely yours.</p>
                  </>
                )}
                <p className="font-serif italic text-xl md:text-2xl text-primary border-l-4 border-accent-peach pl-6 md:pl-8 py-2">
                  "{siteConfigs.about_quote || "Style isn’t just what you wear — it’s how you live."}"
                </p>
              </div>
            </div>
            <div className="relative aspect-4/5 rounded-4xl overflow-hidden shadow-2xl border-8 md:border-12 border-white bg-surface-container">
              <img 
                src={siteConfigs.about_story_image || "https://images.unsplash.com/photo-1494438639946-1ebd1d20bf85?auto=format&fit=crop&q=80&w=800"} 
                alt="Aesthetic Lifestyle" 
                loading="lazy"
                className="w-full h-full object-cover"
                referrerPolicy="no-referrer"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Collaboration Section */}
      <section className="max-w-7xl mx-auto px-6 pt-20 md:pt-32">
        <div className="bg-surface-container rounded-[40px] md:rounded-[48px] overflow-hidden grid grid-cols-1 lg:grid-cols-2 border border-outline-variant/30 shadow-sm">
          <div className="p-8 md:p-16 lg:p-24 space-y-8 bg-linear-to-br from-surface-container to-accent-blush/20">
            <h2 className="text-3xl md:text-4xl font-headline font-bold text-on-surface">
              {siteConfigs.about_collab_title || 'Let’s Work Together'}
            </h2>
            <p className="text-sm md:text-base text-on-surface-variant leading-loose">
              {siteConfigs.about_collab_description || "I love collaborating with brands that share a commitment to aesthetics and mindful consumption. Whether it's a content partnership or a creative direction project, let's create something timeless."}
            </p>
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-6">
              <div className="flex -space-x-4">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="w-10 h-10 md:w-12 md:h-12 rounded-full border-4 border-white overflow-hidden shadow-sm">
                    <img src={`https://i.pravatar.cc/150?u=${i+10}`} alt="Partner" className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                  </div>
                ))}
              </div>
              <span className="font-label text-[10px] uppercase tracking-widest font-bold text-primary">50+ Successful Brand Collabs</span>
            </div>
          </div>
          <div className="bg-white p-8 md:p-16 lg:p-24">
            {isSuccess ? (
              <motion.div 
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="h-full flex flex-col items-center justify-center text-center space-y-6"
              >
                <div className="w-16 h-16 md:w-20 md:h-20 rounded-full bg-accent-blush flex items-center justify-center text-primary">
                  <CheckCircle2 size={32} />
                </div>
                <h3 className="text-2xl md:text-3xl font-headline font-bold text-on-surface">Thank You!</h3>
                <p className="text-sm md:text-base text-on-surface-variant font-serif italic">
                  Your message has been received. I’ll be in touch soon.
                </p>
                <button 
                  onClick={() => setIsSuccess(false)}
                  className="text-primary font-label text-[10px] uppercase tracking-widest font-bold border-b border-primary pt-4"
                >
                  Send Another Message
                </button>
              </motion.div>
            ) : (
              <form className="space-y-8 md:space-y-10" onSubmit={handleSubmit}>
                <div className="space-y-2">
                  <label className="block font-label text-[10px] uppercase tracking-[0.2em] text-on-surface-variant font-bold">Your Name</label>
                  <input 
                    type="text" 
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="E.g. Julianne Moore" 
                    className="w-full border-b border-outline-variant focus:outline-none focus:border-primary px-4 md:px-6 py-3 transition-all placeholder:text-outline/30 bg-transparent border-t-0 border-l-0 border-r-0 text-sm" 
                  />
                </div>
                <div className="space-y-2">
                  <label className="block font-label text-[10px] uppercase tracking-[0.2em] text-on-surface-variant font-bold">Email Address</label>
                  <input 
                    type="email" 
                    required
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    placeholder="hello@example.com" 
                    className="w-full border-b border-outline-variant focus:outline-none focus:border-primary px-4 md:px-6 py-3 transition-all placeholder:text-outline/30 bg-transparent border-t-0 border-l-0 border-r-0 text-sm" 
                  />
                </div>
                <div className="space-y-2">
                  <label className="block font-label text-[10px] uppercase tracking-[0.2em] text-on-surface-variant font-bold">Tell me about your project</label>
                  <textarea 
                    rows={3} 
                    required
                    value={formData.message}
                    onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                    placeholder="I'd love to partner on..." 
                    className="w-full border-b border-outline-variant focus:outline-none focus:border-primary px-4 md:px-6 py-3 transition-all placeholder:text-outline/30 resize-none bg-transparent border-t-0 border-l-0 border-r-0 text-sm" 
                  />
                </div>
                <button 
                  disabled={isSubmitting}
                  className="w-full bg-primary text-white py-4 md:py-5 rounded-2xl font-label font-bold uppercase tracking-widest hover:bg-primary-hover transition-all shadow-xl shadow-primary/20 flex items-center justify-center gap-3 disabled:opacity-50 text-xs md:text-sm"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="animate-spin" size={20} /> Sending...
                    </>
                  ) : (
                    'Send Message'
                  )}
                </button>
              </form>
            )}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="bg-surface-container py-20 md:py-32 px-6">
        <div className="max-w-4xl mx-auto text-center space-y-8 md:space-y-10">
          <h2 className="text-3xl md:text-5xl lg:text-6xl font-headline font-bold text-on-surface leading-tight">
            {siteConfigs.about_cta_title || 'Ready to elevate your aesthetic?'}
          </h2>
          <p className="text-lg md:text-xl text-on-surface-variant font-serif italic">
            {siteConfigs.about_cta_subtitle || 'Explore my curated collection of home, style, and lifestyle finds.'}
          </p>
          <div className="flex justify-center pt-4">
            <Link 
              to="/shop"
              className="bg-primary text-on-primary px-10 md:px-12 py-4 md:py-5 rounded-2xl font-label font-bold uppercase tracking-widest hover:bg-primary-hover transition-all shadow-xl shadow-primary/20 text-sm md:text-base w-full sm:w-auto"
            >
              {siteConfigs.about_cta_button || 'Shop the Collection'}
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
