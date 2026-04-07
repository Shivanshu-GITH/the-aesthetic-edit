import React, { createContext, useContext } from 'react';
import { useAdmin } from './hooks/useAdmin';

type AdminContextType = ReturnType<typeof useAdmin>;

type AdminGlobal = typeof globalThis & {
  __AESTHETIC_ADMIN_CONTEXT__?: React.Context<AdminContextType | undefined>;
};

const adminGlobal = globalThis as AdminGlobal;
const AdminContext =
  adminGlobal.__AESTHETIC_ADMIN_CONTEXT__ ??
  createContext<AdminContextType | undefined>(undefined);

if (!adminGlobal.__AESTHETIC_ADMIN_CONTEXT__) {
  adminGlobal.__AESTHETIC_ADMIN_CONTEXT__ = AdminContext;
}

export const AdminProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const admin = useAdmin();
  return (
    <AdminContext.Provider value={admin}>
      {children}
    </AdminContext.Provider>
  );
};

export const useAdminContext = () => {
  const context = useContext(AdminContext);
  if (context === undefined) {
    throw new Error('useAdminContext must be used within an AdminProvider');
  }
  return context;
};
