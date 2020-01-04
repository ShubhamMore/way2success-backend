const mongoose = require('mongoose');
const imageSchema = new mongoose.Schema({
  category: {
    type: String,
    required: true
  },
  image_name: {
    type: String,
    required: true
  },
  secure_url: {
    type: String,
    required: true
  },
  public_id: {
    type: String,
    require: true
  },
  created_at: {
    type: String,
    default: Date.now.toString()
  },
  width: {
    type: String,
    default: '720'
  },
  height: {
    type: String,
    default: '480'
  }
});

imageSchema.methods.toJSON = function() {
  const image = this;
  const imageObject = image.toObject();

  delete imageObject.__v;

  return imageObject;
};

const image = mongoose.model('Image', imageSchema);

module.exports = image;
