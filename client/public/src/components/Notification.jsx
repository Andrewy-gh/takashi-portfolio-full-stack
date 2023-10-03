import { forwardRef, useContext } from 'react';
import Snackbar from '@mui/material/Snackbar';
import MuiAlert from '@mui/material/Alert';
import { NotificationContext } from '../contexts/NotificationContext';

const Alert = forwardRef(function Alert(props, ref) {
  return <MuiAlert elevation={6} ref={ref} variant="filled" {...props} />;
});

export default function Notification() {
  const { open, message, severity, resetMessages } =
    useContext(NotificationContext);

  const handleClose = (_, reason) => {
    if (reason === 'clickaway') {
      return;
    }
    resetMessages();
  };

  return (
    <Snackbar open={open} autoHideDuration={3000} onClose={handleClose}>
      <Alert onClose={handleClose} severity={severity} sx={{ width: '100%' }}>
        {message}
      </Alert>
    </Snackbar>
  );
}
