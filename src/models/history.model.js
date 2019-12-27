const mongoose = require('mongoose');
const historySchema = new mongoose.Schema({
  student: {
    type: String,
    required: true
  },
  branch: {
    type: String,
    required: true
  },
  history: [
    {
      date: {
        type: String,
        default: new Date()
      },
      course: {
        type: String,
        required: true
      },
      courseType: {
        type: String,
        required: true
      },
      batches: [
        {
          batch: {
            type: String,
            required: true
          },
          subjects: [String]
        }
      ]
    }
  ]
});

const History = mongoose.model('History', historySchema);

module.exports = History;
