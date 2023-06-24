import Grid from '@mui/material/Grid';
import Menu from '../components/Menu';
import Images from '../components/Images/index';

export default function Home() {
  return (
    <>
      <Grid
        container
        columns={12}
        sx={{ gap: { mobile: '1.25rem', tablet: '0' } }}
      >
        <Grid item mobile={12} tablet={3}>
          <Menu
          // user={user}
          />
        </Grid>
        <Grid item mobile={12} tablet={9} sx={{ tablet: { padding: '.5em' } }}>
          <Images />
        </Grid>
      </Grid>
      {/* TODO: Snackbar lift to App component */}
      {/* <Snackbar open={open} autoHideDuration={6000} onClose={handleClose}>
        <Alert onClose={handleClose} severity="success" sx={{ width: '100%' }}>
          {alert}
        </Alert>
      </Snackbar> */}
    </>
  );
}
