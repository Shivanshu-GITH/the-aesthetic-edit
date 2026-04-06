import React, { useState } from 'react';
import { Save, RefreshCw, Settings, Home, User, Layout, Sparkles } from 'lucide-react';
import { useAdminContext } from './AdminContext';
import ImageUpload from '../ImageUpload';

export const AdminSiteConfig: React.FC = () => {
  const { 
    siteConfigs,
    adminFetch,
    refreshSiteConfig,
    isLoading,
    setIsLoading,
    showToast
  } = useAdminContext();

  const handleUpdateConfig = async (key: string, value: string) => {
    setIsLoading(true);
    try {
      const res = await adminFetch('/api/home-shop/admin/config', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ [key]: value })
      });
      if (res.ok) {
        showToast('Config updated', 'success');
        refreshSiteConfig();
      }
    } catch (err) {
      showToast('Failed to update config', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  const ConfigSection: React.FC<{ title: string; icon: any; children: React.ReactNode }> = ({ title, icon: Icon, children }) => (
    <div className="bg-white rounded-[40px] border border-outline-variant/30 shadow-sm overflow-hidden">
      <div className="p-8 border-b border-outline-variant/20 flex items-center gap-3">
        <Icon size={20} className="text-primary" />
        <h3 className="text-xl font-headline font-bold">{title}</h3>
      </div>
      <div className="p-8 space-y-8">
        {children}
      </div>
    </div>
  );

  const ConfigField: React.FC<{ label: string; name: string; type?: 'text' | 'textarea' | 'image'; placeholder?: string }> = ({ label, name, type = 'text', placeholder }) => (
    <div className="space-y-2">
      <label className="font-label text-[10px] uppercase tracking-widest font-bold text-outline">{label}</label>
      {type === 'image' ? (
        <ImageUpload 
          label={label}
          value={siteConfigs[name] || ''} 
          onChange={(val) => handleUpdateConfig(name, val)} 
        />
      ) : type === 'textarea' ? (
        <textarea 
          rows={3}
          defaultValue={siteConfigs[name] || ''}
          onBlur={(e) => handleUpdateConfig(name, e.target.value)}
          placeholder={placeholder}
          className="px-4 py-3 rounded-xl bg-surface-container/50 border border-outline-variant/30 focus:outline-none focus:border-primary transition-all w-full text-sm resize-none"
        />
      ) : (
        <input 
          type="text"
          defaultValue={siteConfigs[name] || ''}
          onBlur={(e) => handleUpdateConfig(name, e.target.value)}
          placeholder={placeholder}
          className="px-4 py-3 rounded-xl bg-surface-container/50 border border-outline-variant/30 focus:outline-none focus:border-primary transition-all w-full text-sm"
        />
      )}
    </div>
  );

  return (
    <div className="space-y-12">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Settings size={24} className="text-primary" />
          <h2 className="text-3xl font-headline font-bold">Site Configuration</h2>
        </div>
        <div className="flex items-center gap-2 text-[10px] text-outline font-bold uppercase tracking-widest bg-white px-4 py-2 rounded-full border border-outline-variant/20">
          {isLoading ? <RefreshCw size={14} className="animate-spin text-primary" /> : <Save size={14} />}
          Auto-saves on change
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Global Section */}
        <div className="lg:col-span-2">
          <ConfigSection title="Global Settings" icon={Sparkles}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <ConfigField 
                label="Product Vibes Presets (comma separated)" 
                name="vibes_preset" 
                type="textarea"
                placeholder="Minimal, Cozy, Pinteresty, Boho, Modern..." 
              />
              <div className="space-y-4">
                <ConfigField label="Site Brand Title" name="home_hero_title" placeholder="The Aesthetic Edit" />
                <p className="text-[10px] text-outline italic">This is used in the footer and other global branding areas.</p>
              </div>
            </div>
          </ConfigSection>
        </div>

        {/* Home Page Section */}
        <ConfigSection title="Home Hero" icon={Home}>
          <div className="space-y-6">
            <ConfigField label="Hero Title Line 1" name="home_hero_title_line1" placeholder="The" />
            <ConfigField label="Hero Title Line 2 (Italic)" name="home_hero_title_line2" placeholder="Aesthetic Edit" />
            <ConfigField label="Hero Subtitle" name="home_hero_subtitle" type="textarea" placeholder="Turn your saved inspiration into a life you actually live." />
            <ConfigField label="Hero Description" name="home_hero_description" type="textarea" placeholder="Curated finds, cozy spaces, and effortless style..." />
            <ConfigField label="Hero Image" name="home_hero_image" type="image" />
          </div>
        </ConfigSection>

        {/* Home Content Titles */}
        <ConfigSection title="Home Content Titles" icon={Layout}>
          <div className="space-y-6">
            <ConfigField label="Mood Grid Title" name="home_mood_title" placeholder="Browse by Mood" />
            <ConfigField label="Journal Section Title" name="home_journal_title" placeholder="Latest from the Journal" />
            <ConfigField label="Bento Grid Title" name="home_find_here_title" placeholder="What You'll Find Here" />
            <ConfigField label="Bento Grid Subtitle" name="home_find_here_subtitle" type="textarea" placeholder="A curated blend of inspiration and utility." />
          </div>
        </ConfigSection>

        {/* Shop Section */}
        <ConfigSection title="Shop Page" icon={Sparkles}>
          <div className="space-y-6">
            <ConfigField label="Sidebar Categories Title" name="shop_sidebar_title" placeholder="Categories" />
            <ConfigField label="Empty Results Message" name="shop_empty_message" type="textarea" placeholder="No products found matching your criteria." />
          </div>
        </ConfigSection>

        {/* Journal Section */}
        <ConfigSection title="Journal Page" icon={Layout}>
          <div className="space-y-6">
            <ConfigField label="Journal Hero Title Line 1" name="journal_hero_title" placeholder="The Journal" />
            <ConfigField label="Journal Hero Subtitle" name="journal_hero_subtitle" type="textarea" placeholder="Ideas, inspiration, and curated guides..." />
            <div className="pt-4 border-t border-outline-variant/10">
              <ConfigField label="Default Author Image (used on blog listings if post has none)" name="blog_default_author_image" type="image" />
            </div>
          </div>
        </ConfigSection>

        {/* About Page Section */}
        <ConfigSection title="About Page" icon={User}>
          <div className="space-y-6">
            <ConfigField label="About Hero Title" name="about_hero_title" placeholder="Hi, I’m Anjali." />
            <ConfigField label="About Hero Subtitle" name="about_hero_subtitle" type="textarea" placeholder="Creating a life that feels as beautiful as it looks." />
            <ConfigField label="About Hero Description" name="about_hero_description" type="textarea" />
            <ConfigField label="About Hero Image (Circular)" name="about_hero_image" type="image" />
            <ConfigField label="Signature Text" name="about_hero_signature" placeholder="Anjali" />
            <div className="pt-4 border-t border-outline-variant/10">
              <ConfigField label="About Story Title" name="about_story_title" placeholder="My Story" />
              <ConfigField label="About Story Content" name="about_story_content" type="textarea" />
              <ConfigField label="About Quote" name="about_quote" placeholder="Style isn’t just what you wear — it’s how you live." />
              <ConfigField label="About Story Image" name="about_story_image" type="image" />
            </div>
            <div className="pt-4 border-t border-outline-variant/10">
              <ConfigField label="About Collab Title" name="about_collab_title" placeholder="Let’s Work Together" />
              <ConfigField label="About Collab Description" name="about_collab_description" type="textarea" />
            </div>
            <div className="pt-4 border-t border-outline-variant/10">
              <ConfigField label="About CTA Title" name="about_cta_title" placeholder="Ready to elevate your aesthetic?" />
              <ConfigField label="About CTA Subtitle" name="about_cta_subtitle" type="textarea" />
              <ConfigField label="About CTA Button Text" name="about_cta_button" placeholder="Shop the Collection" />
            </div>
          </div>
        </ConfigSection>

        {/* Footer Section */}
        <ConfigSection title="Footer & Newsletter" icon={Layout}>
          <div className="space-y-6">
            <ConfigField label="Newsletter Title" name="newsletter_title" placeholder="Get My Free Pinterest Growth Guide" />
            <ConfigField label="Newsletter Subtitle" name="newsletter_subtitle" type="textarea" />
            <ConfigField label="Newsletter CTA Text" name="newsletter_cta" placeholder="Download Free Guide" />
            <ConfigField label="Newsletter Disclaimer" name="newsletter_disclaimer" placeholder="No spam, just pure inspiration." />
            <div className="pt-6 border-t border-outline-variant/10">
              <ConfigField label="Footer About Text" name="footer_about" type="textarea" placeholder="Your destination for Pinterest-inspired style..." />
              <ConfigField label="Copyright Text" name="footer_copyright" placeholder="© 2026 THE AESTHETIC EDIT. ALL RIGHTS RESERVED." />
            </div>
          </div>
        </ConfigSection>
      </div>
    </div>
  );
};
