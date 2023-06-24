// TODO: insert useMediaQuery
import { useMediaQuery } from '@mui/material/';

import MenuDesktop from './MenuDesktop';
import MenuMobile from './MenuMobile';
import { theme } from '../../styles/styles';
import navigation from '../../data/navigation';

const activeStyle = {
  color: theme.palette.custom.main,
};

const inActiveStyle = {
  color: theme.palette.custom.light,
};

export default function Menu() {
  // const dispatch = useDispatch();

  const isMobile = useMediaQuery(theme.breakpoints.down('tablet'));

  // const { filter, user } = useSelector(({ filter, user }) => ({
  //   filter,
  //   user,
  // }));
  // const setImageFilter = (filter) => {
  //   dispatch(filterImages(filter));
  // };

  return (
    <>
      {isMobile ? (
        <MenuMobile navigation={navigation} />
      ) : (
        <MenuDesktop
          navigation={navigation}
          // user={user}
          // setImageFilter={setImageFilter}
          // filter={filter}
        />
      )}
    </>
  );
}
