const mongoose = require('mongoose');

const ConfigSchema = new mongoose.Schema({
  adminCreated: Boolean,
  imageOrderCreated: Boolean,
});

ConfigSchema.set('toJSON', {
  transform: (document, returnedObject) => {
    returnedObject.id = returnedObject._id.toString();
    delete returnedObject._id;
    delete returnedObject.__v;
  },
});

module.exports = mongoose.model('Config', ConfigSchema);
