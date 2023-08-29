export const renderLink = (link, loggedIn, token) => {
  if (link.path === '/edit') {
    return loggedIn && token;
  }
  return true;
};
