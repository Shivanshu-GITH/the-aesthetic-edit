import React, { useState, useRef } from 'react';
import { Upload, X, RefreshCw, Link as LinkIcon, Plus, ChevronUp, ChevronDown } from 'lucide-react';
import { useToast } from '../context/ToastContext';

interface MultiImageUploadProps {
  value: string[];
  onChange: (value: string[]) => void;
  label: string;
}

export default function MultiImageUpload({ value, onChange, label }: MultiImageUploadProps) {
  const [isUploading, setIsUploading] = useState(false);
  const [isUrlMode, setIsUrlMode] = useState(false);
  const [urlInput, setUrlInput] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { showToast } = useToast();

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    const adminPassword = sessionStorage.getItem('ae_admin_auth') || '';
    setIsUploading(true);

    try {
      const uploadPromises = Array.from(files).map(async (file) => {
        if (file.size > 5 * 1024 * 1024) {
          throw new Error(`File ${file.name} exceeds 5MB`);
        }
        const formData = new FormData();
        formData.append('image', file);
        const response = await fetch('/api/upload', {
          method: 'POST',
          headers: { 'ADMIN_PASSWORD': adminPassword },
          body: formData,
        });
        const data = await response.json();
        if (!data.success) throw new Error(data.error || 'Upload failed');
        return data.url;
      });

      const urls = await Promise.all(uploadPromises);
      onChange([...value, ...urls]);
      showToast(`${urls.length} image(s) uploaded successfully`, 'success');
    } catch (error: any) {
      console.error('Upload error:', error);
      showToast(error.message || 'Upload failed', 'error');
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const addUrl = () => {
    if (!urlInput.trim()) return;
    onChange([...value, urlInput.trim()]);
    setUrlInput('');
    setIsUrlMode(false);
  };

  const removeImage = (index: number) => {
    const next = [...value];
    next.splice(index, 1);
    onChange(next);
  };

  const moveImage = (index: number, direction: 'up' | 'down') => {
    const next = [...value];
    const newIndex = direction === 'up' ? index - 1 : index + 1;
    if (newIndex < 0 || newIndex >= next.length) return;
    [next[index], next[newIndex]] = [next[newIndex], next[index]];
    onChange(next);
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <label className="font-label text-xs uppercase tracking-widest font-bold text-outline">{label}</label>
        <div className="flex gap-2">
          <button 
            type="button"
            onClick={() => setIsUrlMode(false)}
            className={`px-3 py-1 rounded-lg text-[9px] uppercase tracking-wider font-bold transition-all ${!isUrlMode ? 'bg-primary text-white shadow-sm' : 'bg-surface-container text-outline'}`}
          >
            Upload Files
          </button>
          <button 
            type="button"
            onClick={() => setIsUrlMode(true)}
            className={`px-3 py-1 rounded-lg text-[9px] uppercase tracking-wider font-bold transition-all ${isUrlMode ? 'bg-primary text-white shadow-sm' : 'bg-surface-container text-outline'}`}
          >
            Add by URL
          </button>
        </div>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
        {value.map((url, index) => (
          <div key={`${url}-${index}`} className="relative group aspect-square rounded-2xl overflow-hidden border border-outline-variant/30 bg-surface-container">
            <img src={url} alt={`Preview ${index}`} className="w-full h-full object-cover" />
            
            {/* Overlay Controls */}
            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center gap-2">
              <div className="flex gap-1">
                <button 
                  type="button"
                  onClick={() => moveImage(index, 'up')}
                  disabled={index === 0}
                  className="p-1.5 bg-white/20 text-white rounded-lg hover:bg-white/40 disabled:opacity-30"
                >
                  <ChevronUp size={14} />
                </button>
                <button 
                  type="button"
                  onClick={() => moveImage(index, 'down')}
                  disabled={index === value.length - 1}
                  className="p-1.5 bg-white/20 text-white rounded-lg hover:bg-white/40 disabled:opacity-30"
                >
                  <ChevronDown size={14} />
                </button>
              </div>
              <button 
                type="button"
                onClick={() => removeImage(index)}
                className="p-2 bg-red-500/80 text-white rounded-full hover:bg-red-600 transition-colors"
              >
                <X size={16} />
              </button>
            </div>
            
            {index === 0 && (
              <div className="absolute top-2 left-2 bg-primary text-white text-[8px] uppercase tracking-tighter font-bold px-1.5 py-0.5 rounded">
                Cover
              </div>
            )}
          </div>
        ))}

        {isUrlMode ? (
          <div className="aspect-square rounded-2xl border-2 border-dashed border-primary/30 p-4 flex flex-col justify-center gap-3">
            <div className="relative">
              <input 
                type="text"
                value={urlInput}
                onChange={(e) => setUrlInput(e.target.value)}
                placeholder="Image URL..."
                className="w-full pl-8 pr-2 py-2 rounded-lg bg-white border border-outline-variant/30 text-[10px] focus:outline-none focus:border-primary"
                onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addUrl())}
              />
              <LinkIcon size={12} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-outline" />
            </div>
            <button 
              type="button"
              onClick={addUrl}
              className="bg-primary text-white py-2 rounded-lg text-[10px] uppercase font-bold tracking-widest flex items-center justify-center gap-2"
            >
              <Plus size={14} /> Add
            </button>
          </div>
        ) : (
          <button 
            type="button"
            disabled={isUploading}
            onClick={() => fileInputRef.current?.click()}
            className="aspect-square rounded-2xl border-2 border-dashed border-outline-variant/30 flex flex-col items-center justify-center gap-2 hover:border-primary/50 hover:bg-surface-container/30 transition-all group"
          >
            <input 
              type="file" 
              ref={fileInputRef} 
              multiple 
              className="hidden" 
              accept="image/*" 
              onChange={handleFileUpload} 
            />
            {isUploading ? (
              <RefreshCw className="animate-spin text-primary" size={20} />
            ) : (
              <Plus className="text-outline group-hover:text-primary transition-colors" size={24} />
            )}
            <span className="text-[9px] uppercase tracking-widest font-bold text-outline group-hover:text-primary">
              {isUploading ? 'Uploading...' : 'Add Images'}
            </span>
          </button>
        )}
      </div>
    </div>
  );
}
