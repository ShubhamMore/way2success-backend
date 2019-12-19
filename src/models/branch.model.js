const mongoose = require('mongoose');

const branchSchema = new mongoose.Schema({
  branchName: {
    type: String,
    require: true
  },
  address: {
    type: String,
    require: true
  },
  email: {
    type: String,
    require: true
  },
  phone: {
    type: String,
    require: true
  },
  status: {
    type: String,
    default: '1'
  }
});

branchSchema.methods.toJSON = function() {
  const branch = this;
  const branchObject = branch.toObject();

  delete branchObject.__v;

  return branchObject;
};

const branch = mongoose.model('Branch', branchSchema);

module.exports = branch;
