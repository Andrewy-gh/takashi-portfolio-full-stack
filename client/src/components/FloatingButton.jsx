import ArrowCircleUpIcon from '@mui/icons-material/ArrowCircleUp';

export default function FloatingButton() {
  const buttonStyle = {
    position: 'fixed',
    bottom: '20px',
    right: '20px',
    cursor: 'pointer',
  };

  const handleScrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return <ArrowCircleUpIcon style={buttonStyle} onClick={handleScrollToTop} />;
}
