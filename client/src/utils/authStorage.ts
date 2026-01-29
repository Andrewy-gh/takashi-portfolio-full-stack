export const saveToken = (token: string): void => {
  window.localStorage.setItem('loggedPortfolioUser', token);
};

export const getToken = (): string | null => {
  const tokenJSON = window.localStorage.getItem('loggedPortfolioUser');
  return tokenJSON;
};

export const removeToken = (): void => {
  window.localStorage.removeItem('loggedPortfolioUser');
};
