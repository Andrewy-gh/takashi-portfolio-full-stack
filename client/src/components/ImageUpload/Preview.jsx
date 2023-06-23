import { IconButton } from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";

const flex = {
  display: "Flex",
  flexWrap: "Wrap",
  gap: ".3125rem",
  width: "100%",
};

const imageItem = {
  position: "relative",
  width: "100px",
  flex: "0 1 auto",
};

const removeButton = {
  position: "absolute",
  left: "1.25%",
  top: "1.25%",
  color: "black",
  backgroundColor: "rgba(255,255,255,0.5)",
};

export default function Preview({ images, removeImage }) {
  return (
    <Box>
      <Typography variant="h5">Preview</Typography>
      <Box sx={flex}>
        {images.map((image) => (
          <Box key={`image-preview-${image.id}`} sx={imageItem}>
            <img src={image.preview} alt="preview" />
            <IconButton sx={removeButton} onClick={() => removeImage(image.id)}>
              <CloseIcon sx={{ fontSize: 15 }} />
            </IconButton>
          </Box>
        ))}
      </Box>
    </Box>
  );
}
