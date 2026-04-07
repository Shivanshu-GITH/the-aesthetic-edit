import React, { useState, useEffect, useRef } from 'react';
import { Save, RefreshCw, Settings, Home, User, Layout, Sparkles, ShoppingBag, BookOpen, Gift, Package, Heart, Plus, Trash2, Link2 } from 'lucide-react';
import { useAdminContext } from './AdminContext';
import ImageUpload from '../ImageUpload';

type PathLinkRow = { name: string; path: string };
type UrlLinkRow = { name: string; url: string };

function parsePathRows(raw: string | undefined): PathLinkRow[] {
  if (!raw?.trim()) return [{ name: '', path: '' }];
  try {
    const p = JSON.parse(raw);
    if (!Array.isArray(p)) return [{ name: '', path: '' }];
    const rows = p
      .filter((x: unknown) => x && typeof x === 'object')
      .map((x: { name?: string; path?: string }) => ({
        name: String(x.name ?? ''),
        path: String(x.path ?? ''),
      }));
    return rows.length > 0 ? rows : [{ name: '', path: '' }];
  } catch {
    return [{ name: '', path: '' }];
  }
}

function parseUrlRows(raw: string | undefined): UrlLinkRow[] {
  if (!raw?.trim()) return [{ name: '', url: '' }];
  try {
    const p = JSON.parse(raw);
    if (!Array.isArray(p)) return [{ name: '', url: '' }];
    const rows = p
      .filter((x: unknown) => x && typeof x === 'object')
      .map((x: { name?: string; url?: string }) => ({
        name: String(x.name ?? ''),
        url: String(x.url ?? ''),
      }));
    return rows.length > 0 ? rows : [{ name: '', url: '' }];
  } catch {
    return [{ name: '', url: '' }];
  }
}

function buildPathPayload(r: PathLinkRow[]) {
  return r
    .filter((row) => row.name.trim() && row.path.trim())
    .map((row) => {
      const path = row.path.trim();
      return {
        name: row.name.trim().slice(0, 60),
        path: (path.startsWith('/') ? path : `/${path}`).slice(0, 255),
      };
    });
}

function buildUrlPayload(r: UrlLinkRow[]) {
  return r
    .filter((row) => row.name.trim() && row.url.trim())
    .map((row) => ({
      name: row.name.trim().slice(0, 60),
      url: row.url.trim().slice(0, 500),
    }));
}

