import React, { useEffect, useMemo } from 'react';
import { motion } from 'motion/react';
import { Link } from 'react-router-dom';
import { CheckCircle2, Download, Star, Loader2, ArrowRight } from 'lucide-react';
import SEOMeta from '../components/SEOMeta';

const DEFAULT_BULLETS = [
  'The "Aesthetic First" strategy for viral pins',
  'How to optimize your profile for SEO discovery',
  '3 templates for high-converting pin designs',
  'The daily workflow for consistent growth',
];

export default function FreeGuide() {
  const [siteConfigs, setSiteConfigs] = React.useState<Record<string, string>>({});
  const [submitted, setSubmitted] = React.useState(false);
  const [email, setEmail] = React.useState('');
  const [name, setName] = React.useState('');
  const [errors, setErrors] = React.useState<{ name?: string, email?: string }>({});

  const [isLoading, setIsLoading] = React.useState(false);
  const [guideDownloadUrl, setGuideDownloadUrl] = React.useState('');

  useEffect(() => {
    fetch('/api/home-shop/config')
      .then((res) => res.json())
      .then((data) => {
        if (data.success) setSiteConfigs(data.data);
      })
      .catch(() => {});
  }, []);

  const bulletItems = useMemo(() => {
    const raw = siteConfigs.free_guide_bullets?.trim();
    if (!raw) return DEFAULT_BULLETS;
    const lines = raw.split('\n').map((l) => l.trim()).filter(Boolean);
    return lines.length > 0 ? lines : DEFAULT_BULLETS;
  }, [siteConfigs.free_guide_bullets]);

  const proofAvatars = useMemo(
    () =>
      [1, 2, 3, 4].map(
        (i) => siteConfigs[`free_guide_proof_avatar_${i}`] || `https://i.pravatar.cc/100?u=${i}`
      ),
    [siteConfigs]
  );

  const APP_URL =
    (typeof window !== 'undefined' && window.location?.origin) ||
    import.meta.env.VITE_APP_URL ||
    'http://localhost:3000';

  const validate = () => {
    const newErrors: { name?: string, email?: string } = {};
    if (!name || name.length < 2) {
      newErrors.name = 'Name must be at least 2 characters';
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!email || !emailRegex.test(email)) {
      newErrors.email = 'Please enter a valid email address';
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;
    setIsLoading(true);
    
    try {
      const response = await fetch('/api/leads', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email }),
      });
      
      const result = await response.json();

      if (response.ok) {
        const downloadUrl = result?.data?.guideUrl || siteConfigs.free_guide_file_url || '';
        setGuideDownloadUrl(downloadUrl);
        setSubmitted(true);
        if (downloadUrl) {
          window.open(downloadUrl, '_blank', 'noopener,noreferrer');
        }
      } else {
        alert(result?.error || 'Something went wrong. Please try again.');
      }
    } catch (error) {
      console.error('Error submitting form:', error);
      alert('Network error. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const pinDescription =
    siteConfigs.free_guide_pinterest_description ||
    'Free Pinterest Growth Guide by The Aesthetic Edit';

  const isInstantDownload = Boolean(guideDownloadUrl || siteConfigs.free_guide_file_url);

  return (
    <div className="min-h-screen bg-surface relative overflow-hidden">
      <SEOMeta 
        title="Free Pinterest Growth Guide — Grow Your Aesthetic Brand"
        description="Download the free Pinterest Growth Guide. Learn how to build a high-converting aesthetic Pinterest presence from scratch."
        type="website"
      />
      {/* Decorative Background Elements */}
      <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-accent-blush/20 rounded-full blur-[120px] -translate-y-1/2 translate-x-1/3 pointer-events-none"></div>
      <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-accent-peach/20 rounded-full blur-[100px] translate-y-1/3 -translate-x-1/4 pointer-events-none"></div>

      <div className="max-w-7xl mx-auto px-6 py-24 grid grid-cols-1 lg:grid-cols-2 gap-20 items-center relative z-10">
        {/* Left Side: Content */}
        <motion.div 
          initial={{ opacity: 0, x: -30 }}
          animate={{ opacity: 1, x: 0 }}
          className="space-y-10"
        >
          <div className="space-y-6">
            <span className="font-label text-xs uppercase tracking-[0.3em] text-primary font-bold">
              {siteConfigs.free_guide_kicker || 'Free Resource'}
            </span>
            <h1 className="text-5xl md:text-7xl font-headline font-bold leading-tight text-on-surface">
              {siteConfigs.free_guide_title_line1 || 'Get Your Free'} <br />
              <span className="italic font-normal text-primary">
                {siteConfigs.free_guide_title_emphasis || 'Pinterest Growth'}
              </span>{' '}
              {siteConfigs.free_guide_title_suffix || 'Guide'}
            </h1>
            <p className="text-xl text-on-surface-variant font-serif italic leading-relaxed">
              {siteConfigs.free_guide_subtitle ||
                'Unlock the secrets to building a high-converting aesthetic brand on Pinterest. From visual storytelling to SEO optimization.'}
            </p>
          </div>

          <div className="space-y-6">
            {bulletItems.map((item, i) => (
              <div key={i} className="flex items-center gap-4">
                <div className="w-6 h-6 rounded-full bg-accent-blush flex items-center justify-center text-primary">
                  <CheckCircle2 size={16} />
                </div>
                <span className="text-on-surface font-label text-sm tracking-wide font-medium">{item}</span>
              </div>
            ))}
          </div>

          <div className="pt-8 flex flex-wrap items-center gap-8 md:gap-12 border-t border-outline-variant/30">
            <div className="flex flex-col">
              <span className="text-3xl font-headline font-bold text-on-surface">
                {siteConfigs.free_guide_stat_number || '12k+'}
              </span>
              <span className="font-label text-[10px] uppercase tracking-widest text-on-surface-variant font-bold">
                {siteConfigs.free_guide_stat_label || 'Downloads'}
              </span>
            </div>
            <div className="flex flex-col">
              <div className="flex gap-1 text-accent-peach">
                {[...Array(5)].map((_, i) => <Star key={i} size={14} fill="currentColor" />)}
              </div>
              <span className="font-label text-[10px] uppercase tracking-widest text-on-surface-variant mt-1 font-bold">
                {siteConfigs.free_guide_stat_rating || '4.9/5 Rating'}
              </span>
            </div>
            <div className="flex items-center -space-x-3">
              {proofAvatars.map((src, idx) => (
                <img 
                  key={idx} 
                  src={src}
                  loading="lazy"
                  alt=""
                  className="w-10 h-10 rounded-full border-2 border-white shadow-sm bg-surface-container" 
                  referrerPolicy="no-referrer" 
                />
              ))}
              <div className="w-10 h-10 rounded-full bg-accent-blush text-primary flex items-center justify-center text-[10px] font-bold border-2 border-white shadow-sm">
                {siteConfigs.free_guide_social_bubble || '+8k'}
              </div>
            </div>
          </div>
        </motion.div>

        {/* Right Side: Form */}
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-white p-12 rounded-[48px] shadow-2xl border border-outline-variant/30 relative overflow-hidden"
        >
          <div className="absolute top-0 right-0 w-40 h-40 bg-accent-blush/20 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2"></div>
          
          {!submitted ? (
            <div className="space-y-8 relative z-10">
              <div className="text-center space-y-2">
                <h2 className="text-3xl font-headline font-bold text-on-surface">
                  {siteConfigs.free_guide_form_title || 'Download the Guide'}
                </h2>
                <p className="text-on-surface-variant font-body">
                  {siteConfigs.free_guide_form_subtitle || "Enter your details and we'll send it straight to your inbox."}
                </p>
              </div>

              <form onSubmit={handleSubmit} className="space-y-6" noValidate>
                <div className="space-y-2">
                  <label className="font-label text-[10px] uppercase tracking-widest text-on-surface-variant font-bold ml-1">
                    {siteConfigs.free_guide_name_label || 'First Name'}
                  </label>
                  <input 
                    type="text" 
                    value={name}
                    onChange={(e) => {
                      setName(e.target.value);
                      if (errors.name) setErrors(prev => ({ ...prev, name: undefined }));
                    }}
                    placeholder={siteConfigs.free_guide_name_ph || 'Elena'}
                    className={`w-full px-6 py-4 rounded-2xl bg-surface-container/50 border ${errors.name ? 'border-red-400' : 'border-outline-variant/30'} focus:outline-none focus:border-primary transition-all font-body text-on-surface`}
                  />
                  {errors.name && <p className="text-[10px] text-red-400 font-label uppercase tracking-widest ml-1">{errors.name}</p>}
                </div>
                <div className="space-y-2">
                  <label className="font-label text-[10px] uppercase tracking-widest text-on-surface-variant font-bold ml-1">
                    {siteConfigs.free_guide_email_label || 'Email Address'}
                  </label>
                  <input 
                    type="email" 
                    value={email}
                    onChange={(e) => {
                      setEmail(e.target.value);
                      if (errors.email) setErrors(prev => ({ ...prev, email: undefined }));
                    }}
                    placeholder={siteConfigs.free_guide_email_ph || 'elena@example.com'}
                    className={`w-full px-6 py-4 rounded-2xl bg-surface-container/50 border ${errors.email ? 'border-red-400' : 'border-outline-variant/30'} focus:outline-none focus:border-primary transition-all font-body text-on-surface`}
                  />
                  {errors.email && <p className="text-[10px] text-red-400 font-label uppercase tracking-widest ml-1">{errors.email}</p>}
                </div>
                <button 
                  type="submit"
                  disabled={isLoading}
                  className="w-full bg-primary text-white py-5 rounded-2xl font-label text-sm uppercase tracking-widest font-bold hover:bg-primary-hover transition-all flex items-center justify-center gap-3 disabled:opacity-50 shadow-xl shadow-primary/20"
                >
                  {isLoading ? (
                    <>
                      <Loader2 size={18} className="animate-spin" />
                      {siteConfigs.free_guide_submit_loading || 'Sending...'}
                    </>
                  ) : (
                    <>
                      {siteConfigs.free_guide_submit || 'Get Instant Access'} <Download size={18} />
                    </>
                  )}
                </button>
              </form>

              <p className="text-center text-[10px] font-label uppercase tracking-widest text-on-surface-variant font-bold">
                {siteConfigs.free_guide_disclaimer ||
                  'By signing up, you agree to our privacy policy. No spam, ever.'}
              </p>
            </div>
          ) : (
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-center space-y-10 py-12 relative z-10 min-h-[50vh] flex flex-col justify-center"
            >
              <motion.div 
                initial={{ scale: 0 }}
                animate={{ scale: [0, 1.1, 1] }}
                transition={{ duration: 0.6, times: [0, 0.8, 1] }}
                className="w-24 h-24 bg-accent-blush rounded-full flex items-center justify-center mx-auto text-primary"
              >
                <CheckCircle2 size={48} />
              </motion.div>
              
              <div className="space-y-4">
                <h2 className="text-4xl font-headline font-bold text-on-surface">
                  {siteConfigs.free_guide_success_title || (isInstantDownload ? 'Your guide is ready! ✨' : 'Your guide is on its way! ✨')}
                </h2>
                <p className="text-on-surface-variant font-body leading-relaxed max-w-sm mx-auto">
                  {siteConfigs.free_guide_success_body ||
                    (isInstantDownload
                      ? 'Your download should open automatically. If not, use the button below to download instantly.'
                      : 'Check your inbox for an email from Anjali. In the meantime, explore the shop or read the journal.')}
                </p>
              </div>

              <div className="flex flex-col gap-4 max-w-xs mx-auto w-full">
                {guideDownloadUrl && (
                  <a
                    href={guideDownloadUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="bg-primary text-white py-4 rounded-2xl font-label text-sm uppercase tracking-widest font-bold hover:bg-primary-hover transition-all shadow-xl shadow-primary/20"
                  >
                    {siteConfigs.free_guide_download_cta || 'Download Guide Now'}
                  </a>
                )}
                <Link 
                  to="/shop" 
                  className="bg-primary text-white py-4 rounded-2xl font-label text-sm uppercase tracking-widest font-bold hover:bg-primary-hover transition-all shadow-xl shadow-primary/20"
                >
                  {siteConfigs.free_guide_success_shop || 'Shop the Aesthetic'}
                </Link>
                <Link 
                  to="/blog" 
                  className="border-2 border-primary text-primary py-4 rounded-2xl font-label text-sm uppercase tracking-widest font-bold hover:bg-accent-blush transition-all"
                >
                  {siteConfigs.free_guide_success_journal || 'Read the Journal'}
                </Link>
              </div>

              <div className="pt-8 border-t border-outline-variant/30">
                <p className="text-sm text-on-surface-variant font-serif italic mb-4">
                  {siteConfigs.free_guide_share_blurb || 'Love this guide? Share it on Pinterest'}
                </p>
                <a 
                  href={`https://pinterest.com/pin/create/button/?url=${encodeURIComponent(APP_URL + '/free-guide')}&description=${encodeURIComponent(pinDescription)}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 text-primary font-label text-[10px] uppercase tracking-widest font-bold group"
                >
                  {siteConfigs.free_guide_share_pinterest || 'Share to Pinterest'}
                  <ArrowRight size={14} className="transition-transform group-hover:translate-x-1" />
                </a>
              </div>
            </motion.div>
          )}
        </motion.div>
      </div>
    </div>
  );
}
