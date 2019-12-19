const mongoose = require('mongoose');
const enquirySchema = new mongoose.Schema({
  name: {
    type: String,
    required: true
  },
  phone: {
    type: String,
    required: true
  },
  email: {
    type: String,
    required: true
  },
  message: {
    type: String,
    required: true
  },
  date: {
    type: String,
    required: true
  },
  seen: {
    type: String,
    default: '0'
  },
  reply: [
    {
      date: {
        type: String,
        required: true
      },
      subject: {
        type: String,
        required: true
      },
      message: {
        type: String,
        required: true
      }
    }
  ]
});

const enquiry = mongoose.model('Enquiry', enquirySchema);

module.exports = enquiry;
