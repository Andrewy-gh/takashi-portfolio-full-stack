import { useEffect, useState } from 'react';
import { useNotification } from '../contexts/NotificationContext';
import configServices from '../services/config';
import type { AdminCredentials } from '../services/config';

export function useAdmin(): {
  adminStatus: string;
  createAdmin: (credentials: AdminCredentials) => Promise<void>;
} {
  const [adminStatus, setAdminStatus] = useState('');
  const { handleSuccess, handleError } = useNotification();

  useEffect(() => {
    const checkAdmin = async () => {
      const res = await configServices.checkAdmin();
      setAdminStatus(res.status);
    };
    checkAdmin();
  }, []);

  const createAdmin = async (credentials: AdminCredentials) => {
    try {
      const adminCreated = await configServices.createAdmin(credentials);
      if (adminCreated.success) {
        handleSuccess(adminCreated.message);
        setAdminStatus('Admin setup complete');
      }
    } catch (error) {
      handleError(error);
    }
  };

  return {
    adminStatus,
    createAdmin,
  };
}