const SiteConfigPathLinkList: React.FC<{
  label: string;
  hint?: string;
  configKey: string;
  raw: string;
  onSave: (key: string, value: string) => void;
  namePlaceholder?: string;
  routePlaceholder?: string;
}> = ({
  label,
  hint,
  configKey,
  raw,
  onSave,
  namePlaceholder = 'Shop',
  routePlaceholder = '/shop',
}) => {
  const [rows, setRows] = useState<PathLinkRow[]>(() => parsePathRows(raw));
  const rowsRef = useRef(rows);
  rowsRef.current = rows;

  useEffect(() => {
    setRows(parsePathRows(raw));
  }, [raw]);

  const persist = () => {
    void onSave(configKey, JSON.stringify(buildPathPayload(rowsRef.current)));
  };

  const addRow = () => {
    setRows((prev) => [...prev, { name: '', path: '' }]);
  };

  const removeRow = (index: number) => {
    setRows((prev) => {
      const next = prev.filter((_, j) => j !== index);
      const adjusted = next.length > 0 ? next : [{ name: '', path: '' }];
      rowsRef.current = adjusted;
      void onSave(configKey, JSON.stringify(buildPathPayload(adjusted)));
      return adjusted;
    });
  };

  return (
    <div className="space-y-4">
      <div className="flex items-start gap-2">
        <Link2 size={16} className="text-primary mt-0.5 shrink-0" />
        <div className="space-y-1 min-w-0 flex-1">
          <label className="font-label text-[10px] uppercase tracking-widest font-bold text-outline block">{label}</label>
          {hint && <p className="text-[10px] text-outline/80 leading-relaxed">{hint}</p>}
        </div>
      </div>
      <div className="space-y-4 pl-0 md:pl-1">
        {rows.map((row, i) => (
          <div
            key={i}
            className="p-4 rounded-2xl bg-surface-container/40 border border-outline-variant/25 space-y-3"
          >
            <div className="flex items-center justify-between gap-2">
              <span className="font-label text-[9px] uppercase tracking-widest font-bold text-outline">Link {i + 1}</span>
              {rows.length > 1 && (
                <button
                  type="button"
                  onClick={() => removeRow(i)}
                  className="p-1.5 rounded-lg text-outline hover:text-red-600 hover:bg-red-50 transition-colors"
                  aria-label={`Remove link ${i + 1}`}
                >
                  <Trash2 size={16} />
                </button>
              )}
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="space-y-1">
                <label className="font-label text-[9px] uppercase tracking-widest font-bold text-outline">Label (shown in menu)</label>
                <input
                  type="text"
                  value={row.name}
                  onChange={(e) => {
                    const v = e.target.value;
                    setRows((prev) => prev.map((r, j) => (j === i ? { ...r, name: v } : r)));
                  }}
                  onBlur={persist}
                  placeholder={namePlaceholder}
                  className="px-3 py-2.5 rounded-xl bg-white border border-outline-variant/30 focus:outline-none focus:border-primary transition-all w-full text-sm"
                />
              </div>
              <div className="space-y-1">
                <label className="font-label text-[9px] uppercase tracking-widest font-bold text-outline">Route (path)</label>
                <input
                  type="text"
                  value={row.path}
                  onChange={(e) => {
                    const v = e.target.value;
                    setRows((prev) => prev.map((r, j) => (j === i ? { ...r, path: v } : r)));
                  }}
                  onBlur={persist}
                  placeholder={routePlaceholder}
                  className="px-3 py-2.5 rounded-xl bg-white border border-outline-variant/30 focus:outline-none focus:border-primary transition-all w-full text-xs font-mono"
                />
              </div>
            </div>
            <p className="text-[9px] text-outline/70">Use a path like /shop or /about. A leading / is added if missing.</p>
          </div>
        ))}
        <button
          type="button"
          onClick={addRow}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-xl border border-dashed border-outline-variant/40 text-primary font-label text-[10px] uppercase tracking-widest font-bold hover:bg-accent-blush/30 transition-colors"
        >
          <Plus size={16} /> Add link
        </button>
      </div>
    </div>
  );
};

