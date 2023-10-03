export const saveToken = (token) => {
  window.localStorage.setItem('loggedPortfolioUser', token);
};

export const getToken = () => {
  const tokenJSON = window.localStorage.getItem('loggedPortfolioUser');
  return tokenJSON;
};

export const removeToken = () => {
  window.localStorage.removeItem('loggedPortfolioUser');
};
