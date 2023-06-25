import { useSelector } from 'react-redux';
import { Draggable } from 'react-beautiful-dnd';
import DragHandleIcon from '@mui/icons-material/DragHandle';
import ListItem from '@mui/material/ListItem';
import Typography from '@mui/material/Typography';
import EditButton from '../ImageEdit/EditButton';
import DeleteButton from '../ImageDelete/DeleteButton';
import CldThumb from '../Images/CldThumb';
import useMediaQuery from '@mui/material/useMediaQuery';
import { theme } from '../../styles/styles';

// const listItem = {
//   display: 'flex',
//   alignItems: 'center',
//   justifyContent: 'center',
//   border: 'solid 2px #d0d0d0',
//   borderRadius: '.2em',
//   padding: '.5em .8em .5em .5em',
//   marginBottom: '1em',
//   cursor: 'grab',
// };
const listItem = {
  display: 'flex',
  justifyContent: 'space-between',
  border: 'solid 2px #d0d0d0',
  borderRadius: '.2em',
  padding: '.5em .2em .5em .5em',
  marginBottom: '1em',
  cursor: 'grab',
};

const thumbImgContainer = {
  overflow: 'hidden',
  flexShrink: '0',
  width: '2em',
  height: '2em',
  backgroundColor: '#e8e8e8',
  padding: '.5em',
  marginRight: '.5em',
};

const thumbImg = {
  display: 'block',
  width: '100%',
  height: 'auto',
};
const mobileWidth = {
  width: 'calc(100% - 2rem)',
};

export default function DragItem({ image, index }) {
  const cloudName = useSelector(({ cloudName }) => cloudName);
  const isMobile = useMediaQuery(theme.breakpoints.down('tablet'));
  return (
    <Draggable draggableId={image.id} index={index}>
      {(provided, snapshot) => (
        <ListItem
          {...provided.draggableProps}
          {...provided.dragHandleProps}
          ref={provided.innerRef}
          // isDragging={snapshot.isDragging}
          sx={listItem}
        >
          <div>
            <CldThumb cloudName={cloudName} cloudinaryId={image.cloudinaryId} />
          </div>

          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              width: '60%',
            }}
          >
            <div
              style={{
                width: '100%',
                display: 'flex',
                flexDirection: 'column',
                marginRight: '1rem',
              }}
            >
              <Typography variant="body2" sx={{ marginBottom: '.5rem' }}>
                {image.title}
              </Typography>
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                }}
              >
                <div>
                  <EditButton image={image} />
                  <DeleteButton image={image} />
                </div>
                <DragHandleIcon sx={{ placeSelf: 'start end' }} />
              </div>
            </div>
          </div>
        </ListItem>
      )}
    </Draggable>
  );
}
