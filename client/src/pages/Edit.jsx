import { useSelector } from 'react-redux';
import { DragDropContext, Draggable } from 'react-beautiful-dnd';
import Box from '@mui/material/Box';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import Container from '@mui/material/Container';
import DragHandleIcon from '@mui/icons-material/DragHandle';
import EditCard from '../components/Edit/EditCard';
import { useState } from 'react';
import StrictModeDroppable from '../components/Edit/StrictModeDroppable';

const containerStyle = {
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  justifyContent: 'center',
  fontSize: 'calc(10px + 1.5vmin)',
};

const listStyle = {
  listStyle: 'none',
};

const listItem = {
  display: 'flex',
  alignItems: 'center',
  border: 'solid 2px #d0d0d0',
  borderRadius: '.2em',
  padding: '.5em .8em .5em .5em',
  marginBottom: '1em',
};

const thumbContainer = {
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

const thumbFont = {
  maxWidth: 'none',
  fontWeight: 'bold',
  margin: '0',
};

export default function Edit() {
  const { data } = useSelector(({ images }) => images);
  const [characters, updateCharacters] = useState(data);

  function handleOnDragEnd(result) {
    if (!result.destination) return;
    const items = Array.from(characters);
    const [reorderedItem] = items.splice(result.source.index, 1);
    items.splice(result.destination.index, 0, reorderedItem);

    updateCharacters(items);
  }
  return (
    <div className="App">
      <header className="App-header">
        <h1>Final Space Characters</h1>
        <DragDropContext onDragEnd={handleOnDragEnd}>
          <StrictModeDroppable droppableId="characters">
            {(provided) => (
              <ul
                className="characters"
                {...provided.droppableProps}
                ref={provided.innerRef}
              >
                {characters.map(({ id, title, url }, index) => {
                  return (
                    <Draggable key={id} draggableId={id} index={index}>
                      {(provided) => (
                        <li
                          ref={provided.innerRef}
                          {...provided.draggableProps}
                          {...provided.dragHandleProps}
                        >
                          <div className="characters-thumb">
                            <img src={url} alt={`${title} Thumb`} />
                          </div>
                          <p>{title}</p>
                        </li>
                      )}
                    </Draggable>
                  );
                })}
                {provided.placeholder}
              </ul>
            )}
          </StrictModeDroppable>
        </DragDropContext>
      </header>
      <p>
        Images from{' '}
        <a href="https://final-space.fandom.com/wiki/Final_Space_Wiki">
          Final Space Wiki
        </a>
      </p>
    </div>
  );
}
