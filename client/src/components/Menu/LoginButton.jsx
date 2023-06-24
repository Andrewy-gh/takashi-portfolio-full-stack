import Google from '../../assets/google.png';
import { styled } from '@mui/material/styles';
import { getLoginUrl } from '../../services/login';

const Icon = styled('img')(() => ({
  width: '20px',
  height: '20px',
}));

const Button = styled('div')(() => ({
  padding: '10px',
  cursor: 'pointer',
  backgroundColor: '#202020',
}));

const LoginButton = () => {
  const google = async () => {
    const url = await getLoginUrl();
    window.open(url, '_self');
  };

  return (
    <Button onClick={google}>
      <Icon src={Google} alt="" />
    </Button>
  );
};

export default LoginButton;
