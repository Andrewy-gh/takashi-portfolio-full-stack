import { Link } from 'react-router-dom';
import Box from '@mui/material/Box';
import HomeIcon from '@mui/icons-material/Home';
import IconButton from '@mui/material/IconButton';
import DragDrop from '../components/DragDrop/index';
import { theme } from '../styles/styles';
import ImageUpload from '../components/ImageUpload';
import FloatingButton from '../components/FloatingButton';

export default function Edit({
  cloudName,
  images,
  updateImageOrder,
  updateImageDetails,
  removeOneImage,
  uploadNewImage,
}) {
  let content;
  if (!images.length) {
    content = <h1 style={{ textAlign: 'center' }}>No images uploaded</h1>;
  } else {
    content = (
      <>
        <DragDrop
          cloudName={cloudName}
          images={images}
          updateImageOrder={updateImageOrder}
          updateImageDetails={updateImageDetails}
          removeOneImage={removeOneImage}
        />
        <FloatingButton />
      </>
    );
  }

  return (
    <>
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'space-between',
          padding: { mobile: '.75rem .5rem', laptop: '1rem' },
        }}
      >
        <Link to="/">
          <IconButton style={{ placeSelf: 'start start' }}>
            <HomeIcon
              fontSize="large"
              sx={{ color: theme.palette.custom.light }}
            />
          </IconButton>
        </Link>
        <ImageUpload
          style={{ placeSelf: 'start end' }}
          uploadNewImage={uploadNewImage}
        />
      </Box>
      {content}
    </>
  );
}
