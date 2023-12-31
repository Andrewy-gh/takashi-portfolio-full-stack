import { useState } from 'react';

export function useDialog() {
  const [open, setOpen] = useState(false);

  const handleClose = () => setOpen(false);
  const handleOpen = () => setOpen(true);

  return { open, handleClose, handleOpen };
}
