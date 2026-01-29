type NavigationLink = {
  path?: string | null;
};

export const renderLink = (
  link: NavigationLink,
  loggedIn: boolean,
  token: string | null
): boolean => {
  if (link.path === '/edit') {
    return loggedIn && Boolean(token);
  }
  return true;
};
