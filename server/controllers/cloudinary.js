const getCloudname = async (req, res) => {
  res.json(process.env.CLOUD_NAME);
};

module.exports = { getCloudname };
