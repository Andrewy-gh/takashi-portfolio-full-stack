import axios from 'axios';

const getCloudName = async () => {
  const response = await axios.get('http://localhost:3001/cloudinary');
  return response.data;
};

export default { getCloudName };
