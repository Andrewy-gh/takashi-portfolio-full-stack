import { Link } from 'react-router-dom';
// TODO: insert useMediaQuery
import { Container, Typography } from '@mui/material/';

import { styled } from '@mui/material/styles';
import { theme } from '../../styles/styles';
import navigation from '../../data/navigation';
import Default from '../../assets/default.png';
import CoverMobile from '../../assets/cover-mobile-cropped.png';

const MenuDesktopContainer = styled(Container)(() => ({
  position: 'sticky',
  top: theme.spacing(2),
}));

const MenuFixedContent = styled('div')(() => ({
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  padding: theme.spacing(6),
}));

const CustomFlexContainer = styled('div')(() => ({
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
}));

const TypographyStyle = {
  lineHeight: '1.6',
  fontFamily: 'Quando',
  marginBottom: theme.spacing(1),
  cursor: 'pointer',
};

const activeStyle = {
  color: theme.palette.custom.main,
};

const inActiveStyle = {
  color: theme.palette.custom.light,
};

// TODO: jsx file name
const MenuDesktop = () =>
  // {  user, filter, setImageFilter }
  {
    // const handleClick = (filter) => {
    //   setImageFilter(filter);
    // };
    console.log('navigation', navigation);
    return (
      <MenuDesktopContainer>
        <MenuFixedContent>
          <Link to="/">
            <div
              style={{ minWidth: 200 }}
              // onClick={() => handleClick(null)}
            >
              <img src={Default} alt="logo" />
            </div>
          </Link>
          <CustomFlexContainer>
            {navigation.map((nav) =>
              nav.type === 'filter' ? (
                <Typography
                  key={nav.id}
                  variant="h6"
                  sx={{
                    ...TypographyStyle,
                  }}
                >
                  {nav.name}
                </Typography>
              ) : (
                <Link to={nav.path} key={nav.id}>
                  <Typography variant="h6" sx={TypographyStyle}>
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
                    ...TypographyStyle,
                    ...(filter === nav.filter ? activeStyle : inActiveStyle),
                  }}
                  onClick={() => handleClick(nav.filter)}
                >
                  {nav.name}
                </Typography>
              ) : (
                <Link to={nav.path} key={nav.id}>
                  <Typography variant="h6" sx={TypographyStyle}>
                    {nav.name}
                  </Typography>
                </Link>
              )
            )} */}
            {/* {user.loggedIn ? <Admin /> : <LoginButton />} */}
          </CustomFlexContainer>
        </MenuFixedContent>
      </MenuDesktopContainer>
    );
  };

export default function Menu() {
  // const dispatch = useDispatch();

  // const isMobile = useMediaQuery(theme.breakpoints.down('tablet'));

  // const { filter, user } = useSelector(({ filter, user }) => ({
  //   filter,
  //   user,
  // }));
  // const setImageFilter = (filter) => {
  //   dispatch(filterImages(filter));
  // };

  return (
    <>
      {/* {isMobile ? (
        <MenuMobile
          user={user}
          setImageFilter={setImageFilter}
          filter={filter}
        />
      ) : ( */}
      <MenuDesktop
      // user={user}
      // setImageFilter={setImageFilter}
      // filter={filter}
      />
      {/* )} */}
    </>
  );
}
