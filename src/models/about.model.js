const mongoose = require('mongoose');
const aboutSchema = new mongoose.Schema({
  content: {
    type: String,
    default: ''
  },
  vision: {
    type: String,
    default: ''
  }
});

const about = mongoose.model('About', aboutSchema);

module.exports = about;