const SiteConfigUrlLinkList: React.FC<{
  label: string;
  hint?: string;
  configKey: string;
  raw: string;
  onSave: (key: string, value: string) => void;
  namePlaceholder?: string;
  urlPlaceholder?: string;
}> = ({
  label,
  hint,
  configKey,
  raw,
  onSave,
  namePlaceholder = 'Instagram',
  urlPlaceholder = 'https://',
}) => {
  const [rows, setRows] = useState<UrlLinkRow[]>(() => parseUrlRows(raw));
  const rowsRef = useRef(rows);
  rowsRef.current = rows;

  useEffect(() => {
    setRows(parseUrlRows(raw));
  }, [raw]);

  const persist = () => {
    void onSave(configKey, JSON.stringify(buildUrlPayload(rowsRef.current)));
  };

  const addRow = () => {
    setRows((prev) => [...prev, { name: '', url: '' }]);
  };

  const removeRow = (index: number) => {
    setRows((prev) => {
      const next = prev.filter((_, j) => j !== index);
      const adjusted = next.length > 0 ? next : [{ name: '', url: '' }];
      rowsRef.current = adjusted;
      void onSave(configKey, JSON.stringify(buildUrlPayload(adjusted)));
      return adjusted;
    });
  };

  return (
    <div className="space-y-4">
      <div className="flex items-start gap-2">
        <Link2 size={16} className="text-primary mt-0.5 shrink-0" />
        <div className="space-y-1 min-w-0 flex-1">
          <label className="font-label text-[10px] uppercase tracking-widest font-bold text-outline block">{label}</label>
          {hint && <p className="text-[10px] text-outline/80 leading-relaxed">{hint}</p>}
        </div>
      </div>
      <div className="space-y-4 pl-0 md:pl-1">
        {rows.map((row, i) => (
          <div
            key={i}
            className="p-4 rounded-2xl bg-surface-container/40 border border-outline-variant/25 space-y-3"
          >
            <div className="flex items-center justify-between gap-2">
              <span className="font-label text-[9px] uppercase tracking-widest font-bold text-outline">Link {i + 1}</span>
              {rows.length > 1 && (
                <button
                  type="button"
                  onClick={() => removeRow(i)}
                  className="p-1.5 rounded-lg text-outline hover:text-red-600 hover:bg-red-50 transition-colors"
                  aria-label={`Remove link ${i + 1}`}
                >
                  <Trash2 size={16} />
                </button>
              )}
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="space-y-1">
                <label className="font-label text-[9px] uppercase tracking-widest font-bold text-outline">Label</label>
                <input
                  type="text"
                  value={row.name}
                  onChange={(e) => {
                    const v = e.target.value;
                    setRows((prev) => prev.map((r, j) => (j === i ? { ...r, name: v } : r)));
                  }}
                  onBlur={persist}
                  placeholder={namePlaceholder}
                  className="px-3 py-2.5 rounded-xl bg-white border border-outline-variant/30 focus:outline-none focus:border-primary transition-all w-full text-sm"
                />
              </div>
              <div className="space-y-1">
                <label className="font-label text-[9px] uppercase tracking-widest font-bold text-outline">URL</label>
                <input
                  type="text"
                  value={row.url}
                  onChange={(e) => {
                    const v = e.target.value;
                    setRows((prev) => prev.map((r, j) => (j === i ? { ...r, url: v } : r)));
                  }}
                  onBlur={persist}
                  placeholder={urlPlaceholder}
                  className="px-3 py-2.5 rounded-xl bg-white border border-outline-variant/30 focus:outline-none focus:border-primary transition-all w-full text-xs font-mono"
                />
              </div>
            </div>
            <p className="text-[9px] text-outline/70">Full URL (https://…) or mailto:hello@…</p>
          </div>
        ))}
        <button
          type="button"
          onClick={addRow}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-xl border border-dashed border-outline-variant/40 text-primary font-label text-[10px] uppercase tracking-widest font-bold hover:bg-accent-blush/30 transition-colors"
        >
          <Plus size={16} /> Add link
        </button>
      </div>
    </div>
  );
};

export const AdminSiteConfig: React.FC = () => {
  const { 
    siteConfigs,
    adminFetch,
    refreshSiteConfig,
    isLoading,
    setIsLoading,
    showToast
  } = useAdminContext();
  const [guideUploadState, setGuideUploadState] = useState<{
    fileName: string;
    status: 'idle' | 'uploading' | 'success' | 'error';
  }>({ fileName: '', status: 'idle' });

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

  const handleGuideUpload = async (file: File) => {
    setGuideUploadState({ fileName: file.name, status: 'uploading' });
    if (file.type !== 'application/pdf') {
      showToast('Only PDF files are allowed', 'error');
      setGuideUploadState({ fileName: file.name, status: 'error' });
      return;
    }
    if (file.size > 20 * 1024 * 1024) {
      showToast('File size exceeds 20MB', 'error');
      setGuideUploadState({ fileName: file.name, status: 'error' });
      return;
    }

    setIsLoading(true);
    try {
      const formData = new FormData();
      formData.append('guide', file);
      const res = await adminFetch('/api/upload/guide', {
        method: 'POST',
        body: formData,
      });
      const data = await res.json();
      if (!res.ok || !data?.success || !data?.url) {
        showToast(data?.error || 'Guide upload failed', 'error');
        setGuideUploadState({ fileName: file.name, status: 'error' });
        return;
      }
      await handleUpdateConfig('free_guide_file_url', data.url);
      showToast('Guide uploaded successfully', 'success');
      setGuideUploadState({ fileName: file.name, status: 'success' });
    } catch {
      showToast('Guide upload failed', 'error');
      setGuideUploadState({ fileName: file.name, status: 'error' });
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

  const ConfigField: React.FC<{ label: string; name: string; type?: 'text' | 'textarea' | 'image'; placeholder?: string; hint?: string }> = ({ label, name, type = 'text', placeholder, hint }) => (
    <div className="space-y-2">
      <label className="font-label text-[10px] uppercase tracking-widest font-bold text-outline">{label}</label>
      {hint && <p className="text-[10px] text-outline/80 leading-relaxed">{hint}</p>}
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
                <p className="text-[10px] text-outline italic">Used in the navbar, footer logo link, and global branding.</p>
              </div>
              <div className="md:col-span-2 space-y-4">
                <ConfigField
                  label="Navbar — Free Guide Button Label"
                  name="nav_free_guide_label"
                  placeholder="Free Guide"
                />
                <SiteConfigPathLinkList
                  label="Navbar — Main links"
                  configKey="nav_links_json"
                  raw={siteConfigs.nav_links_json || ''}
                  onSave={handleUpdateConfig}
                  hint="Add each menu item with a label and route. Saved automatically when you leave a field. Empty rows are ignored; if none are saved, default links are used on the site."
                  namePlaceholder="Shop"
                  routePlaceholder="/shop"
                />
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
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-2 border-t border-outline-variant/10">
              <ConfigField label="Primary CTA — Shop Button" name="home_hero_shop_btn" placeholder="Shop the Aesthetic" />
              <ConfigField label="Secondary CTA — Blog Button" name="home_hero_blog_btn" placeholder="Explore the Blog" />
            </div>
          </div>
        </ConfigSection>

        {/* Home Content Titles */}
        <ConfigSection title="Home Content Titles" icon={Layout}>
          <div className="space-y-6">
            <ConfigField label="Mood Grid Title" name="home_mood_title" placeholder="Browse by Mood" />
            <ConfigField label="Mood Card — Shop Link Label" name="home_mood_shop_link_cta" placeholder="Shop this vibe →" />
            <ConfigField label="Mood Grid — See More Button" name="home_mood_see_more_cta" placeholder="See More Moods" />
            <ConfigField label="Journal Section Title" name="home_journal_title" placeholder="Latest from the Journal" />
            <ConfigField label="Journal — View All Link" name="home_journal_view_all" placeholder="View All Posts" />
            <ConfigField label="Bento Grid Title" name="home_find_here_title" placeholder="What You'll Find Here" />
            <ConfigField label="Bento Grid Subtitle" name="home_find_here_subtitle" type="textarea" placeholder="A curated blend of inspiration and utility." />
            <ConfigField label="Bento — Empty State Hint" name="home_find_here_empty_hint" placeholder="Configure bento items in Admin → Home Config" />
          </div>
        </ConfigSection>

        {/* Shop Section */}
        <ConfigSection title="Shop Page" icon={ShoppingBag}>
          <div className="space-y-6">
            <ConfigField label="Hero — Eyebrow / Kicker" name="shop_hero_kicker" placeholder="Curated Shopping" />
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <ConfigField label="Hero — Title Line 1" name="shop_hero_title_line1" placeholder="The" />
              <ConfigField label="Hero — Title Line 2 (Italic)" name="shop_hero_title_line2" placeholder="Aesthetic Shop" />
            </div>
            <ConfigField label="Hero — Subtitle" name="shop_hero_subtitle" type="textarea" placeholder="A refined collection of pieces..." />
            <div className="pt-4 border-t border-outline-variant/10 space-y-6">
              <ConfigField label="Search Card Title" name="shop_search_card_title" placeholder="Search" />
              <ConfigField label="Search Placeholder" name="shop_search_placeholder" placeholder="Find something..." />
              <ConfigField label="Quick Filters Title" name="shop_quick_filters_title" placeholder="Quick Filters" />
              <ConfigField label="Sidebar Categories Title" name="shop_sidebar_title" placeholder="Categories" />
              <ConfigField label="“All Products” Row Label" name="shop_all_products_label" placeholder="All Products" />
              <ConfigField label="Vibes Section Title" name="shop_find_vibe_title" placeholder="Find Your Vibe" />
              <ConfigField label="Vibe Filter — “All” Label" name="shop_vibe_all_label" placeholder="All" />
              <ConfigField label="Mobile — Filters Drawer Title" name="shop_mobile_filters_title" placeholder="Filters" />
              <ConfigField label="Mobile — Product Count" name="shop_products_mobile_count" placeholder="{count} Products" hint="Use {count} where the number should appear." />
              <ConfigField label="Empty State — Title" name="shop_no_matches_title" placeholder="No matches found" />
              <ConfigField label="Empty Results Message" name="shop_empty_message" type="textarea" placeholder="No products found matching your criteria." />
              <ConfigField label="Empty State — Clear Filters" name="shop_clear_filters_cta" placeholder="Clear all filters" />
            </div>
          </div>
        </ConfigSection>

        {/* Journal Section */}
        <ConfigSection title="Journal / Blog Hub" icon={BookOpen}>
          <div className="space-y-6">
            <ConfigField label="Journal Hero Title (last word shown italic)" name="journal_hero_title" placeholder="The Journal" />
            <ConfigField label="Journal Hero Subtitle" name="journal_hero_subtitle" type="textarea" placeholder="Ideas, inspiration, and curated guides..." />
            <ConfigField label="Featured Post — Eyebrow" name="featured_article_label" placeholder="Featured Article" />
            <ConfigField label="Featured Post — Read Link" name="journal_read_article_cta" placeholder="Read Article" />
            <ConfigField label="Explore by Category — Title" name="journal_explore_category_title" placeholder="Explore by Category" />
            <ConfigField label="Grid — Search Placeholder" name="journal_search_placeholder" placeholder="Search articles..." />
            <ConfigField label="Grid — Read More Link" name="journal_read_more_cta" placeholder="Read More" />
            <ConfigField label="Grid — No Results Message" name="journal_grid_empty_message" placeholder="No articles found for this selection." />
            <div className="pt-4 border-t border-outline-variant/10 space-y-6">
              <ConfigField label="Subscribe Strip — Title (before emphasis)" name="journal_subscribe_title_before" placeholder="Get weekly aesthetic" />
              <ConfigField label="Subscribe Strip — Emphasis Word" name="journal_subscribe_title_emphasis" placeholder="inspiration" />
              <ConfigField label="Subscribe Strip — Subtitle" name="journal_subscribe_subtitle" type="textarea" placeholder="Join 10,000+ others..." />
              <ConfigField label="Subscribe — Email Placeholder" name="journal_subscribe_email_ph" placeholder="Your email address" />
              <ConfigField label="Subscribe — Button" name="journal_subscribe_button" placeholder="Subscribe" />
              <ConfigField label="Subscribe — Button (loading)" name="journal_subscribe_button_loading" placeholder="Subscribing..." />
              <ConfigField label="Subscribe — Success Message" name="journal_subscribe_success" placeholder="Successfully subscribed! ✨" />
              <ConfigField label="Subscribe — Error Message" name="journal_subscribe_error" placeholder="Something went wrong. Try again." />
              <ConfigField label="Subscribe — Footer Note" name="journal_subscribe_footer_note" placeholder="No spam. Just pure inspiration." />
            </div>
            <div className="pt-4 border-t border-outline-variant/10">
              <ConfigField label="Default Author Image (used on blog listings if post has none)" name="blog_default_author_image" type="image" />
            </div>
          </div>
        </ConfigSection>

        <ConfigSection title="Journal Category Page" icon={BookOpen}>
          <div className="space-y-6">
            <ConfigField label="Header Eyebrow" name="blog_category_kicker" placeholder="Blog Category" />
            <ConfigField label="Not Found — Title" name="blog_category_not_found_title" placeholder="Category not found" />
            <ConfigField label="Not Found — Back Link" name="blog_category_back_link" placeholder="Back to Blog" />
            <ConfigField label="Empty Category Message" name="blog_category_empty_message" placeholder="No posts in this category yet — check back soon." />
            <ConfigField label="Empty — Browse All" name="blog_category_browse_all" placeholder="Browse All Posts" />
            <ConfigField label="Post Card — Read More" name="blog_category_read_more" placeholder="Read More" />
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
            <div className="pt-4 border-t border-outline-variant/10 space-y-6">
              <ConfigField label="About Collab Title" name="about_collab_title" placeholder="Let’s Work Together" />
              <ConfigField label="About Collab Description" name="about_collab_description" type="textarea" />
              <ConfigField label="Collab — Partner Face 1" name="about_collab_avatar_1" type="image" />
              <ConfigField label="Collab — Partner Face 2" name="about_collab_avatar_2" type="image" />
              <ConfigField label="Collab — Partner Face 3" name="about_collab_avatar_3" type="image" />
              <ConfigField label="Collab — Stats Line (e.g. 50+ Successful Brand Collabs)" name="about_collab_stats_line" placeholder="50+ Successful Brand Collabs" />
            </div>
            <div className="pt-4 border-t border-outline-variant/10 space-y-6">
              <p className="font-label text-[10px] uppercase tracking-widest font-bold text-outline">Contact form (collab column)</p>
              <ConfigField label="Thank You — Title" name="about_contact_thank_title" placeholder="Thank You!" />
              <ConfigField label="Thank You — Message" name="about_contact_thank_message" type="textarea" />
              <ConfigField label="Thank You — Send Another" name="about_contact_send_another" placeholder="Send Another Message" />
              <ConfigField label="Field — Name Label" name="about_contact_name_label" placeholder="Your Name" />
              <ConfigField label="Field — Name Placeholder" name="about_contact_name_ph" placeholder="E.g. Julianne Moore" />
              <ConfigField label="Field — Email Label" name="about_contact_email_label" placeholder="Email Address" />
              <ConfigField label="Field — Email Placeholder" name="about_contact_email_ph" placeholder="hello@example.com" />
              <ConfigField label="Field — Message Label" name="about_contact_message_label" placeholder="Tell me about your project" />
              <ConfigField label="Field — Message Placeholder" name="about_contact_message_ph" placeholder="I'd love to partner on..." />
              <ConfigField label="Submit Button" name="about_contact_submit" placeholder="Send Message" />
              <ConfigField label="Submit Button (sending)" name="about_contact_submit_loading" placeholder="Sending..." />
            </div>
            <div className="pt-4 border-t border-outline-variant/10">
              <ConfigField label="About CTA Title" name="about_cta_title" placeholder="Ready to elevate your aesthetic?" />
              <ConfigField label="About CTA Subtitle" name="about_cta_subtitle" type="textarea" />
              <ConfigField label="About CTA Button Text" name="about_cta_button" placeholder="Shop the Collection" />
            </div>
          </div>
        </ConfigSection>

        {/* Footer Section */}
        <ConfigSection title="Free Guide Page" icon={Gift}>
          <div className="space-y-6">
            <div className="space-y-2">
              <label className="font-label text-[10px] uppercase tracking-widest font-bold text-outline">Upload Guide to Cloudinary (PDF)</label>
              <input
                type="file"
                accept="application/pdf"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) void handleGuideUpload(file);
                  e.currentTarget.value = '';
                }}
                className="px-4 py-3 rounded-xl bg-surface-container/50 border border-outline-variant/30 focus:outline-none focus:border-primary transition-all w-full text-sm"
              />
              <p className="text-[10px] text-outline/80">
                {guideUploadState.fileName
                  ? `Selected: ${guideUploadState.fileName}`
                  : 'Choose a file from device. It uploads and auto-fills the guide URL below.'}
              </p>
              {guideUploadState.status === 'uploading' && (
                <p className="text-[10px] text-primary font-bold uppercase tracking-widest">Uploading guide...</p>
              )}
              {guideUploadState.status === 'success' && (
                <p className="text-[10px] text-green-600 font-bold uppercase tracking-widest">Upload complete</p>
              )}
              {guideUploadState.status === 'error' && (
                <p className="text-[10px] text-red-500 font-bold uppercase tracking-widest">Upload failed</p>
              )}
            </div>
            <ConfigField label="Guide File URL (Manual Option)" name="free_guide_file_url" placeholder="https://.../guide.pdf" />
            <ConfigField label="Eyebrow" name="free_guide_kicker" placeholder="Free Resource" />
            <ConfigField label="Title — Line Before Break" name="free_guide_title_line1" placeholder="Get Your Free" />
            <ConfigField label="Title — Italic Emphasis Line" name="free_guide_title_emphasis" placeholder="Pinterest Growth" />
            <ConfigField label="Title — Word After Emphasis" name="free_guide_title_suffix" placeholder="Guide" />
            <ConfigField label="Subtitle" name="free_guide_subtitle" type="textarea" />
            <ConfigField
              label="Bullet Points (one per line)"
              name="free_guide_bullets"
              type="textarea"
              placeholder={'Line 1\nLine 2\nLine 3'}
            />
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-2 border-t border-outline-variant/10">
              <ConfigField label="Stat — Big Number" name="free_guide_stat_number" placeholder="12k+" />
              <ConfigField label="Stat — Label Under Number" name="free_guide_stat_label" placeholder="Downloads" />
              <ConfigField label="Stat — Rating Text" name="free_guide_stat_rating" placeholder="4.9/5 Rating" />
              <ConfigField label="Social Proof — Extra Bubble Text" name="free_guide_social_bubble" placeholder="+8k" />
            </div>
            <p className="font-label text-[10px] uppercase text-outline font-bold pt-2">Proof row — faces (optional URLs)</p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <ConfigField label="Proof Avatar 1" name="free_guide_proof_avatar_1" type="image" />
              <ConfigField label="Proof Avatar 2" name="free_guide_proof_avatar_2" type="image" />
              <ConfigField label="Proof Avatar 3" name="free_guide_proof_avatar_3" type="image" />
              <ConfigField label="Proof Avatar 4" name="free_guide_proof_avatar_4" type="image" />
            </div>
            <div className="pt-4 border-t border-outline-variant/10 space-y-6">
              <ConfigField label="Form Box — Title" name="free_guide_form_title" placeholder="Download the Guide" />
              <ConfigField label="Form Box — Subtitle" name="free_guide_form_subtitle" type="textarea" />
              <ConfigField label="Name Label" name="free_guide_name_label" placeholder="First Name" />
              <ConfigField label="Name Placeholder" name="free_guide_name_ph" placeholder="Elena" />
              <ConfigField label="Email Label" name="free_guide_email_label" placeholder="Email Address" />
              <ConfigField label="Email Placeholder" name="free_guide_email_ph" placeholder="elena@example.com" />
              <ConfigField label="Submit Button" name="free_guide_submit" placeholder="Get Instant Access" />
              <ConfigField label="Submit — Loading" name="free_guide_submit_loading" placeholder="Sending..." />
              <ConfigField label="Form Disclaimer" name="free_guide_disclaimer" type="textarea" />
            </div>
            <div className="pt-4 border-t border-outline-variant/10 space-y-6">
              <ConfigField label="Success — Title" name="free_guide_success_title" placeholder="Your guide is on its way! ✨" />
              <ConfigField label="Success — Body" name="free_guide_success_body" type="textarea" />
              <ConfigField label="Success — Shop CTA" name="free_guide_success_shop" placeholder="Shop the Aesthetic" />
              <ConfigField label="Success — Journal CTA" name="free_guide_success_journal" placeholder="Read the Journal" />
              <ConfigField label="Success — Download CTA" name="free_guide_download_cta" placeholder="Download Guide Now" />
              <ConfigField label="Success — Share Blurb" name="free_guide_share_blurb" placeholder="Love this guide? Share it on Pinterest" />
              <ConfigField label="Success — Pinterest Link Label" name="free_guide_share_pinterest" placeholder="Share to Pinterest" />
              <ConfigField label="Pinterest Share — Default Description" name="free_guide_pinterest_description" placeholder="Free Pinterest Growth Guide by The Aesthetic Edit" />
            </div>
          </div>
        </ConfigSection>

        <ConfigSection title="Product Detail Page (defaults)" icon={Package}>
          <div className="space-y-6">
            <ConfigField label="Back to Shop Link" name="product_back_to_shop" placeholder="Back to Shop" />
            <ConfigField label="Not Found — Title" name="product_not_found_title" placeholder="Product not found" />
            <ConfigField label="Not Found — Link" name="product_not_found_shop_link" placeholder="Back to Shop" />
            <ConfigField label="Default Description (if product has none)" name="product_default_description" type="textarea" />
            <ConfigField label="Shop on Retailer Button" name="product_shop_retailer_cta" placeholder="View on Retailer Site" />
            <ConfigField label="Affiliate Disclaimer" name="product_affiliate_disclaimer" type="textarea" />
            <ConfigField label="Trust Badge 1" name="product_trust_shipping" placeholder="Fast Shipping" />
            <ConfigField label="Trust Badge 2" name="product_trust_quality" placeholder="Quality Assured" />
            <ConfigField label="Trust Badge 3" name="product_trust_retailer" placeholder="Trusted Retailer" />
            <ConfigField label="Related Section — Default Subheading" name="product_related_subheading_default" placeholder="Curated Picks" />
            <ConfigField label="Related Section — Default Heading" name="product_related_heading_default" placeholder="Complete the Look" />
            <ConfigField label="Related Section — Default Description" name="product_related_description_default" type="textarea" />
            <ConfigField label="Related Section — Default CTA" name="product_related_cta_default" placeholder="View All Collection" />
            <ConfigField label="Related — Discover More Button" name="product_related_discover_more" placeholder="Discover More Pieces" />
          </div>
        </ConfigSection>

        <ConfigSection title="Wishlist Page" icon={Heart}>
          <div className="space-y-6">
            <ConfigField label="Page Title (when items saved)" name="wishlist_page_title" placeholder="Your Wishlist" />
            <ConfigField label="Tab — Products" name="wishlist_tab_products" placeholder="Products" />
            <ConfigField label="Tab — Journals" name="wishlist_tab_journals" placeholder="Journals" />
            <ConfigField label="Empty — Logged in (products)" name="wishlist_empty_products_title" placeholder="Your products list is empty" />
            <ConfigField label="Empty — Logged in (journals)" name="wishlist_empty_journals_title" placeholder="Your journals list is empty" />
            <ConfigField label="Empty — Guest Title" name="wishlist_empty_guest_title" placeholder="Join us to save your wishlist" />
            <ConfigField label="Empty — Logged in Subtitle" name="wishlist_empty_logged_subtitle" type="textarea" />
            <ConfigField label="Empty — Guest Subtitle" name="wishlist_empty_guest_subtitle" type="textarea" />
            <ConfigField label="Browse Shop CTA" name="wishlist_browse_shop" placeholder="Browse the Shop" />
            <ConfigField label="Browse Journal CTA" name="wishlist_browse_journal" placeholder="Browse the Journal" />
            <ConfigField label="Guest — Login CTA" name="wishlist_login_cta" placeholder="Login / Sign Up" />
          </div>
        </ConfigSection>

        <ConfigSection title="Footer & Newsletter" icon={Layout}>
          <div className="space-y-6">
            <ConfigField label="Newsletter Title" name="newsletter_title" placeholder="Get My Free Pinterest Growth Guide" />
            <ConfigField label="Newsletter Subtitle" name="newsletter_subtitle" type="textarea" />
            <ConfigField label="Newsletter CTA Text" name="newsletter_cta" placeholder="Download Free Guide" />
            <ConfigField label="Newsletter Disclaimer" name="newsletter_disclaimer" placeholder="No spam, just pure inspiration." />
            <div className="pt-6 border-t border-outline-variant/10 space-y-6">
              <ConfigField label="Column — Quick Links Title" name="footer_col_quick_links" placeholder="Quick Links" />
              <ConfigField label="Column — Categories Title" name="footer_col_categories" placeholder="Categories" />
              <ConfigField label="Column — Connect Title" name="footer_col_connect" placeholder="Connect" />
              <ConfigField label="Affiliate Disclosure Line" name="footer_affiliate_disclosure" placeholder="AFFILIATE DISCLOSURE" />
              <SiteConfigPathLinkList
                label="Footer — Quick links"
                configKey="footer_quick_links_json"
                raw={siteConfigs.footer_quick_links_json || ''}
                onSave={handleUpdateConfig}
                hint="First footer column links (About, Blog, Shop, etc.). Uses the same label + route pattern as the navbar."
                namePlaceholder="About Us"
                routePlaceholder="/about"
              />
              <SiteConfigPathLinkList
                label="Footer — Blog category links"
                configKey="footer_blog_category_links_json"
                raw={siteConfigs.footer_blog_category_links_json || ''}
                onSave={handleUpdateConfig}
                hint="Links to journal categories shown in the middle footer column."
                namePlaceholder="Outfit Ideas"
                routePlaceholder="/blog/outfit-ideas"
              />
              <SiteConfigUrlLinkList
                label="Footer — Social & external links"
                configKey="footer_social_links_json"
                raw={siteConfigs.footer_social_links_json || ''}
                onSave={handleUpdateConfig}
                hint="Use full URLs for social profiles, or mailto:you@email.com for email."
                namePlaceholder="Instagram"
                urlPlaceholder="https://instagram.com/..."
              />
              <ConfigField label="Footer About Text" name="footer_about" type="textarea" placeholder="Your destination for Pinterest-inspired style..." />
              <ConfigField label="Copyright Text" name="footer_copyright" placeholder="© 2026 THE AESTHETIC EDIT. ALL RIGHTS RESERVED." />
            </div>
          </div>
        </ConfigSection>
      </div>
    </div>
  );
};
