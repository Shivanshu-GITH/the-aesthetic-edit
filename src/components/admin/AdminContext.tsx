import React, { createContext, useContext } from 'react';
import { useAdmin } from './hooks/useAdmin';

type AdminContextType = ReturnType<typeof useAdmin>;

const AdminContext = createContext<AdminContextType | undefined>(undefined);

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
