const mongoose = require('mongoose');
const budgetSchema = new mongoose.Schema({
  receipt: {
    type: String,
    default: ''
  },
  title: {
    type: String,
    required: true
  },
  amount: {
    type: String,
    required: true
  },
  type: {
    type: String,
    required: true
  },
  date: {
    type: String,
    required: true
  }
});

const Budget = mongoose.model('Budget', budgetSchema);

module.exports = Budget;
