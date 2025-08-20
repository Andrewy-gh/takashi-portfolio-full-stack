import { createFileRoute, Link } from '@tanstack/react-router';

import useMediaQuery from '@mui/material/useMediaQuery';
import type { Breakpoint } from '@mui/material/styles';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import HomeIcon from '@mui/icons-material/Home';
import IconButton from '@mui/material/IconButton';
import { theme } from '@/theme';

import { useDialog } from '@/hooks/use-dialog';
import { DragDrop } from '@/components/edit/drag-drop';
import { fetchImages } from '@/api';
import { FloatingButton } from '@/components/shared/floating-button';
import { UploadForm } from '@/components/edit/upload-form';

export const Route = createFileRoute('/edit')({
  component: RouteComponent,
  loader: () => fetchImages(),
});

function RouteComponent() {
  const images = Route.useLoaderData();
  const { open, handleOpen, handleClose } = useDialog();
  const fullScreen = useMediaQuery(theme.breakpoints.down('tablet'));
  return (
    <main>
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'space-between',
          padding: { mobile: '.75rem .5rem', laptop: '1rem' },
        }}
      >
        <Link to="/" search={{ filter: undefined }}>
          <IconButton style={{ placeSelf: 'start start' }}>
            <HomeIcon
              fontSize="large"
              sx={{ color: theme.palette.custom.light }}
            />
          </IconButton>
        </Link>
        {/* Upload Form */}
        <Button variant="contained" onClick={handleOpen}>
          Image Upload
        </Button>
        <Dialog
          fullScreen={fullScreen}
          open={open}
          onClose={handleClose}
          aria-labelledby="responsive-dialog-title"
          maxWidth={'lg' as Breakpoint}
        >
          <UploadForm onClose={() => handleClose()} />
        </Dialog>
        <FloatingButton />
      </Box>
      {/* Drag and Drop with Edit and Delete buttons */}
      <DragDrop images={images} />
    </main>
  );
}
