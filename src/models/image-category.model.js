const mongoose = require('mongoose');
const imageCategorySchema = new mongoose.Schema({
  category: {
    type: String,
    required: true
  }
});

imageCategorySchema.methods.toJSON = function() {
  const imageCategory = this;
  const imageCategoryObject = imageCategory.toObject();

  delete imageCategoryObject.__v;

  return imageCategoryObject;
};

const imageCategory = mongoose.model('ImageCategory', imageCategorySchema);

module.exports = imageCategory;
