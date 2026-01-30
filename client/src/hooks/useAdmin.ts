import { useEffect, useState } from 'react';
import { useNotification } from '../contexts/NotificationContext';
import configServices from '../services/config';
import type { AdminCredentials } from '../services/config';

export function useAdmin(): {
  adminStatus: string;
  createAdmin: (credentials: AdminCredentials) => Promise<void>;
} {
  const [adminStatus, setAdminStatus] = useState('');
  const { actions: notification } = useNotification();

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
        notification.success(adminCreated.message);
        setAdminStatus('Admin setup complete');
      }
    } catch (error) {
      notification.error(error);
    }
  };

  return {
    adminStatus,
    createAdmin,
  };
}
