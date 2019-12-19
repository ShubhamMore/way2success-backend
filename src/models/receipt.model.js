const mongoose = require('mongoose');
const receiptSchema = new mongoose.Schema({
  student: {
    type: String,
    required: true
  },
  branch: {
    type: String,
    required: true
  },
  course: {
    type: String,
    required: true
  },
  batch: {
    type: String,
    required: true
  },
  date: {
    type: String,
    required: true
  },
  feeType: {
    type: String,
    required: true
  },
  amount: {
    type: String,
    require: true
  },
  paymentMode: {
    type: String,
    require: true
  },
  description: {
    type: String,
    require: true
  }
});

receiptSchema.methods.toJSON = function() {
  const receipt = this;
  const receiptObject = receipt.toObject();

  delete receiptObject.__v;

  return receiptObject;
};

const receipt = mongoose.model('Receipt', receiptSchema);

module.exports = receipt;
