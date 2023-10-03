const Config = require('../models/Config');
const ImageOrder = require('../models/ImageOrder');

let appInitialized = false;

const initializeApp = async () => {
  const existingConfig = await Config.findOne();
  if (!appInitialized && !existingConfig) {
    const newConfig = new Config({
      adminCreated: false,
    });
    await newConfig.save();
    const imageOrder = new ImageOrder({});
    await imageOrder.save();
  }
  appInitialized = true;
};

module.exports = {
  initializeApp,
};
