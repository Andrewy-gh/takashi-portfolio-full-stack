export const getToken = () => {
  const key = 'jwtPortfolioApp';
  let value = null;
  document.cookie.split(';').forEach((e) => {
    if (e.includes(key)) {
      value = e.split('=')[1];
    }
  });
  return value;
};
