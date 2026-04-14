import React from 'react';
import { UserCircle2 } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import SEOMeta from '../components/SEOMeta';

export default function Profile() {
  const { user, logout } = useAuth();

  if (!user) return null;

  return (
    <div className="max-w-4xl mx-auto px-6 py-24">
      <SEOMeta
        title="Your Profile"
        description="Manage your profile on The Aesthetic Edit."
        type="website"
      />

      <section className="bg-white rounded-[32px] border border-outline-variant/30 p-8 md:p-10 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center gap-6">
          {user.photo ? (
            <img src={user.photo} alt={user.name} className="w-20 h-20 rounded-full object-cover border border-outline-variant/30" />
          ) : (
            <div className="w-20 h-20 rounded-full bg-surface-container flex items-center justify-center text-outline">
              <UserCircle2 size={40} />
            </div>
          )}

          <div className="space-y-2">
            <h1 className="text-3xl md:text-4xl font-headline font-bold text-on-surface">{user.name}</h1>
            <p className="text-on-surface-variant">{user.email}</p>
            <p className="text-[10px] uppercase tracking-widest text-outline font-label">UID: {user.uid || user.id}</p>
          </div>
        </div>

        <div className="mt-8 pt-6 border-t border-outline-variant/30">
          <button
            type="button"
            onClick={() => {
              void logout();
            }}
            className="bg-primary text-white px-6 py-3 rounded-xl font-label text-xs uppercase tracking-widest font-bold hover:bg-primary-hover transition-colors"
          >
            Logout
          </button>
        </div>
      </section>
    </div>
  );
}
