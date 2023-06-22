import axios from 'axios';

export const getLoginUrl = async () => {
  const response = await axios.get('http://localhost:3001/login');
  return response.data.url;
};
