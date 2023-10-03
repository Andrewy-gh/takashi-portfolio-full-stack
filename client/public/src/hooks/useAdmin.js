import { useContext, useEffect, useState } from 'react';
import { NotificationContext } from '../contexts/NotificationContext';
import configServices from '../services/config';

export function useAdmin() {
  const [adminStatus, setAdminStatus] = useState('');
  const { handleSuccess, handleError } = useContext(NotificationContext);

  useEffect(() => {
    const checkAdmin = async () => {
      const res = await configServices.checkAdmin();
      setAdminStatus(res.status);
    };
    checkAdmin();
  }, []);

  const createAdmin = async (credentials) => {
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
