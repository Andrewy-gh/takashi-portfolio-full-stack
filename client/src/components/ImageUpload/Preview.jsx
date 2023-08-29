import { IconButton } from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';

const flex = {
  display: 'Flex',
  flexWrap: 'Wrap',
  gap: '.3125rem',
  width: '100%',
};

const imageItem = {
  position: 'relative',
  width: '100px',
  flex: '0 1 auto',
};

const removeButton = {
  position: 'absolute',
  left: '1.25%',
  top: '1.25%',
  color: 'black',
  backgroundColor: 'rgba(255,255,255,0.5)',
};

export default function Preview({ images, removeImage }) {
  return (
    <div>
      <h3 style={{ marginBottom: '.5rem' }}>Preview</h3>
      <div style={flex}>
        {images.map((image) => (
          <div key={image.id} style={imageItem}>
            <img src={image.preview} alt={image.title} />
            <IconButton sx={removeButton} onClick={() => removeImage(image.id)}>
              <CloseIcon sx={{ fontSize: 15 }} />
            </IconButton>
          </div>
        ))}
      </div>
    </div>
  );
}
