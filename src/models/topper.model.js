const mongoose = require('mongoose');
const topperSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true
  },
  score: {
    type: String,
    required: true
  },
  year: {
    type: String,
    required: true
  },
  details: {
    type: String,
    required: true
  },
  image: {
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
      required: true
    },
    created_at: {
      type: String,
      default: Date.now.toString()
    }
  }
});

const topper = mongoose.model('Topper', topperSchema);

module.exports = topper;
