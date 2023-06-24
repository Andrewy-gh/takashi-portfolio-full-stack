import { Link } from 'react-router-dom';
import Container from '@mui/material/Container';
import Typography from '@mui/material/Typography';
import ImageUpload from '../ImageUpload';
import Default from '../../assets/default.png';
import { theme } from '../../styles/styles';

const flexColumns = {
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
};

const sticky = {
  position: 'sticky',
  top: theme.spacing(2),
};

const typographyStyle = {
  lineHeight: '1.6',
  fontFamily: 'Quando',
  marginBottom: theme.spacing(1),
  cursor: 'pointer',
};

export default function MenuDesktop({ navigation }) {
  // {  user, filter, setImageFilter }
  // const handleClick = (filter) => {
  //   setImageFilter(filter);
  // };
  return (
    <Container sx={sticky}>
      <div style={{ ...flexColumns, padding: theme.spacing(6) }}>
        <Link to="/">
          <div
            style={{ minWidth: 200 }}
            // onClick={() => handleClick(null)}
          >
            <img src={Default} alt="logo" />
          </div>
        </Link>
        <div style={flexColumns}>
          {navigation.map((nav) =>
            nav.type === 'filter' ? (
              <Typography
                key={nav.id}
                variant="h6"
                sx={{
                  ...typographyStyle,
                }}
              >
                {nav.name}
              </Typography>
            ) : (
              <Link to={nav.path} key={nav.id}>
                <Typography variant="h6" sx={typographyStyle}>
                  {nav.name}
                </Typography>
              </Link>
            )
          )}
          {/* Original syntax */}
          {/* {navigation.map((nav) =>
              nav.type === 'filter' ? (
                <Typography
                  key={nav.id}
                  variant="h6"
                  sx={{
                    ...typographyStyle,
                    ...(filter === nav.filter ? activeStyle : inActiveStyle),
                  }}
                  onClick={() => handleClick(nav.filter)}
                >
                  {nav.name}
                </Typography>
              ) : (
                <Link to={nav.path} key={nav.id}>
                  <Typography variant="h6" sx={typographyStyle}>
                    {nav.name}
                  </Typography>
                </Link>
              )
            )} */}
          {/* {user.loggedIn ? <Admin /> : <LoginButton />} */}
          <ImageUpload />
        </div>
      </div>
    </Container>
  );
}
