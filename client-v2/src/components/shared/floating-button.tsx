import ArrowCircleUpIcon from '@mui/icons-material/ArrowCircleUp';

const buttonStyle = {
  position: 'fixed',
  bottom: '20px',
  right: '20px',
  cursor: 'pointer',
};

export function FloatingButton() {
  const handleScrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return <ArrowCircleUpIcon sx={buttonStyle} onClick={handleScrollToTop} />;
}
