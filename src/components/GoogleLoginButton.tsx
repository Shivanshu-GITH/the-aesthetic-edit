import React from 'react';
import { Loader2 } from 'lucide-react';

interface GoogleLoginButtonProps {
  disabled?: boolean;
  loading?: boolean;
  onClick: () => void;
  label?: string;
}

export default function GoogleLoginButton({
  disabled = false,
  loading = false,
  onClick,
  label = 'Continue with Google',
}: GoogleLoginButtonProps) {
  return (
    <button
      type="button"
      disabled={disabled}
      onClick={onClick}
      className="w-full border border-[#DADCE0] bg-white py-4 rounded-2xl font-body text-[15px] font-semibold text-[#3C4043] hover:bg-[#F8F9FA] transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-3 shadow-sm"
    >
      {loading ? (
        <Loader2 size={18} className="animate-spin text-[#5F6368]" />
      ) : (
        <svg width="18" height="18" viewBox="0 0 48 48" aria-hidden="true">
          <path fill="#EA4335" d="M24 9.5c3.54 0 6.73 1.22 9.24 3.6l6.9-6.9C35.95 2.35 30.37 0 24 0 14.63 0 6.5 5.38 2.56 13.22l8.04 6.24C12.42 13.7 17.74 9.5 24 9.5z"/>
          <path fill="#4285F4" d="M46.5 24.55c0-1.64-.15-3.22-.42-4.73H24v9.01h12.67c-.54 2.92-2.2 5.39-4.69 7.04l7.27 5.64C43.96 37.27 46.5 31.47 46.5 24.55z"/>
          <path fill="#FBBC05" d="M10.6 28.54a14.49 14.49 0 0 1 0-9.08l-8.04-6.24a24.03 24.03 0 0 0 0 21.56l8.04-6.24z"/>
          <path fill="#34A853" d="M24 48c6.37 0 11.73-2.1 15.64-5.72l-7.27-5.64c-2.02 1.36-4.6 2.17-8.37 2.17-6.26 0-11.58-4.2-13.4-9.96l-8.04 6.24C6.5 42.62 14.63 48 24 48z"/>
        </svg>
      )}
      {label}
    </button>
  );
}
