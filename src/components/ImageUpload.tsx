import React, { useState, useRef } from 'react';
import { Upload, X, ImageIcon, RefreshCw, Link as LinkIcon } from 'lucide-react';
import { useToast } from '../context/ToastContext';

interface ImageUploadProps {
  value: string;
  onChange: (value: string) => void;
  label: string;
}

export default function ImageUpload({ value, onChange, label }: ImageUploadProps) {
  const [isUploading, setIsUploading] = useState(false);
  const [isUrlMode, setIsUrlMode] = useState(!value || value.startsWith('http'));
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { showToast } = useToast();

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      showToast('File size exceeds 5MB', 'error');
      return;
    }

    setIsUploading(true);
    const formData = new FormData();
    formData.append('image', file);

    const adminPassword = sessionStorage.getItem('ae_admin_auth') || '';

    try {
      const response = await fetch('/api/upload', {
        method: 'POST',
        headers: {
          'ADMIN_PASSWORD': adminPassword,
        },
        body: formData,
      });

      const data = await response.json();
      if (data.success) {
        onChange(data.url);
        showToast('Image uploaded successfully', 'success');
      } else {
        showToast(data.error || 'Upload failed', 'error');
      }
    } catch (error) {
      console.error('Upload error:', error);
      showToast('Network error during upload', 'error');
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <label className="font-label text-xs uppercase tracking-widest font-bold text-outline">{label}</label>
        <div className="flex bg-surface-container rounded-lg p-0.5">
          <button 
            type="button"
            onClick={() => setIsUrlMode(false)}
            className={`px-3 py-1 rounded-md text-[9px] uppercase tracking-wider font-bold transition-all ${!isUrlMode ? 'bg-white shadow-sm text-primary' : 'text-outline'}`}
          >
            Upload
          </button>
          <button 
            type="button"
            onClick={() => setIsUrlMode(true)}
            className={`px-3 py-1 rounded-md text-[9px] uppercase tracking-wider font-bold transition-all ${isUrlMode ? 'bg-white shadow-sm text-primary' : 'text-outline'}`}
          >
            URL
          </button>
        </div>
      </div>

      <div className="relative group">
        {isUrlMode ? (
          <div className="relative">
            <input 
              type="text"
              value={value}
              onChange={(e) => onChange(e.target.value)}
              placeholder="https://images.unsplash.com/..."
              className="px-10 py-3 rounded-xl bg-surface-container/50 border border-outline-variant/30 focus:outline-none focus:border-primary transition-all w-full text-sm"
            />
            <LinkIcon size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-outline" />
          </div>
        ) : (
          <div 
            onClick={() => !isUploading && fileInputRef.current?.click()}
            className={`relative flex flex-col items-center justify-center p-8 border-2 border-dashed rounded-3xl transition-all cursor-pointer bg-surface-container/30 ${isUploading ? 'opacity-50 cursor-not-allowed' : 'hover:border-primary/50 hover:bg-surface-container/50'} ${value && !isUrlMode ? 'border-primary/30' : 'border-outline-variant/30'}`}
          >
            <input 
              type="file" 
              ref={fileInputRef} 
              className="hidden" 
              accept="image/*" 
              onChange={handleFileUpload}
            />
            {isUploading ? (
              <RefreshCw className="animate-spin text-primary mb-2" size={24} />
            ) : (
              <Upload className="text-outline mb-2 group-hover:text-primary transition-colors" size={24} />
            )}
            <p className="text-[10px] uppercase tracking-widest font-bold text-outline group-hover:text-primary transition-colors">
              {isUploading ? 'Uploading...' : (value && !isUrlMode ? 'Replace Image' : 'Select File')}
            </p>
          </div>
        )}

        {value && (
          <div className="mt-4 relative inline-block">
            <div className="relative w-32 aspect-square rounded-2xl overflow-hidden border border-outline-variant/20 shadow-sm bg-surface-container">
              <img src={value} alt="Preview" className="w-full h-full object-cover" />
              <button 
                type="button"
                onClick={() => onChange('')}
                className="absolute top-1 right-1 p-1.5 bg-black/50 text-white rounded-full hover:bg-black/70 transition-colors"
              >
                <X size={12} />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
